import { prisma } from "./prisma";
import { DEFAULT_USER_ID, getHoursBetween } from "./utils";
import type { AIRecommendation } from "@/types";

interface OfferData {
  startDate: Date;
  endDate: Date;
  schedule?: string | null;
  totalHours: number;
  hourlyRate?: number | null;
  totalPrice?: number | null;
  modality?: string;
}

export async function analyzeOffer(offer: OfferData): Promise<AIRecommendation> {
  const config = await prisma.teacherConfig.findUnique({
    where: { userId: DEFAULT_USER_ID },
  });

  const maxWeekly = config?.maxHoursPerWeek ?? 30;
  const maxDaily = config?.dailyMaxHours ?? 8;
  const minRate = config?.minHourlyRate ?? 25;

  // Get all sessions in the offer date range
  const existingSessions = await prisma.session.findMany({
    where: {
      course: { userId: DEFAULT_USER_ID, status: { in: ["confirmado", "pendiente"] } },
      date: { gte: offer.startDate, lte: offer.endDate },
    },
    include: { course: true },
  });

  // Check hourly rate
  const effectiveRate = offer.hourlyRate ?? (offer.totalPrice && offer.totalHours > 0
    ? offer.totalPrice / offer.totalHours : 0);

  const conflicts: string[] = [];
  let decision: AIRecommendation["decision"] = "aceptar";
  let confidence = 85;

  // Check minimum rate
  if (effectiveRate > 0 && effectiveRate < minRate) {
    conflicts.push(
      `La tarifa (${effectiveRate.toFixed(2)}€/h) está por debajo del mínimo configurado (${minRate}€/h)`
    );
    decision = "aceptar_con_ajustes";
    confidence -= 20;
  }

  // Calculate weekly hours impact
  const weeksInRange = Math.max(1, Math.ceil(
    (offer.endDate.getTime() - offer.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  ));
  const offerWeeklyHours = offer.totalHours / weeksInRange;

  // Group existing sessions by week
  const weeklyHoursMap = new Map<string, number>();
  for (const session of existingSessions) {
    const weekKey = getWeekKey(new Date(session.date));
    const hours = getHoursBetween(session.startTime, session.endTime);
    weeklyHoursMap.set(weekKey, (weeklyHoursMap.get(weekKey) ?? 0) + hours);
  }

  // Check weekly capacity
  const maxExistingWeekly = Math.max(0, ...weeklyHoursMap.values());
  const projectedWeekly = maxExistingWeekly + offerWeeklyHours;

  if (projectedWeekly > maxWeekly) {
    conflicts.push(
      `Superaría el máximo semanal: ${projectedWeekly.toFixed(1)}h proyectadas vs ${maxWeekly}h máximo`
    );
    decision = projectedWeekly > maxWeekly * 1.2 ? "no_aceptar" : "aceptar_con_ajustes";
    confidence -= 15;
  }

  // Check daily hours
  const dailyHoursMap = new Map<string, number>();
  for (const session of existingSessions) {
    const dayKey = new Date(session.date).toISOString().split("T")[0];
    const hours = getHoursBetween(session.startTime, session.endTime);
    dailyHoursMap.set(dayKey, (dailyHoursMap.get(dayKey) ?? 0) + hours);
  }

  const maxExistingDaily = Math.max(0, ...dailyHoursMap.values());
  const estimatedDailyNew = offer.totalHours / Math.max(1,
    Math.ceil((offer.endDate.getTime() - offer.startDate.getTime()) / (24 * 60 * 60 * 1000))
  );

  if (maxExistingDaily + estimatedDailyNew > maxDaily) {
    conflicts.push(
      `Podría exceder las ${maxDaily}h diarias máximas en algunos días`
    );
    if (decision !== "no_aceptar") decision = "aceptar_con_ajustes";
    confidence -= 10;
  }

  // Check schedule overlaps
  if (offer.schedule && existingSessions.length > 0) {
    const overlapCount = existingSessions.filter((s) => {
      // Simple overlap detection
      return s.course.status === "confirmado";
    }).length;

    if (overlapCount > 5) {
      conflicts.push(`Hay ${overlapCount} sesiones existentes en el mismo período`);
      confidence -= 10;
    }
  }

  // Check modality preference
  if (config?.preferredModality && config.preferredModality !== "both" && offer.modality) {
    if (config.preferredModality !== offer.modality) {
      conflicts.push(
        `La modalidad (${offer.modality}) no coincide con tu preferencia (${config.preferredModality})`
      );
      confidence -= 5;
    }
  }

  // Build explanation
  const explanation = buildExplanation(decision, conflicts, {
    effectiveRate,
    projectedWeekly,
    maxWeekly,
    offerWeeklyHours,
  });

  return {
    decision,
    confidence: Math.max(10, confidence),
    explanation,
    conflicts,
    weeklyHoursImpact: offerWeeklyHours,
  };
}

function buildExplanation(
  decision: AIRecommendation["decision"],
  conflicts: string[],
  data: { effectiveRate: number; projectedWeekly: number; maxWeekly: number; offerWeeklyHours: number }
): string {
  const parts: string[] = [];

  if (decision === "aceptar") {
    parts.push("La oferta es compatible con tu calendario y configuración actual.");
    parts.push(`Añadirá ~${data.offerWeeklyHours.toFixed(1)}h semanales a tu carga docente.`);
    if (data.effectiveRate > 0) {
      parts.push(`La tarifa efectiva es de ${data.effectiveRate.toFixed(2)}€/h.`);
    }
  } else if (decision === "aceptar_con_ajustes") {
    parts.push("La oferta podría aceptarse con algunos ajustes:");
    for (const c of conflicts) parts.push(`• ${c}`);
    parts.push("Considera negociar horarios o condiciones antes de confirmar.");
  } else {
    parts.push("No se recomienda aceptar esta oferta:");
    for (const c of conflicts) parts.push(`• ${c}`);
    parts.push("Aceptarla podría comprometer la calidad docente o tu bienestar.");
  }

  return parts.join("\n");
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
