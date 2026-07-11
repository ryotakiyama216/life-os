"use client";

import * as React from "react";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, CalendarPlus, CalendarClock } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/priority-badge";
import { TaskStatusBadge } from "@/components/status-badge";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { useAppStore } from "@/store/useAppStore";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { formatDateJP, isOverdue, todayISO } from "@/lib/date";

export function TaskTableRow({ task }: { task: Task }) {
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
    <TableRow className={cn(overdue && "bg-red-50/50 dark:bg-red-950/10")}>
      <TableCell>
        <Checkbox
          checked={done}
          onCheckedChange={(checked) => {
            if (checked) {
              completeTask(task.id);
            } else {
              updateTask(task.id, { status: "todo", completedAt: undefined });
            }
          }}
        />
      </TableCell>
      <TableCell className="max-w-[280px]">
        <button
          className={cn("text-left text-sm hover:underline", done && "text-muted-foreground line-through")}
          onClick={() => setEditOpen(true)}
        >
          {task.title}
        </button>
        {task.tags.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {task.tags.map((t) => (
              <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell>
        <TaskStatusBadge status={task.status} />
      </TableCell>
      <TableCell>
        <PriorityBadge priority={task.priority} />
      </TableCell>
      <TableCell className={cn("text-sm", overdue && "font-medium text-red-600 dark:text-red-400")}>
        {task.dueDate ? formatDateJP(task.dueDate) : "—"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {project?.title ?? goal?.title ?? "—"}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
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
      </TableCell>
      <TaskFormDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
    </TableRow>
  );
}
