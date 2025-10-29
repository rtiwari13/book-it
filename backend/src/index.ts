import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import prisma from "./db/prisma";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

/**
 * GET /experiences
 * Returns list with basic fields
 */
app.get("/experiences", async (req, res) => {
  const { search } = req.query;
  let where = {};
  if (typeof search === "string" && search.trim() !== "") {
    where = {
      title: {
        contains: search,
        mode: "insensitive"
      }
    };
  }
  const exps = await prisma.experience.findMany({
    where,
    orderBy: { id: "asc" }
  });
  res.json(exps);
});

/**
 * GET /experiences/:id
 * Returns experience and available slots (future)
 */
app.get("/experiences/:id", async (req, res) => {
  const id = Number(req.params.id);
  const experience = await prisma.experience.findUnique({ where: { id } });
  if (!experience) return res.status(404).json({ error: "Experience not found" });

  const slots = await prisma.slot.findMany({
    where: { experienceId: id, slotDate: { gte: new Date() } },
    select: { id: true, slotDate: true, slotTime: true, capacity: true, booked: true },
    orderBy: [{ slotDate: "asc" }, { slotTime: "asc" }]
  });

  res.json({ experience, slots });
});

/**
 * POST /promo/validate
 */
app.post("/promo/validate", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "code required" });

  const promo = await prisma.promo.findUnique({ where: { code } });
  if (!promo || !promo.active) return res.status(404).json({ valid: false });
  // return promo details
  res.json({ valid: true, promo });
});

/**
 * POST /bookings
 * Prevent double booking via conditional UPDATE (atomic)
 *
 * Flow:
 * 1) Try to increment booked count with SQL that ensures booked + qty <= capacity
 * 2) If update affects 1 row -> success: create booking record in same transaction
 * 3) If update affects 0 rows -> insufficient seats -> fail
 */
app.post("/bookings", async (req, res) => {
  const { full_name, email, experience_id, slot_id, qty, promo_code } = req.body;

  if (!full_name || !email || !experience_id || !slot_id || !qty) {
    return res.status(400).json({ error: "missing fields" });
  }

  const qtyInt = Number(qty);
  if (qtyInt <= 0) return res.status(400).json({ error: "qty must be > 0" });

  try {
    // Use interactive transaction
    interface Promo {
      code: string;
      active: boolean;
      type: "percent" | "flat";
      value: number;
    }

    interface Experience {
      id: number;
      priceCents: number;
    }

    interface BookingResult {
      bookingId: number;
      totalCents: number;
    }

    const result: BookingResult = await prisma.$transaction(async (tx: PrismaClient): Promise<BookingResult> => {
      // 1) Conditional update using raw SQL so it's done atomically in DB:
      //    update only if there is space. The query returns number of rows updated.
      const updateResult: number = await tx.$executeRawUnsafe(
        `UPDATE "Slot" SET booked = booked + $1 WHERE id = $2 AND (capacity - booked) >= $1`,
        qtyInt,
        slot_id
      );
      // Note: $executeRawUnsafe returns number of affected rows for UPDATE in node-postgres.

      if (Number(updateResult) === 0) {
        // No seats available
        throw { code: "NO_SEATS" };
      }

      // 2) Compute price
      const exp: Experience | null = await tx.experience.findUnique({ where: { id: Number(experience_id) } });
      if (!exp) throw { code: "NO_EXP" };

      let subtotal: number = exp.priceCents * qtyInt;
      let discount: number = 0;

      if (promo_code) {
        const promo: Promo | null = await tx.promo.findUnique({ where: { code: promo_code } });
        if (promo && promo.active) {
          if (promo.type === "percent") discount = Math.floor(subtotal * (promo.value / 100));
          else if (promo.type === "flat") discount = promo.value;
          subtotal = Math.max(0, subtotal - discount);
        }
      }

      const taxes: number = Math.round(subtotal * 0.06); // example 6%
      const total: number = subtotal + taxes;

      const booking = await tx.booking.create({
        data: {
          experienceId: Number(experience_id),
          slotId: Number(slot_id),
          fullName: full_name,
          email,
          qty: qtyInt,
          subtotalCents: subtotal,
          taxesCents: taxes,
          totalCents: total,
          promoCode: promo_code ?? null
        }
      });

      return { bookingId: booking.id, totalCents: total };
    }, { maxWait: 30000 }); // optional timeout

    res.json({ success: true, bookingId: result.bookingId, totalCents: result.totalCents });
  } catch (err: any) {
    if (err && err.code === "NO_SEATS") return res.status(409).json({ error: "Not enough seats" });
    if (err && err.code === "NO_EXP") return res.status(404).json({ error: "Experience not found" });
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
