# apps/web/src/components/landing/hero-video.tsx

**Purpose:** Background hero video, loaded lazily, plus the demo video URL constant.

**Key contents:** Exports `DEMO_VIDEO_URL` and a client `HeroVideo` that sets the video `src` only after window load and browser idle; renders nothing until then.

**Depends on / used by:** Used by the landing hero. (The demo-video button that reused the URL was removed.)

**Decisions & caveats:** Deliberate perf choice (decisions.md): the video is about 18 MB, so it is deferred and skipped entirely for data-saver or reduced-motion users. Safari lacks `requestIdleCallback`, so a 200 ms timeout is used. The URL is a hard-coded CloudFront link. The video is opt-in by device: it never loads under 768px wide, with data saver, on 2g/3g connections or with reduced motion (the hero background colour stands in), and it pauses when the hero is scrolled out of view or the tab is hidden (IntersectionObserver + `visibilitychange`). To allow phones again, drop the `max-width: 767px` check in `shouldLoadVideo`.
