import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { entity: true, sessions: { orderBy: { date: "asc" } } },
  });
  if (!course) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(course);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

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

  const course = await prisma.course.update({
    where: { id },
    data: {
      ...(entityId !== undefined ? { entityId } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.modality !== undefined ? { modality: body.modality } : {}),
      ...(body.cityOrPlatform !== undefined ? { cityOrPlatform: body.cityOrPlatform } : {}),
      ...(body.startDate ? { startDate: new Date(body.startDate) } : {}),
      ...(body.endDate ? { endDate: new Date(body.endDate) } : {}),
      ...(body.totalHours !== undefined ? { totalHours: parseFloat(body.totalHours) } : {}),
      ...(body.schedule !== undefined ? { schedule: body.schedule } : {}),
      ...(body.hourlyRate !== undefined ? { hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null } : {}),
      ...(body.totalPrice !== undefined ? { totalPrice: body.totalPrice ? parseFloat(body.totalPrice) : null } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    },
    include: { entity: true, sessions: true },
  });

  return NextResponse.json(course);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
