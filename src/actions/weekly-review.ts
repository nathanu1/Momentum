"use server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { weeklyReviewSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createWeeklyReview(formData: FormData) {
  const user = await getUser();

  const raw = {
    wins: (formData.get("wins") as string) || undefined,
    challenges: (formData.get("challenges") as string) || undefined,
    prioritiesNextWeek: (formData.get("prioritiesNextWeek") as string) || undefined,
  };

  const parsed = weeklyReviewSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Compute week boundaries (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Calculate auto-summary stats for this week
  const [tasksCompleted, applicationsSubmitted, habitLogs, totalDailyHabits] = await Promise.all([
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

  const maxPossibleLogs = totalDailyHabits * 7;
  const habitsConsistency = maxPossibleLogs > 0 ? Math.round((habitLogs / maxPossibleLogs) * 100) : 0;

  // Check for existing review this week
  const existingReview = await prisma.weeklyReview.findFirst({
    where: { userId: user.id, weekStartDate: weekStart },
    select: { id: true },
  });

  if (existingReview) {
    await prisma.weeklyReview.update({
      where: { id: existingReview.id },
      data: {
        wins: parsed.data.wins || null,
        challenges: parsed.data.challenges || null,
        prioritiesNextWeek: parsed.data.prioritiesNextWeek || null,
        tasksCompleted,
        applicationsSubmitted,
        habitsConsistency,
      },
    });
  } else {
    await prisma.weeklyReview.create({
      data: {
        userId: user.id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        wins: parsed.data.wins || null,
        challenges: parsed.data.challenges || null,
        prioritiesNextWeek: parsed.data.prioritiesNextWeek || null,
        tasksCompleted,
        applicationsSubmitted,
        habitsConsistency,
      },
    });
  }

  revalidatePath("/weekly-review");
  revalidatePath("/dashboard");
  return { success: true };
}
