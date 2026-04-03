import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  RotateCcw,
  AlertTriangle,
  CheckSquare,
  Briefcase,
  Flame,
  FileText,
  ArrowRight,
} from "lucide-react";

export default async function ResetPage() {
  const user = await getUser();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Compute week start
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const [overdueTasks, staleApplications, habits, habitLogs, latestReview] =
    await Promise.all([
      prisma.task.findMany({
        where: {
          userId: user.id,
          status: { not: "Done" },
          dueDate: { lt: startOfDay },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.application.findMany({
        where: {
          userId: user.id,
          status: { in: ["Applied", "OA", "Interview"] },
          nextFollowUpDate: { lt: startOfDay },
        },
        orderBy: { nextFollowUpDate: "asc" },
      }),
      prisma.habit.findMany({
        where: { userId: user.id, frequency: "Daily" },
      }),
      prisma.habitLog.findMany({
        where: {
          habit: { userId: user.id },
          date: startOfDay,
        },
      }),
      prisma.weeklyReview.findFirst({
        where: { userId: user.id },
        orderBy: { weekStartDate: "desc" },
      }),
    ]);

  const neglectedHabits = habits.filter(
    (h) => !habitLogs.some((l) => l.habitId === h.id)
  );

  const hasReviewThisWeek =
    latestReview && latestReview.weekStartDate >= weekStart;

  const issueCount =
    overdueTasks.length +
    staleApplications.length +
    neglectedHabits.length +
    (hasReviewThisWeek ? 0 : 1);

  const checklist = [
    {
      label: "Review overdue tasks",
      count: overdueTasks.length,
      href: "/tasks",
      icon: CheckSquare,
      done: overdueTasks.length === 0,
    },
    {
      label: "Follow up on stale applications",
      count: staleApplications.length,
      href: "/applications",
      icon: Briefcase,
      done: staleApplications.length === 0,
    },
    {
      label: "Complete today's habits",
      count: neglectedHabits.length,
      href: "/habits",
      icon: Flame,
      done: neglectedHabits.length === 0,
    },
    {
      label: "Complete weekly review",
      count: hasReviewThisWeek ? 0 : 1,
      href: "/weekly-review",
      icon: FileText,
      done: !!hasReviewThisWeek,
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <RotateCcw className="h-6 w-6" />
          Life Reset
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Get back on track by clearing your backlog
        </p>
      </div>

      {/* Status Banner */}
      <Card className={issueCount === 0 ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}>
        <CardContent className="flex items-center gap-4 py-5">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${issueCount === 0 ? "bg-green-500/10" : "bg-amber-500/10"}`}>
            {issueCount === 0 ? (
              <CheckSquare className="h-6 w-6 text-green-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            )}
          </div>
          <div>
            <p className="font-semibold">
              {issueCount === 0
                ? "You're all caught up! 🎉"
                : `${issueCount} item${issueCount > 1 ? "s" : ""} need${issueCount === 1 ? "s" : ""} your attention`}
            </p>
            <p className="text-sm text-muted-foreground">
              {issueCount === 0
                ? "Great work staying on top of things"
                : "Work through the checklist below to reset"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Checklist */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Reset Checklist</h2>
        {checklist.map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className={`hover:shadow-sm transition-shadow cursor-pointer mb-3 ${item.done ? "opacity-60" : ""}`}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${item.done ? "bg-green-500/10" : "bg-muted"}`}>
                  {item.done ? (
                    <CheckSquare className="h-4 w-4 text-green-500" />
                  ) : (
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.done ? "line-through" : ""}`}>
                    {item.label}
                  </p>
                  {item.count > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {item.count} item{item.count > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                {!item.done && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Overdue Tasks Detail */}
      {overdueTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5">
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {task.dueDate?.toLocaleDateString()} · {task.category}
                  </p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {Math.ceil((startOfDay.getTime() - (task.dueDate?.getTime() || 0)) / 86400000)}d overdue
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stale Applications */}
      {staleApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-amber-500 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Stale Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {staleApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5">
                <div>
                  <p className="text-sm font-medium">{app.company} — {app.role}</p>
                  <p className="text-xs text-muted-foreground">
                    Follow-up was {app.nextFollowUpDate?.toLocaleDateString()} · {app.status}
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-700 text-xs">Needs Follow-up</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
