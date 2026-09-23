import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@settle/ui/components/card";

export function DashboardPlaceholderCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="opacity-70">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-6 text-center">
        <Icon className="size-6 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{description}</p>
        <span className="text-xs font-medium text-muted-foreground">Coming soon</span>
      </CardContent>
    </Card>
  );
}
