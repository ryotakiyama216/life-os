"use client";

import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/note/note-card";
import { useAppStore } from "@/store/useAppStore";

export default function NotesPage() {
  const router = useRouter();
  const notes = useAppStore((s) => s.notes);
  const addNote = useAppStore((s) => s.addNote);

  function handleCreate() {
    const note = addNote({ title: "無題のメモ", content: "" });
    router.push(`/notes/${note.id}`);
  }

  return (
    <div>
      <PageHeader
        title="ページ・メモ"
        description="Markdownで自由に書けるメモ・ページ"
        action={
          <Button size="sm" className="gap-1.5" onClick={handleCreate}>
            <Plus className="size-4" />
            新規メモ
          </Button>
        }
      />
      {notes.length === 0 ? (
        <EmptyState icon={FileText} title="メモがまだありません" description="新規メモから書き始めましょう" />
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      )}
    </div>
  );
}
