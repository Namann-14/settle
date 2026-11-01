"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Panel, PanelHeader, Segmented } from "@/components/dashboard/panel";

const THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

const isThemeId = (value: string | undefined): value is ThemeId =>
  THEMES.some((t) => t.id === value);

export function AppearancePanel() {
  const { theme, setTheme, forcedTheme } = useTheme();
  // The stored theme is only readable on the client; render a same-sized
  // placeholder until mount so the server HTML and hydration agree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Root providers force light outside /dashboard. If a lock ever applies here,
  // show the choice disabled rather than letting it silently do nothing.
  const locked = Boolean(forcedTheme);
  const value: ThemeId = locked ? "light" : isThemeId(theme) ? theme : "system";

  return (
    <Panel>
      <PanelHeader
        title="Appearance"
        description={
          locked ? "Settle is light only for now. Dark mode is on its way." : "Choose how Settle looks on this device."
        }
      />
      {mounted ? (
        <fieldset disabled={locked} className="min-w-0 disabled:opacity-60">
          <legend className="sr-only">Theme</legend>
          <Segmented label="Theme" options={THEMES} value={value} onChange={setTheme} />
        </fieldset>
      ) : (
        <div aria-hidden className="h-9 w-56 animate-pulse rounded-full bg-muted" />
      )}
    </Panel>
  );
}
