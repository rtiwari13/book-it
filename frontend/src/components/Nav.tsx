"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Nav({ setSearchTerm} : {setSearchTerm : React.Dispatch<string> | null}) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const doSearch = () => {
    const term = q.trim();
    if (setSearchTerm && term)
      setSearchTerm(term)
  
  };
  return (
    <header className="bg-[#F9F9F9] w-full h-[87px] flex justify-between px-[124px] py-4 shadow-[0_2px_16px_0_rgba(0,0,0,0.1)]">
      <Link href="/" className="flex items-center gap-3 w-[100px]">
        <img src="/images/HDlogo.png" alt="logo" />
      </Link>

      <div className=" flex items-center  rounded-sm px-3 py-2">
        <input
          className=" max-w-[340px] bg-[#EDEDED] flex-1 px-4 py-3  outline-none text-sm"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doSearch();
          }}
        />
        <button
          onClick={doSearch}
          className="ml-3 bg-[#FFD643] hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded"
        >
          Search
        </button>
      </div>
    </header>
  );
}
