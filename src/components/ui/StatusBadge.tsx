import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  oferta: "bg-purple-100 text-purple-700",
  pendiente: "bg-yellow-100 text-yellow-700",
  confirmado: "bg-blue-100 text-blue-700",
  finalizado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
  recibida: "bg-purple-100 text-purple-700",
  evaluando: "bg-yellow-100 text-yellow-700",
  aceptada: "bg-green-100 text-green-700",
  rechazada: "bg-red-100 text-red-700",
  impartida: "bg-green-100 text-green-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        statusColors[status] || "bg-slate-100 text-slate-700"
      )}
    >
      {status}
    </span>
  );
}
