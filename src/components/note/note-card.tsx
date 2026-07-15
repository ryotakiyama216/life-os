import Link from "next/link";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Note } from "@/types";
import { formatDateJP } from "@/lib/date";

const MAX_VISIBLE_TAGS = 3;

export function NoteCard({ note }: { note: Note }) {
  const preview = note.content.replace(/[#*_`>-]/g, "").trim().slice(0, 90);
  const visibleTags = note.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = note.tags.length - visibleTags.length;

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="flex h-full flex-col gap-2 p-4 transition-colors hover:bg-secondary/40">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <h3 className="line-clamp-1 text-sm font-medium">{note.title || "無題のメモ"}</h3>
        </div>
        <p className="line-clamp-2 min-h-[2.5em] flex-1 text-xs text-muted-foreground">
          {preview || "（内容はまだありません）"}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-muted-foreground">{formatDateJP(note.updatedAt)}更新</span>
          {visibleTags.map((t) => (
            <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              #{t}
            </span>
          ))}
          {hiddenTagCount > 0 && (
            <span className="text-[11px] text-muted-foreground">+{hiddenTagCount}</span>
          )}
        </div>
      </Card>
    </Link>
  );
}
