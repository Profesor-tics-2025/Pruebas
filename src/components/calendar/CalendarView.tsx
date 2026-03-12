"use client";

import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, DatesSetArg } from "@fullcalendar/core";
import Card from "@/components/ui/Card";
import type { Session } from "@/types";

const courseColors = [
  "#2563eb", "#dc2626", "#16a34a", "#ea580c", "#7c3aed",
  "#0891b2", "#be185d", "#4f46e5", "#059669", "#d97706",
];

export default function CalendarView() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const colorMap = new Map<string, string>();
  let colorIndex = 0;

  const getCourseColor = useCallback((courseId: string) => {
    if (!colorMap.has(courseId)) {
      colorMap.set(courseId, courseColors[colorIndex % courseColors.length]);
      colorIndex++;
    }
    return colorMap.get(courseId)!;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEvents = useCallback(async (start: Date, end: Date) => {
    const from = start.toISOString().split("T")[0];
    const to = end.toISOString().split("T")[0];

    const res = await fetch(`/api/sessions?from=${from}&to=${to}`);
    const sessions: Session[] = await res.json();

    const calEvents: EventInput[] = sessions.map((s) => {
      const dateStr = new Date(s.date).toISOString().split("T")[0];
      return {
        id: s.id,
        title: s.course ? `${s.course.name}${s.content ? ` - ${s.content}` : ""}` : "Sesión",
        start: `${dateStr}T${s.startTime}:00`,
        end: `${dateStr}T${s.endTime}:00`,
        backgroundColor: getCourseColor(s.courseId),
        borderColor: getCourseColor(s.courseId),
        extendedProps: {
          status: s.status,
          courseName: s.course?.name,
        },
      };
    });

    setEvents(calEvents);
  }, [getCourseColor]);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    loadEvents(start, end);
  }, [loadEvents]);

  const handleDatesSet = (arg: DatesSetArg) => {
    loadEvents(arg.start, arg.end);
  };

  return (
    <Card className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale="es"
        firstDay={1}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        events={events}
        datesSet={handleDatesSet}
        height="auto"
        aspectRatio={1.8}
        eventDisplay="block"
        slotDuration="00:30:00"
        nowIndicator={true}
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
        }}
      />
    </Card>
  );
}
