"use client";

import * as React from "react";
import { ArrowDownUp, ListTodo, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MultiSelectFilter } from "@/components/multi-select-filter";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { TaskTableRow } from "@/components/task/task-table-row";
import { useAppStore } from "@/store/useAppStore";
import { PRIORITY_ORDER, TASK_STATUS_LABEL } from "@/types";
import type { Priority, TaskStatus } from "@/types";

type SortKey = "dueDate" | "priority" | "status" | "createdAt";

const ALL = "__all__";

const STATUS_OPTIONS = Object.entries(TASK_STATUS_LABEL).map(([value, label]) => ({ value, label }));
const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
  { value: "P3", label: "P3" },
  { value: "P4", label: "P4" },
];

export default function TasksPage() {
  const tasks = useAppStore((s) => s.tasks);
  const goals = useAppStore((s) => s.goals);
  const projects = useAppStore((s) => s.projects);

  const [statusFilter, setStatusFilter] = React.useState<TaskStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = React.useState<Priority[]>([]);
  const [tagFilter, setTagFilter] = React.useState<string[]>([]);
  const [goalFilter, setGoalFilter] = React.useState<string>(ALL);
  const [projectFilter, setProjectFilter] = React.useState<string>(ALL);
  const [search, setSearch] = React.useState("");
  const [dueFrom, setDueFrom] = React.useState("");
  const [dueTo, setDueTo] = React.useState("");
  const [scheduledFrom, setScheduledFrom] = React.useState("");
  const [scheduledTo, setScheduledTo] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("dueDate");
  const [sortAsc, setSortAsc] = React.useState(true);

  const tagOptions = React.useMemo(() => {
    const tags = new Set<string>();
    for (const t of tasks) for (const tag of t.tags) tags.add(tag);
    return Array.from(tags)
      .sort()
      .map((tag) => ({ value: tag, label: `#${tag}` }));
  }, [tasks]);

  const filtered = tasks
    .filter((t) => statusFilter.length === 0 || statusFilter.includes(t.status))
    .filter((t) => priorityFilter.length === 0 || priorityFilter.includes(t.priority))
    .filter((t) => tagFilter.length === 0 || t.tags.some((tag) => tagFilter.includes(tag)))
    .filter((t) => goalFilter === ALL || t.goalId === goalFilter)
    .filter((t) => projectFilter === ALL || t.projectId === projectFilter)
    .filter((t) => !search.trim() || t.title.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((t) => !dueFrom || (t.dueDate && t.dueDate >= dueFrom))
    .filter((t) => !dueTo || (t.dueDate && t.dueDate <= dueTo))
    .filter((t) => !scheduledFrom || (t.scheduledDate && t.scheduledDate >= scheduledFrom))
    .filter((t) => !scheduledTo || (t.scheduledDate && t.scheduledDate <= scheduledTo))
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "dueDate") cmp = (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
      else if (sortKey === "priority") cmp = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else cmp = b.createdAt.localeCompare(a.createdAt);
      return sortAsc ? cmp : -cmp;
    });

  return (
    <div>
      <PageHeader
        title="タスク"
        description="すべてのタスクを状態・優先度・タグ・期限・目標/プロジェクトで絞り込み"
        action={
          <TaskFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                タスクを追加
              </Button>
            }
          />
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="タイトルで検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-48"
        />
        <MultiSelectFilter label="状態" options={STATUS_OPTIONS} selected={statusFilter} onChange={(v) => setStatusFilter(v as TaskStatus[])} />
        <MultiSelectFilter label="優先度" options={PRIORITY_OPTIONS} selected={priorityFilter} onChange={(v) => setPriorityFilter(v as Priority[])} />
        {tagOptions.length > 0 && (
          <MultiSelectFilter label="タグ" options={tagOptions} selected={tagFilter} onChange={setTagFilter} />
        )}
        <Select value={goalFilter} onValueChange={setGoalFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="すべての目標" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>すべての目標</SelectItem>
            {goals.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="すべてのプロジェクト" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>すべてのプロジェクト</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">期限日順</SelectItem>
            <SelectItem value="priority">優先度順</SelectItem>
            <SelectItem value="status">状態順</SelectItem>
            <SelectItem value="createdAt">作成日順</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => setSortAsc((v) => !v)} title="昇順/降順" className="shrink-0">
          <ArrowDownUp className="size-4" />
        </Button>
      </div>
      <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-muted-foreground">期限</Label>
          <Input type="date" value={dueFrom} onChange={(e) => setDueFrom(e.target.value)} className="h-8 w-36 text-sm" />
          <span className="text-xs text-muted-foreground">〜</span>
          <Input type="date" value={dueTo} onChange={(e) => setDueTo(e.target.value)} className="h-8 w-36 text-sm" />
        </div>
        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-muted-foreground">予定日</Label>
          <Input
            type="date"
            value={scheduledFrom}
            onChange={(e) => setScheduledFrom(e.target.value)}
            className="h-8 w-36 text-sm"
          />
          <span className="text-xs text-muted-foreground">〜</span>
          <Input type="date" value={scheduledTo} onChange={(e) => setScheduledTo(e.target.value)} className="h-8 w-36 text-sm" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListTodo} title="条件に合うタスクがありません" />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>優先度</TableHead>
                <TableHead>期限</TableHead>
                <TableHead>予定日</TableHead>
                <TableHead>目標</TableHead>
                <TableHead>プロジェクト</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TaskTableRow key={t.id} task={t} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
