// Months are "YYYY-MM" strings everywhere in the spending tracker, matching
// the api's ?month= parameter. All math is on the user's local calendar.

const pad = (n: number) => String(n).padStart(2, "0");

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function isMonth(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const index = y * 12 + (m - 1) + delta;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

/** First and last ISO day of the month. */
export function monthBounds(month: string) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${pad(last)}` };
}

export function monthLabel(month: string, opts: { short?: boolean } = {}) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: opts.short ? "short" : "long",
    year: opts.short ? undefined : "numeric",
  });
}

/** How far through `month` today is, 0..1 (1 for past months, 0 for future ones). */
export function monthProgress(month: string) {
  const now = currentMonth();
  if (month < now) return 1;
  if (month > now) return 0;
  const d = new Date();
  return d.getDate() / new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
