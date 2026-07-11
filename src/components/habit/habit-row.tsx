"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HabitFormDialog } from "@/components/habit/habit-form-dialog";
import { useAppStore } from "@/store/useAppStore";
import type { Habit } from "@/types";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function frequencyLabel(habit: Habit): string {
  if (habit.frequency.type === "daily") return "毎日";
  return habit.frequency.days.map((d) => WEEKDAYS[d]).join("・") || "曜日未設定";
}

export function HabitRow({ habit }: { habit: Habit }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const goal = useAppStore((s) => (habit.goalId ? s.goals.find((g) => g.id === habit.goalId) : undefined));
  const removeHabit = useAppStore((s) => s.removeHabit);

  return (
    <Card className="flex items-center justify-between gap-3 p-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{habit.title}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{frequencyLabel(habit)}</span>
          {habit.timeOfDay && <span>{habit.timeOfDay}</span>}
          {goal && <span>目標: {goal.title}</span>}
        </div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
          <Pencil className="size-3.5" />
          編集
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={() => {
            removeHabit(habit.id);
            toast("習慣を削除しました");
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <HabitFormDialog habit={habit} open={editOpen} onOpenChange={setEditOpen} />
    </Card>
  );
}
