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
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/lib/date";
import type { Event } from "@/types";

export function EventFormDialog({
  event,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSaved,
}: {
  event?: Event;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (event: Event) => void;
}) {
  const isEdit = !!event;
  const addEvent = useAppStore((s) => s.addEvent);
  const updateEvent = useAppStore((s) => s.updateEvent);

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const [title, setTitle] = React.useState(event?.title ?? "");
  const [date, setDate] = React.useState(event?.date ?? todayISO());
  const [time, setTime] = React.useState(event?.time ?? "");
  const [location, setLocation] = React.useState(event?.location ?? "");
  const [notes, setNotes] = React.useState(event?.notes ?? "");

  React.useEffect(() => {
    if (!open) return;
    setTitle(event?.title ?? "");
    setDate(event?.date ?? todayISO());
    setTime(event?.time ?? "");
    setLocation(event?.location ?? "");
    setNotes(event?.notes ?? "");
  }, [open, event]);

  async function handleSubmit() {
    if (!title.trim() || !date) return;
    const payload = {
      title: title.trim(),
      date,
      time: time || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    try {
      if (isEdit) {
        await updateEvent(event.id, payload);
        toast.success("予定を更新しました");
        setOpen(false);
        onSaved?.(event);
      } else {
        const created = await addEvent(payload);
        toast.success("予定を追加しました");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "予定を編集" : "予定を追加"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="event-title">タイトル</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 通院、美容室"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-date">日付</Label>
              <Input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-time">時刻（任意）</Label>
              <Input id="event-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-location">場所（任意）</Label>
            <Input
              id="event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例: ○○クリニック"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-notes">メモ（任意）</Label>
            <Textarea
              id="event-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !date}>
            {isEdit ? "更新する" : "追加する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
