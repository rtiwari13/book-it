import Link from "next/link";

export default function ExperienceCard({ exp }: { exp: any }) {
  return (
    <Link href={`/experiences/${exp.id}`}>
      <div className="bg-white shadow rounded-2xl overflow-hidden hover:shadow-md transition">
        <img src={exp.imageUrl || "/placeholder.jpg"} alt={exp.title} className="h-48 w-full object-cover" />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{exp.title}</h3>
          <p className="text-sm text-gray-500">{exp.location}</p>
          <p className="mt-2 font-medium text-indigo-600">₹{(exp.priceCents / 100).toFixed(0)}</p>
        </div>
      </div>
    </Link>
  );
}
