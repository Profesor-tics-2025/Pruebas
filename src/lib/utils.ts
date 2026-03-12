import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  return time;
}

export function getHoursBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

export function calculateCourseIncome(course: {
  hourlyRate?: number | null;
  totalPrice?: number | null;
  totalHours: number;
}): number {
  if (course.totalPrice) return course.totalPrice;
  if (course.hourlyRate) return course.hourlyRate * course.totalHours;
  return 0;
}

// Default user ID for demo (single-tenant)
export const DEFAULT_USER_ID = "demo-user";
