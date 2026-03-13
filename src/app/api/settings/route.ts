import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUser } from "@/lib/seed";

export async function GET() {
  try {
    const userId = await ensureDemoUser();

    const config = await prisma.teacherConfig.findUnique({
      where: { userId },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Error loading settings", details: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
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
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Error updating settings", details: String(error) }, { status: 500 });
  }
}
