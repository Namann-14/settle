"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

// The navbar's sign-in / dashboard buttons: the only part of the navbar that
// depends on the session.
export function NavAuth() {
  return (
    <div className="flex items-center gap-3">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 cursor-pointer">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-full px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer">
            Get Started
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link
          href="/dashboard"
          className="rounded-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
        >
          Dashboard
        </Link>
        <UserButton />
      </Show>
    </div>
  );
}
