"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Sparkles, Square } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@settle/ui/lib/utils";

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
  const [pickedGroup, setPickedGroup] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Names are resolved against a group's members, so default to the most
  // recent group rather than "none".
  const groupId = fixedGroupId ?? pickedGroup ?? groups?.[0]?.id ?? null;
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
      className={cn(
        "flex flex-col gap-2 rounded-[20px] border border-border/70 bg-card p-2 shadow-dashboard sm:flex-row sm:items-center sm:pl-5",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-3 px-3 sm:px-0">
        <Sparkles className="size-5 shrink-0 text-primary" />
        <label className="flex flex-1">
          <span className="sr-only">Describe an expense</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={busy || recording}
            maxLength={2000}
            placeholder={
              recording ? "Listening… tap stop when you’re done" : "Dinner 2400 at Toit with Riya and Aman, I paid"
            }
            className="h-11 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        {!fixedGroupId && groups && groups.length > 0 && (
          <select
            aria-label="Group for this expense"
            value={groupId ?? ""}
            onChange={(e) => setPickedGroup(e.target.value || null)}
            className="h-11 max-w-40 rounded-full border border-border bg-card px-3 text-[13px]"
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
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50",
            recording
              ? "animate-pulse border-destructive bg-destructive/10 text-destructive"
              : "border-border bg-card text-primary hover:bg-muted",
          )}
        >
          {recording ? <Square className="size-4 fill-current" /> : <Mic className="size-[18px]" />}
        </button>
        <button
          type="submit"
          disabled={busy || recording || !text.trim()}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 sm:flex-none"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {busy ? "Drafting…" : "Draft with AI"}
        </button>
      </div>
    </form>
  );
}
