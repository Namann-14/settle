import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Settle",
  description: "What Settle collects, why, and how to have it deleted.",
};

const CONTACT_EMAIL = "namannayak.16@gmail.com";
const UPDATED = "27 September 2026";

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "What we collect",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <b>Account details</b> from our sign-in provider, Clerk: your name, email address and a user id.
        </li>
        <li>
          <b>What you add</b>: expenses, incomes, budgets, groups, settlements and the messages you send to the
          in-app assistant.
        </li>
        <li>
          <b>WhatsApp</b>, only if you link it: your WhatsApp phone number, the text or voice notes you send to the
          Settle bot, and message ids used to avoid logging the same message twice.
        </li>
      </ul>
    ),
  },
  {
    title: "How we use it",
    body: (
      <p>
        Only to run Settle for you: storing and totalling your expenses, working out balances between group
        members, and replying to you on WhatsApp. We don&apos;t sell your data, show ads, or use it to market to
        you. The WhatsApp bot only replies to messages you send it; it never messages you first.
      </p>
    ),
  },
  {
    title: "Who processes it",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Clerk: sign-in and account management.</li>
        <li>Neon: the database your data is stored in.</li>
        <li>Vercel: hosting.</li>
        <li>
          Groq: turns the text and voice notes you send into expense details (amount, category, date). Voice notes
          are transcribed and not kept by Settle after processing.
        </li>
        <li>Meta (WhatsApp Cloud API): delivers messages between you and the Settle bot.</li>
      </ul>
    ),
  },
  {
    title: "Keeping and deleting your data",
    body: (
      <p>
        Your data is kept while your account exists. You can unlink WhatsApp at any time from Settings, which
        removes your phone number from your account. To delete your account and everything in it, email us from
        the address on your account and we&apos;ll remove it within 30 days.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        Questions or deletion requests:{" "}
        <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-16 md:py-24">
      <div className="flex flex-col gap-3">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ✦ Settle
        </Link>
        <h1 className="font-display text-5xl leading-none tracking-tight">
          Privacy <em className="italic">policy</em>
        </h1>
        <p className="text-sm text-muted-foreground">Last updated {UPDATED}</p>
      </div>
      {sections.map((s) => (
        <section key={s.title} className="flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
          {s.body}
        </section>
      ))}
    </main>
  );
}
