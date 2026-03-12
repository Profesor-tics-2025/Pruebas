import { prisma } from "./prisma";
import { DEFAULT_USER_ID } from "./utils";

export async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        name: "Docente Demo",
        email: "docente@demo.com",
        configuration: {
          create: {
            maxHoursPerWeek: 30,
            availableDays: "1,2,3,4,5",
            minHourlyRate: 25,
            preferredModality: "both",
            dailyMaxHours: 8,
          },
        },
      },
    });
  }
  return DEFAULT_USER_ID;
}
