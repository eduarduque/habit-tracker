import { AnalyticsHeader } from "@/components/AnalyticsHeader";
import { HabitGrid } from "@/components/HabitGrid";
import { HabitLeaderboard } from "@/components/HabitLeaderboard";
import { MonthTabs } from "@/components/MonthTabs";
import { WellnessTracker } from "@/components/WellnessTracker";
import { getMonthData } from "@/lib/queries";
import {
  buildWellnessRows,
  computeDailyCompletion,
  computeHabitStats,
  computeLeaderboard,
  computeWeeklyCompletion,
  daysInMonth,
} from "@/lib/stats";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;

  const numDays = daysInMonth(year, month);
  const { habits, wellness } = await getMonthData(year, month);

  const habitStats = habits.map((h) => computeHabitStats(h, numDays));
  const daily = computeDailyCompletion(habitStats, numDays);
  const weekly = computeWeeklyCompletion(daily);
  const leaderboard = computeLeaderboard(habitStats);
  const wellnessRows = buildWellnessRows(wellness, numDays);

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
        habits={habits}
        year={year}
        month={month}
        numDays={numDays}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WellnessTracker key={`${year}-${month}-wellness`} rows={wellnessRows} year={year} month={month} />
        </div>
        <HabitLeaderboard habits={leaderboard} />
      </div>
    </div>
  );
}
