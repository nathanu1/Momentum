"use client";

import { useState, useTransition } from "react";
import { createHabit } from "@/actions/habits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HABIT_FREQUENCIES, HABIT_CATEGORIES } from "@/lib/schemas";
import { Plus, Loader2 } from "lucide-react";

export function CreateHabitDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createHabit(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-1.5" />}>
        <Plus className="h-4 w-4" /> New Habit
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Habit</DialogTitle>
          <DialogDescription>Build a new habit to track</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name *</Label>
            <Input id="name" name="name" required placeholder="e.g., Meditate for 10 minutes" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select name="frequency" defaultValue="Daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="Health">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
