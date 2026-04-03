"use client";

import { useState, useTransition } from "react";
import { updateTask, deleteTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_PRIORITIES, TASK_CATEGORIES, TASK_STATUSES } from "@/lib/schemas";
import { Loader2, Trash2, Calendar, Tag, Flag, Layers, RefreshCw } from "lucide-react";

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: string;
  status: string;
  category: string;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const priorityColors: Record<string, string> = {
  High: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  Low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
};

const statusColors: Record<string, string> = {
  Todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "In Progress": "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  Done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

export function TaskDetailDialog({
  task,
  children,
}: {
  task: TaskData;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateTask(task.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this task?")) return;
    startTransition(async () => {
      await deleteTask(task.id);
      setOpen(false);
    });
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      setIsEditing(false);
      setError(null);
    }
  }

  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toISOString().split("T")[0]
    : "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {children}
      </div>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8">
            {isEditing ? "Edit Task" : task.title}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your task"
              : `Created ${task.createdAt.toLocaleDateString()} · Updated ${task.updatedAt.toLocaleDateString()}`}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          /* ─── Edit Mode ─────────────────────────────────── */
          <form action={handleSave} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                name="title"
                required
                defaultValue={task.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                rows={3}
                defaultValue={task.description || ""}
                placeholder="Add details about this task..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={dueDateStr}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select name="priority" defaultValue={task.priority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select name="status" defaultValue={task.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select name="category" defaultValue={task.category}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <input
              type="hidden"
              name="isRecurring"
              value={String(task.isRecurring)}
            />
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        ) : (
          /* ─── View Mode ─────────────────────────────────── */
          <div className="space-y-5">
            {/* Status & Priority Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={statusColors[task.status] || ""}
                variant="secondary"
              >
                {task.status}
              </Badge>
              <Badge
                className={priorityColors[task.priority] || ""}
                variant="secondary"
              >
                {task.priority} Priority
              </Badge>
              {task.isRecurring && (
                <Badge variant="secondary" className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Recurring
                </Badge>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Description
              </p>
              {task.description ? (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No description added
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Due Date
                  </p>
                  <p className="text-sm mt-0.5">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "No due date"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Category
                  </p>
                  <p className="text-sm mt-0.5">{task.category}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Flag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Priority
                  </p>
                  <p className="text-sm mt-0.5">{task.priority}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Status
                  </p>
                  <p className="text-sm mt-0.5">{task.status}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2 border-t">
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button onClick={() => setIsEditing(true)} className="gap-1.5">
                Edit Task
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
