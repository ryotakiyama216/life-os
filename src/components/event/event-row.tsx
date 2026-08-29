"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventFormDialog } from "@/components/event/event-form-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useAppStore } from "@/store/useAppStore";
import { formatDateFullJP } from "@/lib/date";
import type { Event } from "@/types";

export function EventRow({ event }: { event: Event }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const removeEvent = useAppStore((s) => s.removeEvent);

  return (
    <Card className="flex items-center justify-between gap-3 p-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{event.title}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatDateFullJP(event.date)}</span>
          {event.time && <span>{event.time}</span>}
          {event.location && <span>{event.location}</span>}
        </div>
        {event.notes && <p className="mt-1 text-xs text-muted-foreground">{event.notes}</p>}
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
          <Pencil className="size-3.5" />
          編集
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label="予定を削除"
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <EventFormDialog event={event} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="予定を削除しますか？"
        description={`「${event.title}」を削除します。この操作は取り消せません。`}
        onConfirm={() => {
          removeEvent(event.id);
          toast("予定を削除しました");
          setConfirmDeleteOpen(false);
        }}
      />
    </Card>
  );
}
