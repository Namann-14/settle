"use client";

import { useUser } from "@clerk/nextjs";
import { ArrowRight, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@settle/ui/lib/utils";

import { CHAT_SUGGESTIONS } from "@/components/chat/suggestions";
import { buttonClass } from "@/components/dashboard/panel";

// Starters that prefill the box for the user to finish, unlike the ideas
// list below, which sends straight away.
const STARTERS: { label: string; text: string }[] = [
  { label: "Balances", text: "What's my balance with " },
  { label: "Spending", text: "How much did I spend on " },
  { label: "Groups", text: "Show the expenses in my group " },
];

function greetingFor(hour: number) {
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// The hour is only known on the client, so the greeting is filled in after
// mount to keep the server render and hydration in agreement.
export function useGreeting() {
  const { user } = useUser();
  const [greeting, setGreeting] = useState<string | null>(null);
  useEffect(() => setGreeting(greetingFor(new Date().getHours())), []);
  if (!greeting) return null;
  const name = user?.firstName;
  if (!name) return greeting;
  return greeting === "Up late" ? `Up late, ${name}?` : `${greeting}, ${name}`;
}

// Dashboard home and the entry point to Settle AI: a greeting, one centred
// composer, starters and a few ideas. No chat state lives here; submitting
// hands the prompt to the chat page, which sends it on mount.
export function HomeComposer() {
  const router = useRouter();
  const greeting = useGreeting();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    router.push(`/dashboard/chat?q=${encodeURIComponent(q)}`);
  };

  const prefill = (text: string) => {
    setInput(text);
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    // Caret after the prefill, after React has written the new value.
    requestAnimationFrame(() => el.setSelectionRange(text.length, text.length));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    ask(input);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-1 pb-[10vh]">
      <div className="flex flex-col gap-1.5 text-center">
        {/* Reserve the line so the layout doesn't shift when the greeting arrives. */}
        <h1 className="min-h-9 text-2xl font-semibold tracking-tight text-balance sm:min-h-10 sm:text-3xl">
          {greeting ?? " "}
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask Settle AI about your balances, groups and spending.
        </p>
      </div>

      <form
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 transition-colors duration-150 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50 sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything, like “who owes me for Goa?”"
          aria-label="Ask Settle AI"
          rows={2}
          autoFocus
          className="field-sizing-content max-h-60 min-h-12 w-full resize-none bg-transparent px-1 text-sm leading-6 outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-end gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {STARTERS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                onClick={() => prefill(starter.text)}
                className={buttonClass({ variant: "secondary", size: "sm" })}
              >
                {starter.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send"
            className={buttonClass({ size: "sm", className: "w-11 px-0 sm:w-8" })}
          >
            <ArrowUp />
          </button>
        </div>
      </form>

      <section aria-labelledby="home-ideas" className="flex flex-col">
        <h2 id="home-ideas" className="px-1 pb-1 text-meta text-muted-foreground">
          Try asking
        </h2>
        <ul className="flex flex-col">
          {CHAT_SUGGESTIONS.map((suggestion) => (
            <li key={suggestion} className="border-b border-border/50 last:border-b-0">
              <button
                type="button"
                onClick={() => ask(suggestion)}
                className={cn(
                  "group flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-1 py-2.5 text-left text-sm",
                  "transition-colors duration-150 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
              >
                {suggestion}
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-primary" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
