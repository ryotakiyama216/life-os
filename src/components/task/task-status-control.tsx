"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";
import { TASK_STATUS_LABEL } from "@/types";

const TASK_STATUS_STYLE: Record<TaskStatus, string> = {
  todo: "border-border bg-muted text-muted-foreground",
  in_progress: "border-border bg-muted font-medium text-foreground",
  done: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
  waiting:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
  someday: "border-border bg-muted text-muted-foreground",
};

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "waiting", "someday", "done"];

export function TaskStatusControl({
  status,
  onChange,
  className,
}: {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="-m-1.5 shrink-0 rounded p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`状態: ${TASK_STATUS_LABEL[status]}（変更する）`}
        >
          <Badge
            variant="outline"
            className={cn("cursor-pointer font-normal", TASK_STATUS_STYLE[status], className)}
          >
            {TASK_STATUS_LABEL[status]}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {STATUS_ORDER.map((value) => (
          <DropdownMenuItem key={value} onSelect={() => onChange(value)}>
            {status === value ? <Check className="size-4" /> : <span className="size-4" />}
            {TASK_STATUS_LABEL[value]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
