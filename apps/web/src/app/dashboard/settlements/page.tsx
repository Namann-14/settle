import { SettlementsPage } from "@/components/settlements/settlements-page";
import { Prefetch, serverQueries } from "@/lib/server-prefetch";

export default function Page() {
  return (
    <Prefetch queries={[serverQueries.expenses({ limit: 100 }), serverQueries.settlements({ limit: 100 })]}>
      <SettlementsPage />
    </Prefetch>
  );
}
