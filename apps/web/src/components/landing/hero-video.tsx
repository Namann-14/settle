"use client";

import { useEffect, useRef, useState } from "react";

export const DEMO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

// The hero video is ~18 MB, so it is opt-in by device:
// - never on phones (under 768px wide), data saver, slow connections or
//   reduced motion; the hero's background colour stands in for it there;
// - on everything else it starts only after the page has loaded and the
//   browser is idle, so it never competes with scripts, fonts and styles;
// - it pauses whenever the hero is scrolled out of view or the tab is hidden,
//   so an 18 MB video is not decoded for nothing.
function shouldLoadVideo() {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /^(slow-2g|2g|3g)$/.test(connection.effectiveType)) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(max-width: 767px)").matches) return false;
  return true;
}

export function HeroVideo() {
  const [src, setSrc] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!shouldLoadVideo()) return;

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

  // Play only while the hero is on screen and the tab is visible.
  useEffect(() => {
    const el = video.current;
    const host = box.current;
    if (!src || !el || !host) return;

    let onScreen = true;
    const sync = () => {
      if (onScreen && !document.hidden) el.play().catch(() => {});
      else el.pause();
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(host);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [src]);

  if (!src) return null;
  return (
    <div ref={box} className="pointer-events-none absolute inset-0 z-0 opacity-90">
      <video
        ref={video}
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        src={src}
        // Fade in rather than pop over the background once it starts.
        style={{ "--y": "0px", "--duration": "1s" } as React.CSSProperties}
        className="h-full w-full animate-fade-up object-cover"
      />
    </div>
  );
}
