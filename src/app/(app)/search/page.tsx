"use client";

import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskItem } from "@/components/task/task-item";
import { useAppStore } from "@/store/useAppStore";

const ALL = "__all__";

export default function SearchPage() {
  const tasks = useAppStore((s) => s.tasks);
  const [activeTag, setActiveTag] = React.useState(ALL);

  const tags = Array.from(new Set(tasks.flatMap((t) => t.tags))).sort();
  const filtered = activeTag === ALL ? tasks : tasks.filter((t) => t.tags.includes(activeTag));

  return (
    <div>
      <PageHeader title="検索" description="タグでタスクを絞り込む" />

      {tags.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="タグが付いたタスクがまだありません"
          description="タスクにタグを付けると、ここでタグ別に絞り込めるようになります"
        />
      ) : (
        <Tabs value={activeTag} onValueChange={setActiveTag}>
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value={ALL}>すべて</TabsTrigger>
            {tags.map((tag) => (
              <TabsTrigger key={tag} value={tag}>
                #{tag}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTag} className="mt-0">
            {filtered.length === 0 ? (
              <EmptyState icon={SearchIcon} title="該当するタスクがありません" />
            ) : (
              <div className="space-y-2">
                {filtered.map((t) => (
                  <TaskItem key={t.id} task={t} showProjectGoal />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
