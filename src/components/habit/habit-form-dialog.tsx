"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import type { Habit, HabitFrequency } from "@/types";
import { cn } from "@/lib/utils";

const NONE = "__none__";
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function HabitFormDialog({
  habit,
  initialTitle,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSaved,
}: {
  habit?: Habit;
  initialTitle?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (habit: Habit) => void;
}) {
  const isEdit = !!habit;
  const goals = useAppStore((s) => s.goals);
  const addHabit = useAppStore((s) => s.addHabit);
  const updateHabit = useAppStore((s) => s.updateHabit);

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const [title, setTitle] = React.useState(habit?.title ?? initialTitle ?? "");
  const [goalId, setGoalId] = React.useState(habit?.goalId ?? NONE);
  const [freqType, setFreqType] = React.useState<HabitFrequency["type"]>(
    habit?.frequency.type ?? "daily"
  );
  const [days, setDays] = React.useState<number[]>(
    habit?.frequency.type !== "daily" && habit?.frequency ? (habit.frequency as { days: number[] }).days : []
  );
  const [timeOfDay, setTimeOfDay] = React.useState(habit?.timeOfDay ?? "");

  React.useEffect(() => {
    if (!open) return;
    setTitle(habit?.title ?? initialTitle ?? "");
    setGoalId(habit?.goalId ?? NONE);
    setFreqType(habit?.frequency.type ?? "daily");
    setDays(habit?.frequency.type !== "daily" && habit?.frequency ? (habit.frequency as { days: number[] }).days : []);
    setTimeOfDay(habit?.timeOfDay ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, habit]);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function handleSubmit() {
    if (!title.trim()) return;
    const frequency: HabitFrequency =
      freqType === "daily" ? { type: "daily" } : { type: freqType, days };
    const payload = {
      title: title.trim(),
      goalId: goalId === NONE ? undefined : goalId,
      frequency,
      timeOfDay: timeOfDay || undefined,
    };
    try {
      if (isEdit) {
        await updateHabit(habit.id, payload);
        toast.success("習慣を更新しました");
        setOpen(false);
        onSaved?.(habit);
      } else {
        const created = await addHabit(payload);
        toast.success("習慣を追加しました");
        setOpen(false);
        onSaved?.(created);
      }
    } catch {
      // ストア側でtoast.errorを表示済み
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "習慣を編集" : "習慣を追加"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="habit-title">タイトル</Label>
            <Input
              id="habit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 運動する、日記を書く"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>紐づく目標</Label>
            <Select value={goalId} onValueChange={setGoalId}>
              <SelectTrigger>
                <SelectValue placeholder="なし" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>なし</SelectItem>
                {goals.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>頻度</Label>
            <Select value={freqType} onValueChange={(v) => setFreqType(v as HabitFrequency["type"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">毎日</SelectItem>
                <SelectItem value="weekly">毎週（曜日指定）</SelectItem>
                <SelectItem value="custom">カスタム（曜日指定）</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {freqType !== "daily" && (
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((label, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "size-9 rounded-md border text-sm",
                    days.includes(i)
                      ? "border-foreground bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="habit-time">実施時刻（朝の時間割との連携用）</Label>
            <Input
              id="habit-time"
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {isEdit ? "更新する" : "追加する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
