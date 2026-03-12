"use client";

import dynamic from "next/dynamic";

const CalendarView = dynamic(() => import("@/components/calendar/CalendarView"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-48 mb-6" />
      <div className="h-[600px] bg-slate-200 rounded-xl" />
    </div>
  ),
});

export default function CalendarPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Calendario</h1>
        <p className="text-sm text-slate-500 mt-1">Vista visual de todas tus sesiones</p>
      </div>
      <CalendarView />
    </div>
  );
}
