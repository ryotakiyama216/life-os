"use client";

import { Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/store/useAppStore";
import { todayISO, weekdayOf } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types";

function isDueToday(habit: Habit, weekday: number): boolean {
  if (!habit.active) return false;
  if (habit.frequency.type === "daily") return true;
  return habit.frequency.days.includes(weekday);
}

export function HabitsToday() {
  const today = todayISO();
  const weekday = weekdayOf(today);
  const allHabits = useAppStore((s) => s.habits);
  const allHabitLogs = useAppStore((s) => s.habitLogs);
  const toggleHabitLog = useAppStore((s) => s.toggleHabitLog);

  const habits = allHabits.filter((h) => isDueToday(h, weekday));
  const habitLogs = allHabitLogs.filter((l) => l.date === today);

  if (habits.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Repeat className="size-4" />
          今日の習慣
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5">
          {habits.map((h) => {
            const log = habitLogs.find((l) => l.habitId === h.id);
            const done = log?.completed ?? false;
            return (
              <li key={h.id} className="flex items-center gap-2.5 rounded-md border px-2.5 py-1.5">
                <Checkbox checked={done} onCheckedChange={() => toggleHabitLog(h.id, today)} />
                <span className={cn("text-sm", done && "text-muted-foreground line-through")}>
                  {h.title}
                </span>
                {h.timeOfDay && (
                  <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                    {h.timeOfDay}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
