import { PageContainer, PageHeader } from "@/components/dashboard/panel";
import { AccountPanel } from "@/components/settings/account-panel";
import { AppearancePanel } from "@/components/settings/appearance-panel";
import { TelegramCard } from "@/components/settings/telegram-card";

export default function SettingsPage() {
  return (
    <PageContainer narrow>
      <PageHeader title="Settings" description="Your account, how Settle looks, and connected apps." />
      <AccountPanel />
      <AppearancePanel />
      <section aria-labelledby="settings-connections" className="flex flex-col gap-3">
        <h2 id="settings-connections" className="px-1 text-meta text-muted-foreground">
          Connections
        </h2>
        <TelegramCard />
      </section>
    </PageContainer>
  );
}
