"use client";

import { useEffect, useState } from "react";
import {
  buildDemoStore,
  emptyMonth,
  hasStoredData,
  loadStore,
  monthKey,
  newHabitId,
  saveStore,
  type MonthData,
  type Store,
  type WellnessEntry,
} from "@/lib/storage";

export function useTrackerStore(year: number, month: number) {
  // null means "not yet read from localStorage" — localStorage isn't available
  // during SSR, so the real data is loaded post-mount rather than in a lazy
  // useState initializer, which would make the server-rendered and first
  // client-rendered output diverge and trigger a hydration mismatch.
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, a browser-only external store
    setStore(hasStoredData() ? loadStore() : buildDemoStore());
  }, []);

  useEffect(() => {
    if (store) saveStore(store);
  }, [store]);

  const hydrated = store !== null;
  const key = monthKey(year, month);
  const monthData: MonthData = store?.[key] ?? emptyMonth();

  function updateMonth(updater: (data: MonthData) => MonthData) {
    setStore((prev) => {
      const base = prev ?? {};
      return { ...base, [key]: updater(base[key] ?? emptyMonth()) };
    });
  }

  function toggleHabitLog(habitId: string, day: number) {
    updateMonth((data) => ({
      ...data,
      habits: data.habits.map((h) =>
        h.id === habitId ? { ...h, logs: { ...h.logs, [day]: !h.logs[day] } } : h
      ),
    }));
  }

  function createHabit(values: { name: string; emoji: string; goal: number }) {
    const name = values.name.trim();
    if (!name) throw new Error("Habit name is required");
    if (monthData.habits.some((h) => h.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("A habit with that name already exists this month");
    }

    updateMonth((data) => ({
      ...data,
      habits: [
        ...data.habits,
        {
          id: newHabitId(),
          name,
          emoji: values.emoji.trim() || "✅",
          goal: Math.max(1, values.goal),
          sortOrder: data.habits.length,
          logs: {},
        },
      ],
    }));
  }

  function updateHabit(habitId: string, values: { name: string; emoji: string; goal: number }) {
    const name = values.name.trim();
    if (!name) throw new Error("Habit name is required");
    if (
      monthData.habits.some(
        (h) => h.id !== habitId && h.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      throw new Error("A habit with that name already exists this month");
    }

    updateMonth((data) => ({
      ...data,
      habits: data.habits.map((h) =>
        h.id === habitId
          ? { ...h, name, emoji: values.emoji.trim() || "✅", goal: Math.max(1, values.goal) }
          : h
      ),
    }));
  }

  function deleteHabit(habitId: string) {
    updateMonth((data) => ({
      ...data,
      habits: data.habits.filter((h) => h.id !== habitId),
    }));
  }

  const emptyEntry: WellnessEntry = { mood: null, sleep: null };

  function updateWellness(day: number, entry: Partial<WellnessEntry>) {
    updateMonth((data) => ({
      ...data,
      wellness: {
        ...data.wellness,
        [day]: { ...emptyEntry, ...data.wellness[day], ...entry },
      },
    }));
  }

  return {
    hydrated,
    monthData,
    toggleHabitLog,
    createHabit,
    updateHabit,
    deleteHabit,
    updateWellness,
  };
}
