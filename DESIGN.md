---
name: Settle
description: Split bills, not friendships. A calm shared ledger in forest green on mint paper.
colors:
  banknote-green: "oklch(0.4269 0.0647 162.0340)"
  banknote-green-dark: "oklch(0.7369 0.0830 157.0308)"
  sage: "oklch(0.6528 0.0707 153.5098)"
  sage-dark: "oklch(0.4592 0.0521 160.3874)"
  mint-paper: "oklch(0.9823 0.0041 157.1794)"
  ledger-white: "oklch(1.0000 0 0)"
  pale-mint: "oklch(0.9376 0.0125 156.9926)"
  mint-wash: "oklch(0.8911 0.0227 160.1763)"
  hairline-sage: "oklch(0.8793 0.0177 159.0710)"
  moss-gray: "oklch(0.4977 0.0461 160.9283)"
  forest-ink: "oklch(0.2307 0.0195 160.5314)"
  deep-forest: "oklch(0.2969 0.0374 164.1126)"
  night-forest: "oklch(0.1806 0.0158 165.3930)"
  night-card: "oklch(0.2284 0.0227 165.7869)"
  night-line: "oklch(0.2808 0.0310 164.2455)"
  night-mist: "oklch(0.9419 0.0100 164.8617)"
  oxblood: "oklch(0.4451 0.0916 21.4396)"
  oxblood-dark: "oklch(0.6900 0.1300 22.5000)"
  slate-blue: "oklch(0.8071 0.0438 236.3926)"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "5rem"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "3.75rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "2.125rem"
    fontWeight: 400
    lineHeight: 1.05
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "-0.01em"
  page-title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "-0.035em"
  figure:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1
  dialog-title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.556
  panel-title:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.429
  body-app:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.429
    letterSpacing: "-0.01em"
  meta:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.538
    letterSpacing: "0em"
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.333
    letterSpacing: "0em"
  micro:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.455
    letterSpacing: "0.01em"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  bento: "22px"
  full: "9999px"
spacing:
  unit: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.banknote-green}"
    textColor: "{colors.mint-paper}"
    typography: "{typography.body-app}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.mint-paper}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "32px"
  button-ghost-hover:
    backgroundColor: "{colors.pale-mint}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.full}"
  button-destructive:
    textColor: "{colors.oxblood}"
    rounded: "{rounded.full}"
    height: "32px"
  input:
    textColor: "{colors.forest-ink}"
    typography: "{typography.body-app}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  section-badge:
    backgroundColor: "{colors.mint-paper}"
    textColor: "{colors.banknote-green}"
    rounded: "{rounded.full}"
    padding: "4px 14px"
  panel:
    backgroundColor: "{colors.ledger-white}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  bento-card-dark:
    backgroundColor: "{colors.deep-forest}"
    textColor: "{colors.mint-paper}"
    rounded: "{rounded.bento}"
    padding: "24px"
  nav-link:
    textColor: "{colors.moss-gray}"
    rounded: "{rounded.lg}"
    padding: "6px 14px"
---

# Design System: Settle

## Overview

**Creative North Star: "The Calm Ledger"**

Settle looks like a well-kept money book shared between friends: green ink on mint paper, an editorial serif for the moments that matter, and exact numbers set quietly in Inter. Money between friends is a tense subject; the system's job is to lower the temperature. Nothing flashes, nothing competes, and every number reads as settled fact.

The mood is calm and trustworthy, but warm rather than bank-like. Warmth comes from the serif's softness, the single italic word in a headline ("Split bills, *not* friendships"), the rounded pill controls, and small self-playing demos, never from extra color. The whole palette sits in one green hue family (hue 153 to 165) with a single oxblood for debts and errors, so the interface reads as one material.

Density splits by surface. Marketing pages are airy and editorial: large serif display, wide margins, bento cards. The signed-in app is compact and precise: 12px Inter body, 32px controls, hairline rings. Both share the same tokens; the app simply turns the volume down. The confirmed anti-reference is fintech-neon: no crypto or neobank gradients, no neon on black, no loud dashboard chrome.

**Key Characteristics:**
- One hue family: forest and mint greens, plus oxblood for "you owe" and errors.
- Instrument Serif for display and money moments; Inter for everything else.
- Flat at rest; depth from paper tones and hairlines, shadows only ambient or on hover.
- Pill-shaped buttons and badges; softly rounded cards (16px app, 22px landing bento).
- Light and dark themes are both first-class; dark is a deep night-forest, not neutral black.

## Colors

A single forest-green family on mint-tinted paper, with oxblood held in reserve for money owed and errors.

### Primary
- **Banknote Green** (light `banknote-green`, dark `banknote-green-dark`): the one action color. Primary buttons, the active nav item, focus rings, links, the "You're owed" tile, section badge text, chart series 1. In dark mode it lifts to a lighter sage-green so it reads on night-forest.

### Secondary
- **Sage** (`sage`, dark `sage-dark`): secondary buttons, the far stop of the light bento gradient, chart series 2. Never used for a primary action.

### Tertiary
- **Oxblood** (`oxblood`, dark `oxblood-dark`): "You owe" amounts, negative balances, destructive actions (rendered as a 10% oxblood wash with oxblood text, never a solid red block). A muted brick, not alarm red. In dark mode it lifts to a lighter brick so it stays readable as text on night-forest.
- **Slate Blue** (`slate-blue`): chart series 4 only, so multi-series charts have one cool contrast. Not a UI color.

### Neutral
- **Mint Paper** (`mint-paper`): page background and text on primary fills.
- **Ledger White** (`ledger-white`): cards, popovers, panels; one step brighter than the page.
- **Pale Mint** (`pale-mint`): muted fills, hover backgrounds for ghost and outline buttons, the middle of the bento gradient.
- **Mint Wash** (`mint-wash`): accent fills, avatar and icon chips, the start of the bento gradient.
- **Hairline Sage** (`hairline-sage`): borders, input strokes, dividers. Usually applied at 60 to 70% opacity.
- **Moss Gray** (`moss-gray`): secondary text, descriptions, eyebrows, inactive nav links.
- **Forest Ink** (`forest-ink`): body text and headings. Green-tinted, never pure black.
- **Deep Forest** (`deep-forest`): accent-foreground text, and the fill of dark bento cards and the AI panel on the landing page.
- **Night Forest / Night Card / Night Line / Night Mist** (`night-forest`, `night-card`, `night-line`, `night-mist`): the dark theme's background, card, border/muted, and foreground.

### Named Rules
**The One Hue Rule.** Every neutral carries the green tint (chroma 0.004 to 0.04 at hue ~160). No pure grays, no pure black, no off-family accents in UI chrome.

**The Owed Is Green, Owing Is Oxblood Rule.** Money in your favor uses Banknote Green or plain Forest Ink; money you owe uses Oxblood. No other color carries balance meaning.

**The Themed Selection Rule.** Text selection uses Banknote Green with Mint Paper text (the theme's `primary` / `primary-foreground`, so it flips correctly in dark mode). Browser surfaces like selection, focus rings and carets take palette colors, never browser or off-family defaults.

## Typography

**Display Font:** Instrument Serif (with Georgia, serif)
**Body Font:** Inter (with sans-serif)
**Label/Mono Font:** JetBrains Mono is declared but effectively unused; labels are Inter.

**Character:** A soft, high-contrast editorial serif set against a neutral, tightly tracked grotesque. The serif carries voice and money; Inter carries work.

### Hierarchy
- **Display** (400, 80px desktop, 0.95 line-height, -0.035em): landing hero only. One word in italic for emphasis.
- **Headline** (400, 36px / 48px / 60px across sm/lg, leading 1, tight tracking): landing section headings, max 3xl width. Same italic-word device allowed.
- **Title** (400, 34px, 1.05): bento card titles. In the app, the serif is reserved for money: figure-strip values (28px), ledger totals and the Overview's net sentence (36 to 48px).
- **Landing body** (Inter 400, 16 to 17px, 1.625, -0.01em): landing paragraphs, max ~36rem (`max-w-xl`).

App roles, each a single class (`text-micro`, `text-meta` and `text-figure` are defined in `apps/web/src/index.css`; no other bracketed `text-[Npx]` sizes in the app):
- **Overview net** (serif 400, 36px, 48px from md): the one money sentence that titles Overview.
- **Page title** (Inter 600, 24px `text-2xl`, tight tracking): every other app page header; the chat home greeting steps up to 30px (`text-3xl`) on sm and wider.
- **Figure** (serif 400, 28px `text-figure`, 24px on phones): figure-strip values and ledger column totals; money only.
- **Dialog title** (Inter 600, 18px `text-lg`): sheet and dialog headings.
- **Panel title** (Inter 600, 14px `text-sm`): panel and section headings; weight, not size, separates them from body.
- **Body** (Inter 400, 14px `text-sm`): page content, list rows, table cells, page descriptions.
- **Meta** (Inter 400, 13px `text-meta`, no negative tracking): panel descriptions, figure labels, secondary row text.
- **Caption** (Inter 400, 12px `text-xs`, no negative tracking): metadata lines under rows, hints, small buttons.
- **Micro** (Inter 600, 11px `text-micro`, +0.01em): initials in avatar dots and count badges only.
- **Label** (Inter 400, 12px, uppercase, +0.08em): landing only (bento eyebrows). The app uses no uppercase eyebrows.

### Named Rules
**The Serif Is for Voice and Money Rule.** Instrument Serif appears only on display/headline/title moments and on money figures that headline a tile. Never on buttons, form labels, tables or body copy.

**The Small Type Breathes Rule.** Inter at 13px and below drops the body's -0.01em tracking (the `text-xs`, `text-meta` and `text-micro` tokens reset it); descriptions wrap with `text-pretty`, headings with `text-balance`, and every amount uses tabular figures.

**The One Italic Rule.** A headline may italicize at most one word, and it is the word that carries the point.

## Layout

The landing page is a centered column (max 72rem, `max-w-6xl`) with side gutters of 24px, 48px at md and 80px at lg, and section spacing of 80px on mobile and 128px from md up. Sections lead with a centered badge + serif headline + one-line description. Feature content sits in bento grids that stack to a single column on phones and become multi-column at lg; 375px and 768px are the checked mobile and tablet widths.

The signed-in app uses a collapsible left sidebar plus a solid 56px topbar with a hairline under it. Every page sits in one centered column (`PageContainer`: max 72rem, or 48rem for single-column pages like Settings) with 32px between sections. A page reads top to bottom as: page header, an optional figure strip, an optional filter row, then the work (lists, tables, panels). Panels use 20 to 24px internal padding; spacing follows a 4px base unit (8, 12, 16, 24, 32px are the recurring steps). Two-up layouts collapse to one column below `lg`.

The landing nav is fixed and resizes: full width at the top of the page, then a floating frosted pill after scroll, with the scroll-progress bar on its top edge.

## Elevation & Depth

Flat at rest. Depth comes from tonal layering (Mint Paper page, Ledger White card, Deep Forest feature card on the landing page) and hairline borders or 1px rings at 10% Forest Ink. Shadows are nearly invisible ambient washes. App panels never lift or cast a hover shadow; only popovers, menus and dialogs float. In dark mode shadows deepen (30% black, 15px blur) because tones alone separate less.

### Shadow Vocabulary
- **Ambient xs** (`box-shadow: 0px 2px 10px 0px hsl(0 0% 0% / 0.03)`): section badges, small pills.
- **Ambient sm** (`box-shadow: 0px 2px 10px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05)`): default shadcn surfaces.
- **Dashboard showcase** (`box-shadow: 0 25px 80px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)`): the dashboard preview framed in the landing hero only.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest and stay flat on hover; hover changes a fill, never elevation. A shadow stronger than Ambient sm belongs only to floating layers (menus, dialogs) and the landing hero showcase.

## Shapes

Two shape families. Controls are pills: buttons, badges, chips, the floating nav and avatar dots use full rounding. Containers are soft rectangles: inputs 8px, nav link highlights 8px, app cards and panels 16px, landing bento cards 22px, and icon tiles 6px. Borders are 1px hairlines in Hairline Sage at 60 to 70% opacity, or a 1px ring of Forest Ink at 10%. Cards clip their content (`overflow: hidden`) so demos and images take the card's corner.

The split-coin logo (`apps/web/public/brand/`) is the only illustrative geometry: a circle divided on the diagonal. It may appear as a mark; do not reuse it as decoration.

## Components

### Buttons
Refined and restrained: small, pill-shaped, quiet until pressed.
- **Shape:** full pill (9999px).
- **Primary:** Banknote Green fill, Mint Paper text, 32px tall, 10px horizontal padding, Inter 500 at 12px. Larger sizes are 36px; landing CTAs scale up in size and type but keep the pill.
- **Hover / Focus:** primary fades to 80% opacity on hover; focus shows the Banknote Green border plus a 1px ring at 50%; pressed state nudges down 1px. Landing CTAs add a white sheen sweep (`btn-shine`) and a 1px lift on hover.
- **Outline:** Mint Paper fill with hairline border; hover fills Pale Mint.
- **Secondary:** Sage fill, Forest Ink text.
- **Ghost:** transparent; hover fills Pale Mint.
- **Destructive:** 10% Oxblood wash with Oxblood text, 20% on hover. Never a solid red fill.

### Chips / Badges
- **Section badge:** Mint Paper fill, hairline border, Banknote Green text at 13px, 4px by 14px padding, pill, Ambient xs shadow. Sits above every landing section headline.
- **Status pills** in the app: small pills (10px text) in Banknote Green or Pale Mint.

### Cards / Containers
- **Corner Style:** 16px for app panels and shadcn cards; 22px for landing bento cards.
- **Background:** Ledger White for panels. Bento cards come in three tones that alternate so a row never reads as one block: light (diagonal gradient Mint Wash to Pale Mint to Sage at 40%), card (Ledger White), dark (Deep Forest with Mint Paper text).
- **Shadow Strategy:** flat, including on hover (see Elevation).
- **Border:** full Hairline Sage (app panels, figure strips, ledgers) or a 1px ring at 10% Forest Ink (shadcn cards).
- **Internal Padding:** 20 to 24px for app panels and bento cards; 16px (12px small) for shadcn cards.

### Inputs / Fields
- **Style:** app form controls (`controlClass` in `components/forms/field.tsx`) are 36px tall (40px on phones) with 14px text; shadcn inputs inside dialogs and menus stay 32px at 12px. 8px corners, 1px Hairline Sage stroke, transparent fill (30% input tint in dark), Moss Gray placeholder.
- **Focus:** border shifts to Banknote Green with a 1px ring at 50%.
- **Error / Disabled:** Oxblood border with a 20% Oxblood ring; disabled fades to 50% with a tinted fill.

### Navigation
- **Landing nav:** fixed; full width at top, then a frosted floating pill after scroll. Links are 14px Moss Gray, Forest Ink on hover, with a sliding 8px-rounded highlight at 6% Forest Ink behind the hovered link. Primary "Get Started" pill on the right. Mobile: opaque sheet with scrim, scroll lock and Escape to close.
- **App sidebar:** Sidebar tone (a step darker than Mint Paper), 12px items with icons; the active item takes a Mint Wash fill with Forest Ink text.

### Bento Card (signature)
The landing page's one card language: display-serif title top left (optional 12px uppercase eyebrow above), a small self-playing demo in the middle that yields to clicks, one line of Moss Gray copy at the bottom. Minimum 360px tall, 22px corners, cursor spotlight on pointer devices. Used for "What is Settle?", How it works and "Split it your way".

### App page anatomy
All signed-in pages are built from `apps/web/src/components/dashboard/panel.tsx`; do not hand-roll these again.
- **Page header** (`PageHeader`): Inter 24px semibold title, one plain 14px Moss Gray line of context, primary actions right-aligned (stacked under the title on phones). No eyebrow above it, no italic word, no icon beside the title.
- **Figure strip** (`FigureStrip`): a page's two to four key figures in one bordered strip, cells divided by hairlines. Label 13px Moss Gray in sentence case, value below (serif 28px for money, Inter 20px semibold for counts and names), optional 12px hint. Colour only by meaning: Banknote Green for owed to you, Oxblood for owing or over budget. Never a highlighted or filled tile.
- **Panel** (`Panel` + `PanelHeader`): bordered Ledger White surface, 16px corners, 14px semibold heading with an optional 13px description and one quiet action (a text link or small button) at the right.
- **Rows** (`rowClass`): lists inside panels are rows separated by 50% hairlines, 14px primary text, 12px metadata line, amounts right-aligned in tabular figures. Prefer rows and tables over grids of cards; a grid of cards is only for genuinely visual items.
- **Filters** (`Segmented`, `SegmentedNav`, `SearchField`): a pill track on Ledger White with a hairline; the selected option takes Mint Wash with Forest Ink text. Sub-page navigation (Spending) uses the same track.
- **Buttons** (`buttonClass`): pills. `md` is 36px (40px on phones) at 14px; `sm` is 32px (44px on phones) at 12px. Variants: primary (Banknote Green), secondary (hairline on Ledger White), ghost, danger (Oxblood wash).
- **AI features** (chat, quick add, settle plan, insights) sit on the same surfaces as everything else. Name them in words ("Settle AI"); no sparkle icons, no dark special-case cards, no gradient or glow.
- **States:** every panel owns its loading skeleton (shaped like its content), an inline error with a retry, and an empty state that says what to do next in one line.

### Motion
One quiet entrance per route (`app/dashboard/template.tsx`: fade and 6px rise, 280ms, ease-out-quint) and an optional 200ms fade when loaded content replaces its skeleton (`animate-fade-in`). State changes (hover fills, selected tabs, focus rings) transition colour only, 150ms. Nothing staggers, bounces, scales, lifts or loops in the app; dialogs and menus keep their shadcn open and close. Everything turns off under `prefers-reduced-motion`.

### Ledger (signature)
Overview's "Owed to you | You owe" two-column ledger: serif totals in each column head, one row per person (initials, name, shared groups, amount, action), a Sidebar-tone footer carrying the net. Rows are the api's fewest-payments transfers summed per person.

## Do's and Don'ts

### Do:
- **Do** keep every neutral green-tinted (hue ~160); take colors from the tokens, never from raw Tailwind palettes.
- **Do** use Instrument Serif for headlines, card titles and headline money figures, with at most one italic word.
- **Do** build every app page from the shared anatomy: `PageHeader`, optional `FigureStrip`, filters, then panels of rows.
- **Do** keep app page text at 14px Inter with 13px descriptions and 12px metadata; amounts in tabular figures.
- **Do** keep surfaces flat at rest and on hover; separate them with paper tones and hairlines.
- **Do** use pills for buttons, badges and chips, 16px corners for app panels, 22px for landing bento cards.
- **Do** design and check both light and dark themes in the app; dark is night-forest, never neutral black. Public pages (landing, privacy) stay light.
- **Do** honor `prefers-reduced-motion`: marquee, caret, drift, sheen and the app's route entrance all switch off.

### Don't:
- **Don't** go fintech-neon: no crypto or neobank gradients, neon on black, glowing charts or loud dashboard chrome.
- **Don't** use solid red fills; debts and destructive actions use Oxblood text on a light Oxblood wash.
- **Don't** add hues outside the green family to UI chrome, including browser surfaces like text selection.
- **Don't** set buttons, form labels, tables or body copy in the serif.
- **Don't** parallax, scale or tilt whole blocks on scroll; it was tried and removed as jittery.
- **Don't** reuse the split-coin logo geometry as decoration.
- **Don't** put uppercase eyebrows, italic title words, stat tiles with a highlighted or glowing tile, or sparkle icons in the app.
- **Don't** animate app content on its own: no staggered entrances, hover lifts, icon scaling or count-ups.
