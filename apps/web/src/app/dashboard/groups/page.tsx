import { GroupsPage } from "@/components/groups/groups-page";
import { Prefetch, serverQueries } from "@/lib/server-prefetch";

export default function Page() {
  return (
    <Prefetch queries={[serverQueries.expenses({ limit: 100 }), serverQueries.settlements({ limit: 100 })]}>
      <GroupsPage />
    </Prefetch>
  );
}
