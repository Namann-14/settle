"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@settle/ui/lib/utils";

import { buttonClass } from "@/components/dashboard/panel";
import { useDraftExpenseFromText, useDraftExpenseFromVoice } from "@/hooks/mutations";
import { useGroups } from "@/hooks/useGroups";
import type { ExpenseDraft } from "@/types";

const MAX_RECORDING_MS = 60_000;

// Natural-language expense entry. The AI only drafts; the draft opens in the
// expense sheet for the user to confirm before anything is saved.
export function AiQuickAdd({
  onDraft,
  groupId: fixedGroupId,
  className,
}: {
  onDraft: (draft: ExpenseDraft) => void;
  /** Lock drafts to one group (group detail page). */
  groupId?: string;
  className?: string;
}) {
  const { data: groups } = useGroups();
  const fromText = useDraftExpenseFromText();
  const fromVoice = useDraftExpenseFromVoice();
  const [text, setText] = useState("");
  // undefined = not picked yet (use the default below); "" = "No group".
  const [pickedGroup, setPickedGroup] = useState<string | undefined>(undefined);
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Names are resolved against a group's members, so default to the most
  // recent group rather than "none".
  const groupId = fixedGroupId ?? (pickedGroup !== undefined ? pickedGroup || null : groups?.[0]?.id ?? null);
  const busy = fromText.isPending || fromVoice.isPending;

  useEffect(
    () => () => {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      recorder.current?.stream.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || busy) return;
    try {
      const draft = await fromText.mutateAsync({ text: text.trim(), groupId });
      setText("");
      onDraft({ ...draft, group_id: draft.group_id ?? groupId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't draft that expense");
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Voice input isn't supported in this browser");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error("Microphone access was blocked");
      return;
    }
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = async () => {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      const audio = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      if (audio.size === 0) return;
      try {
        const draft = await fromVoice.mutateAsync({ audio, groupId });
        onDraft({ ...draft, group_id: draft.group_id ?? groupId });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't understand that recording");
      }
    };
    recorder.current = rec;
    rec.start();
    setRecording(true);
    stopTimer.current = setTimeout(() => rec.state === "recording" && rec.stop(), MAX_RECORDING_MS);
  };

  return (
    <form
      onSubmit={submit}
      aria-label="Settle AI quick add"
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 transition-colors duration-150 focus-within:border-ring sm:flex-row sm:items-center sm:pl-4",
        className,
      )}
    >
      <label className="flex min-w-0 flex-1 items-center gap-3 px-2 sm:px-0">
        <span className="shrink-0 text-meta font-medium text-primary">Settle AI</span>
        <span className="sr-only">Describe an expense</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy || recording}
          maxLength={2000}
          placeholder={
            recording ? "Listening… tap stop when you’re done" : "Dinner 2400 at Toit with Riya and Aman, I paid"
          }
          className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:h-9"
        />
      </label>
      <div className="flex items-center gap-2">
        {!fixedGroupId && groups && groups.length > 0 && (
          <select
            aria-label="Group for this expense"
            value={groupId ?? ""}
            onChange={(e) => setPickedGroup(e.target.value)}
            className="h-11 min-w-0 max-w-40 flex-1 truncate rounded-full border border-border bg-card px-3 text-xs text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 sm:h-8 sm:flex-none"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
            <option value="">No group</option>
          </select>
        )}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={busy}
          aria-label={recording ? "Stop recording" : "Record voice"}
          aria-pressed={recording}
          className={buttonClass({
            variant: recording ? "danger" : "secondary",
            size: "sm",
            className: "w-11 px-0 sm:w-8",
          })}
        >
          {recording ? <Square className="fill-current" /> : <Mic />}
        </button>
        <button
          type="submit"
          disabled={busy || recording || !text.trim()}
          className={buttonClass({ size: "sm", className: "flex-1 sm:flex-none" })}
        >
          {busy ? "Drafting…" : "Draft with AI"}
        </button>
      </div>
    </form>
  );
}
