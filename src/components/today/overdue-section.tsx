"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { getOverdueTasks } from "@/lib/priority";
import { OverdueTaskItem } from "@/components/task/overdue-task-item";

export function OverdueSection() {
  const tasks = useAppStore((s) => s.tasks);
  const overdue = getOverdueTasks(tasks);
  const [open, setOpen] = React.useState(false);

  if (overdue.length === 0) return null;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-start gap-2 border-red-200 bg-red-50/50 text-red-700 hover:bg-red-100/50 hover:text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        <AlertTriangle className="size-4 shrink-0" />
        期限切れ・先送り（{overdue.length}件）
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="size-4" />
              期限切れ・先送り（{overdue.length}件）
            </DialogTitle>
            <DialogDescription>今日中に片付けるか、延期・削除を判断しましょう</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {overdue.map((t) => (
              <OverdueTaskItem key={t.id} task={t} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
