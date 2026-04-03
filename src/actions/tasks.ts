"use server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const user = await getUser();

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    priority: formData.get("priority") as string,
    status: formData.get("status") as string,
    category: formData.get("category") as string,
    isRecurring: formData.get("isRecurring") === "true",
  };

  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.task.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      priority: parsed.data.priority,
      status: parsed.data.status,
      category: parsed.data.category,
      isRecurring: parsed.data.isRecurring,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTask(id: string, formData: FormData) {
  const user = await getUser();

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    priority: formData.get("priority") as string,
    status: formData.get("status") as string,
    category: formData.get("category") as string,
    isRecurring: formData.get("isRecurring") === "true",
  };

  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.task.update({
    where: { id, userId: user.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      priority: parsed.data.priority,
      status: parsed.data.status,
      category: parsed.data.category,
      isRecurring: parsed.data.isRecurring,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleTaskComplete(id: string) {
  const user = await getUser();

  const task = await prisma.task.findUnique({
    where: { id, userId: user.id },
  });
  if (!task) return { error: "Task not found" };

  await prisma.task.update({
    where: { id },
    data: { status: task.status === "Done" ? "Todo" : "Done" },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTask(id: string) {
  const user = await getUser();

  await prisma.task.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}
