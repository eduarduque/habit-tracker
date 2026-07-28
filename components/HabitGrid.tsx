"use client";

import { Check, ChevronDown, ChevronUp, Flame, Pencil, Plus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { HabitFormDialog } from "@/components/HabitFormDialog";
import { getDayOfWeekLabel, getWeekGroups, type HabitStats } from "@/lib/stats";
import { cn } from "@/lib/utils";

export function HabitGrid({
  habitStats,
  year,
  month,
  numDays,
  onToggleDay,
  onDeleteHabit,
  onSaveHabit,
  onMoveHabit,
}: {
  habitStats: HabitStats[];
  year: number;
  month: number;
  numDays: number;
  onToggleDay: (habitId: string, day: number) => void;
  onDeleteHabit: (habitId: string, name: string) => void;
  onSaveHabit: (
    habitId: string | undefined,
    values: { name: string; emoji: string; goal: number }
  ) => void;
  onMoveHabit: (habitId: string, direction: "up" | "down") => void;
}) {
  const weekGroups = getWeekGroups(numDays);

  function handleDelete(habitId: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This removes all its tracked days.`)) return;
    onDeleteHabit(habitId, name);
  }

  const totalCols = 1 + numDays + 6;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-xs font-mono">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 min-w-[180px] border-b border-r border-border bg-card px-3 py-2 text-left font-sans font-medium text-muted-foreground">
              Habit
            </th>
            {weekGroups.map((g) => (
              <th
                key={g.label}
                colSpan={g.days.length}
                className="border-b border-r border-border bg-secondary/40 px-1 py-1 text-center font-sans font-medium text-muted-foreground"
              >
                {g.label}
              </th>
            ))}
            <th colSpan={6} className="border-b border-border bg-secondary/40 px-2 py-1 text-center font-sans font-medium text-muted-foreground">
              Analytics
            </th>
          </tr>
          <tr>
            <th className="sticky left-0 z-20 border-b border-r border-border bg-card" />
            {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => (
              <th
                key={day}
                className="w-8 border-b border-r border-border px-0.5 py-1 text-center font-normal text-muted-foreground"
              >
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px]">{getDayOfWeekLabel(year, month, day)}</span>
                  <span>{day}</span>
                </div>
              </th>
            ))}
            <th className="border-b border-r border-border px-2 py-1 text-center text-muted-foreground">Goal</th>
            <th className="border-b border-r border-border px-2 py-1 text-center text-muted-foreground">Actual</th>
            <th className="border-b border-r border-border px-2 py-1 text-center text-muted-foreground">Left</th>
            <th className="border-b border-r border-border px-2 py-1 text-center text-muted-foreground">Progress</th>
            <th className="border-b border-r border-border px-2 py-1 text-center text-muted-foreground">%</th>
            <th className="border-b border-border px-2 py-1 text-center text-muted-foreground">Streak</th>
          </tr>
        </thead>
        <tbody>
          {habitStats.map((habit, index) => (
            <tr key={habit.id} className="group">
              <td className="sticky left-0 z-10 border-b border-r border-border bg-card px-3 py-1.5 text-left font-sans group-hover:bg-secondary/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    <span className="mr-1.5">{habit.emoji}</span>
                    {habit.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label={`Move ${habit.name} up`}
                      disabled={index === 0}
                      onClick={() => onMoveHabit(habit.id, "up")}
                      className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${habit.name} down`}
                      disabled={index === habitStats.length - 1}
                      onClick={() => onMoveHabit(habit.id, "down")}
                      className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <HabitFormDialog
                      numDays={numDays}
                      habit={{ id: habit.id, name: habit.name, emoji: habit.emoji, goal: habit.goal }}
                      onSubmit={(values) => onSaveHabit(habit.id, values)}
                      trigger={
                        <button
                          type="button"
                          aria-label={`Edit ${habit.name}`}
                          className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      }
                    />
                    <button
                      type="button"
                      aria-label={`Delete ${habit.name}`}
                      onClick={() => handleDelete(habit.id, habit.name)}
                      className="rounded p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </td>
              {habit.days.map((completed, i) => {
                const day = i + 1;
                return (
                  <td
                    key={day}
                    className="border-b border-r border-border p-0.5 text-center group-hover:bg-secondary/20"
                  >
                    <button
                      type="button"
                      aria-label={`${habit.name} day ${day} ${completed ? "completed" : "not completed"}`}
                      onClick={() => onToggleDay(habit.id, day)}
                      className={cn(
                        "mx-auto flex h-6 w-6 items-center justify-center rounded border transition-colors",
                        completed
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-transparent hover:border-primary/60"
                      )}
                    >
                      {completed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </button>
                  </td>
                );
              })}
              <td className="border-b border-r border-border px-2 py-1.5 text-center">{habit.goal}</td>
              <td className="border-b border-r border-border px-2 py-1.5 text-center">{habit.actual}</td>
              <td className="border-b border-r border-border px-2 py-1.5 text-center">{habit.left}</td>
              <td className="border-b border-r border-border px-2 py-1.5">
                <Progress value={Math.min(100, habit.percent)} className="h-1.5 w-20" />
              </td>
              <td
                className={cn(
                  "border-b border-r border-border px-2 py-1.5 text-right font-semibold",
                  habit.percent >= 100
                    ? "text-emerald-400"
                    : habit.percent >= 60
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {habit.percent}%
              </td>
              <td className="border-b border-border px-2 py-1.5">
                <div
                  className="flex items-center justify-center gap-1"
                  title={`Longest streak: ${habit.longestStreak} day${habit.longestStreak === 1 ? "" : "s"}`}
                >
                  {habit.currentStreak > 0 && (
                    <Flame className="h-3 w-3 shrink-0 text-orange-400" strokeWidth={2.5} />
                  )}
                  <span className={cn(habit.currentStreak > 0 ? "text-foreground" : "text-muted-foreground")}>
                    {habit.currentStreak}
                  </span>
                  <span className="text-muted-foreground">/{habit.longestStreak}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={totalCols} className="border-t border-border p-1">
              <HabitFormDialog
                numDays={numDays}
                onSubmit={(values) => onSaveHabit(undefined, values)}
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded px-2 py-1 font-sans text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Habit
                  </button>
                }
              />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
