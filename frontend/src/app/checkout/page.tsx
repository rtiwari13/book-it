"use client";
import { useState, useEffect } from "react";
import { validatePromo, bookExperience } from "@/lib/api";
import PromoInput from "@/components/PromoInput";
import Layout from "@/components/Layout";

interface BookingData {
  id?: string;
  name?: string;
  email?: string;
  promoCode?: string;
  discount?: number;
  [key: string]: any;
}

export default function CheckoutPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [promo, setPromo] = useState("");
  const [agree, setAgree] = useState(false);
  const [applying, setApplying] = useState(false);
  const [promoStatus, setPromoStatus] = useState<{
    message: string;
    type: "success" | "error" | "";
  }>({ message: "", type: "" });

  useEffect(() => {
    const data = localStorage.getItem("bookingData");
    if (!data) {
      window.location.href = "/";
      return;
    }
    setBookingData(JSON.parse(data));
  }, []);

  async function handleApplyPromo() {
    if (!promo.trim()) {
      setPromoStatus({ message: "Please enter a promo code", type: "error" });
      return;
    }

    setApplying(true);
    setPromoStatus({ message: "", type: "" });

    try {
      const response = await validatePromo(promo);
      if (response.valid) {
        setBookingData((prev) => ({
          ...prev,
          promoCode: promo,
          discount: response.discount,
        }));
        setPromoStatus({
          message: `Promo code applied successfully${
            response.discount ? ` - ${response.discount}% off` : ""
          }!`,
          type: "success",
        });
      } else {
        setPromoStatus({ message: "Invalid promo code", type: "error" });
      }
    } catch (error) {
      setPromoStatus({
        message: "Failed to validate promo code",
        type: "error",
      });
    } finally {
      setApplying(false);
    }
  }

  async function handlePay() {
    if (!agree) {
      alert("Please agree to the terms and safety policy.");
      return;
    }
    if (!name || !email) {
      alert("Please enter name and email.");
      return;
    }

    const finalBookingData = {
      ...bookingData,
      name,
      email,
      promoCode: promo,
    };

    try {
      const response = await bookExperience(finalBookingData);
      if (response.success) {
        window.location.href = `/result/${response?.refId}`;
      } else {
        console.log(response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 ">
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

              <span>Checkout</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left big form card */}
            <div className="lg:col-span-2">
              <div className="bg-[#EFEFEF] rounded-2xl p-6 shadow-soft border border-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      Full name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl bg-[#DDDDDD] px-4 py-3 placeholder-gray-400 text-gray-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      Email
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="w-full rounded-xl bg-[#DDDDDD] px-4 py-3 placeholder-gray-400 text-gray-800 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <PromoInput
                    promo={promo}
                    setPromo={setPromo}
                    onApply={handleApplyPromo}
                    applying={applying}
                    status={promoStatus}
                  />
                </div>

                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#161616]"
                    />
                    I agree to the terms and safety policy
                  </label>
                </div>
              </div>
            </div>

            {/* Right summary box */}
            <aside className="bg-[#EFEFEF] p-5 rounded-xl  ">
              <div className="text-sm text-gray-600 flex justify-between mb-2">
                <div>Experience</div>
                <div className="font-medium">{bookingData?.experience}</div>
              </div>

              <div className="text-sm text-gray-600 flex justify-between mb-2">
                <div>Date</div>
                <div className="font-medium">{bookingData?.date}</div>
              </div>

              <div className="text-sm text-gray-600 flex justify-between mb-2">
                <div>Time</div>
                <div className="font-medium">{bookingData?.time}</div>
              </div>

              <div className="text-sm text-gray-600 flex justify-between mb-2">
                <div>Qty</div>
                <div className="font-medium">{bookingData?.qty}</div>
              </div>

              <div className="text-sm text-gray-600 flex justify-between mt-3">
                <div>Subtotal</div>
                <div className="font-medium">₹{bookingData?.subtotal}</div>
              </div>

              <div className="text-sm text-gray-600 flex justify-between mt-2">
                <div>Taxes</div>
                <div className="font-medium">₹{bookingData?.taxes}</div>
              </div>

              <div className="border-t border-[#D9D9D9] my-4 "></div>

              <div className="flex justify-between items-center font-bold text-lg mb-4">
                <div>Total</div>
                <div>₹{bookingData?.total}</div>
              </div>

              <button
                onClick={handlePay}
                className={`w-full py-3 rounded-md text-sm font-medium 
                   bg-[#FFD643] text-[#161616]
                
              `}
              >
                Pay and Confirm
              </button>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}
