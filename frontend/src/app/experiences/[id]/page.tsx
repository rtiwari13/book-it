"use client";

import React, { useEffect, useState } from "react";
import { getExperience, validatePromo, bookExperience } from "@/lib/api";
import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";

export default function ExperienceDetail({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<any>(null);
  // store slot id as string to match DOM option values and avoid Number->NaN issues
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [promoValid, setPromoValid] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // `params` is provided as a Promise to client components in the app router.
  // Unwrap it with React.use() before accessing properties to avoid the
  // runtime error: "params is a Promise and must be unwrapped with React.use()".
  const resolvedParams = React.use(params);

  useEffect(() => {
    getExperience(resolvedParams.id).then(setData);
  }, [resolvedParams.id]);

  if (!data) return <Layout><p>Loading...</p></Layout>;
  const { experience, slots } = data;

  const handlePromo = async () => {
    if (!promo) return;
    const res = await validatePromo(promo);
    if (res.valid) {
      setPromoValid(true);
      setDiscount(res.promo.value);
    } else {
      setPromoValid(false);
      setError("Invalid code");
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return setError("Select a slot");
    const res = await bookExperience({
      full_name: "Demo User",
      email: "demo@example.com",
      experience_id: experience.id,
      slot_id: Number(selectedSlot),
      qty,
      promo_code: promoValid ? promo : null,
    });
    if (res.success) router.push(`/booking/success?bid=${res.bookingId}`);
    else setError(res.error || "Booking failed");
  };

  const price = experience.priceCents / 100;
  const total = promoValid ? price * qty * 0.9 : price * qty; // just display-level

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-6">
        <img src={experience.imageUrl} className="w-full md:w-1/2 rounded-2xl object-cover" alt={experience.title} />
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{experience.title}</h2>
          <p className="text-gray-600 mb-4">{experience.description}</p>
          <p className="text-indigo-600 font-medium mb-4">₹{price.toFixed(0)} per person</p>

          <label className="block mb-2 font-medium">Select Slot</label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="border rounded-lg px-3 py-2 mb-4 w-full"
          >
            <option value="">Choose a date/time</option>
            {slots.map((s: any) => (
              <option key={s.id} value={String(s.id)}>
                {new Date(s.slotDate).toLocaleDateString()} — {s.slotTime} ({s.capacity - s.booked} left)
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3 mb-4">
            <label className="font-medium">Qty:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="border rounded-lg px-2 py-1 w-20 text-center"
            />
          </div>

          <div className="mb-4">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value.toUpperCase())}
              placeholder="Promo Code"
              className="border rounded-l-lg px-3 py-2"
            />
            <button
              onClick={handlePromo}
              className="bg-indigo-600 text-white px-3 py-2 rounded-r-lg"
            >
              Apply
            </button>
            {promoValid && <p className="text-green-600 mt-1 text-sm">Promo applied!</p>}
          </div>

          <div className="text-lg font-semibold mb-4">Total: ₹{total.toFixed(0)}</div>

          {error && <p className="text-red-500 mb-2">{error}</p>}

          <button
            onClick={handleBooking}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </Layout>
  );
}
