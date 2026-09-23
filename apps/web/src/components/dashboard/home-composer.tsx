"use client";

import { useUser } from "@clerk/nextjs";
import {
  ArrowUp,
  CalendarRange,
  HandCoins,
  Receipt,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import { CHAT_SUGGESTIONS } from "@/components/chat/suggestions";

// Starters that prefill the box for the user to finish, unlike the ideas
// list below, which sends straight away.
const STARTERS: { label: string; icon: LucideIcon; text: string }[] = [
  { label: "Balances", icon: Wallet, text: "What's my balance with " },
  { label: "Spending", icon: CalendarRange, text: "How much did I spend on " },
  { label: "Groups", icon: Users, text: "Show the expenses in my group " },
];

const IDEA_ICONS: LucideIcon[] = [HandCoins, CalendarRange, Receipt, Users];

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

function fadeUp(delay: number): CSSProperties {
  return { "--delay": `${delay}s`, "--y": "8px" } as CSSProperties;
}

// Dashboard home, laid out like Claude's new-chat screen: greeting, one
// centered composer, a few ideas underneath. No chat state lives here —
// submitting hands the prompt to the chat page, which sends it on mount.
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
    <div className="mx-auto flex w-full max-w-[42rem] flex-1 flex-col justify-center gap-10 pb-[12vh]">
      <h1
        className="animate-fade-up flex min-h-12 items-center justify-center gap-3 text-center font-display text-4xl tracking-tight sm:text-5xl"
        style={fadeUp(0.05)}
      >
        <HandCoins className="size-8 shrink-0 text-primary sm:size-9" />
        <span>{greeting ?? " "}</span>
      </h1>

      <div className="flex flex-col gap-8">
        <form
          className="animate-fade-up relative flex flex-col gap-5 rounded-[26px] border bg-card p-4 pt-5 shadow-lg ring-1 ring-foreground/5 transition-shadow focus-within:ring-foreground/15 sm:px-5"
          style={fadeUp(0.15)}
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
            placeholder="How can I help you today?"
            aria-label="Ask Settle AI"
            rows={1}
            autoFocus
            className="field-sizing-content max-h-60 min-h-7 w-full resize-none bg-transparent px-1 text-base leading-7 outline-none placeholder:text-muted-foreground"
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {STARTERS.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() => prefill(starter.text)}
                  className="inline-flex h-[30px] items-center gap-1.5 rounded-[9px] border bg-muted/50 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <starter.icon className="size-3.5" />
                  {starter.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Settle AI</span>
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send"
                className="flex size-[35px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:hover:brightness-100"
              >
                <ArrowUp className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </form>

        <section className="animate-fade-up flex flex-col gap-1 px-2" style={fadeUp(0.25)}>
          <p className="px-2 pb-2 text-xs text-muted-foreground">Ideas for you</p>
          {CHAT_SUGGESTIONS.map((suggestion, i) => {
            const Icon = IDEA_ICONS[i % IDEA_ICONS.length];
            return (
              <button
                key={suggestion}
                type="button"
                onClick={() => ask(suggestion)}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                {suggestion}
              </button>
            );
          })}
        </section>
      </div>
    </div>
  );
}
