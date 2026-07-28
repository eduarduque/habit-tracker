"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { AnalyticsHeader } from "@/components/AnalyticsHeader";
import { Button } from "@/components/ui/button";
import { HabitGrid } from "@/components/HabitGrid";
import { HabitLeaderboard } from "@/components/HabitLeaderboard";
import { MonthTabs } from "@/components/MonthTabs";
import { Toast } from "@/components/Toast";
import { WellnessTracker } from "@/components/WellnessTracker";
import { useTrackerStore } from "@/lib/useTrackerStore";
import {
  downloadStoreBackup,
  monthKey,
  parseStoreBackup,
  type StoredHabit,
} from "@/lib/storage";
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
    store,
    monthData,
    toggleHabitLog,
    createHabit,
    updateHabit,
    deleteHabit,
    restoreHabit,
    moveHabit,
    updateWellness,
    replaceStore,
    copyHabitsFromMonth,
  } = useTrackerStore(year, month);

  const [deletedHabit, setDeletedHabit] = useState<StoredHabit | null>(null);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dismissedCopyFor, setDismissedCopyFor] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    };
  }, []);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const lastDay = isCurrentMonth ? now.getDate() : numDays;
  const habitStats = monthData.habits
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((h) => computeHabitStats(h, numDays, lastDay));
  const daily = computeDailyCompletion(habitStats, numDays);
  const weekly = computeWeeklyCompletion(daily);
  const leaderboard = computeLeaderboard(habitStats);
  const wellnessRows = buildWellnessRows(monthData.wellness, numDays);

  const currentKey = monthKey(year, month);
  const prevDate = new Date(year, month - 2, 1);
  const prevKey = monthKey(prevDate.getFullYear(), prevDate.getMonth() + 1);
  const prevHabits = store?.[prevKey]?.habits ?? [];
  const showCopyBanner =
    monthData.habits.length === 0 && prevHabits.length > 0 && dismissedCopyFor !== currentKey;

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

  function handleDeleteHabit(habitId: string) {
    const habit = monthData.habits.find((h) => h.id === habitId);
    deleteHabit(habitId);
    if (!habit) return;
    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    setDeletedHabit(habit);
    deleteTimeoutRef.current = setTimeout(() => setDeletedHabit(null), 5000);
  }

  function handleUndoDelete() {
    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    if (deletedHabit) restoreHabit(deletedHabit);
    setDeletedHabit(null);
  }

  function handleExport() {
    if (store) downloadStoreBackup(store);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = parseStoreBackup(String(ev.target?.result ?? ""));
        if (!window.confirm("Import this backup? It will replace all data currently in this browser."))
          return;
        replaceStore(imported);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Failed to import backup.");
      }
    };
    reader.readAsText(file);
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
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Consistency Dashboard</h1>
            <p className="text-xs text-muted-foreground">The Art of Consistency — habit &amp; wellness tracker</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExport} aria-label="Export backup">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import backup"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>
        <MonthTabs year={year} month={month} />
      </header>

      {showCopyBanner && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>
            Copy {prevHabits.length} habit{prevHabits.length === 1 ? "" : "s"} from{" "}
            {prevDate.toLocaleString("en-US", { month: "long" })}?
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setDismissedCopyFor(currentKey)}>
              Start fresh
            </Button>
            <Button size="sm" onClick={() => copyHabitsFromMonth(prevKey)}>
              Copy habits
            </Button>
          </div>
        </div>
      )}

      <AnalyticsHeader daily={daily} weekly={weekly} />

      <HabitGrid
        key={`${year}-${month}-grid`}
        habitStats={habitStats}
        year={year}
        month={month}
        numDays={numDays}
        onToggleDay={toggleHabitLog}
        onDeleteHabit={(habitId) => handleDeleteHabit(habitId)}
        onSaveHabit={handleSaveHabit}
        onMoveHabit={moveHabit}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WellnessTracker
            key={`${year}-${month}-wellness`}
            rows={wellnessRows}
            daily={daily}
            year={year}
            month={month}
            onUpdate={updateWellness}
          />
        </div>
        <HabitLeaderboard habits={leaderboard} />
      </div>

      {deletedHabit && (
        <Toast
          message={`Deleted "${deletedHabit.name}"`}
          actionLabel="Undo"
          onAction={handleUndoDelete}
          onDismiss={() => setDeletedHabit(null)}
        />
      )}

      {importError && (
        <Toast message={importError} onDismiss={() => setImportError(null)} />
      )}
    </div>
  );
}
