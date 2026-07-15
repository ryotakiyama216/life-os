"use client";

import * as React from "react";
import { toast } from "sonner";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkFormDialog } from "@/components/link/link-form-dialog";
import { useAppStore } from "@/store/useAppStore";
import type { LinkItem } from "@/types";

export function LinkRow({ link }: { link: LinkItem }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const removeLink = useAppStore((s) => s.removeLink);

  return (
    <Card className="flex items-center justify-between gap-3 p-3.5">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-center gap-2.5"
      >
        <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{link.title}</p>
          <p className="truncate text-xs text-muted-foreground">{link.url}</p>
        </div>
      </a>
      <div className="flex shrink-0 gap-1.5">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
          <Pencil className="size-3.5" />
          編集
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={async () => {
            try {
              await removeLink(link.id);
              toast("リンクを削除しました");
            } catch {
              // ストア側でtoast.errorを表示済み
            }
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <LinkFormDialog link={link} open={editOpen} onOpenChange={setEditOpen} />
    </Card>
  );
}
