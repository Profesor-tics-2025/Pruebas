import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const offer = await prisma.courseOffer.update({
      where: { id },
      data: {
        ...(entityId !== undefined ? { entityId } : {}),
        ...(body.courseName !== undefined ? { courseName: body.courseName } : {}),
        ...(body.startDate ? { startDate: new Date(body.startDate) } : {}),
        ...(body.endDate ? { endDate: new Date(body.endDate) } : {}),
        ...(body.schedule !== undefined ? { schedule: body.schedule } : {}),
        ...(body.totalHours !== undefined ? { totalHours: parseFloat(body.totalHours) } : {}),
        ...(body.hourlyRate !== undefined ? { hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null } : {}),
        ...(body.totalPrice !== undefined ? { totalPrice: body.totalPrice ? parseFloat(body.totalPrice) : null } : {}),
        ...(body.modality !== undefined ? { modality: body.modality } : {}),
        ...(body.cityOrPlatform !== undefined ? { cityOrPlatform: body.cityOrPlatform } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.aiRecommendation !== undefined ? { aiRecommendation: body.aiRecommendation } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
      include: { entity: true },
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error("Offer PUT error:", error);
    return NextResponse.json({ error: "Error updating offer", details: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.courseOffer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Offer DELETE error:", error);
    return NextResponse.json({ error: "Error deleting offer", details: String(error) }, { status: 500 });
  }
}
