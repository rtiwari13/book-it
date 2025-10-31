"use client";
import { useEffect, useState } from "react";
import { getExperiences } from "@/lib/api";
import ExperienceCard from "@/components/ExperienceCard";
import Nav from "../components/Nav";


export default function HomePage() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm , setSearchTerm] = useState("")

  const fetchExperiences = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const data = await getExperiences(searchTerm);
      setExperiences(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences(searchTerm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
 
   <div className="min-h-screen flex flex-col">
        <Nav 
        setSearchTerm={setSearchTerm}
         />
        <main className="px-[124px] mt-[60px] min-h-screen">

 <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        {experiences.map((exp: any) => (
          <ExperienceCard key={exp.id} exp={exp} />
        ))}

      </div>

        </main>
        <footer className="text-center text-sm text-gray-500 p-4">
          © 2025 MyExperiences — All rights reserved
        </footer>
      </div>
     
     
     
    
  );
}
