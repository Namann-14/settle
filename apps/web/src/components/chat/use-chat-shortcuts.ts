"use client";

import { useEffect, useRef } from "react";

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

type Handlers = {
  busy: boolean;
  stop: () => void;
  focusInput: () => void;
  newChat: () => void;
  copyLastResponse: () => void;
};

// Page-level chat shortcuts, modelled on the usual chatbot conventions:
//   Esc                 stop generating
//   /                   focus the message box (when not already typing)
//   Ctrl/⌘ + Shift + O  new chat
//   Ctrl/⌘ + Shift + C  copy last response
// Enter / Shift+Enter and ↑-to-edit live on the textarea itself.
export function useChatShortcuts(handlers: Handlers) {
  // Latest handlers without re-binding the listener on every render.
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const h = ref.current;
      const mod = e.ctrlKey || e.metaKey;

      if (e.key === "Escape" && h.busy) {
        e.preventDefault();
        h.stop();
      } else if (e.key === "/" && !mod && !e.altKey && !isEditable(e.target)) {
        e.preventDefault();
        h.focusInput();
      } else if (mod && e.shiftKey && e.code === "KeyO") {
        e.preventDefault();
        h.newChat();
      } else if (mod && e.shiftKey && e.code === "KeyC") {
        e.preventDefault();
        h.copyLastResponse();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
