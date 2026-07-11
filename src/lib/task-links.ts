import type { Goal, Project } from "@/types";

/**
 * タスクの「目標」プルダウンに出す選択肢を、現在選択中のプロジェクトから絞り込む。
 * プロジェクトが選ばれている場合、そのプロジェクトが属する目標が唯一の選択肢になる
 * （プロジェクトが目標に属していない場合は「なし」のみ）。
 * プロジェクト未選択なら全目標から自由に選べる。
 */
export function getGoalSelectOptions(
  goals: Goal[],
  projects: Project[],
  projectId: string | undefined
): { goals: Goal[]; allowNone: boolean } {
  if (!projectId) return { goals, allowNone: true };
  const project = projects.find((p) => p.id === projectId);
  if (!project?.goalId) return { goals: [], allowNone: true };
  const goal = goals.find((g) => g.id === project.goalId);
  return { goals: goal ? [goal] : [], allowNone: false };
}

/**
 * タスクの「プロジェクト」プルダウンに出す選択肢を、現在選択中の目標から絞り込む。
 * 目標が選ばれている場合、その目標に属するプロジェクトのみを選択肢にする（「なし」は常に選べる）。
 * 目標未選択なら全プロジェクトから自由に選べる。
 */
export function getProjectSelectOptions(projects: Project[], goalId: string | undefined): Project[] {
  if (!goalId) return projects;
  return projects.filter((p) => p.goalId === goalId);
}
