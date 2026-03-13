"use client";

import { useState } from "react";
import type { CourseOffer } from "@/types";
import toast from "react-hot-toast";

interface Props {
  offer: CourseOffer | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function OfferForm({ offer, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    courseName: offer?.courseName || "",
    entityName: offer?.entity?.name || "",
    startDate: offer?.startDate ? new Date(offer.startDate).toISOString().split("T")[0] : "",
    endDate: offer?.endDate ? new Date(offer.endDate).toISOString().split("T")[0] : "",
    schedule: offer?.schedule || "",
    totalHours: offer?.totalHours?.toString() || "",
    hourlyRate: offer?.hourlyRate?.toString() || "",
    totalPrice: offer?.totalPrice?.toString() || "",
    modality: offer?.modality || "presencial",
    cityOrPlatform: offer?.cityOrPlatform || "",
    status: offer?.status || "recibida",
    notes: offer?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = offer ? `/api/offers/${offer.id}` : "/api/offers";
    const method = offer ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success(offer ? "Oferta actualizada" : "Oferta registrada");
      onSave();
    } else {
      toast.error("Error al guardar");
    }
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelClass}>Nombre del curso *</label>
          <input type="text" required className={inputClass} value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Entidad formativa</label>
          <input type="text" className={inputClass} value={form.entityName} onChange={(e) => setForm({ ...form, entityName: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Modalidad</label>
          <select className={inputClass} value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })}>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Ciudad / Plataforma</label>
          <input type="text" className={inputClass} value={form.cityOrPlatform} onChange={(e) => setForm({ ...form, cityOrPlatform: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Horario</label>
          <input type="text" className={inputClass} value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="L-V 9:00-14:00" />
        </div>
        <div>
          <label className={labelClass}>Fecha inicio *</label>
          <input type="date" required className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Fecha fin *</label>
          <input type="date" required className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Horas totales *</label>
          <input type="number" required step="0.5" min="0" className={inputClass} value={form.totalHours} onChange={(e) => setForm({ ...form, totalHours: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Precio por hora</label>
          <input type="number" step="0.01" min="0" className={inputClass} value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Precio total</label>
          <input type="number" step="0.01" min="0" className={inputClass} value={form.totalPrice} onChange={(e) => setForm({ ...form, totalPrice: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="recibida">Recibida</option>
            <option value="evaluando">Evaluando</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Notas</label>
          <textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Guardando..." : offer ? "Actualizar" : "Registrar oferta"}
        </button>
      </div>
    </form>
  );
}
