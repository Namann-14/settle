import { GroupDetail } from "@/components/groups/group-detail";
import { Prefetch, serverQueries } from "@/lib/server-prefetch";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Prefetch
      queries={[
        serverQueries.group(id),
        serverQueries.groupBalances(id),
        serverQueries.expenses({ group_id: id, limit: 100 }),
        serverQueries.settlements({ group_id: id, limit: 100 }),
      ]}
    >
      <GroupDetail groupId={id} />
    </Prefetch>
  );
}
