"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskActions } from "./task-actions";
import { TaskDetailDialog } from "./task-detail-dialog";

const priorityIndicator: Record<string, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-blue-500",
};

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

export function TaskRow({ task }: { task: TaskData }) {
  return (
    <TaskDetailDialog task={task}>
      <Card className="group hover:shadow-sm transition-shadow">
        <CardContent className="flex items-center gap-3 py-3">
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <TaskActions id={task.id} isDone={task.status === "Done"} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium truncate ${
                task.status === "Done"
                  ? "line-through text-muted-foreground"
                  : ""
              }`}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {task.category}
              </span>
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  · {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              {task.description && (
                <span className="text-xs text-muted-foreground">· 📝</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`h-2 w-2 rounded-full ${priorityIndicator[task.priority]}`}
            />
            <Badge variant="secondary" className="text-xs">
              {task.priority}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </TaskDetailDialog>
  );
}
