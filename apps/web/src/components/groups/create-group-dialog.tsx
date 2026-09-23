"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@settle/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@settle/ui/components/dialog";

import { CURRENCIES, Field, FormError, controlClass } from "@/components/forms/field";
import { useCreateGroup } from "@/hooks/mutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { inviteMember } from "@/lib/api/groups";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateGroupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data: me } = useCurrentUser();
  const createGroup = useCreateGroup();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [inviting, setInviting] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setCurrency(null);
    setEmailDraft("");
    setEmails([]);
    setError(null);
  };

  const addEmail = (raw: string) => {
    const parts = raw.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
    const bad = parts.find((e) => !EMAIL_RE.test(e));
    if (bad) {
      setError(new Error(`“${bad}” doesn't look like an email`));
      return;
    }
    setError(null);
    setEmails((prev) => [...new Set([...prev, ...parts])].filter((e) => e !== me?.email?.toLowerCase()));
    setEmailDraft("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const pending = emailDraft.trim() ? [...emails, emailDraft.trim().toLowerCase()] : emails;
    if (pending.some((e) => !EMAIL_RE.test(e))) {
      setError(new Error("Fix the highlighted email before creating the group"));
      return;
    }
    setError(null);
    try {
      const group = await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        default_currency: currency ?? me?.default_currency ?? "INR",
      });

      // Invite one by one so a single bad address doesn't sink the rest.
      setInviting(true);
      const results = await Promise.allSettled(
        pending.map((email) => inviteMember(group.id, { email })),
      );
      setInviting(false);
      const failed = results.filter((r) => r.status === "rejected").length;
      const invited = results.filter(
        (r) => r.status === "fulfilled" && r.value.status === "invited",
      ).length;

      if (failed) toast.error(`${failed} member${failed === 1 ? "" : "s"} couldn't be added`);
      else if (invited) toast.success(`Group created. ${invited} pending invite${invited === 1 ? "" : "s"} sent`);
      else toast.success("Group created");

      reset();
      onOpenChange(false);
      router.push(`/dashboard/groups/${group.id}`);
    } catch (err) {
      setInviting(false);
      setError(err);
    }
  };

  const busy = createGroup.isPending || inviting;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="gap-5 p-7 sm:max-w-[460px]">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="font-display text-3xl font-normal">New group</DialogTitle>
          <DialogDescription className="text-sm">
            Add people by email. Anyone not on Settle yet gets a pending invite and joins when they
            sign up.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Name">
            <input
              autoFocus
              required
              maxLength={255}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Goa trip"
              className={controlClass}
            />
          </Field>
          <Field label="Description (optional)">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group for?"
              className={controlClass}
            />
          </Field>
          <div className="flex gap-3">
            <Field label="Members" className="flex-1" hint="Press Enter after each email">
              <input
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === ",") && emailDraft.trim()) {
                    e.preventDefault();
                    addEmail(emailDraft);
                  }
                }}
                onBlur={() => emailDraft.trim() && addEmail(emailDraft)}
                placeholder="friend@email.com"
                className={controlClass}
              />
            </Field>
            <Field label="Currency" className="w-28">
              <select
                value={currency ?? me?.default_currency ?? "INR"}
                onChange={(e) => setCurrency(e.target.value)}
                className={controlClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          {emails.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {emails.map((email) => (
                <li
                  key={email}
                  className="flex items-center gap-1 rounded-full bg-muted py-1 pr-1 pl-3 text-[13px]"
                >
                  {email}
                  <button
                    type="button"
                    aria-label={`Remove ${email}`}
                    onClick={() => setEmails((prev) => prev.filter((e) => e !== email))}
                    className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <FormError error={error} />

          <DialogFooter className="mt-1 gap-2 border-0 bg-transparent p-0 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5 text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-11 px-6 text-sm" disabled={busy || !name.trim()}>
              {busy ? "Creating…" : "Create group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
