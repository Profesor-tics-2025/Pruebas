import { NextRequest, NextResponse } from "next/server";
import { analyzeOffer } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const recommendation = await analyzeOffer({
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      schedule: body.schedule,
      totalHours: parseFloat(body.totalHours),
      hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
      totalPrice: body.totalPrice ? parseFloat(body.totalPrice) : null,
      modality: body.modality,
    });

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("AI recommendation error:", error);
    return NextResponse.json({ error: "Error generating recommendation", details: String(error) }, { status: 500 });
  }
}
