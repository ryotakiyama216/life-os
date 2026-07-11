"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ListTodo, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/priority-badge";
import { ProjectStatusBadge } from "@/components/status-badge";
import { MarkdownContent } from "@/components/markdown-content";
import { EmptyState } from "@/components/empty-state";
import { ProjectFormDialog } from "@/components/project/project-form-dialog";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { TaskItem } from "@/components/task/task-item";
import { useAppStore } from "@/store/useAppStore";
import { formatDateJP } from "@/lib/date";
import { FolderKanban } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const project = useAppStore((s) => s.projects.find((p) => p.id === params.id));
  const goal = useAppStore((s) =>
    project?.goalId ? s.goals.find((g) => g.id === project.goalId) : undefined
  );
  const allTasks = useAppStore((s) => s.tasks);
  const removeProject = useAppStore((s) => s.removeProject);

  const tasks = allTasks.filter((t) => t.projectId === params.id);

  if (!project) {
    return <EmptyState icon={FolderKanban} title="プロジェクトが見つかりません" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-3 gap-1.5 px-2" onClick={() => router.push("/projects")}>
          <ArrowLeft className="size-4" />
          プロジェクト一覧へ
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{project.title}</h1>
              <PriorityBadge priority={project.priority} />
              <ProjectStatusBadge status={project.status} />
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {goal && (
                <Link href={`/goals/${goal.id}`} className="underline-offset-2 hover:underline">
                  目標: {goal.title}
                </Link>
              )}
              {project.targetDate && <span>期限: {formatDateJP(project.targetDate)}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <ProjectFormDialog
              project={project}
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
                  await removeProject(project.id);
                  toast("プロジェクトを削除しました");
                  router.push("/projects");
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

      <MarkdownContent content={project.description} />

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ListTodo className="size-4" />
            タスク（{tasks.length}件）
          </h2>
          <TaskFormDialog
            defaultProjectId={project.id}
            defaultGoalId={project.goalId}
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-3.5" />
                タスクを追加
              </Button>
            }
          />
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">タスクを追加して、やることを分解しましょう。</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
