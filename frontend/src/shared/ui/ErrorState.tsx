export function ErrorState({ message = "Не удалось загрузить данные" }: { message?: string }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
      {message}
    </div>
  );
}
