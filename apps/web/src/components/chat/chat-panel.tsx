"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import { ArrowUp, Bookmark, Pencil, RefreshCcw, Square, SquarePen } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Bubble, BubbleContent } from "@settle/ui/components/bubble";
import { Button } from "@settle/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@settle/ui/components/input-group";
import { Marker, MarkerContent, MarkerIcon } from "@settle/ui/components/marker";
import { Message, MessageContent, MessageFooter } from "@settle/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@settle/ui/components/message-scroller";
import { Spinner } from "@settle/ui/components/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@settle/ui/components/tooltip";
import { AssistantMessage } from "@/components/chat/assistant-message";
import { ChatMarkdown } from "@/components/chat/markdown";
import { CopyAction, MessageAction } from "@/components/chat/message-actions";
import { CHAT_SUGGESTIONS } from "@/components/chat/suggestions";
import { useChatShortcuts } from "@/components/chat/use-chat-shortcuts";
import { buttonClass } from "@/components/dashboard/panel";
import { invalidateBalances } from "@/hooks/mutations/invalidate";
import { CHAT_THREADS_KEY, useChatThreads, useRestoreChatCheckpoint } from "@/hooks/useChatThreads";
import type { ChatMessage } from "@/lib/chat-types";
import { cn } from "@settle/ui/lib/utils";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-border bg-muted px-1 font-sans text-micro">{children}</kbd>
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
  const { data: threads } = useChatThreads();
  const title = threads?.find((t) => t.id === chatId)?.title ?? "New chat";
  const restore = useRestoreChatCheckpoint(chatId);
  const {
    messages,
    setMessages,
    sendMessage,
    regenerate,
    addToolApprovalResponse,
    status,
    stop,
    error,
  } = useChat<ChatMessage>({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    // Once every approval in the paused turn is answered, send them; the
    // route turns that into a resume of the same turn.
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    onFinish: ({ message }) => {
      // The turn is saved and the thread's title/recency changed.
      queryClient.invalidateQueries({ queryKey: CHAT_THREADS_KEY });
      const addedExpense = message.parts.some(
        (p) => p.type === "dynamic-tool" && p.toolName === "add_expense" && p.state === "output-available"
      );
      if (addedExpense) invalidateBalances(queryClient);
    },
  });

  // Prompts handed over by ?q= (home composer, search palette).
  // Sent a tick later and cancelled on cleanup: under StrictMode the first
  // mount is torn down straight away, and useChat's cleanup calls
  // chat.stop(), which aborted a send made synchronously here before its
  // request went out. The ref then stops the remount from sending twice.
  const sentInitial = useRef(false);
  useEffect(() => {
    if (!initialPrompt || sentInitial.current) return;
    const timer = setTimeout(() => {
      sentInitial.current = true;
      sendMessage({ text: initialPrompt });
      clearPromptParam();
    }, 0);
    return () => clearTimeout(timer);
  }, [initialPrompt, sendMessage]);

  const busy = status === "submitted" || status === "streaming";
  const modKey = useModKey();

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
  };

  const formRef = useRef<HTMLFormElement>(null);
  // The send button turns into stop while a reply is running.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) {
      stop();
      return;
    }
    if (!input.trim()) return;
    send(input);
    setInput("");
  };

  // The ai service deletes the expenses later turns added and drops those
  // turns from the history; the next request sends this turn's checkpointId,
  // which makes the graph fork from it too.
  const restoreTo = async (index: number) => {
    const checkpointId = messages[index]?.metadata?.checkpointId;
    if (busy || !checkpointId || restore.isPending) return;
    try {
      const { removed_expenses } = await restore.mutateAsync(checkpointId);
      setMessages(messages.slice(0, index + 1));
      if (removed_expenses > 0) {
        toast.success(
          `Restored. Removed ${removed_expenses} ${removed_expenses === 1 ? "expense" : "expenses"} added after this point.`
        );
      }
    } catch {
      toast.error("Couldn't restore that checkpoint. Please try again.");
    }
  };

  const answerApproval = (id: string, approved: boolean) => {
    if (busy) return;
    addToolApprovalResponse({ id, approved });
  };

  // Retrying a reply re-runs it from the turn before, so the ai service
  // forks from that turn's checkpoint (and rolls back any expense the
  // retried reply added). The first reply has no earlier checkpoint.
  const canRetry = (index: number) =>
    Boolean(messages.slice(0, index).findLast((m) => m.role === "assistant")?.metadata?.checkpointId);

  const editQuestion = (message: ChatMessage) => {
    setInput(message.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])).join(""));
    focusInput();
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
  // Enter sends, Shift+Enter is a new line (not mid IME composition).
  const handleTextareaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!busy) formRef.current?.requestSubmit();
      return;
    }
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
    <div className={cn("flex min-h-0 flex-col", className)}>
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-sm font-semibold">{title}</h1>
          <p className="text-xs text-muted-foreground">Settle AI</p>
        </div>
        <button
          type="button"
          onClick={newChat}
          disabled={messages.length === 0}
          title={`New chat (${modKey}+Shift+O)`}
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          <SquarePen />
          New chat
        </button>
      </header>

      <MessageScrollerProvider autoScroll>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-6 px-1 py-6">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
                  <h2 className="text-sm font-semibold">Ask Settle AI</h2>
                  <p className="max-w-sm text-meta text-muted-foreground">
                    Questions about your balances, groups, expenses and settlements. Pick one below
                    or type your own.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isLast = index === messages.length - 1;
                  const isUser = message.role === "user";
                  const replyText = message.parts
                    .flatMap((p) => (p.type === "text" ? [p.text] : []))
                    .join("\n\n")
                    .trim();
                  const settled = !busy || !isLast;
                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={isUser}
                      className="flex flex-col gap-3"
                    >
                      <Message align={isUser ? "end" : "start"}>
                        <MessageContent className="text-sm leading-6">
                          {isUser ? (
                            <Bubble align="end" variant="muted" className="max-w-full sm:max-w-[85%]">
                              <BubbleContent className="px-4 py-2.5 text-sm leading-6">
                                {message.parts.map((part, i) =>
                                  part.type === "text" ? (
                                    <ChatMarkdown key={i}>{part.text}</ChatMarkdown>
                                  ) : null
                                )}
                              </BubbleContent>
                            </Bubble>
                          ) : (
                            <div className="w-full max-w-full sm:max-w-[85%]">
                              <AssistantMessage
                                message={message}
                                isStreaming={isLast && status === "streaming"}
                                canAnswer={isLast && !busy}
                                onApproval={answerApproval}
                              />
                            </div>
                          )}
                          {settled && (isUser ? isLast || index === messages.length - 2 : replyText) && (
                            <MessageFooter
                              className={cn(
                                "transition-opacity duration-150 [@media(hover:none)]:opacity-100",
                                !isLast && "opacity-0 group-hover/message:opacity-100 focus-within:opacity-100"
                              )}
                            >
                              {isUser ? (
                                <MessageAction label="Edit" onClick={() => editQuestion(message)}>
                                  <Pencil />
                                </MessageAction>
                              ) : (
                                <>
                                  <CopyAction text={replyText} />
                                  {isLast && canRetry(index) && (
                                    <MessageAction
                                      label="Retry"
                                      onClick={() => regenerate({ messageId: message.id })}
                                    >
                                      <RefreshCcw />
                                    </MessageAction>
                                  )}
                                </>
                              )}
                            </MessageFooter>
                          )}
                        </MessageContent>
                      </Message>
                      {!isUser && message.metadata?.checkpointId && !isLast && (
                        <Marker variant="separator">
                          <MarkerContent className="inline-flex items-center gap-2">
                            <MarkerIcon>
                              <Bookmark />
                            </MarkerIcon>
                            Checkpoint
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    type="button"
                                    size="xs"
                                    variant="outline"
                                    onClick={() => restoreTo(index)}
                                    disabled={busy || restore.isPending}
                                  />
                                }
                              >
                                Restore
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                Remove everything after this reply, including expenses it added
                                later, and continue from here
                              </TooltipContent>
                            </Tooltip>
                          </MarkerContent>
                        </Marker>
                      )}
                    </MessageScrollerItem>
                  );
                })
              )}
              {status === "submitted" && (
                <p className="shimmer text-sm text-muted-foreground">Thinking…</p>
              )}
              {error && (
                <div
                  role="alert"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-sm"
                >
                  <span className="text-destructive">That didn&apos;t go through. Please try again.</span>
                  <button
                    type="button"
                    onClick={() => regenerate()}
                    disabled={busy}
                    className={buttonClass({ variant: "secondary", size: "sm" })}
                  >
                    Try again
                  </button>
                </div>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton className="border-border bg-card shadow-none hover:bg-muted" />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 pt-2">
        {(messages.length === 0 || followUps.length > 0) && (
          <div className="no-scrollbar flex scroll-fade-x gap-2 overflow-x-auto overscroll-x-contain px-0.5">
            {(messages.length === 0 ? CHAT_SUGGESTIONS : followUps).map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => send(suggestion)}
                className="h-11 shrink-0 border-border bg-card px-3.5 text-xs font-normal text-foreground shadow-none transition-colors duration-150 hover:bg-muted sm:h-8"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        <form ref={formRef} onSubmit={handleSubmit}>
          <InputGroup className="rounded-2xl border-border bg-card shadow-none transition-colors duration-150">
            <InputGroupTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Ask about your balances, spending, groups…"
              aria-label="Message Settle AI"
              className="max-h-48 min-h-14 p-3 text-sm leading-6"
              autoFocus
            />
            <InputGroupAddon align="block-end">
              <InputGroupButton
                type="submit"
                size="icon-sm"
                variant="default"
                disabled={!busy && !input.trim()}
                aria-label={busy ? "Stop" : "Send"}
                className="ml-auto rounded-full shadow-none"
              >
                {status === "submitted" ? (
                  <Spinner />
                ) : busy ? (
                  <Square className="fill-current" />
                ) : (
                  <ArrowUp />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
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
