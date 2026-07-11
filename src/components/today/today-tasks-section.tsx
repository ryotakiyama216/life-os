"use client";

import { CalendarCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { getTodayTasks } from "@/lib/priority";
import { TaskItem } from "@/components/task/task-item";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { EmptyState } from "@/components/empty-state";
import { todayISO } from "@/lib/date";

export function TodayTasksSection() {
  const tasks = useAppStore((s) => s.tasks);
  const todayTasks = getTodayTasks(tasks);

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarCheck className="size-4" />
          今日やること（{todayTasks.length}件）
        </h2>
        <TaskFormDialog
          defaultScheduledDate={todayISO()}
          trigger={
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="size-3.5" />
              タスクを追加
            </Button>
          }
        />
      </div>
      {todayTasks.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="今日の予定はまだありません"
          description="下の「今やるべき候補」から選ぶか、新しくタスクを追加しましょう"
        />
      ) : (
        <div className="space-y-2">
          {todayTasks.map((t) => (
            <TaskItem key={t.id} task={t} showProjectGoal />
          ))}
        </div>
      )}
    </section>
  );
}
