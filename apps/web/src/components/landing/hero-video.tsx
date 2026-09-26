"use client";

import { useEffect, useState } from "react";

export const DEMO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4";

// The hero video is ~18 MB. Rendering it with a src straight away makes it
// compete with the page's own scripts, fonts and styles for bandwidth, so it
// only starts once the page has finished loading and the browser is idle.
// Visitors on data saver or with reduced motion never download it at all;
// the hero's background colour stands in for it.
export function HeroVideo() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (
      connection?.saveData ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    // Safari has no requestIdleCallback; a short timeout after load is close enough.
    const hasIdle = typeof window.requestIdleCallback === "function";
    let handle: number | undefined;
    const show = () => setSrc(DEMO_VIDEO_URL);
    const start = () => {
      handle = hasIdle
        ? window.requestIdleCallback(show, { timeout: 2000 })
        : window.setTimeout(show, 200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      window.removeEventListener("load", start);
      if (handle === undefined) return;
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  if (!src) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
      <video
        autoPlay
        muted
        loop
        playsInline
        src={src}
        // Fade in rather than pop over the background once it starts.
        style={{ "--y": "0px", "--duration": "1s" } as React.CSSProperties}
        className="h-full w-full animate-fade-up object-cover"
      />
    </div>
  );
}
