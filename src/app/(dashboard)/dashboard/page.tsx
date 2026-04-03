import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Briefcase,
  CheckSquare,
  Flame,
  AlertTriangle,
  Plus,
  ArrowRight,
  Target,
  TrendingUp,
} from "lucide-react";

async function getDashboardData(userId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    todayTasks,
    overdueTasks,
    totalTasks,
    completedTasks,
    applications,
    habits,
    habitLogs,
  ] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        status: { not: "Done" },
        dueDate: { gte: startOfDay, lt: new Date(startOfDay.getTime() + 86400000) },
      },
      orderBy: { priority: "desc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        userId,
        status: { not: "Done" },
        dueDate: { lt: startOfDay },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: "Done" } }),
    prisma.application.findMany({ where: { userId } }),
    prisma.habit.findMany({ where: { userId } }),
    prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: { gte: startOfDay },
      },
    }),
  ]);

  const pipelineSummary = {
    wishlist: applications.filter((a) => a.status === "Wishlist").length,
    applied: applications.filter((a) => a.status === "Applied").length,
    oa: applications.filter((a) => a.status === "OA").length,
    interview: applications.filter((a) => a.status === "Interview").length,
    offer: applications.filter((a) => a.status === "Offer").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
    total: applications.length,
  };

  const habitsCompletedToday = habitLogs.length;
  const totalHabits = habits.filter((h) => h.frequency === "Daily").length;

  const needsReset = overdueTasks.length >= 3 || 
    (totalHabits > 0 && habitsCompletedToday / totalHabits < 0.3);

  return {
    todayTasks,
    overdueTasks,
    totalTasks,
    completedTasks,
    pipelineSummary,
    habitsCompletedToday,
    totalHabits,
    habits,
    needsReset,
  };
}

export default async function DashboardPage() {
  const user = await getUser();
  const data = await getDashboardData(user.id);
  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good {getGreeting()}, {firstName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s on your plate today
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/applications">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Application
            </Button>
          </Link>
          <Link href="/tasks">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Life Reset Banner */}
      {data.needsReset && (
        <Link href="/reset">
          <Card className="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Time for a Life Reset?</p>
                <p className="text-xs text-muted-foreground">
                  You have overdue tasks and unfinished habits. Let&apos;s get back on track.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.pipelineSummary.total}</p>
                <p className="text-xs text-muted-foreground">Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data.completedTasks}/{data.totalTasks}
                </p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data.habitsCompletedToday}/{data.totalHabits}
                </p>
                <p className="text-xs text-muted-foreground">Habits Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.pipelineSummary.interview}</p>
                <p className="text-xs text-muted-foreground">Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Today&apos;s Tasks
            </CardTitle>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.todayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks due today. Nice!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full shrink-0"
                         style={{ backgroundColor: task.priority === "High" ? "rgb(239 68 68)" : task.priority === "Medium" ? "rgb(245 158 11)" : "rgb(59 130 246)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.category}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Pipeline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Application Pipeline
            </CardTitle>
            <Link href="/applications">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.pipelineSummary.total === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No applications yet</p>
                <Link href="/applications">
                  <Button variant="outline" size="sm" className="mt-3">
                    Add your first application
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Wishlist", count: data.pipelineSummary.wishlist, color: "bg-slate-100 text-slate-700" },
                  { label: "Applied", count: data.pipelineSummary.applied, color: "bg-blue-50 text-blue-700" },
                  { label: "OA", count: data.pipelineSummary.oa, color: "bg-violet-50 text-violet-700" },
                  { label: "Interview", count: data.pipelineSummary.interview, color: "bg-amber-50 text-amber-700" },
                  { label: "Offer", count: data.pipelineSummary.offer, color: "bg-green-50 text-green-700" },
                  { label: "Rejected", count: data.pipelineSummary.rejected, color: "bg-red-50 text-red-700" },
                ].map((stage) => (
                  <div
                    key={stage.label}
                    className={`rounded-lg p-3 text-center ${stage.color}`}
                  >
                    <p className="text-xl font-bold">{stage.count}</p>
                    <p className="text-xs font-medium">{stage.label}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        {data.overdueTasks.length > 0 && (
          <Card className="border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-4 w-4" />
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {task.dueDate?.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs shrink-0">
                      Overdue
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Habit Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Habits
            </CardTitle>
            <Link href="/habits">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.habits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Flame className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No habits tracked yet</p>
                <Link href="/habits">
                  <Button variant="outline" size="sm" className="mt-3">
                    Start a habit
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.habits.slice(0, 5).map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Flame className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{habit.name}</p>
                        <p className="text-xs text-muted-foreground">{habit.category}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      🔥 {habit.streak}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
