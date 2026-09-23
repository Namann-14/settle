import { Lightbulb } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@settle/ui/components/card";

export function QuickTipCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick tip</CardTitle>
      </CardHeader>
      <CardContent className="flex items-start gap-3">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          Log expenses right after you pay to keep group balances accurate — the longer you
          wait, the easier it is to forget who paid what.
        </p>
      </CardContent>
    </Card>
  );
}
