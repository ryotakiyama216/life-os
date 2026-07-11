"use client";

import { Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/store/useAppStore";
import { todayISO, weekdayOf } from "@/lib/date";
import { isHabitDueOn, sortHabitsByTime } from "@/lib/habit";
import { cn } from "@/lib/utils";

export function HabitsToday() {
  const today = todayISO();
  const weekday = weekdayOf(today);
  const allHabits = useAppStore((s) => s.habits);
  const allHabitLogs = useAppStore((s) => s.habitLogs);
  const goals = useAppStore((s) => s.goals);
  const toggleHabitLog = useAppStore((s) => s.toggleHabitLog);

  const habits = sortHabitsByTime(allHabits.filter((h) => isHabitDueOn(h, weekday)));
  const habitLogs = allHabitLogs.filter((l) => l.date === today);
  const goalsById = new Map(goals.map((g) => [g.id, g]));

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
            const goal = h.goalId ? goalsById.get(h.goalId) : undefined;
            return (
              <li key={h.id} className="flex items-center gap-2.5 rounded-md border px-2.5 py-1.5">
                <Checkbox checked={done} onCheckedChange={() => toggleHabitLog(h.id, today)} />
                <div className="min-w-0">
                  <span className={cn("text-sm", done && "text-muted-foreground line-through")}>
                    {h.title}
                  </span>
                  {goal && <p className="text-xs text-muted-foreground">{goal.title}</p>}
                </div>
                {h.timeOfDay && (
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
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
