import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyReviewForm } from "./weekly-review-form";
import { FileText, CheckSquare, Briefcase, Flame, TrendingUp } from "lucide-react";

export default async function WeeklyReviewPage() {
  const user = await getUser();

  // Get current week boundaries
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Fetch auto stats
  const [tasksCompleted, applicationsSubmitted, habitLogs, totalDailyHabits] =
    await Promise.all([
      prisma.task.count({
        where: {
          userId: user.id,
          status: "Done",
          updatedAt: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.application.count({
        where: {
          userId: user.id,
          createdAt: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.habitLog.count({
        where: {
          habit: { userId: user.id },
          date: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.habit.count({
        where: { userId: user.id, frequency: "Daily" },
      }),
    ]);

  const maxLogs = totalDailyHabits * 7;
  const habitConsistency = maxLogs > 0 ? Math.round((habitLogs / maxLogs) * 100) : 0;

  // Fetch existing review for this week
  const existingReview = await prisma.weeklyReview.findFirst({
    where: { userId: user.id, weekStartDate: weekStart },
  });

  // Fetch previous reviews
  const previousReviews = await prisma.weeklyReview.findMany({
    where: { userId: user.id },
    orderBy: { weekStartDate: "desc" },
    take: 5,
  });

  const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weekly Review</h1>
        <p className="text-muted-foreground text-sm mt-1">{weekLabel}</p>
      </div>

      {/* Auto Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{tasksCompleted}</p>
                <p className="text-xs text-muted-foreground">Tasks Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{applicationsSubmitted}</p>
                <p className="text-xs text-muted-foreground">Apps Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{habitConsistency}%</p>
                <p className="text-xs text-muted-foreground">Habit Consistency</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{habitLogs}</p>
                <p className="text-xs text-muted-foreground">Habit Check-ins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Form */}
      <WeeklyReviewForm existing={existingReview} />

      {/* Previous Reviews */}
      {previousReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Previous Reviews</h2>
          {previousReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {review.weekStartDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  —{" "}
                  {review.weekEndDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {review.wins && (
                  <div>
                    <p className="font-medium text-green-600 mb-1">Wins</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{review.wins}</p>
                  </div>
                )}
                {review.challenges && (
                  <div>
                    <p className="font-medium text-amber-600 mb-1">Challenges</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{review.challenges}</p>
                  </div>
                )}
                {review.prioritiesNextWeek && (
                  <div>
                    <p className="font-medium text-blue-600 mb-1">Next Week Priorities</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {review.prioritiesNextWeek}
                    </p>
                  </div>
                )}
                <div className="flex gap-4 pt-2 border-t text-xs text-muted-foreground">
                  <span>{review.tasksCompleted} tasks</span>
                  <span>{review.applicationsSubmitted} apps</span>
                  <span>{review.habitsConsistency}% habits</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
