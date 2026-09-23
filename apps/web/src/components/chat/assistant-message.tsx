"use client";

import type { DynamicToolUIPart } from "ai";
import { PenLine } from "lucide-react";
import { useState } from "react";

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskTrigger,
} from "@/components/ai-elements/task";
import { outputLines, readableArgs, toolStep } from "@/components/chat/tool-steps";
import type { ChatMessage } from "@/lib/chat-types";

const MAX_TASK_ITEMS = 6;

function thinkingMessage(isStreaming: boolean, duration?: number) {
  if (isStreaming || duration === 0) return <Shimmer duration={1}>Thinking…</Shimmer>;
  if (duration === undefined) return <p>Thought for a few seconds</p>;
  return <p>Thought for {duration} {duration === 1 ? "second" : "seconds"}</p>;
}

function ToolTask({ part }: { part: DynamicToolUIPart }) {
  const lines =
    part.state === "output-error"
      ? [part.errorText]
      : part.state === "output-available"
        ? outputLines(part.output)
        : [];
  if (lines.length === 0) return null;

  const shown = lines.slice(0, MAX_TASK_ITEMS);
  const title =
    part.state === "output-error"
      ? "Tool failed"
      : `${lines.length} ${lines.length === 1 ? "result" : "results"}`;

  return (
    <Task defaultOpen={false}>
      <TaskTrigger title={title} />
      <TaskContent>
        {shown.map((line, i) => (
          <TaskItem key={i} className="truncate text-xs">
            {line}
          </TaskItem>
        ))}
        {lines.length > shown.length && (
          <TaskItem className="text-xs">
            and {lines.length - shown.length} more…
          </TaskItem>
        )}
      </TaskContent>
    </Task>
  );
}

// One assistant turn, laid out as: model reasoning, then the chain of tool
// steps it took (each with a collapsible Task of what the tool found), then
// the answer. `isStreaming` is true only for the turn currently arriving.
export function AssistantMessage({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming: boolean;
}) {
  // null = follow the stream (open while it runs, collapsed after); a user
  // toggle overrides that for the rest of this message's life. Reasoning is
  // controlled the same way because the model reasons once per call — its
  // built-in auto-close only fires once, leaving later rounds stuck open.
  const [chainOpen, setChainOpen] = useState<boolean | null>(null);
  const [reasoningOpen, setReasoningOpen] = useState<boolean | null>(null);

  const parts = message.parts;
  const lastPart = parts.at(-1);
  const reasoning = parts
    .flatMap((p) => (p.type === "reasoning" && p.text.trim() ? [p.text] : []))
    .join("\n\n");
  const tools = parts.filter((p): p is DynamicToolUIPart => p.type === "dynamic-tool");
  const texts = parts.flatMap((p) => (p.type === "text" && p.text ? [p.text] : []));

  const toolsRunning = tools.some((t) => t.state === "input-available");
  const lastToolIndex = parts.findLastIndex((p) => p.type === "dynamic-tool");
  const answering = parts.slice(lastToolIndex + 1).some((p) => p.type === "text");
  const reasoningStreaming = isStreaming && lastPart?.type === "reasoning";
  const writingStatus = !isStreaming || answering ? "complete" : toolsRunning ? "pending" : "active";

  return (
    <div className="flex flex-col gap-3">
      {reasoning && (
        <Reasoning
          className="mb-0"
          isStreaming={reasoningStreaming}
          open={reasoningOpen ?? reasoningStreaming}
          onOpenChange={setReasoningOpen}
        >
          <ReasoningTrigger getThinkingMessage={thinkingMessage} />
          <ReasoningContent>{reasoning}</ReasoningContent>
        </Reasoning>
      )}

      {tools.length > 0 && (
        <ChainOfThought
          open={chainOpen ?? isStreaming}
          onOpenChange={setChainOpen}
        >
          <ChainOfThoughtHeader>
            {isStreaming && !answering ? (
              <Shimmer duration={1}>Working on it…</Shimmer>
            ) : (
              `Used ${tools.length} ${tools.length === 1 ? "step" : "steps"}`
            )}
          </ChainOfThoughtHeader>
          <ChainOfThoughtContent>
            {tools.map((part) => {
              const step = toolStep(part.toolName);
              const running = part.state === "input-available";
              const args = readableArgs(part.input);
              return (
                <ChainOfThoughtStep
                  key={part.toolCallId}
                  icon={step.icon}
                  status={running ? "active" : "complete"}
                  label={
                    running ? <Shimmer duration={1.5}>{`${step.active}…`}</Shimmer> : step.done
                  }
                >
                  {args.length > 0 && (
                    <ChainOfThoughtSearchResults>
                      {args.map((arg) => (
                        <ChainOfThoughtSearchResult key={arg}>{arg}</ChainOfThoughtSearchResult>
                      ))}
                    </ChainOfThoughtSearchResults>
                  )}
                  <ToolTask part={part} />
                </ChainOfThoughtStep>
              );
            })}
            <ChainOfThoughtStep
              icon={PenLine}
              status={writingStatus}
              label={
                writingStatus === "active" ? (
                  <Shimmer duration={1.5}>Writing the answer…</Shimmer>
                ) : writingStatus === "pending" ? (
                  "Write the answer"
                ) : (
                  "Wrote the answer"
                )
              }
            />
          </ChainOfThoughtContent>
        </ChainOfThought>
      )}

      {texts.map((text, i) => (
        <MessageResponse key={i}>{text}</MessageResponse>
      ))}

      {/* Nothing visible yet (no reasoning text, steps or answer). */}
      {isStreaming && !reasoning && tools.length === 0 && texts.length === 0 && (
        <Shimmer className="text-sm">Thinking…</Shimmer>
      )}
    </div>
  );
}
