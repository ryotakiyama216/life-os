"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/priority-badge";
import { useAppStore } from "@/store/useAppStore";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { formatDateJP, isToday, overdueLabel, todayISO } from "@/lib/date";
import { getPostponeToTomorrowPatch } from "@/lib/priority";

/** 期限切れタスク専用: 「今日やる/明日に延期/削除」を隠さずボタンで直接表示する */
export function OverdueTaskItem({ task }: { task: Task }) {
  const router = useRouter();
  const completeTask = useAppStore((s) => s.completeTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const removeTask = useAppStore((s) => s.removeTask);
  const goal = useAppStore((s) => (task.goalId ? s.goals.find((g) => g.id === task.goalId) : undefined));
  const project = useAppStore((s) =>
    task.projectId ? s.projects.find((p) => p.id === task.projectId) : undefined
  );

  const scheduledToday = isToday(task.scheduledDate);

  return (
    <div className="rounded-lg border border-red-200 bg-card px-3 py-2.5 dark:border-red-900/50">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={false}
          className="mt-0.5"
          onCheckedChange={(checked) => {
            if (checked) {
              completeTask(task.id);
              toast.success("完了しました");
            }
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/tasks/${task.id}`} className="text-sm hover:underline">
              {task.title}
            </Link>
            <PriorityBadge priority={task.priority} />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              期限 {formatDateJP(task.dueDate)}（{overdueLabel(task.dueDate!)}）
            </span>
            {task.scheduledDate && (
              <span
                className={cn(
                  "text-xs",
                  scheduledToday ? "font-medium text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                )}
              >
                予定 {formatDateJP(task.scheduledDate)}
                {scheduledToday && "（今日）"}
              </span>
            )}
            {(project || goal) && (
              <span className="text-xs text-muted-foreground">{project ? project.title : goal?.title}</span>
            )}
          </div>
          {task.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {task.tags.map((t) => (
                <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5 pl-7">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={scheduledToday}
          onClick={() => {
            updateTask(task.id, { scheduledDate: todayISO() });
            toast.success("今日の予定にしました");
          }}
        >
          <CalendarPlus className="size-3.5" />
          今日やる
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => {
            updateTask(task.id, getPostponeToTomorrowPatch(task));
            toast.success("期限を明日に変更しました");
          }}
        >
          <CalendarClock className="size-3.5" />
          明日に延期
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => router.push(`/tasks/${task.id}`)}>
          <Pencil className="size-3.5" />
          編集
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn("gap-1.5 text-red-600 hover:text-red-600")}
          onClick={() => {
            removeTask(task.id);
            toast("タスクを削除しました");
          }}
        >
          <Trash2 className="size-3.5" />
          削除
        </Button>
      </div>
    </div>
  );
}
