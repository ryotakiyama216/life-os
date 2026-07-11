"use client";

import * as React from "react";
import { FolderKanban, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectFormDialog } from "@/components/project/project-form-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { PRIORITY_ORDER } from "@/types";
import type { ProjectStatus } from "@/types";
import { PROJECT_STATUS_LABEL } from "@/types";

type SortKey = "priority" | "targetDate" | "createdAt";

export default function ProjectsPage() {
  const projects = useAppStore((s) => s.projects);
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | "all">("active");
  const [sortKey, setSortKey] = React.useState<SortKey>("priority");

  const filtered = projects
    .filter((p) => statusFilter === "all" || p.status === statusFilter)
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
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProjectStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての状態</SelectItem>
            {Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-44">
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
