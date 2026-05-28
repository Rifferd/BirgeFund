type LoadingStateProps = {
  text?: string;
};

export function LoadingState({ text = "Загрузка..." }: LoadingStateProps) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-[32px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        {text}
      </div>
    </div>
  );
}
