import type { HabitModel, HabitLogModel, WellnessLogModel } from "@/lib/generated/prisma/models";

export type HabitWithLogs = HabitModel & { logs: HabitLogModel[] };

export type HabitStats = {
  id: number;
  name: string;
  emoji: string;
  goal: number;
  actual: number;
  left: number;
  percent: number;
  days: boolean[]; // index 0 = day 1
};

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function getDayOfWeekLabel(year: number, month: number, day: number) {
  return DOW[new Date(year, month - 1, day).getDay()];
}

export function computeHabitStats(habit: HabitWithLogs, numDays: number): HabitStats {
  const byDay = new Map<number, boolean>(
    habit.logs.map((l: HabitLogModel): [number, boolean] => [l.day, l.completed])
  );
  const days: boolean[] = Array.from({ length: numDays }, (_, i) => byDay.get(i + 1) ?? false);
  const actual = days.filter(Boolean).length;
  const left = Math.max(0, habit.goal - actual);
  const percent = habit.goal > 0 ? Math.round((actual / habit.goal) * 100) : 0;

  return {
    id: habit.id,
    name: habit.name,
    emoji: habit.emoji,
    goal: habit.goal,
    actual,
    left,
    percent,
    days,
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

export function buildWellnessRows(wellness: WellnessLogModel[], numDays: number): WellnessRow[] {
  const byDay = new Map(wellness.map((w) => [w.day, w]));
  return Array.from({ length: numDays }, (_, i) => {
    const day = i + 1;
    const row = byDay.get(day);
    return { day, mood: row?.mood ?? null, sleep: row?.sleep ?? null };
  });
}
