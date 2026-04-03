import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTaskDialog } from "@/components/features/create-task-dialog";
import { TaskRow } from "./task-row";
import { CheckSquare, Circle, Clock, AlertTriangle } from "lucide-react";

export default async function TasksPage() {
  const user = await getUser();

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
  });

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdue = tasks.filter((t) => t.status !== "Done" && t.dueDate && t.dueDate < now);
  const today = tasks.filter((t) => {
    if (t.status === "Done" || !t.dueDate) return false;
    const taskDate = new Date(t.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === now.getTime();
  });
  const upcoming = tasks.filter((t) => {
    if (t.status === "Done" || !t.dueDate) return false;
    const taskDate = new Date(t.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() > now.getTime();
  });
  const noDueDate = tasks.filter((t) => t.status !== "Done" && !t.dueDate);
  const completed = tasks.filter((t) => t.status === "Done");

  const sections = [
    { title: "Overdue", icon: AlertTriangle, tasks: overdue, color: "text-red-500" },
    { title: "Today", icon: Clock, tasks: today, color: "text-amber-500" },
    { title: "Upcoming", icon: Circle, tasks: upcoming, color: "text-blue-500" },
    { title: "No Due Date", icon: Circle, tasks: noDueDate, color: "text-muted-foreground" },
    { title: "Completed", icon: CheckSquare, tasks: completed, color: "text-green-500" },
  ].filter((s) => s.tasks.length > 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tasks.filter((t) => t.status !== "Done").length} active · {completed.length} completed
          </p>
        </div>
        <CreateTaskDialog />
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No tasks yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Add your first task to get started
            </p>
            <CreateTaskDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <section.icon className={`h-4 w-4 ${section.color}`} />
                <h2 className="text-sm font-semibold">{section.title}</h2>
                <Badge variant="secondary" className="text-xs ml-1">
                  {section.tasks.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {section.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
