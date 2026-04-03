import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateHabitDialog } from "@/components/features/create-habit-dialog";
import { HabitActions } from "./habit-actions";
import { Flame } from "lucide-react";

const categoryColors: Record<string, string> = {
  Health: "bg-green-500/10 text-green-600",
  Productivity: "bg-blue-500/10 text-blue-600",
  Mindset: "bg-purple-500/10 text-purple-600",
  "Personal Care": "bg-pink-500/10 text-pink-600",
};

export default async function HabitsPage() {
  const user = await getUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    include: {
      logs: {
        where: { date: today },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const habitsWithStatus = habits.map((habit) => ({
    ...habit,
    completedToday: habit.logs.length > 0,
  }));

  const completedCount = habitsWithStatus.filter((h) => h.completedToday).length;
  const dailyHabits = habitsWithStatus.filter((h) => h.frequency === "Daily");

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {completedCount}/{dailyHabits.length} completed today
          </p>
        </div>
        <CreateHabitDialog />
      </div>

      {/* Progress Bar */}
      {dailyHabits.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Today&apos;s Progress</p>
              <p className="text-sm text-muted-foreground">
                {Math.round((completedCount / dailyHabits.length) * 100)}%
              </p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / dailyHabits.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habits list */}
      {habitsWithStatus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Flame className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No habits yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Start building a new habit today
            </p>
            <CreateHabitDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {habitsWithStatus.map((habit) => (
            <Card key={habit.id} className="group hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-4 py-4">
                <HabitActions id={habit.id} completedToday={habit.completedToday} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${habit.completedToday ? "line-through text-muted-foreground" : ""}`}>
                    {habit.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={categoryColors[habit.category] || ""} variant="secondary">
                      {habit.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{habit.frequency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold">{habit.streak}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
