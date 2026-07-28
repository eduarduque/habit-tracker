import type { StoredHabit, WellnessEntry } from "@/lib/storage";

export type HabitStats = {
  id: string;
  name: string;
  emoji: string;
  goal: number;
  actual: number;
  left: number;
  percent: number;
  days: boolean[]; // index 0 = day 1
  currentStreak: number;
  longestStreak: number;
};

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function getDayOfWeekLabel(year: number, month: number, day: number) {
  return DOW[new Date(year, month - 1, day).getDay()];
}

// `lastDay` is the most recent day that "counts" for a current streak — the
// current day-of-month if viewing this month, or the full month otherwise —
// so an in-progress month isn't falsely treated as a broken streak just
// because its remaining days haven't happened yet.
function computeStreaks(days: boolean[], lastDay: number) {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  let current = 0;
  for (let i = lastDay - 1; i >= 0; i--) {
    if (!days[i]) break;
    current++;
  }

  return { current, longest };
}

export function computeHabitStats(
  habit: StoredHabit,
  numDays: number,
  lastDay: number = numDays
): HabitStats {
  const days: boolean[] = Array.from({ length: numDays }, (_, i) => habit.logs[i + 1] ?? false);
  const actual = days.filter(Boolean).length;
  const left = Math.max(0, habit.goal - actual);
  const percent = habit.goal > 0 ? Math.round((actual / habit.goal) * 100) : 0;
  const { current, longest } = computeStreaks(days, lastDay);

  return {
    id: habit.id,
    name: habit.name,
    emoji: habit.emoji,
    goal: habit.goal,
    actual,
    left,
    percent,
    days,
    currentStreak: current,
    longestStreak: longest,
  };
}

export function computeDailyCompletion(habitStats: HabitStats[], numDays: number) {
  const total = habitStats.length;
  return Array.from({ length: numDays }, (_, i) => {
    const completed = habitStats.filter((h) => h.days[i]).length;
    return {
      day: i + 1,
      percent: total ? Math.round((completed / total) * 100) : 0,
    };
  });
}

export function computeWeeklyCompletion(daily: { day: number; percent: number }[]) {
  const weeks: { week: string; percent: number }[] = [];
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7);
    const avg = chunk.reduce((sum, d) => sum + d.percent, 0) / chunk.length;
    weeks.push({ week: `Week ${weeks.length + 1}`, percent: Math.round(avg) });
  }
  return weeks;
}

export function getWeekGroups(numDays: number) {
  const groups: { label: string; days: number[] }[] = [];
  for (let start = 1; start <= numDays; start += 7) {
    const end = Math.min(start + 6, numDays);
    const days = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    groups.push({ label: `Week ${groups.length + 1}`, days });
  }
  return groups;
}

export function computeLeaderboard(habitStats: HabitStats[], limit = 10) {
  return [...habitStats].sort((a, b) => b.percent - a.percent).slice(0, limit);
}

export type WellnessRow = {
  day: number;
  mood: number | null;
  sleep: number | null;
};

export function computeWellnessInsight(
  wellnessRows: WellnessRow[],
  daily: { day: number; percent: number }[]
): string | null {
  const percentByDay = new Map(daily.map((d) => [d.day, d.percent]));

  const goodSleep: number[] = [];
  const poorSleep: number[] = [];
  for (const row of wellnessRows) {
    if (row.sleep == null) continue;
    const percent = percentByDay.get(row.day);
    if (percent == null) continue;
    (row.sleep >= 7 ? goodSleep : poorSleep).push(percent);
  }

  if (goodSleep.length < 3 || poorSleep.length < 3) return null;

  const avg = (arr: number[]) => arr.reduce((sum, v) => sum + v, 0) / arr.length;
  const diff = Math.round(avg(goodSleep) - avg(poorSleep));
  if (Math.abs(diff) < 5) return null;

  return diff > 0
    ? `You complete ${diff}% more habits on days you sleep 7+ hours.`
    : `You complete ${Math.abs(diff)}% more habits on days you sleep under 7 hours.`;
}

export function buildWellnessRows(
  wellness: Record<number, WellnessEntry>,
  numDays: number
): WellnessRow[] {
  return Array.from({ length: numDays }, (_, i) => {
    const day = i + 1;
    const entry = wellness[day];
    return { day, mood: entry?.mood ?? null, sleep: entry?.sleep ?? null };
  });
}
