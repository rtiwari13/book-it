import Link from "next/link";

export default function ExperienceCard({ exp }: { exp: any }) {
  return (
    
    <div className=" card max-w-[280px] w-full  rounded-xl ">
      <img
        src={exp.imageUrl || "/placeholder.jpg"}
        alt={exp.title}
        className="h-[170px] w-full object-cover rounded-t-xl"
      />
      <div className="bg-[#F0F0F0] px-4 py-3 w-full gap-5 flex flex-col rounded-b-xl">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-lg text-[#161616] font-semibold">{exp.title}</h3>
          <span className="bg-[#D6D6D6] py-1 px-2 rounded-sm ">
            {exp.location}
          </span>
        </div>

        <p className="text-[12px] text-[#6C6C6C] font-normal">
          {exp.description}
        </p>
        <div className="flex flex-row items-center justify-between ">
          <p className="text-[12px] font-normal text-[#161616]">
            From
            <span className="text-[20px] font-medium "> ₹{(exp.priceCents / 100).toFixed(0)}</span>
          </p>

          <Link
            href={`/details/${exp.id}`}
            className="ml-3 bg-[#FFD643] hover:bg-yellow-500 text-black font-semibold px-2 py-1.5 rounded"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
