const STORAGE_KEY = "habit-tracker:v1";

export type StoredHabit = {
  id: string;
  name: string;
  emoji: string;
  goal: number;
  sortOrder: number;
  logs: Record<number, boolean>; // day -> completed
};

export type WellnessEntry = { mood: number | null; sleep: number | null };

export type MonthData = {
  habits: StoredHabit[];
  wellness: Record<number, WellnessEntry>; // day -> entry
};

export type Store = Record<string, MonthData>; // key: `${year}-${month}`

export function monthKey(year: number, month: number) {
  return `${year}-${month}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function hasStoredData() {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function loadStore(): Store {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

export function saveStore(store: Store) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function emptyMonth(): MonthData {
  return { habits: [], wellness: {} };
}

export function newHabitId() {
  return isBrowser() && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `habit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// --- Demo data (seeds the very first time someone opens the app) ---

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

type DemoHabitDef = { name: string; emoji: string; goal: number; rate: number };

const DEMO_HABITS: DemoHabitDef[] = [
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

function generateDemoMonth(
  year: number,
  month: number,
  seed: number,
  overrides: Partial<Record<string, number>> = {}
): MonthData {
  const rand = mulberry32(seed);
  const numDays = daysInMonth(year, month);

  const habits: StoredHabit[] = DEMO_HABITS.map((h, i) => {
    const rate = overrides[h.name] ?? h.rate;
    const goal = Math.min(h.goal, numDays);
    const logs: Record<number, boolean> = {};
    for (let day = 1; day <= numDays; day++) {
      const drift = (day / numDays) * 0.1;
      logs[day] = rand() < Math.min(0.97, rate + drift);
    }
    return {
      id: `demo-${year}-${month}-${i}`,
      name: h.name,
      emoji: h.emoji,
      goal,
      sortOrder: i,
      logs,
    };
  });

  const wellness: Record<number, WellnessEntry> = {};
  for (let day = 1; day <= numDays; day++) {
    const completedCount = habits.filter((h) => h.logs[day]).length;
    const completionRate = habits.length ? completedCount / habits.length : 0.5;
    const mood = Math.max(1, Math.min(5, Math.round(1 + completionRate * 3.5 + (rand() - 0.5) * 1.5)));
    const sleep = Math.round((5.5 + completionRate * 2 + (rand() - 0.5) * 1.2) * 10) / 10;
    wellness[day] = { mood, sleep };
  }

  return { habits, wellness };
}

export function buildDemoStore(): Store {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const prevDate = new Date(year, month - 2, 1);

  return {
    [monthKey(year, month)]: generateDemoMonth(year, month, 42),
    [monthKey(prevDate.getFullYear(), prevDate.getMonth() + 1)]: generateDemoMonth(
      prevDate.getFullYear(),
      prevDate.getMonth() + 1,
      7,
      { "Wake up at 05:00": 0.3, Gym: 0.5 }
    ),
  };
}
