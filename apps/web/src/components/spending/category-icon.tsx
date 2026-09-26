import {
  Car,
  CircleEllipsis,
  Clapperboard,
  Coffee,
  Dumbbell,
  Fuel,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  type LucideIcon,
  PawPrint,
  Plane,
  Repeat,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  Tag,
  Utensils,
  Wifi,
  Zap,
} from "lucide-react";

import { cn } from "@settle/ui/lib/utils";

// Categories store a lucide icon *name*; this is the whitelist the picker
// offers and the renderer understands. Unknown names fall back to a tag.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  "shopping-basket": ShoppingBasket,
  car: Car,
  house: House,
  zap: Zap,
  "shopping-bag": ShoppingBag,
  clapperboard: Clapperboard,
  plane: Plane,
  "heart-pulse": HeartPulse,
  repeat: Repeat,
  "graduation-cap": GraduationCap,
  "circle-ellipsis": CircleEllipsis,
  coffee: Coffee,
  fuel: Fuel,
  gift: Gift,
  dumbbell: Dumbbell,
  shirt: Shirt,
  smartphone: Smartphone,
  wifi: Wifi,
  "paw-print": PawPrint,
  tag: Tag,
};

export const CATEGORY_COLORS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const;

/** CSS color for a category; uncolored ones cycle through the chart palette by position. */
export function categoryColor(color: string | null | undefined, index = 0) {
  const token = color && CATEGORY_COLORS.includes(color as never) ? color : CATEGORY_COLORS[index % 5];
  return `var(--${token})`;
}

export function CategoryIcon({
  icon,
  color,
  index,
  className,
}: {
  icon?: string | null;
  color?: string | null;
  index?: number;
  className?: string;
}) {
  const Icon = (icon && CATEGORY_ICONS[icon]) || Tag;
  const fill = categoryColor(color, index);
  return (
    <span
      className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl", className)}
      style={{ backgroundColor: `color-mix(in oklab, ${fill} 18%, transparent)`, color: fill }}
      aria-hidden
    >
      <Icon className="size-4" />
    </span>
  );
}
