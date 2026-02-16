export function calculateMaxFine(revenue: number): number {
  return Math.max(10_000_000, revenue * 0.02);
}

export function formatFine(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isLikelyAffected(
  revenue: number,
  employeeCount: number
): boolean {
  return employeeCount >= 50 || revenue >= 10_000_000;
}
