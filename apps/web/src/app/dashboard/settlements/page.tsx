import { SettlementsPage } from "@/components/settlements/settlements-page";
import { Prefetch, serverQueries } from "@/lib/server-prefetch";

export default function Page() {
  // Balances come from useStanding (currentUser and groups are prefetched by
  // the dashboard layout; per-group balances follow on the client).
  return (
    <Prefetch queries={[serverQueries.settlements({ limit: 100 })]}>
      <SettlementsPage />
    </Prefetch>
  );
}
