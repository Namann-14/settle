import type { Frequency } from "@/types";

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function describeFrequency(frequency: Frequency, interval: number) {
  if (interval === 1) return FREQUENCY_LABELS[frequency];
  const unit = { DAILY: "days", WEEKLY: "weeks", MONTHLY: "months", YEARLY: "years" }[frequency];
  return `Every ${interval} ${unit}`;
}
