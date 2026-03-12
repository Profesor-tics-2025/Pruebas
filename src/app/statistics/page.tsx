"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

interface StatsData {
  monthlyStats: Array<{ month: string; hours: number; income: number; courses: number }>;
  entityStats: Record<string, { courses: number; hours: number; income: number }>;
  modalityStats: { presencial: number; online: number; hibrido: number };
  averageHourlyRate: number;
  dashboard: {
    yearlyIncome: number;
    monthlyHours: number;
  };
}

const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#ea580c", "#7c3aed", "#0891b2"];

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-72 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const entityData = Object.entries(stats.entityStats).map(([name, data]) => ({
    name,
    ...data,
  }));

  const modalityData = [
    { name: "Presencial", value: stats.modalityStats.presencial },
    { name: "Online", value: stats.modalityStats.online },
    { name: "Híbrido", value: stats.modalityStats.hibrido },
  ].filter((d) => d.value > 0);

  const totalYearlyHours = stats.monthlyStats.reduce((s, m) => s + m.hours, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Estadísticas</h1>
        <p className="text-sm text-slate-500 mt-1">Análisis detallado de tu actividad docente</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Ingresos anuales</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(stats.dashboard.yearlyIncome)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Horas anuales</p>
          <p className="text-xl font-bold mt-1">{totalYearlyHours.toFixed(1)}h</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Tarifa media</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(stats.averageHourlyRate)}/h</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Entidades</p>
          <p className="text-xl font-bold mt-1">{entityData.length}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by month */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Ingresos por mes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)} EUR`, "Ingresos"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="income" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hours by month */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Horas impartidas por mes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(v: number) => [`${v}h`, "Horas"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="hours" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Courses by entity */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Cursos por entidad</h3>
          <div className="h-64">
            {entityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={120} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="courses" fill="#7c3aed" radius={[0, 4, 4, 0]} name="Cursos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Sin datos
              </div>
            )}
          </div>
        </Card>

        {/* Modality distribution */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Distribución presencial / online</h3>
          <div className="h-64">
            {modalityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modalityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {modalityData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Sin datos
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Workload analysis */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Análisis de carga docente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.monthlyStats.filter((m) => m.hours > 0).map((m) => {
            const weeklyAvg = m.hours / 4;
            const occupancy = Math.min(100, (weeklyAvg / 30) * 100);
            return (
              <div key={m.month} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{m.month}</span>
                  <span className="text-xs text-slate-500">{m.hours}h</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${occupancy > 80 ? "bg-red-500" : occupancy > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${occupancy}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{occupancy.toFixed(0)}% ocupación</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
