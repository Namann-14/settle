import { PageContainer } from "@/components/dashboard/panel";
import { SpendingNav } from "@/components/spending/spending-nav";

// One page column for the whole Spending section. The sub-page nav sits above
// each sub-page's own PageHeader, so the four pages read as tabs of one section
// while each still names what it is (Spending, Budgets, Recurring, Categories).
export default function SpendingLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer className="gap-6 md:gap-8">
      <SpendingNav />
      {children}
    </PageContainer>
  );
}
