import { PrismaClient } from "../prisma/generated/client";
const prisma = new PrismaClient();

async function main() {
  // clear existing
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.promo.deleteMany();

  const e1 = await prisma.experience.create({
    data: {
      title: "Kayaking",
      slug: "kayaking",
      description: "Curated small-group kayaking experience. Helmet and life jackets included.",
      priceCents: 99900,
      imageUrl: "/images/kayak1.jpg",
      location: "Udupi, Karnataka"
    }
  });

  const e2 = await prisma.experience.create({
    data: {
      title: "Nandi Hills Sunrise",
      slug: "nandi-hills",
      description: "Sunrise trek to Nandi Hills.",
      priceCents: 89900,
      imageUrl: "/images/nandi.jpg",
      location: "Bangalore"
    }
  });

  // slots for kayaking
  await prisma.slot.createMany({
    data: [
      { experienceId: e1.id, slotDate: new Date("2025-10-22"), slotTime: "07:00", capacity: 6 },
      { experienceId: e1.id, slotDate: new Date("2025-10-22"), slotTime: "09:00", capacity: 10 },
      { experienceId: e1.id, slotDate: new Date("2025-10-23"), slotTime: "11:00", capacity: 8 }
    ]
  });

  // slots for nandi
  await prisma.slot.createMany({
    data: [
      { experienceId: e2.id, slotDate: new Date("2025-10-23"), slotTime: "06:00", capacity: 12 },
      { experienceId: e2.id, slotDate: new Date("2025-10-24"), slotTime: "06:00", capacity: 12 }
    ]
  });

  await prisma.promo.createMany({
    data: [
      { code: "SAVE10", type: "percent", value: 10, active: true },    // 10%
      { code: "FLAT100", type: "flat", value: 10000, active: true }    // 10000 cents = ₹100
    ]
  });

  console.log("Seeded DB");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
