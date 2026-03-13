import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUser } from "@/lib/seed";

export async function GET(req: NextRequest) {
  const userId = await ensureDemoUser();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const courses = await prisma.course.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    include: { entity: true, sessions: { orderBy: { date: "asc" } } },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const userId = await ensureDemoUser();
  const body = await req.json();

  // Handle entity creation/linking
  let entityId = body.entityId;
  if (body.entityName && !entityId) {
    let entity = await prisma.trainingEntity.findFirst({
      where: { name: body.entityName },
    });
    if (!entity) {
      entity = await prisma.trainingEntity.create({
        data: { name: body.entityName },
      });
    }
    entityId = entity.id;
  }

  const course = await prisma.course.create({
    data: {
      userId,
      entityId,
      name: body.name,
      modality: body.modality || "presencial",
      cityOrPlatform: body.cityOrPlatform,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      totalHours: parseFloat(body.totalHours),
      schedule: body.schedule,
      hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
      totalPrice: body.totalPrice ? parseFloat(body.totalPrice) : null,
      status: body.status || "pendiente",
      notes: body.notes,
    },
    include: { entity: true, sessions: true },
  });

  return NextResponse.json(course, { status: 201 });
}
