import { prisma } from "@/lib/prisma";

export async function getMonthData(year: number, month: number) {
  const [habits, wellness] = await Promise.all([
    prisma.habit.findMany({
      where: { year, month },
      orderBy: { sortOrder: "asc" },
      include: { logs: true },
    }),
    prisma.wellnessLog.findMany({
      where: { year, month },
      orderBy: { day: "asc" },
    }),
  ]);

  return { habits, wellness };
}

export async function getAvailableMonths() {
  const rows = await prisma.habit.findMany({
    distinct: ["year", "month"],
    select: { year: true, month: true },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });
  return rows;
}
