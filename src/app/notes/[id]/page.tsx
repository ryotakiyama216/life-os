"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";

const NONE = "__none__";

export default function NoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const note = useAppStore((s) => s.notes.find((n) => n.id === params.id));
  const goals = useAppStore((s) => s.goals);
  const projects = useAppStore((s) => s.projects);
  const updateNote = useAppStore((s) => s.updateNote);
  const removeNote = useAppStore((s) => s.removeNote);

  const [tagsInput, setTagsInput] = React.useState(note?.tags.join(", ") ?? "");

  React.useEffect(() => {
    setTagsInput(note?.tags.join(", ") ?? "");
  }, [note?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!note) {
    return <EmptyState icon={FileText} title="メモが見つかりません" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1.5 px-2" onClick={() => router.push("/notes")}>
          <ArrowLeft className="size-4" />
          メモ一覧へ
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-red-600 hover:text-red-600"
          onClick={() => {
            removeNote(note.id);
            toast("メモを削除しました");
            router.push("/notes");
          }}
        >
          <Trash2 className="size-3.5" />
          削除
        </Button>
      </div>

      <Input
        value={note.title}
        onChange={(e) => updateNote(note.id, { title: e.target.value })}
        placeholder="無題のメモ"
        className="border-none px-0 text-xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>関連する目標</Label>
          <Select
            value={note.linkedGoalId ?? NONE}
            onValueChange={(v) => updateNote(note.id, { linkedGoalId: v === NONE ? undefined : v })}
          >
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
        <div className="space-y-1.5">
          <Label>関連するプロジェクト</Label>
          <Select
            value={note.linkedProjectId ?? NONE}
            onValueChange={(v) => updateNote(note.id, { linkedProjectId: v === NONE ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="なし" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>なし</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>タグ（カンマ区切り）</Label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            onBlur={() =>
              updateNote(note.id, {
                tags: tagsInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="例: 読書, アイデア"
          />
        </div>
      </div>

      <MarkdownEditor
        value={note.content}
        onChange={(v) => updateNote(note.id, { content: v })}
        minRows={16}
      />
    </div>
  );
}
