"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useRecurringSync } from "@/hooks/mutations";

// Recurring expenses have no cron: whenever the dashboard opens, log every
// occurrence that has fallen due (on the user's local date). The api locks
// the rules while it works, so two tabs doing this at once is harmless.
export function RecurringSync() {
  const sync = useRecurringSync();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    sync.mutate(undefined, {
      onSuccess: ({ created }) => {
        if (created > 0) toast.success(`Logged ${created} recurring expense${created === 1 ? "" : "s"}`);
      },
    });
  }, [sync]);

  return null;
}
