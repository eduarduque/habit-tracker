"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function MonthTabs({ year, month }: { year: number; month: number }) {
  const router = useRouter();

  function goToMonth(newYear: number, newMonth: number) {
    router.push(`/?year=${newYear}&month=${newMonth}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => goToMonth(year - 1, month)}
          aria-label="Previous year"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-mono text-sm">{year}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => goToMonth(year + 1, month)}
          aria-label="Next year"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Tabs value={String(month)} onValueChange={(v) => goToMonth(year, Number(v))}>
        <TabsList className="h-auto flex-wrap">
          {MONTH_LABELS.map((label, i) => (
            <TabsTrigger key={label} value={String(i + 1)} className="font-mono text-xs">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
