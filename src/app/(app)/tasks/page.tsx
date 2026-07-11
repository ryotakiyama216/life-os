"use client";

import * as React from "react";
import { ArrowDownUp, ListTodo, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { TaskTableRow } from "@/components/task/task-table-row";
import { useAppStore } from "@/store/useAppStore";
import { PRIORITY_ORDER, TASK_STATUS_LABEL } from "@/types";
import type { Priority, TaskStatus } from "@/types";

type SortKey = "dueDate" | "priority" | "status" | "createdAt";

const ALL = "__all__";

export default function TasksPage() {
  const tasks = useAppStore((s) => s.tasks);
  const goals = useAppStore((s) => s.goals);
  const projects = useAppStore((s) => s.projects);

  const [statusFilter, setStatusFilter] = React.useState<TaskStatus | typeof ALL>(ALL);
  const [priorityFilter, setPriorityFilter] = React.useState<Priority | typeof ALL>(ALL);
  const [goalFilter, setGoalFilter] = React.useState<string>(ALL);
  const [projectFilter, setProjectFilter] = React.useState<string>(ALL);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("dueDate");
  const [sortAsc, setSortAsc] = React.useState(true);

  const filtered = tasks
    .filter((t) => statusFilter === ALL || t.status === statusFilter)
    .filter((t) => priorityFilter === ALL || t.priority === priorityFilter)
    .filter((t) => goalFilter === ALL || t.goalId === goalFilter)
    .filter((t) => projectFilter === ALL || t.projectId === projectFilter)
    .filter((t) => !search.trim() || t.title.toLowerCase().includes(search.trim().toLowerCase()))
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
        description="すべてのタスクを状態・優先度・期限・目標/プロジェクトで絞り込み"
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
          className="w-48"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | typeof ALL)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>すべての状態</SelectItem>
            {Object.entries(TASK_STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | typeof ALL)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>すべての優先度</SelectItem>
            <SelectItem value="P1">P1</SelectItem>
            <SelectItem value="P2">P2</SelectItem>
            <SelectItem value="P3">P3</SelectItem>
            <SelectItem value="P4">P4</SelectItem>
          </SelectContent>
        </Select>
        <Select value={goalFilter} onValueChange={setGoalFilter}>
          <SelectTrigger className="w-40">
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
          <SelectTrigger className="w-44">
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
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">期限日順</SelectItem>
            <SelectItem value="priority">優先度順</SelectItem>
            <SelectItem value="status">状態順</SelectItem>
            <SelectItem value="createdAt">作成日順</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => setSortAsc((v) => !v)} title="昇順/降順">
          <ArrowDownUp className="size-4" />
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListTodo} title="条件に合うタスクがありません" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
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
      )}
    </div>
  );
}
