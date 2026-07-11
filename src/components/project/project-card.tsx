"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/priority-badge";
import { ProjectStatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/store/useAppStore";
import type { Project } from "@/types";
import { formatDateJP } from "@/lib/date";

export function ProjectCard({ project, showGoal = true }: { project: Project; showGoal?: boolean }) {
  const goals = useAppStore((s) => s.goals);
  const tasks = useAppStore((s) => s.tasks);

  const goal = project.goalId ? goals.find((g) => g.id === project.goalId) : undefined;
  const relatedTasks = tasks.filter((t) => t.projectId === project.id);
  const taskStats = { total: relatedTasks.length, done: relatedTasks.filter((t) => t.status === "done").length };

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="space-y-2 p-4 transition-colors hover:bg-secondary/40">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium">{project.title}</h3>
          <PriorityBadge priority={project.priority} />
          <ProjectStatusBadge status={project.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {showGoal && goal && <span>目標: {goal.title}</span>}
          {project.targetDate && <span>期限 {formatDateJP(project.targetDate)}</span>}
          <span>
            タスク {taskStats.done}/{taskStats.total}
          </span>
        </div>
      </Card>
    </Link>
  );
}
