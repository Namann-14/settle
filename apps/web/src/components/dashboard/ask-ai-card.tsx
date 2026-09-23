"use client";

import { Sparkles } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@settle/ui/components/card";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          Ask Settle AI
        </CardTitle>
        <CardDescription>
          Get answers about your balances, spending and groups.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <PromptInput onSubmit={(message: PromptInputMessage) => ask(message.text)}>
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
            <Suggestion key={suggestion} suggestion={suggestion} onClick={ask} />
          ))}
        </Suggestions>
      </CardContent>
    </Card>
  );
}
