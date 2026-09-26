import { SpendingOverview } from "@/components/spending/spending-overview";
import { currentMonth, isMonth } from "@/lib/months";

export default async function SpendingPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { month } = await searchParams;
  return <SpendingOverview month={isMonth(month) ? month : currentMonth()} />;
}
