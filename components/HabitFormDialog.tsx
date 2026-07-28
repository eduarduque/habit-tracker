"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HabitFormValues = {
  name: string;
  emoji: string;
  goal: number;
};

export function HabitFormDialog({
  trigger,
  numDays,
  habit,
  onSubmit,
}: {
  trigger: ReactNode;
  numDays: number;
  habit?: { id: string; name: string; emoji: string; goal: number };
  onSubmit: (values: HabitFormValues) => void;
}) {
  const isEdit = !!habit;
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<HabitFormValues>({
    name: habit?.name ?? "",
    emoji: habit?.emoji ?? "✅",
    goal: habit?.goal ?? Math.min(30, numDays),
  });
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    setError(null);
    if (next) {
      setValues({
        name: habit?.name ?? "",
        emoji: habit?.emoji ?? "✅",
        goal: habit?.goal ?? Math.min(30, numDays),
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      onSubmit(values);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Habit" : "Add Habit"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this habit's name, emoji, or monthly goal."
                : "Track a new habit for this month."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="habit-emoji" className="text-right text-xs text-muted-foreground">
                Emoji
              </Label>
              <Input
                id="habit-emoji"
                value={values.emoji}
                onChange={(e) => setValues((v) => ({ ...v, emoji: e.target.value }))}
                className="col-span-3"
                maxLength={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="habit-name" className="text-right text-xs text-muted-foreground">
                Name
              </Label>
              <Input
                id="habit-name"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                className="col-span-3"
                autoFocus
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="habit-goal" className="text-right text-xs text-muted-foreground">
                Goal (days)
              </Label>
              <Input
                id="habit-goal"
                type="number"
                min={1}
                max={numDays}
                value={values.goal}
                onChange={(e) => setValues((v) => ({ ...v, goal: Number(e.target.value) }))}
                className="col-span-3"
                required
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="submit">{isEdit ? "Save changes" : "Add habit"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
