"use client";

import { startTransition, useOptimistic } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateWellness } from "@/lib/actions";
import { getDayOfWeekLabel, type WellnessRow } from "@/lib/stats";
import { cn } from "@/lib/utils";

type WellnessState = Record<number, { mood: number | null; sleep: number | null }>;
type WellnessAction =
  | { day: number; mood: number }
  | { day: number; sleep: number };

const MOOD_STEPS = ["#184f95", "#1c5cab", "#256abf", "#5598e7", "#86b6ef"];

export function WellnessTracker({
  rows,
  year,
  month,
}: {
  rows: WellnessRow[];
  year: number;
  month: number;
}) {
  const initialState: WellnessState = Object.fromEntries(
    rows.map((r) => [r.day, { mood: r.mood, sleep: r.sleep }])
  );

  const [optimisticState, addOptimistic] = useOptimistic(
    initialState,
    (state: WellnessState, action: WellnessAction) => ({
      ...state,
      [action.day]: { ...state[action.day], ...action },
    })
  );

  function cycleMood(day: number) {
    const current = optimisticState[day]?.mood ?? 0;
    const mood = (current % 5) + 1;
    startTransition(() => {
      addOptimistic({ day, mood });
      updateWellness(year, month, day, { mood });
    });
  }

  function setSleep(day: number, value: string) {
    const sleep = value === "" ? 0 : Math.max(0, Math.min(12, parseFloat(value)));
    if (Number.isNaN(sleep)) return;
    startTransition(() => {
      addOptimistic({ day, sleep });
      updateWellness(year, month, day, { sleep });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Overall Wellness Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto px-2">
        <table className="border-collapse text-xs font-mono">
          <thead>
            <tr>
              <th className="min-w-[80px] border-b border-r border-border px-3 py-1 text-left font-sans font-medium text-muted-foreground">
                Metric
              </th>
              {rows.map((r) => (
                <th
                  key={r.day}
                  className="w-8 border-b border-r border-border px-0.5 py-1 text-center font-normal text-muted-foreground"
                >
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px]">{getDayOfWeekLabel(year, month, r.day)}</span>
                    <span>{r.day}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-r border-border px-3 py-1.5 text-left font-sans text-muted-foreground">
                Mood
              </td>
              {rows.map((r) => {
                const mood = optimisticState[r.day]?.mood ?? null;
                return (
                  <td key={r.day} className="border-b border-r border-border p-0.5 text-center">
                    <button
                      type="button"
                      aria-label={`Set mood for day ${r.day}${mood ? `, currently ${mood} of 5` : ""}`}
                      onClick={() => cycleMood(r.day)}
                      className="mx-auto flex h-6 w-6 items-center justify-center rounded border border-border text-[10px] font-semibold text-white transition-colors hover:border-primary/60"
                      style={{ backgroundColor: mood ? MOOD_STEPS[mood - 1] : "transparent" }}
                    >
                      {mood ?? ""}
                    </button>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="border-b border-r border-border px-3 py-1.5 text-left font-sans text-muted-foreground">
                Sleep (h)
              </td>
              {rows.map((r) => {
                const sleep = optimisticState[r.day]?.sleep ?? null;
                return (
                  <td key={r.day} className="border-b border-r border-border p-0.5 text-center">
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      max={12}
                      aria-label={`Sleep hours for day ${r.day}`}
                      defaultValue={sleep ?? ""}
                      onBlur={(e) => setSleep(r.day, e.target.value)}
                      className={cn(
                        "h-6 w-8 rounded border border-border bg-transparent text-center text-[10px] outline-none",
                        "focus:border-primary/60"
                      )}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
