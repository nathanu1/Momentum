"use server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { habitSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createHabit(formData: FormData) {
  const user = await getUser();

  const raw = {
    name: formData.get("name") as string,
    frequency: formData.get("frequency") as string,
    category: formData.get("category") as string,
  };

  const parsed = habitSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.habit.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      frequency: parsed.data.frequency,
      category: parsed.data.category,
    },
  });

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleHabitLog(habitId: string) {
  const user = await getUser();

  const habit = await prisma.habit.findUnique({
    where: { id: habitId, userId: user.id },
  });
  if (!habit) return { error: "Habit not found" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.habitLog.findUnique({
    where: {
      habitId_date: { habitId, date: today },
    },
  });

  if (existingLog) {
    await prisma.habitLog.delete({ where: { id: existingLog.id } });
    await prisma.habit.update({
      where: { id: habitId },
      data: { streak: Math.max(0, habit.streak - 1) },
    });
  } else {
    await prisma.habitLog.create({
      data: { habitId, date: today },
    });
    await prisma.habit.update({
      where: { id: habitId },
      data: { streak: habit.streak + 1 },
    });
  }

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteHabit(id: string) {
  const user = await getUser();

  await prisma.habit.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { success: true };
}
