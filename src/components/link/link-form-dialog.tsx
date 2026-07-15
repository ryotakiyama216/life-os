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
import { useAppStore } from "@/store/useAppStore";
import type { LinkItem } from "@/types";

const SUGGESTED_CATEGORIES = ["メール", "Meet", "Slack", "その他"];

export function LinkFormDialog({
  link,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  link?: LinkItem;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isEdit = !!link;
  const links = useAppStore((s) => s.links);
  const addLink = useAppStore((s) => s.addLink);
  const updateLink = useAppStore((s) => s.updateLink);

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const [title, setTitle] = React.useState(link?.title ?? "");
  const [url, setUrl] = React.useState(link?.url ?? "");
  const [category, setCategory] = React.useState(link?.category ?? "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(link?.title ?? "");
    setUrl(link?.url ?? "");
    setCategory(link?.category ?? "");
    setIsSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, link]);

  const categoryOptions = Array.from(
    new Set([...SUGGESTED_CATEGORIES, ...links.map((l) => l.category).filter(Boolean)])
  );

  async function handleSubmit() {
    if (!title.trim() || !url.trim() || isSubmitting) return;
    const payload = {
      title: title.trim(),
      url: url.trim(),
      category: category.trim(),
    };
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateLink(link.id, payload);
        toast.success("リンクを更新しました");
      } else {
        await addLink(payload);
        toast.success("リンクを追加しました");
      }
      setOpen(false);
    } catch {
      // ストア側でtoast.errorを表示済み
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "リンクを編集" : "リンクを追加"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="link-title">タイトル</Label>
            <Input
              id="link-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 週次定例Meet"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="link-category">カテゴリ</Label>
            <Input
              id="link-category"
              list="link-category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="例: メール、Meet"
            />
            <datalist id="link-category-options">
              {categoryOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !url.trim() || isSubmitting}>
            {isEdit ? "更新する" : "追加する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
