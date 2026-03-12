import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const sessions = await prisma.session.findMany({
    where: {
      ...(courseId ? { courseId } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      course: { userId: "demo-user" },
    },
    include: { course: { include: { entity: true } } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Support bulk creation
  if (Array.isArray(body)) {
    const sessions = await prisma.session.createMany({
      data: body.map((s: Record<string, string>) => ({
        courseId: s.courseId,
        date: new Date(s.date),
        startTime: s.startTime,
        endTime: s.endTime,
        content: s.content || null,
        status: s.status || "pendiente",
      })),
    });
    return NextResponse.json(sessions, { status: 201 });
  }

  const session = await prisma.session.create({
    data: {
      courseId: body.courseId,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      content: body.content || null,
      status: body.status || "pendiente",
    },
    include: { course: true },
  });

  return NextResponse.json(session, { status: 201 });
}
