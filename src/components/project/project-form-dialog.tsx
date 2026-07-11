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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarkdownEditor } from "@/components/markdown-editor";
import { useAppStore } from "@/store/useAppStore";
import type { Priority, Project, ProjectStatus } from "@/types";
import { PRIORITY_LABEL, PROJECT_STATUS_LABEL } from "@/types";

const NONE = "__none__";

export function ProjectFormDialog({
  project,
  initialTitle,
  defaultGoalId,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSaved,
}: {
  project?: Project;
  initialTitle?: string;
  defaultGoalId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (project: Project) => void;
}) {
  const isEdit = !!project;
  const goals = useAppStore((s) => s.goals);
  const addProject = useAppStore((s) => s.addProject);
  const updateProject = useAppStore((s) => s.updateProject);

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const [title, setTitle] = React.useState(project?.title ?? initialTitle ?? "");
  const [description, setDescription] = React.useState(project?.description ?? "");
  const [status, setStatus] = React.useState<ProjectStatus>(project?.status ?? "active");
  const [priority, setPriority] = React.useState<Priority>(project?.priority ?? "P3");
  const [goalId, setGoalId] = React.useState(project?.goalId ?? defaultGoalId ?? NONE);
  const [targetDate, setTargetDate] = React.useState(project?.targetDate ?? "");

  React.useEffect(() => {
    if (!open) return;
    setTitle(project?.title ?? initialTitle ?? "");
    setDescription(project?.description ?? "");
    setStatus(project?.status ?? "active");
    setPriority(project?.priority ?? "P3");
    setGoalId(project?.goalId ?? defaultGoalId ?? NONE);
    setTargetDate(project?.targetDate ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project]);

  async function handleSubmit() {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description,
      priority,
      goalId: goalId === NONE ? undefined : goalId,
      targetDate: targetDate || undefined,
    };
    try {
      if (isEdit) {
        await updateProject(project.id, { ...payload, status });
        toast.success("プロジェクトを更新しました");
        setOpen(false);
        onSaved?.(project);
      } else {
        const created = await addProject(payload);
        toast.success("プロジェクトを追加しました");
        setOpen(false);
        onSaved?.(created);
      }
    } catch {
      // ストア側でtoast.errorを表示済み
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "プロジェクトを編集" : "プロジェクトを追加"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="project-title">タイトル</Label>
            <Input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="目標を達成するための取り組み"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>紐づく目標</Label>
              <Select value={goalId} onValueChange={setGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder="なし" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>なし</SelectItem>
                  {goals.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isEdit && (
              <div className="space-y-1.5">
                <Label>状態</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div className="space-y-1.5">
              <Label htmlFor="project-target">目標達成日</Label>
              <Input
                id="project-target"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>詳細（Markdown）</Label>
            <MarkdownEditor value={description} onChange={setDescription} minRows={6} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {isEdit ? "更新する" : "追加する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
