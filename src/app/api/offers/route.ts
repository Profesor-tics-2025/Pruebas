import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUser } from "@/lib/seed";

export async function GET() {
  try {
    const userId = await ensureDemoUser();

    const offers = await prisma.courseOffer.findMany({
      where: { userId },
      include: { entity: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error("Offers GET error:", error);
    return NextResponse.json({ error: "Error loading offers", details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await ensureDemoUser();
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

    const offer = await prisma.courseOffer.create({
      data: {
        userId,
        entityId,
        courseName: body.courseName,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        schedule: body.schedule,
        totalHours: parseFloat(body.totalHours),
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
        totalPrice: body.totalPrice ? parseFloat(body.totalPrice) : null,
        modality: body.modality || "presencial",
        cityOrPlatform: body.cityOrPlatform,
        status: body.status || "recibida",
        notes: body.notes,
      },
      include: { entity: true },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("Offers POST error:", error);
    return NextResponse.json({ error: "Error creating offer", details: String(error) }, { status: 500 });
  }
}
