"use client";

import { Badge } from "@settle/ui/components/badge";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@settle/ui/components/trace";
import type { DynamicToolUIPart } from "ai";
import { Ban, Brain, CircleAlert, CircleCheck, CircleDashed, LoaderCircle } from "lucide-react";
import { useState } from "react";

import {
  ExpenseConfirmation,
  expenseAmount,
  expenseSummary,
} from "@/components/chat/expense-confirmation";
import { ChatMarkdown } from "@/components/chat/markdown";
import { outputLines, readableArgs, toolStep } from "@/components/chat/tool-steps";
import type { ChatMessage, ExpensePreview } from "@/lib/chat-types";

const MAX_RESULT_LINES = 6;

const isRunning = (p: DynamicToolUIPart) =>
  p.state === "input-streaming" ||
  p.state === "input-available" ||
  (p.state === "approval-responded" && p.approval.approved);

// A tool call that changed data, after the user answered its Confirmation:
// "Added Dinner ₹1,200", "Didn't add Dinner", or why it failed.
function ExpenseLine({ part, expense }: { part: DynamicToolUIPart; expense: ExpensePreview }) {
  const running = isRunning(part);
  const failed = part.state === "output-error";
  const denied =
    part.state === "output-denied" || (part.state === "approval-responded" && !part.approval.approved);
  // Asked, but the user moved on without answering (only on older turns).
  const unanswered = part.state === "approval-requested";

  const [title, icon] = running
    ? [`Adding ${expense.description}…`, <LoaderCircle key="i" className="animate-spin" />]
    : failed
      ? [`Couldn't add ${expense.description}`, <CircleAlert key="i" />]
      : denied
        ? [`Didn't add ${expense.description}`, <Ban key="i" />]
        : unanswered
          ? [`Not answered: ${expense.description}`, <CircleDashed key="i" />]
          : [`Added ${expense.description}`, <CircleCheck key="i" />];

  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : failed ? "error" : unanswered ? "pending" : undefined}>
          <TraceIcon>{icon}</TraceIcon>
          <TraceTitle>{title}</TraceTitle>
          {!failed && <TraceDescription>{expenseAmount(expense)}</TraceDescription>}
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="text-xs">
        {failed ? part.errorText : expenseSummary(expense)}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

// One tool call as a Trace line (the Tool pattern). Expands to the args it
// was called with and what it found, when there is anything to show.
function ToolLine({ part }: { part: DynamicToolUIPart }) {
  const step = toolStep(part.toolName);
  const running = isRunning(part);
  const failed = part.state === "output-error";
  const args = readableArgs(part.input);
  const lines = failed
    ? [part.errorText]
    : part.state === "output-available"
      ? outputLines(part.output)
      : [];
  const shown = lines.slice(0, MAX_RESULT_LINES);
  const Icon = failed ? CircleAlert : step.icon;

  const line = (
    <TraceLine status={running ? "running" : failed ? "error" : undefined}>
      <TraceIcon>{running ? <LoaderCircle className="animate-spin" /> : <Icon />}</TraceIcon>
      <TraceTitle>{running ? `${step.active}…` : failed ? `${step.done} (failed)` : step.done}</TraceTitle>
      {!running && !failed && lines.length > 0 && (
        <TraceDescription>
          {lines.length} {lines.length === 1 ? "result" : "results"}
        </TraceDescription>
      )}
    </TraceLine>
  );

  if (args.length === 0 && lines.length === 0) return line;

  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="flex flex-col gap-1.5 text-xs">
        {args.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {args.map((arg) => (
              <Badge key={arg} variant="secondary">
                {arg}
              </Badge>
            ))}
          </div>
        )}
        {shown.map((text, i) => (
          <p key={i} className="truncate">
            {text}
          </p>
        ))}
        {lines.length > shown.length && <p>and {lines.length - shown.length} more…</p>}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

// One assistant turn, laid out as: model reasoning (Reasoning pattern), the
// steps it took (Chain of Thought, each step a Tool line), any expense
// waiting for approval (Confirmation), then the answer. `isStreaming` is true
// only for the turn currently arriving; approvals can be answered only on the
// latest turn (`canAnswer`).
export function AssistantMessage({
  message,
  isStreaming,
  canAnswer,
  onApproval,
}: {
  message: ChatMessage;
  isStreaming: boolean;
  canAnswer: boolean;
  onApproval: (approvalId: string, approved: boolean) => void;
}) {
  // undefined = follow the stream (open while it runs, collapsed after); a
  // user toggle overrides that for the rest of this message's life.
  const [stepsOpen, setStepsOpen] = useState<boolean>();
  const [reasoningOpen, setReasoningOpen] = useState<boolean>();

  const parts = message.parts;
  const lastPart = parts.at(-1);
  const reasoning = parts
    .flatMap((p) => (p.type === "reasoning" && p.text.trim() ? [p.text] : []))
    .join("\n\n");
  const tools = parts.filter((p): p is DynamicToolUIPart => p.type === "dynamic-tool");
  const texts = parts.flatMap((p) => (p.type === "text" && p.text ? [p.text] : []));
  const previews = new Map(
    parts.flatMap((p) =>
      p.type === "data-expense-approval" ? [[p.data.toolCallId, p.data.expense] as const] : []
    )
  );

  // Waiting on the user: shown as Confirmation cards, not inside the steps.
  const asking = canAnswer
    ? tools.filter((t) => t.state === "approval-requested" && previews.has(t.toolCallId))
    : [];
  const steps = tools.filter((t) => !asking.includes(t));
  const failed = steps.filter((t) => t.state === "output-error").length;

  const lastToolIndex = parts.findLastIndex((p) => p.type === "dynamic-tool");
  const answering = parts.slice(lastToolIndex + 1).some((p) => p.type === "text");
  const reasoningStreaming = isStreaming && lastPart?.type === "reasoning";
  const working = isStreaming && !answering;

  return (
    <div className="flex flex-col gap-3">
      {(reasoning || steps.length > 0) && (
        <Trace>
          {reasoning && (
            <TraceCollapsible
              open={reasoningOpen ?? reasoningStreaming}
              onOpenChange={setReasoningOpen}
            >
              <TraceCollapsibleTrigger>
                <TraceLine status={reasoningStreaming ? "running" : undefined}>
                  <TraceIcon>
                    {reasoningStreaming ? <LoaderCircle className="animate-spin" /> : <Brain />}
                  </TraceIcon>
                  <TraceTitle>{reasoningStreaming ? "Thinking" : "Thought"}</TraceTitle>
                </TraceLine>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent className="text-xs whitespace-pre-wrap">
                {reasoning}
              </TraceCollapsibleContent>
            </TraceCollapsible>
          )}

          {steps.length > 0 && (
            <TraceCollapsible open={stepsOpen ?? working} onOpenChange={setStepsOpen}>
              <TraceCollapsibleTrigger>
                <TraceLine status={working ? "running" : failed > 0 ? "error" : undefined}>
                  <TraceIcon>
                    {working ? <LoaderCircle className="animate-spin" /> : <CircleCheck />}
                  </TraceIcon>
                  <TraceTitle>
                    {working
                      ? "Working on it"
                      : `Done in ${steps.length} ${steps.length === 1 ? "step" : "steps"}`}
                  </TraceTitle>
                </TraceLine>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent keepMounted>
                <Trace>
                  {steps.map((part) => {
                    const expense = previews.get(part.toolCallId);
                    return expense ? (
                      <ExpenseLine key={part.toolCallId} part={part} expense={expense} />
                    ) : (
                      <ToolLine key={part.toolCallId} part={part} />
                    );
                  })}
                </Trace>
              </TraceCollapsibleContent>
            </TraceCollapsible>
          )}
        </Trace>
      )}

      {asking.map((part) => (
        <ExpenseConfirmation
          key={part.toolCallId}
          expense={previews.get(part.toolCallId)!}
          onAnswer={(approved) =>
            part.state === "approval-requested" && onApproval(part.approval.id, approved)
          }
        />
      ))}

      {texts.map((text, i) => (
        <ChatMarkdown key={i}>{text}</ChatMarkdown>
      ))}

      {/* Nothing visible yet (no reasoning text, steps or answer). */}
      {isStreaming && !reasoning && tools.length === 0 && texts.length === 0 && (
        <p className="shimmer text-sm text-muted-foreground">Thinking…</p>
      )}
    </div>
  );
}
