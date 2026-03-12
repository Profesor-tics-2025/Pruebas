import Card from "@/components/ui/Card";
import type { ConflictAlert } from "@/types";

const typeIcons: Record<string, string> = {
  overlap: "Solapamiento",
  daily_excess: "Exceso diario",
  weekly_excess: "Exceso semanal",
};

export default function ConflictAlerts({ conflicts }: { conflicts: ConflictAlert[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        Alertas de calendario ({conflicts.length})
      </h3>
      <div className="space-y-3">
        {conflicts.map((conflict, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
          >
            <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
              {typeIcons[conflict.type] || conflict.type}
            </span>
            <p className="text-sm text-red-700">{conflict.message}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
