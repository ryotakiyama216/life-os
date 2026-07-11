"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckSquare, FolderKanban, History, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/empty-state";
import { TaskItem } from "@/components/task/task-item";
import { ProjectCard } from "@/components/project/project-card";
import { useAppStore } from "@/store/useAppStore";
import { getDayActivity } from "@/lib/review";
import { formatDateFullJP } from "@/lib/date";

export default function ReviewDetailPage({ params }: { params: { date: string } }) {
  const router = useRouter();
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const habits = useAppStore((s) => s.habits);
  const habitLogs = useAppStore((s) => s.habitLogs);
  const toggleHabitLog = useAppStore((s) => s.toggleHabitLog);

  const activity = getDayActivity(params.date, tasks, projects, habits, habitLogs);
  const hasNothing =
    activity.tasks.length === 0 && activity.projects.length === 0 && activity.habitEntries.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-3 gap-1.5 px-2" onClick={() => router.push("/review")}>
          <ArrowLeft className="size-4" />
          振り返り一覧へ
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">{formatDateFullJP(params.date)}</h1>
      </div>

      {hasNothing ? (
        <EmptyState icon={History} title="この日の記録はありません" />
      ) : (
        <>
          {activity.tasks.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <CheckSquare className="size-4" />
                完了したタスク（{activity.tasks.length}件）
              </h2>
              <div className="space-y-2">
                {activity.tasks.map((t) => (
                  <TaskItem key={t.id} task={t} showProjectGoal />
                ))}
              </div>
            </section>
          )}

          {activity.projects.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <FolderKanban className="size-4" />
                完了したプロジェクト（{activity.projects.length}件）
              </h2>
              <div className="space-y-2.5">
                {activity.projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}

          {activity.habitEntries.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Repeat className="size-4" />
                実施した習慣（{activity.habitEntries.length}件）
              </h2>
              <ul className="space-y-1.5">
                {activity.habitEntries.map(({ log, habit }) => (
                  <li key={log.id} className="flex items-center gap-2.5 rounded-md border px-2.5 py-1.5">
                    <Checkbox
                      checked={log.completed}
                      onCheckedChange={() => toggleHabitLog(habit.id, params.date)}
                    />
                    <span className="text-sm">{habit.title}</span>
                    {habit.timeOfDay && (
                      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                        {habit.timeOfDay}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
