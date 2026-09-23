"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { SquarePen, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
} from "@/components/ai-elements/checkpoint";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { AssistantMessage } from "@/components/chat/assistant-message";
import { CHAT_SUGGESTIONS } from "@/components/chat/suggestions";
import { useChatShortcuts } from "@/components/chat/use-chat-shortcuts";
import { CHAT_THREADS_KEY } from "@/hooks/useChatThreads";
import type { ChatMessage } from "@/lib/chat-types";
import { cn } from "@settle/ui/lib/utils";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border bg-muted px-1 font-sans text-[0.7rem]">{children}</kbd>
  );
}

// "⌘" on Apple platforms, "Ctrl" elsewhere. Read after mount so the server
// render (which can't know the platform) and hydration agree.
function useModKey() {
  const [modKey, setModKey] = useState("Ctrl");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setModKey("⌘");
  }, []);
  return modKey;
}

// Drop ?q once it's been sent, so a refresh doesn't ask it again.
// replaceState rather than router navigation, so the stream isn't disturbed.
function clearPromptParam() {
  if (window.location.search) {
    window.history.replaceState(null, "", window.location.pathname);
  }
}

export function ChatPanel({
  chatId,
  initialMessages,
  initialPrompt,
  className,
}: {
  // Also the ai service's thread id, so chat memory and history follow it.
  chatId: string;
  initialMessages?: ChatMessage[];
  initialPrompt?: string;
  className?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, setMessages, sendMessage, status, stop, error } = useChat<ChatMessage>({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    // The turn is saved and the thread's title/recency changed.
    onFinish: () => queryClient.invalidateQueries({ queryKey: CHAT_THREADS_KEY }),
  });

  // Prompts handed over from the dashboard's Ask AI card (?q=). The ref
  // guards against double-sending under StrictMode's double effect run.
  const sentInitial = useRef(false);
  useEffect(() => {
    if (!initialPrompt || sentInitial.current) return;
    sentInitial.current = true;
    sendMessage({ text: initialPrompt });
    clearPromptParam();
  }, [initialPrompt, sendMessage]);

  const busy = status === "submitted" || status === "streaming";
  const modKey = useModKey();

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
  };

  const handleSubmit = (message: PromptInputMessage) => {
    send(message.text);
    setInput("");
  };

  // Dropping later messages is enough on the client; the next request sends
  // this turn's checkpointId, which makes the ai service fork from it too.
  const restoreTo = (index: number) => {
    if (busy) return;
    setMessages(messages.slice(0, index + 1));
  };

  const focusInput = () => textareaRef.current?.focus();

  // New chats start from the dashboard home composer.
  const newChat = () => router.push("/dashboard");

  const copyLastResponse = async () => {
    const last = messages.findLast((m) => m.role === "assistant");
    const text = last?.parts
      .flatMap((p) => (p.type === "text" ? [p.text] : []))
      .join("\n\n")
      .trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied last response");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  useChatShortcuts({ busy, stop, focusInput, newChat, copyLastResponse });

  // ↑ in an empty box recalls the last question to edit and resend.
  const handleTextareaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "ArrowUp" || input !== "") return;
    const lastQuestion = messages
      .findLast((m) => m.role === "user")
      ?.parts.flatMap((p) => (p.type === "text" ? [p.text] : []))
      .join("");
    if (!lastQuestion) return;
    e.preventDefault();
    setInput(lastQuestion);
  };

  const lastMessage = messages.at(-1);
  const followUps =
    !busy && lastMessage?.role === "assistant"
      ? lastMessage.parts.flatMap((p) => (p.type === "data-suggestions" ? p.data : []))
      : [];

  return (
    <div className={cn("flex min-h-0 flex-col gap-4", className)}>
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Sparkles className="size-10 text-primary" />}
              title="Ask Settle AI"
              description="Questions about your balances, groups, expenses and settlements."
            />
          ) : (
            messages.map((message, index) => {
              const isLast = index === messages.length - 1;
              return (
                <div key={message.id} className="flex flex-col gap-4">
                  <Message from={message.role}>
                    <MessageContent>
                      {message.role === "assistant" ? (
                        <AssistantMessage
                          message={message}
                          isStreaming={isLast && status === "streaming"}
                        />
                      ) : (
                        message.parts.map((part, i) =>
                          part.type === "text" ? (
                            <MessageResponse key={i}>{part.text}</MessageResponse>
                          ) : null
                        )
                      )}
                    </MessageContent>
                  </Message>
                  {message.role === "assistant" && message.metadata?.checkpointId && !isLast && (
                    <Checkpoint>
                      <CheckpointIcon />
                      <CheckpointTrigger
                        tooltip="Remove everything after this reply and continue from here"
                        onClick={() => restoreTo(index)}
                        disabled={busy}
                      >
                        Restore checkpoint
                      </CheckpointTrigger>
                    </Checkpoint>
                  )}
                </div>
              );
            })
          )}
          {status === "submitted" && <Shimmer className="text-sm">Thinking…</Shimmer>}
          {error && (
            <p className="text-sm text-destructive">
              Something went wrong. Please try again.
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {(messages.length === 0 || followUps.length > 0) && (
          <Suggestions>
            {(messages.length === 0 ? CHAT_SUGGESTIONS : followUps).map((suggestion) => (
              <Suggestion key={suggestion} suggestion={suggestion} onClick={send} />
            ))}
          </Suggestions>
        )}
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Ask about your balances, spending, groups…"
              autoFocus
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputButton
                onClick={newChat}
                disabled={messages.length === 0}
                tooltip={{ content: "New chat", shortcut: `${modKey}+Shift+O` }}
              >
                <SquarePen className="size-4" />
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit
              status={status}
              onStop={stop}
              disabled={!busy && !input.trim()}
            />
          </PromptInputFooter>
        </PromptInput>
        <p className="hidden text-center text-xs text-muted-foreground sm:block">
          {busy ? (
            <><Kbd>Esc</Kbd> to stop</>
          ) : (
            <>
              <Kbd>Enter</Kbd> to send · <Kbd>Shift+Enter</Kbd> new line · <Kbd>↑</Kbd> edit last
              question · <Kbd>{modKey}+Shift+C</Kbd> copy last reply · <Kbd>/</Kbd> focus
            </>
          )}
        </p>
      </div>
    </div>
  );
}
