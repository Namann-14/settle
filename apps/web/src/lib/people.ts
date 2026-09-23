import type { Group } from "@/types";

export function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || "?";
}

export function firstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] ?? null;
}

// The api has no GET /users/{id}, so names come from the group member lists
// the dashboard already fetches. Email is the fallback when a member never
// set a name.
export function buildNameMap(groups: Group[] | undefined) {
  const map = new Map<string, string>();
  for (const group of groups ?? []) {
    for (const member of group.members) {
      const label = member.user_name || member.user_email;
      if (label && !map.has(member.user_id)) map.set(member.user_id, label);
    }
  }
  return map;
}

export function displayName(
  names: Map<string, string>,
  userId: string,
  meId: string | undefined,
  { you = "You" }: { you?: string } = {},
) {
  if (userId === meId) return you;
  return names.get(userId) ?? "Member";
}

/** Money values arrive as Decimal strings from the api. */
export function num(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDay(iso: string) {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
