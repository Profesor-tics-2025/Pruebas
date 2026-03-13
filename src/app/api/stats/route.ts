import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUser } from "@/lib/seed";
import { detectConflicts } from "@/lib/conflicts";
import { getHoursBetween, calculateCourseIncome } from "@/lib/utils";

export async function GET() {
  const userId = await ensureDemoUser();
  const now = new Date();

  // Get all courses
  const courses = await prisma.course.findMany({
    where: { userId, status: { in: ["confirmado", "pendiente", "finalizado"] } },
    include: { sessions: true, entity: true },
  });

  // Upcoming courses
  const upcomingCourses = courses.filter(
    (c) => new Date(c.startDate) >= now && c.status !== "finalizado"
  ).length;

  // Get sessions for this week
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const allSessions = courses.flatMap((c) => c.sessions);

  const weekSessions = allSessions.filter((s) => {
    const d = new Date(s.date);
    return d >= weekStart && d <= weekEnd;
  });
  const weeklyHours = weekSessions.reduce(
    (sum, s) => sum + getHoursBetween(s.startTime, s.endTime), 0
  );

  // This month sessions
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthSessions = allSessions.filter((s) => {
    const d = new Date(s.date);
    return d >= monthStart && d <= monthEnd;
  });
  const monthlyHours = monthSessions.reduce(
    (sum, s) => sum + getHoursBetween(s.startTime, s.endTime), 0
  );

  // Monthly income - courses active this month
  const monthCourses = courses.filter((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return start <= monthEnd && end >= monthStart;
  });
  const monthlyIncome = monthCourses.reduce((sum, c) => {
    const income = calculateCourseIncome(c);
    // Prorate if course spans multiple months
    const courseStart = new Date(c.startDate);
    const courseEnd = new Date(c.endDate);
    const totalDays = Math.max(1, (courseEnd.getTime() - courseStart.getTime()) / (24 * 60 * 60 * 1000));
    const overlapStart = new Date(Math.max(monthStart.getTime(), courseStart.getTime()));
    const overlapEnd = new Date(Math.min(monthEnd.getTime(), courseEnd.getTime()));
    const overlapDays = Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / (24 * 60 * 60 * 1000));
    return sum + (income * overlapDays / totalDays);
  }, 0);

  // Yearly income
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  const yearCourses = courses.filter((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return start <= yearEnd && end >= yearStart;
  });
  const yearlyIncome = yearCourses.reduce((sum, c) => sum + calculateCourseIncome(c), 0);

  // Monthly breakdown for charts
  const monthlyStats = [];
  for (let m = 0; m < 12; m++) {
    const mStart = new Date(now.getFullYear(), m, 1);
    const mEnd = new Date(now.getFullYear(), m + 1, 0, 23, 59, 59, 999);

    const mSessions = allSessions.filter((s) => {
      const d = new Date(s.date);
      return d >= mStart && d <= mEnd;
    });
    const mHours = mSessions.reduce(
      (sum, s) => sum + getHoursBetween(s.startTime, s.endTime), 0
    );

    const mCourses = courses.filter((c) => {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      return start <= mEnd && end >= mStart;
    });
    const mIncome = mCourses.reduce((sum, c) => {
      const income = calculateCourseIncome(c);
      const courseStart = new Date(c.startDate);
      const courseEnd = new Date(c.endDate);
      const totalDays = Math.max(1, (courseEnd.getTime() - courseStart.getTime()) / (24 * 60 * 60 * 1000));
      const overlapStart = new Date(Math.max(mStart.getTime(), courseStart.getTime()));
      const overlapEnd = new Date(Math.min(mEnd.getTime(), courseEnd.getTime()));
      const overlapDays = Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / (24 * 60 * 60 * 1000));
      return sum + (income * overlapDays / totalDays);
    }, 0);

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    monthlyStats.push({
      month: monthNames[m],
      hours: Math.round(mHours * 10) / 10,
      income: Math.round(mIncome * 100) / 100,
      courses: mCourses.length,
    });
  }

  // Entity breakdown
  const entityStats = new Map<string, { courses: number; hours: number; income: number }>();
  for (const c of courses) {
    const name = c.entity?.name || "Sin entidad";
    const prev = entityStats.get(name) || { courses: 0, hours: 0, income: 0 };
    entityStats.set(name, {
      courses: prev.courses + 1,
      hours: prev.hours + c.totalHours,
      income: prev.income + calculateCourseIncome(c),
    });
  }

  // Modality breakdown
  const modalityStats = { presencial: 0, online: 0, hibrido: 0 };
  for (const c of courses) {
    const key = c.modality as keyof typeof modalityStats;
    if (key in modalityStats) modalityStats[key]++;
  }

  // Conflicts
  const conflicts = await detectConflicts();

  return NextResponse.json({
    dashboard: {
      upcomingCourses,
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      monthlyHours: Math.round(monthlyHours * 10) / 10,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      yearlyIncome: Math.round(yearlyIncome * 100) / 100,
      conflicts,
    },
    monthlyStats,
    entityStats: Object.fromEntries(entityStats),
    modalityStats,
    averageHourlyRate:
      courses.length > 0
        ? Math.round(
            (yearCourses.reduce((sum, c) => sum + calculateCourseIncome(c), 0) /
              Math.max(1, yearCourses.reduce((sum, c) => sum + c.totalHours, 0))) * 100
          ) / 100
        : 0,
  });
}
