"use client";

import { AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getOverdueTasks } from "@/lib/priority";
import { OverdueTaskItem } from "@/components/task/overdue-task-item";

export function OverdueSection() {
  const tasks = useAppStore((s) => s.tasks);
  const overdue = getOverdueTasks(tasks);

  if (overdue.length === 0) return null;

  return (
    <section className="space-y-2.5 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
        <AlertTriangle className="size-4" />
        期限切れ（{overdue.length}件）— 今日中に片付けるか、延期・削除を判断しましょう
      </h2>
      <div className="space-y-2">
        {overdue.map((t) => (
          <OverdueTaskItem key={t.id} task={t} />
        ))}
      </div>
    </section>
  );
}
