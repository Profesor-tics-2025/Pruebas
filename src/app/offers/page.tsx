"use client";

import { useEffect, useState, useCallback } from "react";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import OfferForm from "@/components/offers/OfferForm";
import AIRecommendationPanel from "@/components/offers/AIRecommendationPanel";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CourseOffer, AIRecommendation } from "@/types";
import toast from "react-hot-toast";

export default function OffersPage() {
  const [offers, setOffers] = useState<CourseOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<CourseOffer | null>(null);
  const [aiResult, setAiResult] = useState<{ offer: CourseOffer; recommendation: AIRecommendation } | null>(null);

  const loadOffers = useCallback(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then(setOffers)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta oferta?")) return;
    await fetch(`/api/offers/${id}`, { method: "DELETE" });
    toast.success("Oferta eliminada");
    loadOffers();
  };

  const handleAnalyze = async (offer: CourseOffer) => {
    toast.loading("Analizando oferta...", { id: "ai" });
    const res = await fetch("/api/ai-recommendation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: offer.startDate,
        endDate: offer.endDate,
        schedule: offer.schedule,
        totalHours: offer.totalHours,
        hourlyRate: offer.hourlyRate,
        totalPrice: offer.totalPrice,
        modality: offer.modality,
      }),
    });
    const recommendation = await res.json();
    toast.dismiss("ai");

    // Save recommendation to offer
    await fetch(`/api/offers/${offer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiRecommendation: JSON.stringify(recommendation) }),
    });

    setAiResult({ offer, recommendation });
    loadOffers();
  };

  const handleStatusChange = async (offer: CourseOffer, status: string) => {
    await fetch(`/api/offers/${offer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success(`Estado cambiado a "${status}"`);
    loadOffers();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ofertas de cursos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona las ofertas recibidas y obtén recomendaciones IA
          </p>
        </div>
        <button
          onClick={() => { setEditingOffer(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Nueva oferta
        </button>
      </div>

      {/* Offers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
          ))
        ) : offers.length === 0 ? (
          <Card className="col-span-full p-8 text-center">
            <p className="text-slate-400">No hay ofertas registradas</p>
          </Card>
        ) : (
          offers.map((offer) => {
            const income = offer.totalPrice || (offer.hourlyRate ? offer.hourlyRate * offer.totalHours : 0);
            const savedRec = offer.aiRecommendation ? JSON.parse(offer.aiRecommendation) as AIRecommendation : null;

            return (
              <Card key={offer.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{offer.courseName}</h3>
                    <p className="text-xs text-slate-500">{offer.entity?.name || "Sin entidad"}</p>
                  </div>
                  <StatusBadge status={offer.status} />
                </div>

                <div className="space-y-1.5 text-sm text-slate-600 flex-1">
                  <p>{formatDate(offer.startDate)} - {formatDate(offer.endDate)}</p>
                  <p>{offer.totalHours}h - {offer.modality}</p>
                  {offer.schedule && <p>{offer.schedule}</p>}
                  <p className="font-medium text-slate-900">{formatCurrency(income)}</p>
                </div>

                {savedRec && (
                  <div className={`mt-3 p-2 rounded-lg text-xs ${
                    savedRec.decision === "aceptar" ? "bg-green-50 text-green-700" :
                    savedRec.decision === "aceptar_con_ajustes" ? "bg-yellow-50 text-yellow-700" :
                    "bg-red-50 text-red-700"
                  }`}>
                    IA: {savedRec.decision === "aceptar" ? "Aceptar" :
                         savedRec.decision === "aceptar_con_ajustes" ? "Aceptar con ajustes" :
                         "No aceptar"} ({savedRec.confidence}%)
                  </div>
                )}

                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleAnalyze(offer)}
                    className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                    title="Analizar con IA"
                  >
                    IA
                  </button>
                  <select
                    className="px-2 py-1 text-xs border border-slate-200 rounded"
                    value={offer.status}
                    onChange={(e) => handleStatusChange(offer, e.target.value)}
                  >
                    <option value="recibida">Recibida</option>
                    <option value="evaluando">Evaluando</option>
                    <option value="aceptada">Aceptada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                  <div className="flex-1" />
                  <button
                    onClick={() => { setEditingOffer(offer); setShowForm(true); }}
                    className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79" />
                    </svg>
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Offer form modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingOffer(null); }}
        title={editingOffer ? "Editar oferta" : "Nueva oferta"}
        size="lg"
      >
        <OfferForm
          offer={editingOffer}
          onSave={() => { setShowForm(false); setEditingOffer(null); loadOffers(); }}
          onCancel={() => { setShowForm(false); setEditingOffer(null); }}
        />
      </Modal>

      {/* AI Recommendation modal */}
      <Modal
        isOpen={!!aiResult}
        onClose={() => setAiResult(null)}
        title="Recomendación IA"
        size="md"
      >
        {aiResult && <AIRecommendationPanel offer={aiResult.offer} recommendation={aiResult.recommendation} />}
      </Modal>
    </div>
  );
}
