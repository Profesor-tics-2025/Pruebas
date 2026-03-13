"use client";

import type { CourseOffer, AIRecommendation } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  offer: CourseOffer;
  recommendation: AIRecommendation;
}

export default function AIRecommendationPanel({ offer, recommendation }: Props) {
  const decisionConfig = {
    aceptar: {
      label: "Aceptar curso",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: (
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    aceptar_con_ajustes: {
      label: "Aceptar con ajustes",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: (
        <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      ),
    },
    no_aceptar: {
      label: "No aceptar",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: (
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
  };

  const config = decisionConfig[recommendation.decision];
  const income = offer.totalPrice || (offer.hourlyRate ? offer.hourlyRate * offer.totalHours : 0);

  return (
    <div className="space-y-5">
      {/* Decision header */}
      <div className={`flex items-center gap-4 p-4 rounded-xl border ${config.color}`}>
        {config.icon}
        <div>
          <h3 className="text-lg font-bold">{config.label}</h3>
          <p className="text-sm">Confianza: {recommendation.confidence}%</p>
        </div>
      </div>

      {/* Offer summary */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-slate-500">Curso</p>
          <p className="font-medium">{offer.courseName}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-slate-500">Ingresos</p>
          <p className="font-medium">{formatCurrency(income)}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-slate-500">Horas totales</p>
          <p className="font-medium">{offer.totalHours}h</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-slate-500">Impacto semanal</p>
          <p className="font-medium">+{recommendation.weeklyHoursImpact.toFixed(1)}h/semana</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Análisis detallado</h4>
        <div className="text-sm text-slate-600 whitespace-pre-line">
          {recommendation.explanation}
        </div>
      </div>

      {/* Conflicts */}
      {recommendation.conflicts.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
          <h4 className="text-sm font-semibold text-red-700 mb-2">
            Puntos de atención ({recommendation.conflicts.length})
          </h4>
          <ul className="space-y-1">
            {recommendation.conflicts.map((c, i) => (
              <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
