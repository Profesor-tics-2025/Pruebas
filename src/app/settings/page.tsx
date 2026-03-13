"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import type { TeacherConfig } from "@/types";
import toast from "react-hot-toast";

const DAYS = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "0", label: "Domingo" },
];

export default function SettingsPage() {
  const [config, setConfig] = useState<TeacherConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setConfig)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (res.ok) {
      toast.success("Configuración guardada");
    } else {
      toast.error("Error al guardar");
    }
    setSaving(false);
  };

  const toggleDay = (day: string) => {
    if (!config) return;
    const days = config.availableDays.split(",").filter(Boolean);
    const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    setConfig({ ...config, availableDays: newDays.sort().join(",") });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!config) return null;

  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">
          Personaliza los parámetros de tu actividad docente
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Work hours */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Horario y capacidad</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Máximo de horas por semana
              </label>
              <input
                type="number"
                min="1"
                max="60"
                className={inputClass}
                value={config.maxHoursPerWeek}
                onChange={(e) => setConfig({ ...config, maxHoursPerWeek: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-slate-400 mt-1">
                Se usa para detectar exceso de carga y recomendaciones IA
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Máximo de horas por día
              </label>
              <input
                type="number"
                min="1"
                max="12"
                className={inputClass}
                value={config.dailyMaxHours}
                onChange={(e) => setConfig({ ...config, dailyMaxHours: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </Card>

        {/* Available days */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Días disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const isActive = config.availableDays.split(",").includes(day.value);
              return (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Rates */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Tarifas</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tarifa mínima por hora (EUR)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              className={inputClass}
              value={config.minHourlyRate}
              onChange={(e) => setConfig({ ...config, minHourlyRate: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-slate-400 mt-1">
              Las ofertas por debajo de esta tarifa serán señaladas por la IA
            </p>
          </div>
        </Card>

        {/* Modality preference */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Preferencia de modalidad</h3>
          <div className="flex gap-3">
            {[
              { value: "presencial", label: "Presencial" },
              { value: "online", label: "Online" },
              { value: "both", label: "Sin preferencia" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setConfig({ ...config, preferredModality: opt.value })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  config.preferredModality === opt.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </div>
    </div>
  );
}
