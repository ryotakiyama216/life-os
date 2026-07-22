"use client";

import * as React from "react";
import { FolderKanban, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectFormDialog } from "@/components/project/project-form-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectFilter } from "@/components/multi-select-filter";
import { useAppStore } from "@/store/useAppStore";
import { PRIORITY_ORDER } from "@/types";
import type { ProjectStatus } from "@/types";
import { PROJECT_STATUS_LABEL } from "@/types";

type SortKey = "priority" | "targetDate" | "createdAt";

const STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => ({ value, label }));

export default function ProjectsPage() {
  const projects = useAppStore((s) => s.projects);
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus[]>(["active"]);
  const [sortKey, setSortKey] = React.useState<SortKey>("priority");

  const filtered = projects
    .filter((p) => statusFilter.length === 0 || statusFilter.includes(p.status))
    .sort((a, b) => {
      if (sortKey === "priority") return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      if (sortKey === "targetDate") return (a.targetDate ?? "9999").localeCompare(b.targetDate ?? "9999");
      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <div>
      <PageHeader
        title="プロジェクト"
        description="目標を達成するための取り組み"
        action={
          <ProjectFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                プロジェクトを追加
              </Button>
            }
          />
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <MultiSelectFilter label="状態" options={STATUS_OPTIONS} selected={statusFilter} onChange={(v) => setStatusFilter(v as ProjectStatus[])} />
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">優先度順</SelectItem>
            <SelectItem value="targetDate">期限順</SelectItem>
            <SelectItem value="createdAt">作成日順</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="プロジェクトがまだありません"
          description="目標から逆算して、必要な取り組みを追加しましょう"
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
