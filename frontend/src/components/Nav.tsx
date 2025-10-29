"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function Nav() {
  const [q, setQ] = useState("");
  const router = useRouter();

  const doSearch = () => {
    const term = q.trim();
    if (term) router.push(`/?search=${encodeURIComponent(term)}`);
    else router.push(`/`);
  };
  return (
    <header className="bg-[#F9F9F9] shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto p-4 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/images/HDlogo.png" alt="logo" />
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-xl flex items-center bg-gray-100 rounded-lg shadow-sm px-3 py-2">
            <input
              className="flex-1 bg-transparent outline-none px-2 text-sm"
              placeholder="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
            />
            <button
              onClick={doSearch}
              className="ml-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
