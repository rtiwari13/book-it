export declare function getExperienceWithSlots(id: number): Promise<{
    slots: {
        id: number;
        experienceId: number;
        slotDate: Date;
        slotTime: string;
        capacity: number;
    }[];
} & {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    priceCents: number;
    imageUrl: string | null;
    location: string | null;
    createdAt: Date;
}>;
//# sourceMappingURL=experience.service.d.ts.map