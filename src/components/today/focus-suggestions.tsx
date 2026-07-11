"use client";

import { Sparkles, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge } from "@/components/priority-badge";
import { useAppStore } from "@/store/useAppStore";
import { getFocusSuggestions } from "@/lib/priority";
import { todayISO } from "@/lib/date";

export function FocusSuggestions() {
  const tasks = useAppStore((s) => s.tasks);
  const goals = useAppStore((s) => s.goals);
  const projects = useAppStore((s) => s.projects);
  const updateTask = useAppStore((s) => s.updateTask);

  const suggestions = getFocusSuggestions(tasks, goals, projects, 5);
  if (suggestions.length === 0) return null;

  const goalsById = new Map(goals.map((g) => [g.id, g]));
  const projectsById = new Map(projects.map((p) => [p.id, p]));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" />
          今やるべき候補
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          目標・プロジェクトの優先度から逆算した、日付未設定のタスクです。好きなタスクに流されないための道しるべ。
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map((t) => {
          const project = t.projectId ? projectsById.get(t.projectId) : undefined;
          const goal = t.goalId ? goalsById.get(t.goalId) : project?.goalId ? goalsById.get(project.goalId) : undefined;
          return (
            <div key={t.id} className="flex items-center gap-2.5 rounded-md border px-2.5 py-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm">{t.title}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                {(goal || project) && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {goal?.title}
                    {goal && project && " / "}
                    {project?.title}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1.5"
                onClick={() => updateTask(t.id, { scheduledDate: todayISO() })}
              >
                <CalendarPlus className="size-3.5" />
                今日やる
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
