"use client";
import Nav from "./Nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav setSearchTerm={null} />
      <main className="px-[124px] mt-[60px] min-h-screen">{children}</main>
      <footer className="text-center text-sm text-gray-500 p-4">
        © 2025 MyExperiences — All rights reserved
      </footer>
    </div>
  );
}
