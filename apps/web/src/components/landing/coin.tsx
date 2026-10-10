import { cn } from "@settle/ui/lib/utils";

// Glossy coin with a milled edge and the split-coin mark struck into the face.
// Pure SVG with fixed oklch greens: it is an illustration, so it should read
// the same on light and dark backgrounds.
const EDGE_STEPS = 14;

export function Coin({
  className,
  half,
  id = "coin",
}: {
  className?: string;
  // Render only one half (used to split the coin apart on hover).
  half?: "left" | "right";
  // Gradient ids must be unique per instance on a page.
  id?: string;
}) {
  return (
    <svg
      viewBox="-64 -58 128 116"
      aria-hidden
      className={cn("size-full overflow-visible", className)}
      style={half ? { clipPath: half === "left" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)" } : undefined}
    >
      <defs>
        {/* banded metallic face, light to shadow and back */}
        <linearGradient id={`${id}-face`} x1="0.1" y1="0" x2="0.85" y2="1">
          <stop offset="0" style={{ stopColor: "oklch(0.97 0.02 158)" }} />
          <stop offset="0.22" style={{ stopColor: "oklch(0.86 0.05 158)" }} />
          <stop offset="0.44" style={{ stopColor: "oklch(0.7 0.075 158)" }} />
          <stop offset="0.54" style={{ stopColor: "oklch(0.5 0.07 162)" }} />
          <stop offset="0.68" style={{ stopColor: "oklch(0.8 0.06 158)" }} />
          <stop offset="0.86" style={{ stopColor: "oklch(0.95 0.025 158)" }} />
          <stop offset="1" style={{ stopColor: "oklch(0.62 0.07 160)" }} />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="0.9" y1="0" x2="0.15" y2="1">
          <stop offset="0" style={{ stopColor: "oklch(0.96 0.025 158)" }} />
          <stop offset="0.4" style={{ stopColor: "oklch(0.74 0.07 158)" }} />
          <stop offset="1" style={{ stopColor: "oklch(0.48 0.07 162)" }} />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "oklch(0.8 0.06 158)" }} />
          <stop offset="0.38" style={{ stopColor: "oklch(0.42 0.06 162)" }} />
          <stop offset="0.62" style={{ stopColor: "oklch(0.88 0.04 158)" }} />
          <stop offset="1" style={{ stopColor: "oklch(0.55 0.065 161)" }} />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" style={{ stopColor: "oklch(0.3 0.06 164)", stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: "oklch(0.3 0.06 164)", stopOpacity: 0.35 }} />
        </linearGradient>
        <radialGradient id={`${id}-glint`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* thickness: a stack of offset discs with a dashed milled edge */}
      {Array.from({ length: EDGE_STEPS }, (_, i) => {
        const dx = 7 - (i * 7) / EDGE_STEPS;
        return (
          <ellipse
            key={i}
            cx={dx}
            cy="0"
            rx="41"
            ry="50"
            fill={`url(#${id}-edge)`}
            stroke={i % 2 ? "oklch(0.92 0.03 158)" : "oklch(0.4 0.06 162)"}
            strokeWidth="0.7"
            strokeDasharray="1.1 1.6"
            strokeOpacity="0.6"
          />
        );
      })}

      {/* face */}
      <ellipse rx="41" ry="50" fill={`url(#${id}-face)`} />
      <ellipse rx="34.4" ry="42" fill={`url(#${id}-inner)`} opacity="0.55" />
      <ellipse rx="34.4" ry="42" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" />
      <ellipse rx="41" ry="50" fill={`url(#${id}-shade)`} />

      {/* split-coin mark */}
      <g transform="translate(-12 -12) scale(0.5)" opacity="0.92">
        <path d="M12.69 35.31A16 16 0 0 1 35.31 12.69Z" transform="translate(-1.6 -1.6)" style={{ fill: "oklch(0.3 0.055 163)" }} />
        <path d="M35.31 12.69A16 16 0 0 1 12.69 35.31Z" transform="translate(1.6 1.6)" style={{ fill: "oklch(0.3 0.055 163)", fillOpacity: 0.45 }} />
      </g>

      {/* glint and rim light */}
      <ellipse cx="-13" cy="-21" rx="17" ry="8" fill={`url(#${id}-glint)`} transform="rotate(-32 -13 -21)" />
      <ellipse rx="40.6" ry="49.6" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" />
    </svg>
  );
}
