"use client";

import { startTransition, useOptimistic } from "react";
import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toggleHabitLog } from "@/lib/actions";
import {
  computeHabitStats,
  getDayOfWeekLabel,
  getWeekGroups,
  type HabitWithLogs,
} from "@/lib/stats";
import { cn } from "@/lib/utils";

type DaysState = Record<number, boolean[]>;

type ToggleAction = { habitId: number; day: number };

export function HabitGrid({
  habits,
  year,
  month,
  numDays,
}: {
  habits: HabitWithLogs[];
  year: number;
  month: number;
  numDays: number;
}) {
  const initialState: DaysState = Object.fromEntries(
    habits.map((h) => [h.id, computeHabitStats(h, numDays).days])
  );

  const [optimisticDays, addOptimisticToggle] = useOptimistic(
    initialState,
    (state: DaysState, { habitId, day }: ToggleAction) => {
      const days = [...state[habitId]];
      days[day - 1] = !days[day - 1];
      return { ...state, [habitId]: days };
    }
  );

  const weekGroups = getWeekGroups(numDays);

  function handleToggle(habitId: number, day: number) {
    startTransition(() => {
      addOptimisticToggle({ habitId, day });
      toggleHabitLog(habitId, day);
    });
  }

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
            <th colSpan={5} className="border-b border-border bg-secondary/40 px-2 py-1 text-center font-sans font-medium text-muted-foreground">
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
            <th className="border-b border-border px-2 py-1 text-center text-muted-foreground">%</th>
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => {
            const days = optimisticDays[habit.id];
            const actual = days.filter(Boolean).length;
            const left = Math.max(0, habit.goal - actual);
            const percent = habit.goal > 0 ? Math.round((actual / habit.goal) * 100) : 0;

            return (
              <tr key={habit.id} className="group">
                <td className="sticky left-0 z-10 border-b border-r border-border bg-card px-3 py-1.5 text-left font-sans group-hover:bg-secondary/40">
                  <span className="mr-1.5">{habit.emoji}</span>
                  {habit.name}
                </td>
                {days.map((completed, i) => {
                  const day = i + 1;
                  return (
                    <td
                      key={day}
                      className="border-b border-r border-border p-0.5 text-center group-hover:bg-secondary/20"
                    >
                      <button
                        type="button"
                        aria-label={`${habit.name} day ${day} ${completed ? "completed" : "not completed"}`}
                        onClick={() => handleToggle(habit.id, day)}
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
                <td className="border-b border-r border-border px-2 py-1.5 text-center">{actual}</td>
                <td className="border-b border-r border-border px-2 py-1.5 text-center">{left}</td>
                <td className="border-b border-r border-border px-2 py-1.5">
                  <Progress value={Math.min(100, percent)} className="h-1.5 w-20" />
                </td>
                <td
                  className={cn(
                    "border-b border-border px-2 py-1.5 text-right font-semibold",
                    percent >= 100
                      ? "text-emerald-400"
                      : percent >= 60
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {percent}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
