"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, CalendarPlus, CalendarClock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/priority-badge";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { useAppStore } from "@/store/useAppStore";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { formatDateJP, isOverdue, overdueLabel, todayISO } from "@/lib/date";
import { toast } from "sonner";

export function TaskItem({
  task,
  showProjectGoal = false,
}: {
  task: Task;
  showProjectGoal?: boolean;
}) {
  const [editOpen, setEditOpen] = React.useState(false);
  const completeTask = useAppStore((s) => s.completeTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const removeTask = useAppStore((s) => s.removeTask);
  const goal = useAppStore((s) => (task.goalId ? s.goals.find((g) => g.id === task.goalId) : undefined));
  const project = useAppStore((s) =>
    task.projectId ? s.projects.find((p) => p.id === task.projectId) : undefined
  );

  const overdue = task.status !== "done" && isOverdue(task.dueDate);
  const done = task.status === "done";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5",
        overdue && "border-red-200 dark:border-red-900/50"
      )}
    >
      <Checkbox
        checked={done}
        className="mt-0.5"
        onCheckedChange={(checked) => {
          if (checked) {
            completeTask(task.id);
            toast.success("完了しました");
          } else {
            updateTask(task.id, { status: "todo", completedAt: undefined });
          }
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn("text-sm", done && "text-muted-foreground line-through")}>
            {task.title}
          </span>
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span className={cn("text-xs", overdue ? "font-medium text-red-600 dark:text-red-400" : "text-muted-foreground")}>
              期限 {formatDateJP(task.dueDate)}
              {overdue && `（${overdueLabel(task.dueDate)}）`}
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
          <Button variant="ghost" size="icon" className="size-7 shrink-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" /> 編集
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateTask(task.id, { scheduledDate: todayISO() })}>
            <CalendarPlus className="size-4" /> 今日の予定にする
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              updateTask(task.id, { dueDate: format(addDays(new Date(), 1), "yyyy-MM-dd") })
            }
          >
            <CalendarClock className="size-4" /> 明日に延期
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 dark:text-red-400"
            onSelect={() => {
              removeTask(task.id);
              toast("タスクを削除しました");
            }}
          >
            <Trash2 className="size-4" /> 削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TaskFormDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
