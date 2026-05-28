export function formatMoney(value: number | string, currency = "KGS") {
  const numericValue = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(numericValue)) {
    return `0 ${currency}`;
  }

  return `${new Intl.NumberFormat("ru-RU").format(numericValue)} ${currency === "KGS" ? "сом" : currency}`;
}
