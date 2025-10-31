import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import prisma from "./db/prisma";
import {  Prisma } from "@prisma/client";

type Booking = {
    qty : number
  }

  type Slot = {
    bookings : Booking []
  }

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

/**
 * GET /experiences
 * Returns list with basic fields
 */
app.get("/experiences", async (req: Request, res: Response) => {
  const { search } = req.query as { search?: string };
  let where : Prisma.ExperienceWhereInput | undefined;
  if (typeof search === "string" && search.trim() !== "") {
    where = {
      title: {
        contains: search,
        mode: "insensitive",
      },
    };
  }
  const exps = await prisma.experience.findMany({
    ...(where ? { where } : {}),
    orderBy: { id: "asc" },
  });
  res.json(exps);
});

/**
 * GET /experiences/:id
 * Returns experience and available slots (future)
 */
app.get("/experiences/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const experience = await prisma.experience.findUnique({ where: { id } });
  if (!experience)
    return res.status(404).json({ error: "Experience not found" });

  const slots = await prisma.slot.findMany({
    where: { experienceId: id, slotDate: { gte: new Date() } },
    include: { bookings: true },
    orderBy: [{ slotDate: "asc" }, { slotTime: "asc" }],
  });

  

  const enrichedSlots = slots.map((slot: Slot  ) => {
    const totalBookingsCount =
      slot.bookings?.reduce((sum : number, b: Booking ) => sum + b.qty, 0) || 0;
    return {
      ...slot,
      booked: totalBookingsCount,
    };
  });

  res.json({ experience, slots: enrichedSlots });
});

/**
 * POST /promo/validate
 */
app.post("/promo/validate", async (req: Request, res: Response) => {
  const { code } = req.body as { code?: string };
  if (!code) return res.status(400).json({ error: "code required" });

  const promo = await prisma.promo.findUnique({ where: { code } });
  if (!promo || !promo.active) return res.status(404).json({ valid: false });
  // return promo details
  res.json({ valid: true, promo });
});

app.post("/bookings", async (req: Request, res: Response) => {
  const { name, email, experienceId, slotId, qty, promoCode } = req.body as {
    name?: string;
    email?: string;
    experienceId?: number | string;
    slotId?: number | string;
    qty?: number | string;
    promoCode?: string;
  };

  if (!promoCode || !name || !email || !slotId || !qty) {
    return res.status(400).json({ error: "missing fields" });
  }

  const qtyInt = Number(qty);
  if (qtyInt <= 0) return res.status(400).json({ error: "qty must be > 0" });
  try {
    // Use interactive transaction
    interface BookingResult {
      bookingId: number;
      totalCents: number;
      refId:string;
    }

    const result: BookingResult = await prisma.$transaction(
      async (tx: Prisma.TransactionClient): Promise<BookingResult> => {
        // 2) Compute price
        const sl = await tx.slot.findUnique({
          where: { id: Number(slotId) },
          include: {
            experience: true,
          },
        });

        const exp = sl?.experience;

        if (!exp) throw { code: "NO_EXP" };

        const totalBookings = await tx.booking.findMany({
          where: {
            slotId: Number(slotId),
          },
        });

        let totalBookingsCount : number = 0;

        totalBookings.forEach((element :  {qty: number}) => {
          totalBookingsCount += element.qty;
        });
        if (
          Number(totalBookingsCount) + Number(qtyInt) >
          Number(sl?.capacity)
        ) {
          // No seats available
          throw { code: "NO_SEATS" };
        }

        let subtotal: number = exp.priceCents * qtyInt;
        let discount: number = 0;

        if (promoCode) {
          const promo = await tx.promo.findUnique({
            where: { code: promoCode },
          });
          if (promo && promo.active) {
            if (promo.type === "percent")
              discount = Math.floor(subtotal * (promo.value / 100));
            else if (promo.type === "flat") discount = promo.value;
            subtotal = Math.max(0, subtotal - discount);
          }
        }

        const taxes: number = Math.round(subtotal * 0.06); // example 6%
        const total: number = subtotal + taxes;
        const refId = Math.random().toString(36).substring(2, 8).toUpperCase();

        const booking = await tx.booking.create({
          data: {
            slotId: Number(slotId),
            fullName: name,
            email,
            qty: qtyInt,
            subtotalCents: subtotal,
            taxesCents: taxes,
            totalCents: total,
            promoCode: promoCode ?? null,
            refId: refId 
          },
        });

        return { bookingId: booking.id, totalCents: total , refId : refId};
      },
      { maxWait: 30000 }
    ); // optional timeout

    res.json({
      success: true,
      bookingId: result.bookingId,
      totalCents: result.totalCents,
      refId:result.refId
    });
  } catch (err: any) {
    if (err && err.code === "NO_SEATS")
      return res.status(409).json({ error: "Not enough seats" });
    if (err && err.code === "NO_EXP")
      return res.status(404).json({ error: "Experience not found" });
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

/**
 * GET /bookings/:id
 * Returns booking details by booking id
 */
app.get("/bookings/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid booking id" });
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        slot: {
          include: { experience: true },
        },
      },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
