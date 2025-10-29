"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";

export default function BookingSuccess() {
  const search = useSearchParams();
  const bid = search.get("bid");

  return (
    <Layout>
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
        <p className="text-gray-700 mb-6">Your booking ID is <strong>{bid}</strong></p>
        <Link href="/" className="text-indigo-600 hover:underline">
          Back to Experiences
        </Link>
      </div>
    </Layout>
  );
}
