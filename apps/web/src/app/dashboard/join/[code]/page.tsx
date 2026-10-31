import { JoinGroup } from "@/components/groups/join-group";

// /dashboard is Clerk-protected, so someone opening a shared link signs in
// first and lands back here.
export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <JoinGroup code={code} />;
}
