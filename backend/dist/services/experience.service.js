"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExperienceWithSlots = getExperienceWithSlots;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
async function getExperienceWithSlots(id) {
    const experience = await prisma.experience.findUnique({
        where: { id },
        include: {
            slots: {
                where: {
                    slotDate: {
                        gte: (0, date_fns_1.startOfDay)(new Date()),
                        lte: (0, date_fns_1.addDays)((0, date_fns_1.startOfDay)(new Date()), 5)
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
//# sourceMappingURL=experience.service.js.map