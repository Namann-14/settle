# apps/web/src/components/landing/hero-video.tsx

**Purpose:** Background hero video, loaded lazily, plus the demo video URL constant.

**Key contents:** Exports `DEMO_VIDEO_URL` and a client `HeroVideo` that sets the video `src` only after window load and browser idle; renders nothing until then.

**Depends on / used by:** Used by the landing hero; `demo-video-button.tsx` imports the URL.

**Decisions & caveats:** Deliberate perf choice (decisions.md): the video is about 18 MB, so it is deferred and skipped entirely for data-saver or reduced-motion users. Safari lacks `requestIdleCallback`, so a 200 ms timeout is used. The URL is a hard-coded CloudFront link.
