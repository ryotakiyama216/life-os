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
import type { Goal, GoalStatus, Priority } from "@/types";
import { GOAL_STATUS_LABEL, PRIORITY_LABEL } from "@/types";

export function GoalFormDialog({
  goal,
  initialTitle,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSaved,
}: {
  goal?: Goal;
  initialTitle?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (goal: Goal) => void;
}) {
  const isEdit = !!goal;
  const addGoal = useAppStore((s) => s.addGoal);
  const updateGoal = useAppStore((s) => s.updateGoal);

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const [title, setTitle] = React.useState(goal?.title ?? initialTitle ?? "");
  const [description, setDescription] = React.useState(goal?.description ?? "");
  const [status, setStatus] = React.useState<GoalStatus>(goal?.status ?? "active");
  const [priority, setPriority] = React.useState<Priority>(goal?.priority ?? "P2");
  const [targetDate, setTargetDate] = React.useState(goal?.targetDate ?? "");

  React.useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? initialTitle ?? "");
    setDescription(goal?.description ?? "");
    setStatus(goal?.status ?? "active");
    setPriority(goal?.priority ?? "P2");
    setTargetDate(goal?.targetDate ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, goal]);

  async function handleSubmit() {
    if (!title.trim()) return;
    try {
      if (isEdit) {
        await updateGoal(goal.id, {
          title: title.trim(),
          description,
          status,
          priority,
          targetDate: targetDate || undefined,
        });
        toast.success("目標を更新しました");
        setOpen(false);
        onSaved?.(goal);
      } else {
        const created = await addGoal({
          title: title.trim(),
          description,
          priority,
          targetDate: targetDate || undefined,
        });
        toast.success("目標を追加しました");
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
          <DialogTitle>{isEdit ? "目標を編集" : "目標を追加"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">タイトル</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="今年、何を達成したい？"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {isEdit && (
              <div className="space-y-1.5">
                <Label>状態</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOAL_STATUS_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              <Label htmlFor="goal-target">目標達成日</Label>
              <Input
                id="goal-target"
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
