"use client";

import { useEffect, useState, useCallback } from "react";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import CourseForm from "@/components/courses/CourseForm";
import SessionList from "@/components/courses/SessionList";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Course } from "@/types";
import toast from "react-hot-toast";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showSessions, setShowSessions] = useState<Course | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const loadCourses = useCallback(() => {
    const url = statusFilter ? `/api/courses?status=${statusFilter}` : "/api/courses";
    fetch(url)
      .then((r) => r.json())
      .then(setCourses)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este curso y todas sus sesiones?")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    toast.success("Curso eliminado");
    loadCourses();
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingCourse(null);
    loadCourses();
  };

  const statuses = ["", "oferta", "pendiente", "confirmado", "finalizado", "cancelado"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cursos</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona todos tus cursos</p>
        </div>
        <button
          onClick={() => { setEditingCourse(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nuevo curso
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s || "Todos"}
          </button>
        ))}
      </div>

      {/* Course table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Curso</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Entidad</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Fechas</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Horas</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Ingresos</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Cargando...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No hay cursos registrados
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const income = course.totalPrice || (course.hourlyRate ? course.hourlyRate * course.totalHours : 0);
                  return (
                    <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{course.name}</p>
                          <p className="text-xs text-slate-500">
                            {course.modality} {course.cityOrPlatform ? `- ${course.cityOrPlatform}` : ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {course.entity?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(course.startDate)} - {formatDate(course.endDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{course.totalHours}h</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {formatCurrency(income)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={course.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowSessions(course)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600"
                            title="Sesiones"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { setEditingCourse(course); setShowForm(true); }}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Course form modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingCourse(null); }}
        title={editingCourse ? "Editar curso" : "Nuevo curso"}
        size="lg"
      >
        <CourseForm course={editingCourse} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingCourse(null); }} />
      </Modal>

      {/* Sessions modal */}
      <Modal
        isOpen={!!showSessions}
        onClose={() => setShowSessions(null)}
        title={`Sesiones: ${showSessions?.name ?? ""}`}
        size="lg"
      >
        {showSessions && <SessionList course={showSessions} />}
      </Modal>
    </div>
  );
}
