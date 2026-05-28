export function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(amount) + " сом";
}
