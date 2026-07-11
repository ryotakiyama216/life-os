import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GoalStatus, ProjectStatus, TaskStatus } from "@/types";
import { GOAL_STATUS_LABEL, PROJECT_STATUS_LABEL, TASK_STATUS_LABEL } from "@/types";

const STATUS_STYLE: Record<string, string> = {
  done: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
  in_progress: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400",
  active: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400",
  todo: "border-border bg-muted text-muted-foreground",
  someday: "border-border bg-muted text-muted-foreground",
  waiting: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
  on_hold: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
  archived: "border-border bg-muted text-muted-foreground",
};

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", STATUS_STYLE[status], className)}>
      {TASK_STATUS_LABEL[status]}
    </Badge>
  );
}

export function GoalStatusBadge({ status, className }: { status: GoalStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", STATUS_STYLE[status], className)}>
      {GOAL_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", STATUS_STYLE[status], className)}>
      {PROJECT_STATUS_LABEL[status]}
    </Badge>
  );
}
