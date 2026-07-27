import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Deterministic mulberry32 PRNG so re-seeding produces the same data every time.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

type HabitSeed = {
  name: string;
  emoji: string;
  goal: number;
  rate: number; // baseline consistency rate, 0-1
};

const HABITS: HabitSeed[] = [
  { name: "Stretching", emoji: "🤸", goal: 30, rate: 0.87 },
  { name: "Wake up at 05:00", emoji: "⏰", goal: 30, rate: 0.42 },
  { name: "Project Work", emoji: "🎯", goal: 26, rate: 0.78 },
  { name: "Gym", emoji: "🏋️", goal: 20, rate: 0.65 },
  { name: "Reading", emoji: "📖", goal: 30, rate: 0.7 },
  { name: "Meditation", emoji: "🧘", goal: 30, rate: 0.55 },
  { name: "No Sugar", emoji: "🍬", goal: 30, rate: 0.48 },
  { name: "Cold Shower", emoji: "🚿", goal: 30, rate: 0.6 },
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

async function seedMonth(year: number, month: number, habitRates?: Partial<Record<string, number>>) {
  const numDays = daysInMonth(year, month);

  for (let i = 0; i < HABITS.length; i++) {
    const h = HABITS[i];
    const rate = habitRates?.[h.name] ?? h.rate;
    const goal = Math.min(h.goal, numDays);

    const habit = await prisma.habit.upsert({
      where: { name_year_month: { name: h.name, year, month } },
      update: { emoji: h.emoji, goal, sortOrder: i },
      create: { name: h.name, emoji: h.emoji, goal, year, month, sortOrder: i },
    });

    for (let day = 1; day <= numDays; day++) {
      // Slight upward drift through the month to simulate building momentum.
      const drift = (day / numDays) * 0.1;
      const completed = rand() < Math.min(0.97, rate + drift);

      await prisma.habitLog.upsert({
        where: { habitId_day: { habitId: habit.id, day } },
        update: { completed },
        create: { habitId: habit.id, day, completed },
      });
    }
  }

  // Wellness: loosely correlate mood/sleep with that day's overall completion rate.
  for (let day = 1; day <= numDays; day++) {
    const logs = await prisma.habitLog.findMany({
      where: { day, habit: { year, month } },
    });
    const completionRate = logs.length
      ? logs.filter((l) => l.completed).length / logs.length
      : 0.5;

    const mood = Math.max(1, Math.min(5, Math.round(1 + completionRate * 3.5 + (rand() - 0.5) * 1.5)));
    const sleep = Math.round((5.5 + completionRate * 2 + (rand() - 0.5) * 1.2) * 10) / 10;

    await prisma.wellnessLog.upsert({
      where: { year_month_day: { year, month, day } },
      update: { mood, sleep },
      create: { year, month, day, mood, sleep },
    });
  }
}

async function main() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Current month: main dataset the dashboard opens on.
  await seedMonth(currentYear, currentMonth);

  // Previous month too, so the month tab switcher has more than one month to show.
  const prevDate = new Date(currentYear, currentMonth - 2, 1);
  await seedMonth(prevDate.getFullYear(), prevDate.getMonth() + 1, {
    "Wake up at 05:00": 0.3,
    Gym: 0.5,
  });

  console.log(`Seeded habits + logs for ${currentYear}-${currentMonth} and ${prevDate.getFullYear()}-${prevDate.getMonth() + 1}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
