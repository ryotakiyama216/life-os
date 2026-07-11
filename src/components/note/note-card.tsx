import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Note } from "@/types";
import { formatDateJP } from "@/lib/date";

export function NoteCard({ note }: { note: Note }) {
  const preview = note.content.replace(/[#*_`>-]/g, "").trim().slice(0, 90);
  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="space-y-1.5 p-4 transition-colors hover:bg-secondary/40">
        <h3 className="text-sm font-medium">{note.title || "無題のメモ"}</h3>
        {preview && <p className="text-xs text-muted-foreground">{preview}</p>}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-muted-foreground">{formatDateJP(note.updatedAt)}更新</span>
          {note.tags.map((t) => (
            <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
      </Card>
    </Link>
  );
}
