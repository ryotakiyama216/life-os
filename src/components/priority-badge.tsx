import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority } from "@/types";
import { PRIORITY_LABEL } from "@/types";

const PRIORITY_STYLE: Record<Priority, string> = {
  P1: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400",
  P2: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
  P3: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400",
  P4: "border-border bg-muted text-muted-foreground",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", PRIORITY_STYLE[priority], className)}>
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}
