"use client";
import { useEffect, useState } from "react";
import { getExperiences } from "@/lib/api";
import ExperienceCard from "@/components/ExperienceCard";
import Layout from "@/components/Layout";
import { useSearchParams } from "next/navigation";


export default function HomePage() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

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
    const s = searchParams?.get("search") ?? undefined;
    fetchExperiences(s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <Layout>
      {/* Search moved to header */}
      <h2 className="text-2xl font-bold mb-4">Available Experiences</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences.map((exp: any) => (
          <ExperienceCard key={exp.id} exp={exp} />
        ))}
      </div>
    </Layout>
  );
}
