// Fetch booking details by bookingId (ref)
export async function getBooking(bookingId: string) {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
}
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";


export async function getExperiences(search?: string) {
  let url = `${API_BASE}/experiences`;
  if (search && search.trim() !== "") {
    url += `?search=${encodeURIComponent(search)}`;
  }
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch experiences");
  return res.json();
}

export async function getExperience(id: string) {
  const res = await fetch(`${API_BASE}/experiences/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch experience");
  return res.json();
}

export async function validatePromo(code: string) {
  const res = await fetch(`${API_BASE}/promo/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return res.json();
}

export async function bookExperience(data: any) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
