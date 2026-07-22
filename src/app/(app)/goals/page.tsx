"use client";

import * as React from "react";
import { Plus, Target } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { GoalCard } from "@/components/goal/goal-card";
import { GoalFormDialog } from "@/components/goal/goal-form-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectFilter } from "@/components/multi-select-filter";
import { useAppStore } from "@/store/useAppStore";
import { PRIORITY_ORDER } from "@/types";
import type { GoalStatus } from "@/types";
import { GOAL_STATUS_LABEL } from "@/types";

type SortKey = "priority" | "targetDate" | "createdAt";

const STATUS_OPTIONS = Object.entries(GOAL_STATUS_LABEL).map(([value, label]) => ({ value, label }));

export default function GoalsPage() {
  const goals = useAppStore((s) => s.goals);
  const [statusFilter, setStatusFilter] = React.useState<GoalStatus[]>(["active"]);
  const [sortKey, setSortKey] = React.useState<SortKey>("priority");

  const filtered = goals
    .filter((g) => statusFilter.length === 0 || statusFilter.includes(g.status))
    .sort((a, b) => {
      if (sortKey === "priority") return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      if (sortKey === "targetDate") return (a.targetDate ?? "9999").localeCompare(b.targetDate ?? "9999");
      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <div>
      <PageHeader
        title="目標"
        description="今年、達成したいことを棚卸しする"
        action={
          <GoalFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                目標を追加
              </Button>
            }
          />
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <MultiSelectFilter label="状態" options={STATUS_OPTIONS} selected={statusFilter} onChange={(v) => setStatusFilter(v as GoalStatus[])} />
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">優先度順</SelectItem>
            <SelectItem value="targetDate">達成期限順</SelectItem>
            <SelectItem value="createdAt">作成日順</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={Target}
          title="目標がまだありません"
          description="今年達成したいことを1つ追加してみましょう"
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}
    </div>
  );
}
