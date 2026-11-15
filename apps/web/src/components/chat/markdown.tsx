"use client";

import { cn } from "@settle/ui/lib/utils";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { memo, type ComponentProps } from "react";
import { Streamdown } from "streamdown";

const plugins = { cjk, code, math, mermaid };

// Message text as markdown. shadcn's AI Elements Message pattern renders
// replies with Streamdown, so this is the one piece kept from the old
// ai-elements `MessageResponse`. Memoised on the text so earlier messages
// don't re-parse while a new one streams in.
export const ChatMarkdown = memo(
  ({ className, ...props }: ComponentProps<typeof Streamdown>) => (
    <Streamdown
      className={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
      plugins={plugins}
      {...props}
    />
  ),
  (prev, next) => prev.children === next.children && prev.isAnimating === next.isAnimating,
);

ChatMarkdown.displayName = "ChatMarkdown";
