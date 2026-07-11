"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  CheckSquare,
  FolderKanban,
  Target,
  Repeat,
  FileText,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { GoalFormDialog } from "@/components/goal/goal-form-dialog";
import { ProjectFormDialog } from "@/components/project/project-form-dialog";
import { HabitFormDialog } from "@/components/habit/habit-form-dialog";
import { useAppStore } from "@/store/useAppStore";
import type { InboxItem } from "@/types";
import { formatDateTimeJP } from "@/lib/date";

type DialogKind = "task" | "goal" | "project" | "habit" | null;

export function InboxItemRow({ item }: { item: InboxItem }) {
  const [dialogKind, setDialogKind] = React.useState<DialogKind>(null);
  const removeInboxItem = useAppStore((s) => s.removeInboxItem);
  const addNote = useAppStore((s) => s.addNote);
  const addTask = useAppStore((s) => s.addTask);

  async function finish() {
    try {
      await removeInboxItem(item.id);
    } catch {
      // ストア側でtoast.errorを表示済み
    }
  }

  async function makeSomeday() {
    try {
      await addTask({ title: item.content, status: "someday" });
      toast.success("「いつか/たぶん」リストへ移動しました");
      await finish();
    } catch {
      // ストア側でtoast.errorを表示済み
    }
  }

  async function makeNote() {
    try {
      const firstLine = item.content.split("\n")[0].slice(0, 60) || "無題のメモ";
      await addNote({ title: firstLine, content: item.content, type: "note" });
      toast.success("ページ・メモに追加しました");
      await finish();
    } catch {
      // ストア側でtoast.errorを表示済み
    }
  }

  return (
    <Card className="flex items-start justify-between gap-3 p-3">
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap text-sm">{item.content}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatDateTimeJP(item.createdAt)}</p>
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDialogKind("task")}>
          <CheckSquare className="size-3.5" />
          タスク
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDialogKind("project")}>
          <FolderKanban className="size-3.5" />
          プロジェクト
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDialogKind("goal")}>
          <Target className="size-3.5" />
          目標
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDialogKind("habit")}>
          <Repeat className="size-3.5" />
          習慣
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={makeNote}>
          <FileText className="size-3.5" />
          メモ
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={makeSomeday}>
          <Clock className="size-3.5" />
          いつか
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={async () => {
            try {
              await removeInboxItem(item.id);
              toast("削除しました");
            } catch {
              // ストア側でtoast.errorを表示済み
            }
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <TaskFormDialog
        open={dialogKind === "task"}
        onOpenChange={(o) => !o && setDialogKind(null)}
        initialTitle={item.content}
        onSaved={finish}
      />
      <GoalFormDialog
        open={dialogKind === "goal"}
        onOpenChange={(o) => !o && setDialogKind(null)}
        initialTitle={item.content}
        onSaved={finish}
      />
      <ProjectFormDialog
        open={dialogKind === "project"}
        onOpenChange={(o) => !o && setDialogKind(null)}
        initialTitle={item.content}
        onSaved={finish}
      />
      <HabitFormDialog
        open={dialogKind === "habit"}
        onOpenChange={(o) => !o && setDialogKind(null)}
        initialTitle={item.content}
        onSaved={finish}
      />
    </Card>
  );
}
