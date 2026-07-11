"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/priority-badge";
import { GoalStatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/store/useAppStore";
import type { Goal } from "@/types";
import { formatDateJP } from "@/lib/date";

export function GoalCard({ goal }: { goal: Goal }) {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);

  const projectCount = projects.filter((p) => p.goalId === goal.id).length;
  const relatedTasks = tasks.filter(
    (t) => t.goalId === goal.id || projects.find((p) => p.id === t.projectId)?.goalId === goal.id
  );
  const taskStats = { total: relatedTasks.length, done: relatedTasks.filter((t) => t.status === "done").length };

  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="space-y-2 p-4 transition-colors hover:bg-secondary/40">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium">{goal.title}</h3>
          <PriorityBadge priority={goal.priority} />
          <GoalStatusBadge status={goal.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {goal.targetDate && <span>期限 {formatDateJP(goal.targetDate)}</span>}
          <span>プロジェクト {projectCount}件</span>
          <span>
            タスク {taskStats.done}/{taskStats.total}
          </span>
        </div>
      </Card>
    </Link>
  );
}
