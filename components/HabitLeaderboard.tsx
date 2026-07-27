import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { HabitStats } from "@/lib/stats";

export function HabitLeaderboard({ habits }: { habits: HabitStats[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Top Habits Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {habits.map((h, i) => (
          <div key={h.id} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground">
              {i + 1}
            </span>
            <span className="w-40 shrink-0 truncate text-sm">
              <span className="mr-1.5">{h.emoji}</span>
              {h.name}
            </span>
            <Progress value={Math.min(100, h.percent)} className="h-1.5 flex-1" />
            <span
              className={cn(
                "w-12 shrink-0 text-right font-mono text-xs font-semibold",
                h.percent >= 100
                  ? "text-emerald-400"
                  : h.percent >= 60
                    ? "text-foreground"
                    : "text-muted-foreground"
              )}
            >
              {h.percent}%
            </span>
          </div>
        ))}
        {habits.length === 0 && (
          <p className="text-sm text-muted-foreground">No habits tracked yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
