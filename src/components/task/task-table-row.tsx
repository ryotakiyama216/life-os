"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, MoreHorizontal, Trash2, CalendarPlus, CalendarClock } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskStatusControl } from "@/components/task/task-status-control";
import { useAppStore } from "@/store/useAppStore";
import type { Priority, Task, TaskStatus } from "@/types";
import { PRIORITY_LABEL } from "@/types";
import { cn } from "@/lib/utils";
import { formatDateJP, isOverdue, isToday, todayISO } from "@/lib/date";
import { getPostponeToTomorrowPatch } from "@/lib/priority";
import { getGoalSelectOptions, getProjectSelectOptions } from "@/lib/task-links";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";

const NONE = "__none__";

export function TaskTableRow({ task }: { task: Task }) {
  const completeTask = useAppStore((s) => s.completeTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const removeTask = useAppStore((s) => s.removeTask);
  const goals = useAppStore((s) => s.goals);
  const projects = useAppStore((s) => s.projects);

  const [title, setTitle] = React.useState(task.title);
  React.useEffect(() => setTitle(task.title), [task.title]);
  const debouncedUpdateTitle = useDebouncedCallback((value: string) => {
    if (!value.trim()) return;
    updateTask(task.id, { title: value.trim() });
  }, 600);

  const overdue = task.status !== "done" && isOverdue(task.dueDate);
  const scheduledToday = isToday(task.scheduledDate);
  const done = task.status === "done";
  const inProgress = task.status === "in_progress";

  function handleStatusChange(value: TaskStatus) {
    if (value === "done") {
      completeTask(task.id);
    } else if (task.status === "done") {
      updateTask(task.id, { status: value, completedAt: undefined });
    } else {
      updateTask(task.id, { status: value });
    }
  }

  function handleDueDateChange(value: string) {
    if (value && task.scheduledDate && value < task.scheduledDate) {
      toast.error("期限日は実施予定日より前に設定できません");
      return;
    }
    updateTask(task.id, { dueDate: value || undefined });
  }

  // プロジェクトに紐づくタスクの目標は、そのプロジェクトの目標に一意に決まる
  // （タスクが独立して別の目標を持つことはできない）。プロジェクト未設定の時だけ目標を自由選択できる。
  function handleProjectChange(value: string) {
    if (value === NONE) {
      updateTask(task.id, { projectId: undefined });
      return;
    }
    const selected = projects.find((p) => p.id === value);
    updateTask(task.id, { projectId: value, goalId: selected?.goalId });
  }

  function handleGoalChange(value: string) {
    updateTask(task.id, { goalId: value === NONE ? undefined : value });
  }

  const goalOptions = getGoalSelectOptions(goals, projects, task.projectId);
  const effectiveGoalId = task.projectId
    ? projects.find((p) => p.id === task.projectId)?.goalId
    : task.goalId;
  const projectOptions = getProjectSelectOptions(projects, effectiveGoalId);

  return (
    <TableRow
      className={cn(
        overdue && "bg-red-50/50 dark:bg-red-950/10",
        !overdue && inProgress && "bg-blue-50/50 dark:bg-blue-950/10"
      )}
    >
      <TableCell className="min-w-[200px] max-w-[240px]">
        <div className="flex items-center gap-1">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              debouncedUpdateTitle(e.target.value);
            }}
            className={cn(
              "h-8 border-none px-1 shadow-none focus-visible:ring-1",
              done && "text-muted-foreground line-through"
            )}
          />
          <Link
            href={`/tasks/${task.id}`}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            title="詳細を開く"
          >
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
        {task.tags.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1 px-1">
            {task.tags.map((t) => (
              <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell>
        <TaskStatusControl status={task.status} onChange={handleStatusChange} />
      </TableCell>
      <TableCell>
        <Select value={task.priority} onValueChange={(v) => updateTask(task.id, { priority: v as Priority })}>
          <SelectTrigger className="h-8 w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(PRIORITY_LABEL).map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          type="date"
          value={task.dueDate ?? ""}
          min={task.scheduledDate || undefined}
          onChange={(e) => handleDueDateChange(e.target.value)}
          className={cn("h-8 w-36 text-sm", overdue && "border-red-300 text-red-600 dark:border-red-900")}
        />
      </TableCell>
      <TableCell className={cn("text-sm", scheduledToday && "font-medium text-blue-600 dark:text-blue-400")}>
        {task.scheduledDate ? formatDateJP(task.scheduledDate) : "—"}
      </TableCell>
      <TableCell>
        <Select value={effectiveGoalId ?? NONE} onValueChange={handleGoalChange}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="なし" />
          </SelectTrigger>
          <SelectContent>
            {goalOptions.allowNone && <SelectItem value={NONE}>なし</SelectItem>}
            {goalOptions.goals.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select value={task.projectId ?? NONE} onValueChange={handleProjectChange}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="なし" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>なし</SelectItem>
            {projectOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => updateTask(task.id, { scheduledDate: todayISO() })}>
              <CalendarPlus className="size-4" /> 今日の予定にする
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => updateTask(task.id, getPostponeToTomorrowPatch(task))}>
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
      </TableCell>
    </TableRow>
  );
}
