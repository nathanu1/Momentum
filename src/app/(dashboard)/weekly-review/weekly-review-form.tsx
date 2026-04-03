"use client";

import { useState, useTransition } from "react";
import { createWeeklyReview } from "@/actions/weekly-review";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check } from "lucide-react";

interface WeeklyReview {
  id: string;
  wins: string | null;
  challenges: string | null;
  prioritiesNextWeek: string | null;
}

export function WeeklyReviewForm({
  existing,
}: {
  existing: WeeklyReview | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createWeeklyReview(formData);
      if (!result?.error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {existing ? "Update Your Review" : "This Week's Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wins" className="text-green-600 font-medium">
              Wins 🎉
            </Label>
            <Textarea
              id="wins"
              name="wins"
              rows={3}
              defaultValue={existing?.wins || ""}
              placeholder="What went well this week?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="challenges" className="text-amber-600 font-medium">
              Challenges 🤔
            </Label>
            <Textarea
              id="challenges"
              name="challenges"
              rows={3}
              defaultValue={existing?.challenges || ""}
              placeholder="What was difficult or didn't go as planned?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prioritiesNextWeek" className="text-blue-600 font-medium">
              Next Week Priorities 🎯
            </Label>
            <Textarea
              id="prioritiesNextWeek"
              name="prioritiesNextWeek"
              rows={3}
              defaultValue={existing?.prioritiesNextWeek || ""}
              placeholder="What do you want to focus on next week?"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : existing ? (
                "Update Review"
              ) : (
                "Save Review"
              )}
            </Button>
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" /> Saved!
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
