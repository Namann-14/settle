# apps/web/src/components/landing/demo-video-button.tsx

**Purpose:** Hero play button that opens a modal with the demo video.

**Key contents:** Client component holding open/close state; renders the button and a fullscreen overlay with an autoplaying `<video>`.

**Depends on / used by:** Imports `DEMO_VIDEO_URL` from `hero-video.tsx`; used in the landing hero.

**Decisions & caveats:** Kept as one of the few client pieces so the rest of the hero stays server-rendered. The video only mounts when the modal is open, so it is not downloaded until clicked.
