'use client'

import Layout from "@/components/Layout";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Result() {
  const params = useParams();
  const refId = params?.id as string | undefined;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-start justify-center py-20 px-6">
      <div className="w-full max-w-xl text-center">
        <div className="flex justify-center mb-6">
          <svg
            width="70"
            height="70"
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M35 0C44.2826 0 53.185 3.68749 59.7487 10.2513C66.3125 16.815 70 25.7174 70 35C70 44.2826 66.3125 53.185 59.7487 59.7487C53.185 66.3125 44.2826 70 35 70C25.7174 70 16.815 66.3125 10.2513 59.7487C3.68749 53.185 0 44.2826 0 35C0 25.7174 3.68749 16.815 10.2513 10.2513C16.815 3.68749 25.7174 0 35 0ZM30.64 41.905L22.865 34.125C22.5863 33.8463 22.2554 33.6252 21.8912 33.4743C21.527 33.3235 21.1367 33.2458 20.7425 33.2458C20.3483 33.2458 19.958 33.3235 19.5938 33.4743C19.2296 33.6252 18.8987 33.8463 18.62 34.125C18.0571 34.6879 17.7408 35.4514 17.7408 36.2475C17.7408 37.0436 18.0571 37.8071 18.62 38.37L28.52 48.27C28.7979 48.5501 29.1286 48.7725 29.4929 48.9242C29.8572 49.076 30.2479 49.1541 30.6425 49.1541C31.0371 49.1541 31.4278 49.076 31.7921 48.9242C32.1564 48.7725 32.4871 48.5501 32.765 48.27L53.265 27.765C53.5475 27.4874 53.7722 27.1567 53.9261 26.7918C54.0801 26.427 54.1604 26.0352 54.1622 25.6392C54.164 25.2432 54.0875 24.8508 53.9369 24.4845C53.7863 24.1182 53.5647 23.7854 53.2848 23.5052C53.005 23.225 52.6724 23.003 52.3063 22.852C51.9402 22.701 51.5478 22.6239 51.1518 22.6253C50.7558 22.6267 50.364 22.7064 49.999 22.86C49.6339 23.0136 49.3029 23.2379 49.025 23.52L30.64 41.905Z"
              fill="#24AC39"
            />
          </svg>
        </div>

        <>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Booking Confirmed
          </h1>
          <p className="text-xl text-[#656565] mb-4">Ref ID: {refId}</p>
        </>

        <div className="mx-auto w-36">
          <Link
            href="/"
            className="inline-block w-full text-center text-sm bg-[#E3E3E3] text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
    </Layout>
    
  );
}
