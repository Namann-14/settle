"use client";

import { Button } from "@settle/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@settle/ui/components/tooltip";
import { Check, Copy } from "lucide-react";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { toast } from "sonner";

// A message action from the shadcn AI Elements Message pattern: a ghost icon
// button with a tooltip, its label doubling as the aria-label.
export function MessageAction({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & Omit<ComponentProps<typeof Button>, "children">) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button type="button" variant="ghost" size="icon-sm" aria-label={label} {...props} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// Copies the reply and shows a check for two seconds.
export function CopyAction({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  return (
    <MessageAction label={copied ? "Copied" : "Copy"} onClick={copy}>
      {copied ? <Check /> : <Copy />}
    </MessageAction>
  );
}
