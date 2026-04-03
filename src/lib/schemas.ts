import { z } from "zod";

// ─── Application ────────────────────────────────────────────────────────────
export const APPLICATION_STATUSES = [
  "Wishlist",
  "Applied",
  "OA",
  "Interview",
  "Offer",
  "Rejected",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const applicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional(),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.enum(APPLICATION_STATUSES),
  dateApplied: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
  notes: z.string().optional(),
  resumeVersion: z.string().optional(),
  coverLetterVersion: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

// ─── Task ───────────────────────────────────────────────────────────────────
export const TASK_STATUSES = ["Todo", "In Progress", "Done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_CATEGORIES = [
  "Career",
  "School",
  "Health",
  "Personal",
  "Admin",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
  category: z.enum(TASK_CATEGORIES),
  isRecurring: z.boolean().default(false),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// ─── Habit ──────────────────────────────────────────────────────────────────
export const HABIT_FREQUENCIES = ["Daily", "Weekly"] as const;
export type HabitFrequency = (typeof HABIT_FREQUENCIES)[number];

export const HABIT_CATEGORIES = [
  "Health",
  "Productivity",
  "Mindset",
  "Personal Care",
] as const;
export type HabitCategory = (typeof HABIT_CATEGORIES)[number];

export const habitSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  frequency: z.enum(HABIT_FREQUENCIES),
  category: z.enum(HABIT_CATEGORIES),
});

export type HabitFormData = z.infer<typeof habitSchema>;

// ─── Weekly Review ──────────────────────────────────────────────────────────
export const weeklyReviewSchema = z.object({
  wins: z.string().optional(),
  challenges: z.string().optional(),
  prioritiesNextWeek: z.string().optional(),
});

export type WeeklyReviewFormData = z.infer<typeof weeklyReviewSchema>;

// ─── Auth ───────────────────────────────────────────────────────────────────
export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
