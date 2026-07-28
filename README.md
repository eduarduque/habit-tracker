# Consistency Dashboard

A dark, dense habit & consistency tracker modeled on "The Art of Consistency" spreadsheet layout. Runs entirely in your browser — no server, no account, no database. All data lives in `localStorage` on whatever device you open it on.

**Live app:** https://eduarduque.github.io/habit-tracker/

## Features

- **Habit matrix grid** — days 1–31 grouped into Week 1–5, sticky habit-name column, instant checkbox toggles
- **Fully editable** — add, rename, re-emoji, retarget, or delete any habit right from the grid
- **Analytics** — per-habit Goal/Actual/Left/Progress/%, plus Daily Progress and Weekly Performance charts
- **Wellness tracker** — daily mood (1–5) and sleep hours
- **Leaderboard** — top habits ranked by completion %
- **Month navigation** — Jan–Dec tabs with year stepper; each month keeps its own habits and goals
- Comes pre-loaded with sample habits for the current and previous month so the dashboard isn't empty on first open — replace them with your own anytime

## Stack

Next.js (App Router, TypeScript, Tailwind, static export) + shadcn/ui + Recharts. No backend, no API routes, no database — every mutation writes straight to `localStorage`.

## Data & privacy

Everything is stored only in your browser's `localStorage`, under the key `habit-tracker:v1`. Nothing is ever sent to a server. It's per-browser/per-device — there's no sync between your phone and computer. Clearing site data/cache will erase it, so there's no built-in backup yet (see the money-tracker/moving-tracker projects for the export/import pattern if you want to add one).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deployment

Deploys automatically to GitHub Pages via `.github/workflows/deploy.yml` on every push to `master` — it runs `npm run build` (a static export, configured in `next.config.ts`) and publishes the `out/` folder. No manual steps needed after the first push.
