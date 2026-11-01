import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The app defines extra font-size roles (text-micro, text-meta, text-figure in
// apps/web/src/index.css). Without telling tailwind-merge they are sizes, it
// reads them as colours and drops them whenever a text colour class follows.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["micro", "meta", "figure"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
