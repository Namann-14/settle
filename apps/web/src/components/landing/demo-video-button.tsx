"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

import { DEMO_VIDEO_URL } from "@/components/landing/hero-video";

// The hero's play button and the demo video modal it opens. The only
// interactive part of the hero, so the rest of the landing page can stay
// server-rendered.
export function DemoVideoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Play demo video"
        className="h-11 w-11 rounded-full border-0 bg-background flex items-center justify-center hover:bg-secondary hover:scale-105 transition-all shadow-md cursor-pointer"
      >
        <Play className="h-4 w-4 fill-foreground text-foreground ml-0.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up">
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              <video controls autoPlay className="w-full h-full object-cover">
                <source src={DEMO_VIDEO_URL} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
