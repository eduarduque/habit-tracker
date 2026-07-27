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
