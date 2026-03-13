"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats, MonthlyStats } from "@/types";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import ConflictAlerts from "@/components/dashboard/ConflictAlerts";

interface StatsResponse {
  dashboard: DashboardStats;
  monthlyStats: MonthlyStats[];
  averageHourlyRate: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const d = stats?.dashboard;

  const metricCards = [
    {
      title: "Próximos Cursos",
      value: d?.upcomingCourses ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Horas esta semana",
      value: `${d?.weeklyHours ?? 0}h`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Ingresos del mes",
      value: formatCurrency(d?.monthlyIncome ?? 0),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
        </svg>
      ),
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Ingresos anuales",
      value: formatCurrency(d?.yearlyIncome ?? 0),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      ),
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Resumen de tu actividad docente
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <Card key={card.title} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${card.color}`}>{card.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Horas este mes</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{d?.monthlyHours ?? 0}h</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Tarifa media</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(stats?.averageHourlyRate ?? 0)}/h
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Alertas activas</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {d?.conflicts.length ?? 0}
          </p>
        </Card>
      </div>

      {/* Conflict alerts */}
      {d && d.conflicts.length > 0 && <ConflictAlerts conflicts={d.conflicts} />}

      {/* Charts */}
      {stats?.monthlyStats && <DashboardCharts monthlyStats={stats.monthlyStats} />}
    </div>
  );
}
