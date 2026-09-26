import { SpendingNav } from "@/components/spending/spending-nav";

export default function SpendingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-2 py-4 md:px-4 md:py-6">
      <SpendingNav />
      {children}
    </div>
  );
}
