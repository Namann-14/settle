"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { Panel, PanelHeader, buttonClass, rowClass } from "@/components/dashboard/panel";
import { useUpdateCurrentUser } from "@/hooks/mutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// A short list for the people Settle is built for; anything else already
// saved on the account is kept as an extra option so it never disappears.
const CURRENCIES = [
  { code: "INR", label: "Indian rupee" },
  { code: "USD", label: "US dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British pound" },
  { code: "AED", label: "UAE dirham" },
  { code: "SGD", label: "Singapore dollar" },
] as const;

// DESIGN.md input: 8px corners, hairline stroke, token focus ring. Taller on
// phones for the tap target, and 16px text there so iOS doesn't zoom in.
const selectClass =
  "h-11 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-transparent px-2.5 text-base text-foreground transition-colors duration-150 outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-56 sm:text-xs dark:bg-input/30";

function Detail({ label, value, loading }: { label: string; value?: string | null; loading: boolean }) {
  return (
    <div className={rowClass}>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      {loading ? (
        <Skeleton className="h-3.5 w-40 rounded-full" />
      ) : (
        <span className="min-w-0 truncate text-right">{value || "Not set"}</span>
      )}
    </div>
  );
}

export function AccountPanel() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const { data: me, isLoading: meLoading } = useCurrentUser();
  const update = useUpdateCurrentUser();

  const name = user?.fullName || me?.name;
  const email = user?.primaryEmailAddress?.emailAddress || me?.email;
  const current = me?.default_currency;
  const options =
    current && !CURRENCIES.some((c) => c.code === current)
      ? [...CURRENCIES, { code: current, label: current }]
      : CURRENCIES;

  const changeCurrency = (code: string) => {
    if (!code || code === current) return;
    update.mutate(
      { default_currency: code },
      {
        onSuccess: () => toast.success(`Default currency set to ${code}`),
        onError: (err) => toast.error(err.message || "Couldn't save your currency"),
      },
    );
  };

  return (
    <Panel className="gap-2">
      <PanelHeader
        title="Account"
        description="Your name and email come from your sign-in."
        action={
          <button
            type="button"
            onClick={() => openUserProfile()}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            Manage account
          </button>
        }
      />

      <div className="flex flex-col">
        <Detail label="Name" value={name} loading={!isLoaded && !me} />
        <Detail label="Email" value={email} loading={!isLoaded && !me} />

        <div className={cn(rowClass, "flex-col items-stretch gap-2 sm:flex-row sm:items-center")}>
          <div className="flex min-w-0 flex-col gap-0.5">
            <label htmlFor="default-currency" className="text-muted-foreground">
              Default currency
            </label>
            <p id="default-currency-hint" className="text-xs text-muted-foreground">
              Used for your personal spending totals and budgets.
            </p>
          </div>
          {meLoading ? (
            <Skeleton className="h-11 w-full rounded-lg sm:h-8 sm:w-56" />
          ) : (
            <select
              id="default-currency"
              value={current ?? ""}
              onChange={(e) => changeCurrency(e.target.value)}
              disabled={!me || update.isPending}
              aria-describedby="default-currency-hint"
              className={selectClass}
            >
              {!current && <option value="">Choose a currency</option>}
              {options.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </Panel>
  );
}
