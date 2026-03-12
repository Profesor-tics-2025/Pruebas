import { prisma } from "./prisma";
import { DEFAULT_USER_ID, getHoursBetween } from "./utils";
import type { ConflictAlert } from "@/types";

export async function detectConflicts(): Promise<ConflictAlert[]> {
  const config = await prisma.teacherConfig.findUnique({
    where: { userId: DEFAULT_USER_ID },
  });

  const maxDaily = config?.dailyMaxHours ?? 8;
  const maxWeekly = config?.maxHoursPerWeek ?? 30;

  const sessions = await prisma.session.findMany({
    where: {
      course: {
        userId: DEFAULT_USER_ID,
        status: { in: ["confirmado", "pendiente"] },
      },
      status: "pendiente",
    },
    include: { course: true },
    orderBy: { date: "asc" },
  });

  const alerts: ConflictAlert[] = [];

  // Group by date for overlap and daily excess detection
  const byDate = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const key = new Date(s.date).toISOString().split("T")[0];
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(s);
  }

  for (const [date, daySessions] of byDate) {
    // Check overlaps
    const sorted = daySessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].endTime > sorted[i + 1].startTime) {
        alerts.push({
          type: "overlap",
          message: `Solapamiento: "${sorted[i].course.name}" (${sorted[i].startTime}-${sorted[i].endTime}) y "${sorted[i + 1].course.name}" (${sorted[i + 1].startTime}-${sorted[i + 1].endTime})`,
          date,
          sessions: [sorted[i].id, sorted[i + 1].id],
        });
      }
    }

    // Check daily excess
    const totalHours = daySessions.reduce(
      (sum, s) => sum + getHoursBetween(s.startTime, s.endTime), 0
    );
    if (totalHours > maxDaily) {
      alerts.push({
        type: "daily_excess",
        message: `Exceso diario: ${totalHours.toFixed(1)}h el ${date} (máximo ${maxDaily}h)`,
        date,
        sessions: daySessions.map((s) => s.id),
      });
    }
  }

  // Check weekly excess
  const byWeek = new Map<string, number>();
  for (const s of sessions) {
    const d = new Date(s.date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d);
    weekStart.setDate(diff);
    const key = weekStart.toISOString().split("T")[0];
    byWeek.set(key, (byWeek.get(key) ?? 0) + getHoursBetween(s.startTime, s.endTime));
  }

  for (const [weekStart, hours] of byWeek) {
    if (hours > maxWeekly) {
      alerts.push({
        type: "weekly_excess",
        message: `Exceso semanal: ${hours.toFixed(1)}h en la semana del ${weekStart} (máximo ${maxWeekly}h)`,
        date: weekStart,
        sessions: [],
      });
    }
  }

  return alerts;
}
