"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const prisma_1 = __importDefault(require("./db/prisma"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const PORT = process.env.PORT || 4000;
/**
 * GET /experiences
 * Returns list with basic fields
 */
app.get("/experiences", async (req, res) => {
    const { search } = req.query;
    let where = undefined;
    if (typeof search === "string" && search.trim() !== "") {
        where = {
            title: {
                contains: search,
                mode: "insensitive",
            },
        };
    }
    const exps = await prisma_1.default.experience.findMany({
        ...(where ? { where } : {}),
        orderBy: { id: "asc" },
    });
    res.json(exps);
});
/**
 * GET /experiences/:id
 * Returns experience and available slots (future)
 */
app.get("/experiences/:id", async (req, res) => {
    const id = Number(req.params.id);
    const experience = await prisma_1.default.experience.findUnique({ where: { id } });
    if (!experience)
        return res.status(404).json({ error: "Experience not found" });
    const slots = await prisma_1.default.slot.findMany({
        where: { experienceId: id, slotDate: { gte: new Date() } },
        include: { bookings: true },
        orderBy: [{ slotDate: "asc" }, { slotTime: "asc" }],
    });
    const enrichedSlots = slots.map((slot) => {
        const totalBookingsCount = slot.bookings?.reduce((sum, b) => sum + b.qty, 0) || 0;
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
app.post("/promo/validate", async (req, res) => {
    const { code } = req.body;
    if (!code)
        return res.status(400).json({ error: "code required" });
    const promo = await prisma_1.default.promo.findUnique({ where: { code } });
    if (!promo || !promo.active)
        return res.status(404).json({ valid: false });
    // return promo details
    res.json({ valid: true, promo });
});
app.post("/bookings", async (req, res) => {
    const { name, email, experienceId, slotId, qty, promoCode } = req.body;
    if (!promoCode || !name || !email || !slotId || !qty) {
        return res.status(400).json({ error: "missing fields" });
    }
    const qtyInt = Number(qty);
    if (qtyInt <= 0)
        return res.status(400).json({ error: "qty must be > 0" });
    try {
        const result = await prisma_1.default.$transaction(async (tx) => {
            // 2) Compute price
            const sl = await tx.slot.findUnique({
                where: { id: Number(slotId) },
                include: {
                    experience: true,
                },
            });
            const exp = sl?.experience;
            if (!exp)
                throw { code: "NO_EXP" };
            const totalBookings = await tx.booking.findMany({
                where: {
                    slotId: Number(slotId),
                },
            });
            let totalBookingsCount = 0;
            totalBookings.forEach((element) => {
                totalBookingsCount += element.qty;
            });
            if (Number(totalBookingsCount) + Number(qtyInt) >
                Number(sl?.capacity)) {
                // No seats available
                throw { code: "NO_SEATS" };
            }
            let subtotal = exp.priceCents * qtyInt;
            let discount = 0;
            if (promoCode) {
                const promo = await tx.promo.findUnique({
                    where: { code: promoCode },
                });
                if (promo && promo.active) {
                    if (promo.type === "percent")
                        discount = Math.floor(subtotal * (promo.value / 100));
                    else if (promo.type === "flat")
                        discount = promo.value;
                    subtotal = Math.max(0, subtotal - discount);
                }
            }
            const taxes = Math.round(subtotal * 0.06); // example 6%
            const total = subtotal + taxes;
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
            return { bookingId: booking.id, totalCents: total, refId: refId };
        }, { maxWait: 30000 }); // optional timeout
        res.json({
            success: true,
            bookingId: result.bookingId,
            totalCents: result.totalCents,
            refId: result.refId
        });
    }
    catch (err) {
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
app.get("/bookings/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!id)
        return res.status(400).json({ error: "Invalid booking id" });
    try {
        const booking = await prisma_1.default.booking.findUnique({
            where: { id },
            include: {
                slot: {
                    include: { experience: true },
                },
            },
        });
        if (!booking)
            return res.status(404).json({ error: "Booking not found" });
        res.json(booking);
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
//# sourceMappingURL=index.js.map