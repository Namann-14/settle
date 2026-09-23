"use client";

import { Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@settle/ui/components/avatar";
import { Button } from "@settle/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@settle/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@settle/ui/components/empty";
import { Skeleton } from "@settle/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@settle/ui/components/tooltip";

import { useGroups } from "@/hooks/useGroups";

function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase();
}

export function GroupsCard() {
  const { data: groups, isLoading, isError } = useGroups();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your groups</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <Empty>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Couldn&apos;t load groups</EmptyTitle>
            <EmptyDescription>Try refreshing the page.</EmptyDescription>
          </Empty>
        ) : !groups || groups.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>No groups yet</EmptyTitle>
            <EmptyDescription>Create one to start splitting expenses.</EmptyDescription>
          </Empty>
        ) : (
          groups.map((group) => {
            const activeMembers = group.members.filter((m) => !m.removed_at);
            return (
              <div key={group.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-sm font-medium">{group.name}</span>
                  <div className="flex -space-x-2">
                    {activeMembers.slice(0, 5).map((member) => (
                      <Avatar key={member.id} size="sm" className="ring-2 ring-background">
                        <AvatarFallback>{initials(member.user_name)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {activeMembers.length > 5 && (
                      <Avatar size="sm" className="ring-2 ring-background">
                        <AvatarFallback>+{activeMembers.length - 5}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>
                    <Button size="sm" variant="outline" disabled>
                      Settle up
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settle-up flow coming soon</TooltipContent>
                </Tooltip>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
