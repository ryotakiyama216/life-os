import type { Habit, HabitLog, Project, Task } from "@/types";

export interface DayActivity {
  date: string;
  tasks: Task[];
  projects: Project[];
  habitEntries: { log: HabitLog; habit: Habit }[];
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

/** タスク完了日・プロジェクト完了日・習慣実施日を統合し、活動があった日付を新しい順に返す */
export function getActivityDates(tasks: Task[], projects: Project[], habitLogs: HabitLog[]): string[] {
  const dates = new Set<string>();
  tasks.forEach((t) => t.completedAt && dates.add(toDateKey(t.completedAt)));
  projects.forEach((p) => p.completedAt && dates.add(toDateKey(p.completedAt)));
  habitLogs.forEach((l) => l.completed && dates.add(l.date));
  return Array.from(dates).sort((a, b) => b.localeCompare(a));
}

/** 指定日の完了タスク・完了プロジェクト・実施済み習慣をまとめて返す */
export function getDayActivity(
  date: string,
  tasks: Task[],
  projects: Project[],
  habits: Habit[],
  habitLogs: HabitLog[]
): DayActivity {
  const habitsById = new Map(habits.map((h) => [h.id, h]));
  return {
    date,
    tasks: tasks.filter((t) => t.completedAt && toDateKey(t.completedAt) === date),
    projects: projects.filter((p) => p.completedAt && toDateKey(p.completedAt) === date),
    habitEntries: habitLogs
      .filter((l) => l.date === date && l.completed)
      .map((log) => ({ log, habit: habitsById.get(log.habitId) }))
      .filter((x): x is { log: HabitLog; habit: Habit } => !!x.habit),
  };
}

export function countActivity(activity: DayActivity): string {
  const parts: string[] = [];
  if (activity.tasks.length > 0) parts.push(`タスク${activity.tasks.length}件`);
  if (activity.projects.length > 0) parts.push(`プロジェクト${activity.projects.length}件`);
  if (activity.habitEntries.length > 0) parts.push(`習慣${activity.habitEntries.length}件`);
  return parts.join("・") || "記録なし";
}
