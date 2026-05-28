export function EmptyState({ text = "Данных пока нет" }: { text?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-8 text-center text-sm font-semibold text-muted dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      {text}
    </div>
  );
}
