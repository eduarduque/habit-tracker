"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleHabitLog(habitId: number, day: number) {
  const existing = await prisma.habitLog.findUnique({
    where: { habitId_day: { habitId, day } },
  });
  const completed = !existing?.completed;

  await prisma.habitLog.upsert({
    where: { habitId_day: { habitId, day } },
    update: { completed },
    create: { habitId, day, completed },
  });

  revalidatePath("/");
}

export async function createHabit(
  year: number,
  month: number,
  data: { name: string; emoji: string; goal: number }
) {
  const name = data.name.trim();
  if (!name) throw new Error("Habit name is required");

  const count = await prisma.habit.count({ where: { year, month } });

  try {
    await prisma.habit.create({
      data: {
        name,
        emoji: data.emoji.trim() || "✅",
        goal: Math.max(1, data.goal),
        year,
        month,
        sortOrder: count,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      throw new Error("A habit with that name already exists this month");
    }
    throw err;
  }

  revalidatePath("/");
}

export async function updateHabit(
  habitId: number,
  data: { name: string; emoji: string; goal: number }
) {
  const name = data.name.trim();
  if (!name) throw new Error("Habit name is required");

  try {
    await prisma.habit.update({
      where: { id: habitId },
      data: {
        name,
        emoji: data.emoji.trim() || "✅",
        goal: Math.max(1, data.goal),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      throw new Error("A habit with that name already exists this month");
    }
    throw err;
  }

  revalidatePath("/");
}

export async function deleteHabit(habitId: number) {
  await prisma.habit.delete({ where: { id: habitId } });
  revalidatePath("/");
}

export async function updateWellness(
  year: number,
  month: number,
  day: number,
  data: { mood?: number; sleep?: number }
) {
  await prisma.wellnessLog.upsert({
    where: { year_month_day: { year, month, day } },
    update: data,
    create: { year, month, day, ...data },
  });

  revalidatePath("/");
}
