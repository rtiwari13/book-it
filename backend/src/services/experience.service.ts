import { PrismaClient } from '@prisma/client';
import { addDays, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

export async function getExperienceWithSlots(id: number) {
  const experience = await prisma.experience.findUnique({
    where: { id },
    include: {
      slots: {
        where: {
          slotDate: {
            gte: startOfDay(new Date()),
            lte: addDays(startOfDay(new Date()), 5)
          }
        },
        orderBy: [
          { slotDate: 'asc' },
          { slotTime: 'asc' }
        ]
      }
    }
  });

  if (!experience) {
    throw new Error('Experience not found');
  }

  return experience;
}