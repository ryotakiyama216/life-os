"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ListTodo, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import { todayISO } from "@/lib/date";
import { getGoalSelectOptions, getProjectSelectOptions } from "@/lib/task-links";
import type { Priority, TaskStatus } from "@/types";
import { PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/types";
import { cn } from "@/lib/utils";

const NONE = "__none__";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const task = useAppStore((s) => s.tasks.find((t) => t.id === params.id));
  const goals = useAppStore((s) => s.goals);
  const projects = useAppStore((s) => s.projects);
  const completeTask = useAppStore((s) => s.completeTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const removeTask = useAppStore((s) => s.removeTask);

  const [title, setTitle] = React.useState(task?.title ?? "");
  const [description, setDescription] = React.useState(task?.description ?? "");
  const [tagsInput, setTagsInput] = React.useState(task?.tags.join(", ") ?? "");
  const [dueDate, setDueDate] = React.useState(task?.dueDate ?? "");
  const [scheduledDate, setScheduledDate] = React.useState(task?.scheduledDate ?? "");

  React.useEffect(() => {
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setTagsInput(task?.tags.join(", ") ?? "");
    setDueDate(task?.dueDate ?? "");
    setScheduledDate(task?.scheduledDate ?? "");
  }, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedUpdateTask = useDebouncedCallback((patch: { title?: string; description?: string }) => {
    if (!task) return;
    updateTask(task.id, patch);
  }, 600);

  if (!task) {
    return <EmptyState icon={ListTodo} title="タスクが見つかりません" />;
  }

  function handleStatusChange(value: TaskStatus) {
    if (!task) return;
    if (value === "done") {
      completeTask(task.id);
    } else if (task.status === "done") {
      updateTask(task.id, { status: value, completedAt: undefined });
    } else {
      updateTask(task.id, { status: value });
    }
  }

  function handleDueDateChange(value: string) {
    if (!task) return;
    if (value && task.scheduledDate && value < task.scheduledDate) {
      toast.error("期限日は実施予定日より前に設定できません");
      setDueDate(task.dueDate ?? "");
      return;
    }
    setDueDate(value);
    updateTask(task.id, { dueDate: value || undefined });
  }

  function handleScheduledDateChange(value: string) {
    if (!task) return;
    if (value && task.dueDate && value > task.dueDate) {
      toast.error("実施予定日は期限日より後に設定できません");
      setScheduledDate(task.scheduledDate ?? "");
      return;
    }
    setScheduledDate(value);
    updateTask(task.id, { scheduledDate: value || undefined });
  }

  const done = task.status === "done";

  // プロジェクトを選ぶと、そのプロジェクトの目標にタスクの目標が一意に決まる
  // （タスクが独立して別の目標を持つことはできない）。プロジェクト未設定の時だけ目標を自由選択できる。
  function handleProjectChange(value: string) {
    if (!task) return;
    if (value === NONE) {
      updateTask(task.id, { projectId: undefined });
      return;
    }
    const selected = projects.find((p) => p.id === value);
    updateTask(task.id, { projectId: value, goalId: selected?.goalId });
  }

  const goalOptions = getGoalSelectOptions(goals, projects, task.projectId);
  const effectiveGoalId = task.projectId
    ? projects.find((p) => p.id === task.projectId)?.goalId
    : task.goalId;
  const projectOptions = getProjectSelectOptions(projects, effectiveGoalId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1.5 px-2" onClick={() => router.push("/tasks")}>
          <ArrowLeft className="size-4" />
          タスク一覧へ
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-red-600 hover:text-red-600"
          onClick={async () => {
            try {
              await removeTask(task.id);
              toast("タスクを削除しました");
              router.push("/tasks");
            } catch {
              // ストア側でtoast.errorを表示済み
            }
          }}
        >
          <Trash2 className="size-3.5" />
          削除
        </Button>
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          checked={done}
          onCheckedChange={(checked) => {
            if (checked) {
              completeTask(task.id);
              toast.success("完了しました");
            } else {
              updateTask(task.id, { status: "todo", completedAt: undefined });
            }
          }}
        />
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            debouncedUpdateTask({ title: e.target.value });
          }}
          placeholder="何をする？"
          className={cn(
            "border-none px-0 text-xl font-semibold tracking-tight shadow-none focus-visible:ring-0",
            done && "text-muted-foreground line-through"
          )}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>状態</Label>
          <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TASK_STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>優先度</Label>
          <Select
            value={task.priority}
            onValueChange={(v) => updateTask(task.id, { priority: v as Priority })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="task-due">期限日</Label>
          <Input
            id="task-due"
            type="date"
            min={scheduledDate || undefined}
            value={dueDate}
            onChange={(e) => handleDueDateChange(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="task-scheduled">実施予定日</Label>
          <div className="flex gap-1.5">
            <Input
              id="task-scheduled"
              type="date"
              max={dueDate || undefined}
              value={scheduledDate}
              onChange={(e) => handleScheduledDateChange(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleScheduledDateChange(todayISO())}
            >
              今日
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>目標</Label>
          <Select
            value={effectiveGoalId ?? NONE}
            onValueChange={(v) => updateTask(task.id, { goalId: v === NONE ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="なし" />
            </SelectTrigger>
            <SelectContent>
              {goalOptions.allowNone && <SelectItem value={NONE}>なし</SelectItem>}
              {goalOptions.goals.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>プロジェクト</Label>
          <Select value={task.projectId ?? NONE} onValueChange={handleProjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="なし" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>なし</SelectItem>
              {projectOptions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="task-tags">タグ（カンマ区切り）</Label>
          <Input
            id="task-tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            onBlur={() =>
              updateTask(task.id, {
                tags: tagsInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="例: 仕事, 買い物"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>メモ（Markdown可）</Label>
        <MarkdownEditor
          value={description}
          onChange={(v) => {
            setDescription(v);
            debouncedUpdateTask({ description: v });
          }}
          minRows={24}
        />
      </div>
    </div>
  );
}
