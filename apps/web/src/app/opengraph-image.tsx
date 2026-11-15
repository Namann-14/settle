import { ImageResponse } from "next/og";

export const alt = "Settle - Split bills, not friendships";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#1f3a2e",
          color: "#f4f1e8",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>Settle</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 104, lineHeight: 1, letterSpacing: -3 }}>
            Split bills, not friendships
          </div>
          <div style={{ fontSize: 34, opacity: 0.75 }}>
            Shared expenses for trips, flats and dinners. Settle up in the fewest payments.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
