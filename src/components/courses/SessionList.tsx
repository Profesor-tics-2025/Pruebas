"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { Course, Session } from "@/types";
import toast from "react-hot-toast";

export default function SessionList({ course }: { course: Course }) {
  const [sessions, setSessions] = useState<Session[]>(course.sessions || []);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    date: "",
    startTime: "09:00",
    endTime: "14:00",
    content: "",
  });

  useEffect(() => {
    fetch(`/api/sessions?courseId=${course.id}`)
      .then((r) => r.json())
      .then(setSessions);
  }, [course.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, courseId: course.id }),
    });
    if (res.ok) {
      toast.success("Sesión añadida");
      setShowAdd(false);
      setForm({ date: "", startTime: "09:00", endTime: "14:00", content: "" });
      const updated = await fetch(`/api/sessions?courseId=${course.id}`).then((r) => r.json());
      setSessions(updated);
    }
  };

  const toggleStatus = async (session: Session) => {
    const newStatus = session.status === "pendiente" ? "impartida" : "pendiente";
    await fetch(`/api/sessions/${session.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setSessions(sessions.map((s) => (s.id === session.id ? { ...s, status: newStatus } : s)));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setSessions(sessions.filter((s) => s.id !== id));
    toast.success("Sesión eliminada");
  };

  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{sessions.length} sesiones</p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
        >
          + Añadir sesión
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-4 bg-slate-50 rounded-lg space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha</label>
              <input type="date" required className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hora inicio</label>
              <input type="time" required className={inputClass} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hora fin</label>
              <input type="time" required className={inputClass} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Contenido</label>
            <input type="text" className={inputClass} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Descripción de la sesión" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium">Guardar</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No hay sesiones</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <button onClick={() => toggleStatus(session)} className="flex-shrink-0" title="Cambiar estado">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${session.status === "impartida" ? "bg-green-500 border-green-500" : "border-slate-300"}`}>
                  {session.status === "impartida" && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{formatDate(session.date)}</span>
                  <span className="text-xs text-slate-500">{session.startTime} - {session.endTime}</span>
                  <StatusBadge status={session.status} />
                </div>
                {session.content && <p className="text-xs text-slate-500 mt-0.5 truncate">{session.content}</p>}
              </div>
              <button onClick={() => handleDelete(session.id)} className="text-slate-400 hover:text-red-500 p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
