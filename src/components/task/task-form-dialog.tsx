"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import type { Priority, Task, TaskStatus } from "@/types";
import { PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/types";
import { todayISO } from "@/lib/date";
import { getGoalSelectOptions, getProjectSelectOptions } from "@/lib/task-links";

const NONE = "__none__";

export function TaskFormDialog({
  task,
  initialTitle,
  defaultProjectId,
  defaultGoalId,
  defaultDueDate,
  defaultScheduledDate,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSaved,
}: {
  task?: Task;
  initialTitle?: string;
  defaultProjectId?: string;
  defaultGoalId?: string;
  defaultDueDate?: string;
  defaultScheduledDate?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (task: Task) => void;
}) {
  const isEdit = !!task;
  const goals = useAppStore((s) => s.goals);
  const projects = useAppStore((s) => s.projects);
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const [title, setTitle] = React.useState(task?.title ?? initialTitle ?? "");
  const [description, setDescription] = React.useState(task?.description ?? "");
  const [status, setStatus] = React.useState<TaskStatus>(task?.status ?? "todo");
  const [priority, setPriority] = React.useState<Priority>(task?.priority ?? "P3");
  const [dueDate, setDueDate] = React.useState(task?.dueDate ?? defaultDueDate ?? "");
  const [scheduledDate, setScheduledDate] = React.useState(
    task?.scheduledDate ?? defaultScheduledDate ?? ""
  );
  const [goalId, setGoalId] = React.useState(task?.goalId ?? defaultGoalId ?? NONE);
  const [projectId, setProjectId] = React.useState(task?.projectId ?? defaultProjectId ?? NONE);
  const [tags, setTags] = React.useState(task?.tags?.join(", ") ?? "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? initialTitle ?? "");
    setDescription(task?.description ?? "");
    setStatus(task?.status ?? "todo");
    setPriority(task?.priority ?? "P3");
    setDueDate(task?.dueDate ?? defaultDueDate ?? "");
    setScheduledDate(task?.scheduledDate ?? defaultScheduledDate ?? "");
    setGoalId(task?.goalId ?? defaultGoalId ?? NONE);
    setProjectId(task?.projectId ?? defaultProjectId ?? NONE);
    setTags(task?.tags?.join(", ") ?? "");
    setIsSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task]);

  async function handleSubmit() {
    if (!title.trim() || isSubmitting) return;
    if (dueDate && scheduledDate && dueDate < scheduledDate) {
      toast.error("期限日は実施予定日より前に設定できません");
      return;
    }
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      title: title.trim(),
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
      scheduledDate: scheduledDate || undefined,
      goalId: goalId === NONE ? undefined : goalId,
      projectId: projectId === NONE ? undefined : projectId,
      tags: parsedTags,
    };
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateTask(task.id, payload);
        toast.success("タスクを更新しました");
        setOpen(false);
        onSaved?.(task);
      } else {
        const created = await addTask(payload);
        toast.success("タスクを追加しました");
        setOpen(false);
        onSaved?.(created);
      }
    } catch {
      // ストア側でtoast.errorを表示済み。ダイアログは開いたままにする
    } finally {
      setIsSubmitting(false);
    }
  }

  // プロジェクトを選ぶと、そのプロジェクトの目標にタスクの目標が一意に決まる
  // （タスクが独立して別の目標を持つことはできない）。プロジェクト未設定の時だけ目標を自由選択できる。
  function handleProjectChange(value: string) {
    setProjectId(value);
    if (value === NONE) return;
    const selected = projects.find((p) => p.id === value);
    setGoalId(selected?.goalId ?? NONE);
  }

  const goalOptions = getGoalSelectOptions(goals, projects, projectId === NONE ? undefined : projectId);
  const projectOptions = getProjectSelectOptions(projects, goalId === NONE ? undefined : goalId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "タスクを編集" : "タスクを追加"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">タイトル</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="何をする？"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">メモ（Markdown可）</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>状態</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
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
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-due">期限日</Label>
              <Input
                id="task-due"
                type="date"
                min={scheduledDate || undefined}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduledDate(todayISO())}
                >
                  今日
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>目標</Label>
              <Select value={goalId} onValueChange={setGoalId}>
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
              <Select value={projectId} onValueChange={handleProjectChange}>
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-tags">タグ（カンマ区切り）</Label>
            <Input
              id="task-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例: 仕事, 買い物"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isSubmitting}>
            {isEdit ? "更新する" : "追加する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
