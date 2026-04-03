"use server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createApplication(formData: FormData) {
  const user = await getUser();

  const raw = {
    company: formData.get("company") as string,
    role: formData.get("role") as string,
    location: (formData.get("location") as string) || undefined,
    link: (formData.get("link") as string) || undefined,
    status: formData.get("status") as string,
    dateApplied: (formData.get("dateApplied") as string) || undefined,
    nextFollowUpDate: (formData.get("nextFollowUpDate") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    resumeVersion: (formData.get("resumeVersion") as string) || undefined,
    coverLetterVersion: (formData.get("coverLetterVersion") as string) || undefined,
  };

  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.application.create({
    data: {
      userId: user.id,
      company: parsed.data.company,
      role: parsed.data.role,
      location: parsed.data.location || null,
      link: parsed.data.link || null,
      status: parsed.data.status,
      dateApplied: parsed.data.dateApplied ? new Date(parsed.data.dateApplied) : null,
      nextFollowUpDate: parsed.data.nextFollowUpDate ? new Date(parsed.data.nextFollowUpDate) : null,
      notes: parsed.data.notes || null,
      resumeVersion: parsed.data.resumeVersion || null,
      coverLetterVersion: parsed.data.coverLetterVersion || null,
    },
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateApplication(id: string, formData: FormData) {
  const user = await getUser();

  const raw = {
    company: formData.get("company") as string,
    role: formData.get("role") as string,
    location: (formData.get("location") as string) || undefined,
    link: (formData.get("link") as string) || undefined,
    status: formData.get("status") as string,
    dateApplied: (formData.get("dateApplied") as string) || undefined,
    nextFollowUpDate: (formData.get("nextFollowUpDate") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    resumeVersion: (formData.get("resumeVersion") as string) || undefined,
    coverLetterVersion: (formData.get("coverLetterVersion") as string) || undefined,
  };

  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.application.update({
    where: { id, userId: user.id },
    data: {
      company: parsed.data.company,
      role: parsed.data.role,
      location: parsed.data.location || null,
      link: parsed.data.link || null,
      status: parsed.data.status,
      dateApplied: parsed.data.dateApplied ? new Date(parsed.data.dateApplied) : null,
      nextFollowUpDate: parsed.data.nextFollowUpDate ? new Date(parsed.data.nextFollowUpDate) : null,
      notes: parsed.data.notes || null,
      resumeVersion: parsed.data.resumeVersion || null,
      coverLetterVersion: parsed.data.coverLetterVersion || null,
    },
  });

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteApplication(id: string) {
  const user = await getUser();

  await prisma.application.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateApplicationStatus(id: string, status: string) {
  const user = await getUser();

  await prisma.application.update({
    where: { id, userId: user.id },
    data: { status },
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { success: true };
}
