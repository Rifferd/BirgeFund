import { getStatusLabel } from "../lib/statusLabels";

export function StatusBadge({ status }: { status?: string | null }) {
  const tone =
    status === "fundraising" || status === "approved" || status === "completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
      : status === "rejected" || status === "failed" || status === "cancelled"
        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        : status === "pending_review"
          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
          : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tone}`}>
      {getStatusLabel(status)}
    </span>
  );
}
