"use client";

import { useTransition } from "react";
import { toggleTaskComplete, deleteTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Check, Circle, Trash2, Loader2 } from "lucide-react";

export function TaskActions({ id, isDone }: { id: string; isDone: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleTaskComplete(id);
    });
  }

  function handleDelete() {
    if (!confirm("Delete this task?")) return;
    startTransition(async () => {
      await deleteTask(id);
    });
  }

  if (isPending) {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground shrink-0" />;
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={handleToggle}
        className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center hover:border-primary transition-colors"
      >
        {isDone && <Check className="h-3 w-3 text-green-500" />}
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
