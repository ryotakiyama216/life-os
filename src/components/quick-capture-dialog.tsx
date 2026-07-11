"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/useAppStore";

export function QuickCaptureDialog() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const addInboxItem = useAppStore((s) => s.addInboxItem);

  function handleSubmit() {
    const content = value.trim();
    if (!content) return;
    addInboxItem(content);
    setValue("");
    setOpen(false);
    toast.success("Inboxに追加しました");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          クイックキャプチャ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>クイックキャプチャ</DialogTitle>
          <DialogDescription>
            思いついたことをそのままInboxへ。あとで仕分けすればOK。
          </DialogDescription>
        </DialogHeader>
        <Textarea
          autoFocus
          placeholder="やること、気になること、アイデア..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          rows={4}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!value.trim()}>
            Inboxへ追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
