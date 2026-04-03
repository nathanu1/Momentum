"use client";

import { useState, useTransition } from "react";
import { createApplication } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { APPLICATION_STATUSES } from "@/lib/schemas";
import { Plus, Loader2 } from "lucide-react";

export function CreateApplicationDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createApplication(formData);
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
        <Plus className="h-4 w-4" /> Add Application
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Application</DialogTitle>
          <DialogDescription>Track a new job or internship application</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" name="company" required placeholder="Google" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input id="role" name="role" required placeholder="Software Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Mountain View, CA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue="Wishlist">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link</Label>
            <Input id="link" name="link" type="url" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateApplied">Date Applied</Label>
              <Input id="dateApplied" name="dateApplied" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextFollowUpDate">Follow-up Date</Label>
              <Input id="nextFollowUpDate" name="nextFollowUpDate" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Any notes about this application..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resumeVersion">Resume Version</Label>
              <Input id="resumeVersion" name="resumeVersion" placeholder="v2.3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverLetterVersion">Cover Letter</Label>
              <Input id="coverLetterVersion" name="coverLetterVersion" placeholder="v1.0" />
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
