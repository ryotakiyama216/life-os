"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, CalendarPlus, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/priority-badge";
import { TaskStatusControl } from "@/components/task/task-status-control";
import { OverdueLabel } from "@/components/overdue-label";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useAppStore } from "@/store/useAppStore";
import type { Task, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";
import { formatDateJP, isOverdue, isToday, todayISO } from "@/lib/date";
import { getPostponeToTomorrowPatch } from "@/lib/priority";
import { toast } from "sonner";

export function TaskItem({
  task,
  showProjectGoal = false,
}: {
  task: Task;
  showProjectGoal?: boolean;
}) {
  const router = useRouter();
  const completeTask = useAppStore((s) => s.completeTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const removeTask = useAppStore((s) => s.removeTask);
  const goal = useAppStore((s) => (task.goalId ? s.goals.find((g) => g.id === task.goalId) : undefined));
  const project = useAppStore((s) =>
    task.projectId ? s.projects.find((p) => p.id === task.projectId) : undefined
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  const overdue = task.status !== "done" && isOverdue(task.dueDate);
  const scheduledToday = isToday(task.scheduledDate);
  const done = task.status === "done";
  const inProgress = task.status === "in_progress";

  function handleStatusChange(value: TaskStatus) {
    if (value === "done") {
      completeTask(task.id);
      toast.success("完了しました");
    } else if (task.status === "done") {
      updateTask(task.id, { status: value, completedAt: undefined });
    } else {
      updateTask(task.id, { status: value });
    }
  }

  function handleCheckedChange(checked: boolean) {
    if (checked) {
      completeTask(task.id);
      toast.success("完了しました");
    } else {
      updateTask(task.id, { status: "todo", completedAt: undefined });
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5",
        overdue && "border-red-200 dark:border-red-900/50",
        !overdue && inProgress && "border-blue-200 dark:border-blue-900/50"
      )}
    >
      <Checkbox
        checked={done}
        onCheckedChange={handleCheckedChange}
        aria-label={done ? "タスクを未完了に戻す" : "タスクを完了にする"}
        className="mt-1.5 shrink-0"
      />
      <TaskStatusControl status={task.status} onChange={handleStatusChange} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={`/tasks/${task.id}`}
            className={cn(
              "text-sm hover:underline",
              done && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </Link>
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (overdue ? (
            <OverdueLabel date={task.dueDate} label="期限 " />
          ) : (
            <span className="text-xs text-muted-foreground">期限 {formatDateJP(task.dueDate)}</span>
          ))}
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
          {showProjectGoal && (project || goal) && (
            <span className="text-xs text-muted-foreground">
              {project ? project.title : goal?.title}
            </span>
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label="その他の操作">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => router.push(`/tasks/${task.id}`)}>
            <Pencil className="size-4" /> 編集
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateTask(task.id, { scheduledDate: todayISO() })}>
            <CalendarPlus className="size-4" /> 今日の予定にする
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateTask(task.id, getPostponeToTomorrowPatch(task))}>
            <CalendarClock className="size-4" /> 明日に延期
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 dark:text-red-400"
            onSelect={(e) => {
              e.preventDefault();
              setConfirmDeleteOpen(true);
            }}
          >
            <Trash2 className="size-4" /> 削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="タスクを削除しますか？"
        description={`「${task.title}」を削除します。この操作は取り消せません。`}
        onConfirm={() => {
          removeTask(task.id);
          toast("タスクを削除しました");
          setConfirmDeleteOpen(false);
        }}
      />
    </div>
  );
}
