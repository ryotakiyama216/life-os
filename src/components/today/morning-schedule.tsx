"use client";

import * as React from "react";
import { Plus, Trash2, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";

export function MorningSchedule() {
  const today = todayISO();
  const allBlocks = useAppStore((s) => s.morningBlocks);
  const blocks = allBlocks.filter((b) => b.date === today);
  const addMorningBlock = useAppStore((s) => s.addMorningBlock);
  const removeMorningBlock = useAppStore((s) => s.removeMorningBlock);
  const toggleMorningBlockDone = useAppStore((s) => s.toggleMorningBlockDone);

  const [time, setTime] = React.useState("06:00");
  const [title, setTitle] = React.useState("");

  function handleAdd() {
    if (!title.trim()) return;
    addMorningBlock({ date: today, time, title: title.trim() });
    setTitle("");
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sunrise className="size-4" />
          今日の時間割
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {blocks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            まだブロックがありません。最高の1日にする朝のスケジュールを組み立てましょう。
          </p>
        )}
        <ul className="space-y-1.5">
          {blocks.map((b) => (
            <li
              key={b.id}
              className="flex items-center gap-2.5 rounded-md border px-2.5 py-1.5"
            >
              <Checkbox checked={b.done} onCheckedChange={() => toggleMorningBlockDone(b.id)} />
              <span className="w-12 shrink-0 text-xs tabular-nums text-muted-foreground">
                {b.time}
              </span>
              <span className={cn("flex-1 text-sm", b.done && "text-muted-foreground line-through")}>
                {b.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0"
                onClick={() => removeMorningBlock(b.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-1.5 pt-1">
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-24 shrink-0"
          />
          <Input
            placeholder="例: 運動、読書、朝食..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button variant="outline" size="icon" onClick={handleAdd} disabled={!title.trim()}>
            <Plus className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
