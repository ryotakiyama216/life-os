"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/priority-badge";
import { GoalStatusBadge } from "@/components/status-badge";
import { MarkdownContent } from "@/components/markdown-content";
import { EmptyState } from "@/components/empty-state";
import { GoalFormDialog } from "@/components/goal/goal-form-dialog";
import { ProjectFormDialog } from "@/components/project/project-form-dialog";
import { ProjectCard } from "@/components/project/project-card";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { TaskItem } from "@/components/task/task-item";
import { useAppStore } from "@/store/useAppStore";
import { formatDateJP } from "@/lib/date";
import { FolderKanban, Target } from "lucide-react";

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const goal = useAppStore((s) => s.goals.find((g) => g.id === params.id));
  const allProjects = useAppStore((s) => s.projects);
  const allTasks = useAppStore((s) => s.tasks);
  const removeGoal = useAppStore((s) => s.removeGoal);

  const projects = allProjects.filter((p) => p.goalId === params.id);
  const directTasks = allTasks.filter((t) => t.goalId === params.id && !t.projectId);

  if (!goal) {
    return (
      <EmptyState icon={Target} title="目標が見つかりません" />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-3 gap-1.5 px-2" onClick={() => router.push("/goals")}>
          <ArrowLeft className="size-4" />
          目標一覧へ
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{goal.title}</h1>
              <PriorityBadge priority={goal.priority} />
              <GoalStatusBadge status={goal.status} />
            </div>
            {goal.targetDate && (
              <p className="text-sm text-muted-foreground">達成期限: {formatDateJP(goal.targetDate)}</p>
            )}
          </div>
          <div className="flex gap-2">
            <GoalFormDialog
              goal={goal}
              trigger={
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Pencil className="size-3.5" />
                  編集
                </Button>
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600 hover:text-red-600"
              onClick={async () => {
                try {
                  await removeGoal(goal.id);
                  toast("目標を削除しました");
                  router.push("/goals");
                } catch {
                  // ストア側でtoast.errorを表示済み
                }
              }}
            >
              <Trash2 className="size-3.5" />
              削除
            </Button>
          </div>
        </div>
      </div>

      <MarkdownContent content={goal.description} />

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <FolderKanban className="size-4" />
            プロジェクト（{projects.length}件）
          </h2>
          <ProjectFormDialog
            defaultGoalId={goal.id}
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-3.5" />
                プロジェクトを追加
              </Button>
            }
          />
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            プロジェクトがなくてもOK。習慣や直接のタスクだけで達成できる目標もあります。
          </p>
        ) : (
          <div className="space-y-2.5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} showGoal={false} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">目標に直接ひもづくタスク（{directTasks.length}件）</h2>
          <TaskFormDialog
            defaultGoalId={goal.id}
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-3.5" />
                タスクを追加
              </Button>
            }
          />
        </div>
        {directTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">プロジェクトを経由しないタスクはまだありません。</p>
        ) : (
          <div className="space-y-2">
            {directTasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
