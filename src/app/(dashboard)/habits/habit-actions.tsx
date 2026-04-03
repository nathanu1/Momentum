"use client";

import { useTransition } from "react";
import { toggleHabitLog, deleteHabit } from "@/actions/habits";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Loader2 } from "lucide-react";

export function HabitActions({
  id,
  completedToday,
}: {
  id: string;
  completedToday: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleHabitLog(id);
    });
  }

  function handleDelete() {
    if (!confirm("Delete this habit? All history will be lost.")) return;
    startTransition(async () => {
      await deleteHabit(id);
    });
  }

  if (isPending) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground shrink-0" />;
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={handleToggle}
        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
          completedToday
            ? "bg-green-500 border-green-500"
            : "border-muted-foreground/30 hover:border-green-500"
        }`}
      >
        {completedToday && <Check className="h-3.5 w-3.5 text-white" />}
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}
