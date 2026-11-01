"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { HandCoins, MessageSquare, Plus, Receipt, Search, UserPlus, Users } from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@settle/ui/components/command";

import { NAV_ITEMS } from "@/components/dashboard/nav-main";
import { ExpenseSheet, type ExpenseSheetSeed } from "@/components/expenses/expense-sheet";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import {
  RecordSettlementDialog,
  type SettlementPreset,
} from "@/components/settlements/record-settlement-dialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGroups } from "@/hooks/useGroups";
import { listExpenses } from "@/lib/api/expenses";
import { formatMoney } from "@/lib/balances";
import { formatDay, initials, num } from "@/lib/people";
import type { Group } from "@/types";

const ACTIONS = [
  { id: "add-expense", label: "Add expense", icon: Plus },
  { id: "new-group", label: "New group", icon: UserPlus },
  { id: "settle-up", label: "Settle up", icon: HandCoins },
] as const;

type ActionId = (typeof ACTIONS)[number]["id"];

function matches(query: string, ...fields: (string | null | undefined)[]) {
  const q = query.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(q));
}

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** Everyone you share a group with, once each, with the groups you share. */
function peopleFrom(groups: Group[] | undefined, meId: string | undefined) {
  const byId = new Map<string, { userId: string; name: string; email?: string | null; groups: Group[] }>();
  for (const g of groups ?? []) {
    for (const m of g.members) {
      if (m.removed_at || m.user_id === meId) continue;
      const entry = byId.get(m.user_id) ?? {
        userId: m.user_id,
        name: m.user_name || m.user_email || "Member",
        email: m.user_email,
        groups: [],
      };
      entry.groups.push(g);
      byId.set(m.user_id, entry);
    }
  }
  return [...byId.values()];
}

/**
 * Topbar search (Ctrl/⌘K): pages, actions, groups and people are filtered
 * locally from cached data; expenses are searched on the server by
 * description or merchant. The last row hands the text to Settle AI.
 */
export function SearchPalette() {
  const router = useRouter();
  const { data: me } = useCurrentUser();
  const { data: groups } = useGroups();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [seed, setSeed] = useState<ExpenseSheetSeed | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [settle, setSettle] = useState<SettlementPreset | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const trimmed = query.trim();
  const debounced = useDebounced(trimmed, 250);
  const expenses = useQuery({
    queryKey: ["expenses", { q: debounced, limit: 8, include_group_expenses: true }],
    queryFn: () => listExpenses({ q: debounced, limit: 8, include_group_expenses: true }),
    enabled: open && debounced.length >= 2,
    staleTime: 30_000,
  });

  const people = useMemo(() => peopleFrom(groups, me?.id), [groups, me?.id]);
  const groupName = (id?: string | null) => groups?.find((g) => g.id === id)?.name;

  const pages = NAV_ITEMS.filter((p) => !trimmed || matches(trimmed, p.title));
  const actions = ACTIONS.filter((a) => !trimmed || matches(trimmed, a.label));
  const groupHits = trimmed ? (groups ?? []).filter((g) => matches(trimmed, g.name, g.description)).slice(0, 5) : [];
  const peopleHits = trimmed ? people.filter((p) => matches(trimmed, p.name, p.email)).slice(0, 5) : [];
  const expenseHits = trimmed.length >= 2 && debounced === trimmed ? (expenses.data ?? []) : [];
  const searchingExpenses = trimmed.length >= 2 && (debounced !== trimmed || expenses.isFetching);

  // Rows in display order; the highlight jumps to the top one whenever the
  // results change, so Enter opens the best match rather than "Ask Settle AI"
  // (which was the only row before the expense search came back).
  const rowValues = [
    ...expenseHits.map((e) => `expense-${e.id}`),
    ...groupHits.map((g) => `group-${g.id}`),
    ...peopleHits.map((p) => `person-${p.userId}`),
    ...actions.map((a) => `action-${a.id}`),
    ...pages.map((p) => `page-${p.url}`),
    ...(trimmed ? ["ask-ai"] : []),
  ];
  const firstRow = rowValues[0] ?? "";
  const rowsKey = rowValues.join("|");
  const [selected, setSelected] = useState("");
  useEffect(() => setSelected(firstRow), [rowsKey, firstRow]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };
  const go = <T extends string>(href: Route<T>) => {
    close();
    router.push(href);
  };
  const runAction = (id: ActionId) => {
    close();
    if (id === "add-expense") setSeed({ mode: "create" });
    else if (id === "new-group") setCreatingGroup(true);
    else setSettle({});
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full items-center gap-2 rounded-full border border-border bg-card pl-3.5 pr-2 text-meta text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:h-9"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">
          Search<span className="hidden sm:inline"> expenses, groups, people</span>
        </span>
        <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-micro sm:inline">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
        title="Search"
        description="Search expenses, groups, people and pages"
        className="sm:max-w-xl"
      >
        {/* Filtering is ours: expenses are already matched by the api. */}
        <Command shouldFilter={false} value={selected} onValueChange={setSelected}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search expenses, groups, people…"
            className="text-sm"
          />
          <CommandList className="max-h-[60vh]">
            <CommandEmpty>{searchingExpenses ? "Searching…" : "No matches."}</CommandEmpty>

            {expenseHits.length > 0 && (
              <CommandGroup heading="Expenses">
                {expenseHits.map((e) => (
                  <CommandItem
                    key={e.id}
                    value={`expense-${e.id}`}
                    onSelect={() => {
                      close();
                      setSeed({ mode: "edit", expense: e });
                    }}
                  >
                    <Receipt />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{e.description}</span>
                      <span className="truncate text-micro text-muted-foreground">
                        {formatDay(e.date)} · {groupName(e.group_id) ?? "Personal"}
                        {e.merchant ? ` · ${e.merchant}` : ""}
                      </span>
                    </span>
                    <span className="text-xs tabular-nums">{formatMoney(num(e.amount), e.currency)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {groupHits.length > 0 && (
              <CommandGroup heading="Groups">
                {groupHits.map((g) => (
                  <CommandItem key={g.id} value={`group-${g.id}`} onSelect={() => go(`/dashboard/groups/${g.id}`)}>
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-accent text-micro font-semibold text-accent-foreground">
                      {initials(g.name)}
                    </span>
                    <span className="flex-1 truncate">{g.name}</span>
                    <span className="text-micro text-muted-foreground">
                      {g.members.filter((m) => !m.removed_at).length} members
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {peopleHits.length > 0 && (
              <CommandGroup heading="People">
                {peopleHits.map((p) => (
                  <CommandItem
                    key={p.userId}
                    value={`person-${p.userId}`}
                    onSelect={() => go(`/dashboard/groups/${p.groups[0].id}`)}
                  >
                    <Users />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{p.name}</span>
                      {p.email && <span className="truncate text-micro text-muted-foreground">{p.email}</span>}
                    </span>
                    <span className="max-w-32 truncate text-micro text-muted-foreground">
                      {p.groups.map((g) => g.name).join(", ")}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {actions.length > 0 && (
              <CommandGroup heading="Actions">
                {actions.map((a) => (
                  <CommandItem key={a.id} value={`action-${a.id}`} onSelect={() => runAction(a.id)}>
                    <a.icon />
                    {a.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {pages.length > 0 && (
              <CommandGroup heading="Pages">
                {pages.map((p) => (
                  <CommandItem key={p.url} value={`page-${p.url}`} onSelect={() => go(p.url)}>
                    <p.icon />
                    {p.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {trimmed && (
              <CommandGroup heading="Settle AI">
                <CommandItem
                  value="ask-ai"
                  onSelect={() => go(`/dashboard/chat?q=${encodeURIComponent(trimmed)}`)}
                >
                  <MessageSquare />
                  <span className="truncate">Ask Settle AI: “{trimmed}”</span>
                  <CommandShortcut>↵</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>

      <ExpenseSheet seed={seed} onOpenChange={(o) => !o && setSeed(null)} />
      <CreateGroupDialog open={creatingGroup} onOpenChange={setCreatingGroup} />
      <RecordSettlementDialog preset={settle} onOpenChange={(o) => !o && setSettle(null)} />
    </>
  );
}
