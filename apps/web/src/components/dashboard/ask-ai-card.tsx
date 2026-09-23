"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { CHAT_SUGGESTIONS } from "@/components/chat/suggestions";
import { Eyebrow } from "@/components/dashboard/panel";

// Entry point only — no chat state lives on the dashboard home. Submitting
// hands the prompt to the full chat page, which sends it on mount.
export function AskAiCard() {
  const router = useRouter();
  const [input, setInput] = useState("");

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    router.push(`/dashboard/chat?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="flex h-full flex-col gap-6 rounded-2xl bg-accent-foreground p-6 text-primary-foreground md:flex-row md:items-center md:gap-8 md:p-8">
      <div className="flex flex-1 flex-col gap-2.5">
        <Eyebrow className="text-primary-foreground/60">Settle AI</Eyebrow>
        <h2 className="font-display text-3xl leading-none tracking-tight md:text-4xl">
          Ask your money <em className="italic">anything</em>
        </h2>
        <p className="text-sm leading-relaxed text-primary-foreground/70">
          Balances, spending and groups, answered in plain language.
        </p>
      </div>
      <div className="flex min-w-0 flex-[1.2] flex-col gap-3">
        <PromptInput
          // PromptInput wraps its content in a square InputGroup; round it and the
          // submit button from here so the shared component stays untouched.
          className="text-foreground [&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:border-transparent [&_button[type=submit]]:rounded-full"
          onSubmit={(message: PromptInputMessage) => ask(message.text)}
        >
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Who owes me money?"
              className="min-h-10"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit disabled={!input.trim()} />
          </PromptInputFooter>
        </PromptInput>
        <Suggestions>
          {CHAT_SUGGESTIONS.slice(0, 3).map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={ask}
              className="border-primary-foreground/20 bg-transparent text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            />
          ))}
        </Suggestions>
      </div>
    </section>
  );
}
