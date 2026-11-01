// A template (unlike the layout) remounts on every navigation, so each
// dashboard route enters with the same short fade and rise. This is the only
// page-level animation; cards and rows inside do not animate in on their own.
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in flex flex-1 flex-col">{children}</div>;
}
