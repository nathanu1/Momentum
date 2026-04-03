"use client";

import { useTransition } from "react";
import { deleteApplication, updateApplicationStatus } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { APPLICATION_STATUSES } from "@/lib/schemas";
import {
  MoreHorizontal,
  Trash2,
  Loader2,
  ArrowRightLeft,
  CheckCircle2,
  Circle,
} from "lucide-react";

const statusIcons: Record<string, string> = {
  Wishlist: "🌟",
  Applied: "📨",
  OA: "💻",
  Interview: "🎤",
  Offer: "🎉",
  Rejected: "❌",
};

export function ApplicationActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this application?")) return;
    startTransition(async () => {
      await deleteApplication(id);
    });
  }

  function handleStatusChange(newStatus: string) {
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      await updateApplicationStatus(id, newStatus);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            className="h-8 w-8"
          />
        }
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowRightLeft className="h-4 w-4 mr-1.5 text-muted-foreground" />
            Change Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {APPLICATION_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
              >
                <span className="mr-1.5">{statusIcons[status]}</span>
                {status}
                {status === currentStatus ? (
                  <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                ) : (
                  <Circle className="ml-auto h-4 w-4 text-transparent" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-1.5" />
          Delete Application
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
