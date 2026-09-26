import { RecurringPage } from "@/components/spending/recurring-page";
import { Prefetch, serverQueries } from "@/lib/server-prefetch";

export default function Page() {
  return (
    <Prefetch queries={[serverQueries.recurring()]}>
      <RecurringPage />
    </Prefetch>
  );
}
