import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUser } from "@/lib/seed";

export async function GET() {
  const userId = await ensureDemoUser();

  const config = await prisma.teacherConfig.findUnique({
    where: { userId },
  });

  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const userId = await ensureDemoUser();
  const body = await req.json();

  const config = await prisma.teacherConfig.upsert({
    where: { userId },
    update: {
      ...(body.maxHoursPerWeek !== undefined ? { maxHoursPerWeek: body.maxHoursPerWeek } : {}),
      ...(body.availableDays !== undefined ? { availableDays: body.availableDays } : {}),
      ...(body.minHourlyRate !== undefined ? { minHourlyRate: body.minHourlyRate } : {}),
      ...(body.preferredModality !== undefined ? { preferredModality: body.preferredModality } : {}),
      ...(body.dailyMaxHours !== undefined ? { dailyMaxHours: body.dailyMaxHours } : {}),
    },
    create: {
      userId,
      maxHoursPerWeek: body.maxHoursPerWeek ?? 30,
      availableDays: body.availableDays ?? "1,2,3,4,5",
      minHourlyRate: body.minHourlyRate ?? 25,
      preferredModality: body.preferredModality ?? "both",
      dailyMaxHours: body.dailyMaxHours ?? 8,
    },
  });

  return NextResponse.json(config);
}
