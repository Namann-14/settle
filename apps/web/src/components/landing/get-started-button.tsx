"use client";

import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";

// Signed-out visitors get the Clerk sign-up modal; signed-in users go straight to the dashboard.
export function GetStartedButton({
  label = "Get started free",
  className,
}: {
  label?: string;
  className: string;
}) {
  return (
    <>
      <Show when="signed-out">
        <SignUpButton mode="modal">
          <button className={className}>{label}</button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link href="/dashboard" className={className}>
          Open dashboard
        </Link>
      </Show>
    </>
  );
}
