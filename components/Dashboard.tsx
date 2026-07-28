"use client";

import { useSearchParams } from "next/navigation";
import { AnalyticsHeader } from "@/components/AnalyticsHeader";
import { HabitGrid } from "@/components/HabitGrid";
import { HabitLeaderboard } from "@/components/HabitLeaderboard";
import { MonthTabs } from "@/components/MonthTabs";
import { WellnessTracker } from "@/components/WellnessTracker";
import { useTrackerStore } from "@/lib/useTrackerStore";
import {
  buildWellnessRows,
  computeDailyCompletion,
  computeHabitStats,
  computeLeaderboard,
  computeWeeklyCompletion,
  daysInMonth,
} from "@/lib/stats";

export function Dashboard() {
  const searchParams = useSearchParams();
  const now = new Date();
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : now.getFullYear();
  const month = searchParams.get("month") ? Number(searchParams.get("month")) : now.getMonth() + 1;

  const numDays = daysInMonth(year, month);
  const {
    hydrated,
    monthData,
    toggleHabitLog,
    createHabit,
    updateHabit,
    deleteHabit,
    updateWellness,
  } = useTrackerStore(year, month);

  const habitStats = monthData.habits
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((h) => computeHabitStats(h, numDays));
  const daily = computeDailyCompletion(habitStats, numDays);
  const weekly = computeWeeklyCompletion(daily);
  const leaderboard = computeLeaderboard(habitStats);
  const wellnessRows = buildWellnessRows(monthData.wellness, numDays);

  function handleSaveHabit(
    habitId: string | undefined,
    values: { name: string; emoji: string; goal: number }
  ) {
    if (habitId) {
      updateHabit(habitId, values);
    } else {
      createHabit(values);
    }
  }

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Loading your data…
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Consistency Dashboard</h1>
          <p className="text-xs text-muted-foreground">The Art of Consistency — habit &amp; wellness tracker</p>
        </div>
        <MonthTabs year={year} month={month} />
      </header>

      <AnalyticsHeader daily={daily} weekly={weekly} />

      <HabitGrid
        key={`${year}-${month}-grid`}
        habitStats={habitStats}
        year={year}
        month={month}
        numDays={numDays}
        onToggleDay={toggleHabitLog}
        onDeleteHabit={(habitId) => deleteHabit(habitId)}
        onSaveHabit={handleSaveHabit}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WellnessTracker
            key={`${year}-${month}-wellness`}
            rows={wellnessRows}
            year={year}
            month={month}
            onUpdate={updateWellness}
          />
        </div>
        <HabitLeaderboard habits={leaderboard} />
      </div>
    </div>
  );
}
