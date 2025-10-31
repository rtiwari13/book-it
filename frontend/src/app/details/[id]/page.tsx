"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getExperience} from "../../../lib/api";
import Layout from "@/components/Layout";

type Slot = {
  id: number;
  time: string;
  capacity: number;
  booked: number;
  slotDate?: string; // ISO
};

export default function DetailsPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experience, setExperience] = useState<any | null>(null);
  const [slotsByDate, setSlotsByDate] = useState<Record<string, Slot[]>>({});
  const [dates, setDates] = useState<Array<{ key: string; label: string }>>([]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  const price = experience ? Math.round((experience.priceCents ?? 0) / 100) : 0;
  const slots = selectedDate ? slotsByDate[selectedDate] ?? [] : [];

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null;

  const subtotal = price * qty;
  const taxes = Math.round(subtotal * 0.06);
  const total = subtotal + taxes;

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    getExperience(id)
      .then((res) => {
        if (!mounted) return;
        // backend returns { experience, slots }
        const exp = res.experience ?? res;
        const slots: Slot[] = (res.slots ?? []) as Slot[];

        // group slots by date (YYYY-MM-DD)
        const byDate: Record<string, Slot[]> = {};
        const dateKeys: string[] = [];
        slots.forEach((s) => {
          const rawDate = (s as any).slotDate;
          if (!rawDate) return; // skip malformed
          const d = new Date(rawDate).toISOString().slice(0, 10);
          const time = (s as any).slotTime as string;
          const slotObj: Slot = {
            id: s.id,
            time,
            capacity: s.capacity,
            booked: s.booked,
            slotDate: d,
          };
          if (!byDate[d]) {
            byDate[d] = [slotObj];
            dateKeys.push(d);
          } else {
            byDate[d].push(slotObj);
          }
        });

        const dateArr = dateKeys.map((k) => ({
          key: k,
          label: new Date(k).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
          }),
        }));

        setExperience(exp);
        setSlotsByDate(byDate);
        setDates(dateArr);
        setSelectedDate(dateArr[0]?.key ?? null);
        setSelectedSlotId(null);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!id) {
    return <div className="p-8">Invalid experience id</div>;
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-[#FF4C0A]">Error: {error}</div>;
  }

  // fallback content when no experience found
  if (!experience) {
    return <div className="p-8">Experience not found</div>;
  }

  const IMAGE_SRC = experience.imageUrl ?? "/images/kayak.jpg";

  // no-op side-effects avoided; dates may be empty if there are no upcoming slots

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
   
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="text-black text-[14px] font-medium flex justify-start items-center gap-2"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.152 5.4937H2.8437L6.91037 1.42704C7.23537 1.10204 7.23537 0.568703 6.91037 0.243703C6.83328 0.16645 6.7417 0.105161 6.64089 0.0633426C6.54008 0.0215248 6.43201 0 6.32287 0C6.21373 0 6.10566 0.0215248 6.00485 0.0633426C5.90404 0.105161 5.81247 0.16645 5.73537 0.243703L0.243704 5.73537C0.166451 5.81246 0.105161 5.90404 0.063343 6.00485C0.0215252 6.10566 0 6.21373 0 6.32287C0 6.43201 0.0215252 6.54008 0.063343 6.64089C0.105161 6.7417 0.166451 6.83328 0.243704 6.91037L5.73537 12.402C5.81252 12.4792 5.90411 12.5404 6.00492 12.5821C6.10572 12.6239 6.21376 12.6454 6.32287 12.6454C6.43198 12.6454 6.54002 12.6239 6.64082 12.5821C6.74163 12.5404 6.83322 12.4792 6.91037 12.402C6.98752 12.3249 7.04872 12.2333 7.09048 12.1325C7.13223 12.0317 7.15372 11.9236 7.15372 11.8145C7.15372 11.7054 7.13223 11.5974 7.09048 11.4966C7.04872 11.3958 6.98752 11.3042 6.91037 11.227L2.8437 7.16037H12.152C12.6104 7.16037 12.9854 6.78537 12.9854 6.32704C12.9854 5.8687 12.6104 5.4937 12.152 5.4937Z"
                fill="black"
              />
            </svg>

            <span>Details</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left main column (image + details) */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden">
              <img
                src={IMAGE_SRC}
                alt="Experience"
                className="w-full h-[381px] object-cover rounded-2xl "
              />
            </div>

            <h1 className="text-2xl text-[#161616] font-medium mt-6">
              {experience.title}
            </h1>

            <p className="text-[#6C6C6C] text-[16px] mt-3 max-w-3xl">
              {experience.description ?? ""}
            </p>

            {/* Choose date */}
            <div className="mt-8">
              <h3 className=" text-[#161616] text-lg font-medium mb-3">
                Choose date
              </h3>
              <div className="flex flex-wrap gap-3">
                {dates.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No upcoming dates available
                  </div>
                ) : (
                  dates.map((d) => {
                    const active = d.key === selectedDate;
                    return (
                      <button
                        key={d.key}
                        onClick={() => {
                          setSelectedDate(d.key);
                          setSelectedSlotId(null);
                        }}
                        className={`px-3 py-2 rounded-sm text-sm  ${
                          active
                            ? "bg-[#FFD643] text-black "
                            : " text-[#838383] border-[0.6px] border-[#BDBDBD]"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Choose time */}
            <div className="mt-6">
              <h3 className="text-[#161616] text-lg font-medium mb-3">
                Choose time
              </h3>

              <div className="flex flex-wrap gap-3 items-center">
                {slots.map((s) => {
                  const available = Math.max(0, s.capacity - s.booked);
                  const isSoldOut = available <= 0;
                  const isSelected = selectedSlotId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => !isSoldOut && setSelectedSlotId(s.id)}
                      disabled={isSoldOut}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md  text-sm ${
                        isSoldOut
                          ? "bg-[#CCCCCC] text-[#838383] cursor-not-allowed"
                          : isSelected
                          ? "bg-[#FFD643] "
                          : " text-[#838383] border-[0.6px] border-[#BDBDBD]"
                      }`}
                    >
                      <span className="pr-1">{s.time}</span>
                      {/* availability badges */}
                      {isSoldOut ? (
                        <span className="ml-2 text-[10px] font-medium  text-[#6A6A6A] px-2 py-0.5 rounded">
                          Sold out
                        </span>
                      ) : (
                        <span className="ml-2 text-xs  text-[#FF4C0A] px-2 py-0.5 rounded">
                          {available} left
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[12px] text-[#838383] mt-3">
                All times are in IST (GMT +5:30)
              </p>
            </div>

            {/* About */}
            <div className="mt-10">
              <h4 className="text-[#161616] font-medium text-lg mb-2">About</h4>
              <div className="bg-[#EEEEEE] px-3 py-2 rounded-sm text-[#838383]">
                Scenic routes, trained guides, and safety briefing. Minimum age
                10.
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="">
            <aside className="bg-[#EFEFEF] rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="text-[16px] text-[#656565] ">Starts at</div>
                <div className=" text-[18px] text-[#161616] ">₹{price}</div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between   mb-2">
                  <div className="text-[16px] text-[#656565] ">Quantity</div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-4 h-4 text-[#161616]  border-[0.4px] border-[#C9C9C9] flex items-center justify-center "
                    >
                      <svg
                        width="10"
                        height="2"
                        viewBox="0 0 10 2"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.33333 1.33333H0V0H9.33333V1.33333Z"
                          fill="#161616"
                        />
                      </svg>
                    </button>
                    <div className="w-6 text-center text-[#161616] ">{qty}</div>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className=" w-4 h-4 text-[#161616] border-[0.4px] border-[#C9C9C9] flex items-center justify-center"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 5.33333H0V4H4V0H5.33333V4H9.33333V5.33333H5.33333V9.33333H4V5.33333Z"
                          fill="#161616"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[16px] text-[#656565] ">
                  <div>Subtotal</div>
                  <div className="text-[#161616]">₹{subtotal}</div>
                </div>

                <div className="flex items-center justify-between  mt-2">
                  <div>Taxes</div>
                  <div className="text-[#161616]">₹{taxes}</div>
                </div>

                <div className="border-t border-[#D9D9D9] my-4 "></div>

                <div className="flex items-center justify-between text-[20px] font-medium text-[#161616] mb-3">
                  <div>Total</div>
                  <div>₹{total}</div>
                </div>

                <button
                  onClick={async () => {
                    if (!selectedSlotId || !experience) return;
                    try {
                      setBookingLoading(true);

                      // Save booking data to localStorage
                      const bookingData = {
                        experience: experience?.title || "Experience",
                        date: selectedDate,
                        time: selectedSlot?.time,
                        qty: qty,
                        price: price,
                        subtotal: subtotal,
                        taxes: taxes,
                        total: total,
                        slotId: selectedSlotId,
                        experience_id: Number(experience?.id ?? id),
                      };

                      localStorage.setItem(
                        "bookingData",
                        JSON.stringify(bookingData)
                      );

                      // Redirect to checkout
                      window.location.href = "/checkout";
                    } catch (err: any) {
                      console.error(err);
                      setBookingLoading(false);
                      alert("Failed to proceed to checkout. Please try again.");
                    } finally {
                      setBookingLoading(false);
                    }
                  }}
                  disabled={!selectedSlotId || bookingLoading}
                  className={` w-full py-3 rounded-md text-sm font-medium  ${
                    selectedSlotId && !bookingLoading
                      ? "bg-[#FFD643] text-[#161616] cursor-pointer"
                      : "bg-[#D7D7D7] text-[#7F7F7F] cursor-not-allowed"
                  }`}
                >
                  {bookingLoading ? "Booking…" : "Confirm"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
    </Layout>
    
  );
}
