import type { Habit } from "@/types";

export function isHabitDueOn(habit: Habit, weekday: number): boolean {
  if (!habit.active) return false;
  if (habit.frequency.type === "daily") return true;
  return habit.frequency.days.includes(weekday);
}

/** 実施時刻(timeOfDay)の昇順で並び替える。未設定の習慣は末尾（元の順序を保つ） */
export function sortHabitsByTime(habits: Habit[]): Habit[] {
  return [...habits].sort((a, b) => {
    if (a.timeOfDay && b.timeOfDay) return a.timeOfDay.localeCompare(b.timeOfDay);
    if (a.timeOfDay) return -1;
    if (b.timeOfDay) return 1;
    return 0;
  });
}
