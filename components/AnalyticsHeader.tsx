"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BAR_COLOR = "#3987e5";
const GRID_COLOR = "#2c2c2a";
const AXIS_COLOR = "#898781";

function ChartTooltip({
  active,
  payload,
  label,
  unitLabel,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
  unitLabel: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <div className="text-muted-foreground">{unitLabel} {label}</div>
      <div className="font-mono font-semibold text-popover-foreground">{payload[0].value}%</div>
    </div>
  );
}

export function AnalyticsHeader({
  daily,
  weekly,
}: {
  daily: { day: number; percent: number }[];
  weekly: { week: string; percent: number }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Daily Progress</CardTitle>
        </CardHeader>
        <CardContent className="h-48 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID_COLOR} />
              <XAxis
                dataKey="day"
                tick={{ fill: AXIS_COLOR, fontSize: 10 }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: AXIS_COLOR, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                content={<ChartTooltip unitLabel="Day" />}
              />
              <Bar dataKey="percent" fill={BAR_COLOR} radius={[3, 3, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-48 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID_COLOR} />
              <XAxis
                dataKey="week"
                tickFormatter={(v: string) => v.replace("Week ", "W")}
                tick={{ fill: AXIS_COLOR, fontSize: 10 }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: AXIS_COLOR, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                content={<ChartTooltip unitLabel="Week" />}
              />
              <Bar dataKey="percent" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
