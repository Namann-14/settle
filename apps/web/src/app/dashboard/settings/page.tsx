import { WhatsAppCard } from "@/components/settings/whatsapp-card";
import { Eyebrow } from "@/components/dashboard/panel";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-2">
        <Eyebrow>Account</Eyebrow>
        <h1 className="font-display text-4xl leading-none tracking-tight md:text-5xl">
          <em className="italic">Settings</em>
        </h1>
      </div>
      <WhatsAppCard />
    </div>
  );
}
