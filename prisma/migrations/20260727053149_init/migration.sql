-- CreateTable
CREATE TABLE "Habit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '✅',
    "goal" INTEGER NOT NULL DEFAULT 30,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HabitLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "habitId" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "HabitLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WellnessLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "mood" INTEGER,
    "sleep" REAL
);

-- CreateIndex
CREATE INDEX "Habit_year_month_idx" ON "Habit"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Habit_name_year_month_key" ON "Habit"("name", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "HabitLog_habitId_day_key" ON "HabitLog"("habitId", "day");

-- CreateIndex
CREATE INDEX "WellnessLog_year_month_idx" ON "WellnessLog"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "WellnessLog_year_month_day_key" ON "WellnessLog"("year", "month", "day");
