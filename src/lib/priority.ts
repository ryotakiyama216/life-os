import type { Goal, Priority, Project, Task } from "@/types";
import { PRIORITY_ORDER } from "@/types";
import { daysFromToday, isOverdue, isToday } from "@/lib/date";

function priorityWeight(p: Priority): number {
  return PRIORITY_ORDER[p]; // P1=4 ... P4=1
}

export function isOpenTask(task: Task): boolean {
  return task.status !== "done" && task.status !== "someday";
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => isOpenTask(t) && t.dueDate && isOverdue(t.dueDate))
    .sort((a, b) => daysFromToday(a.dueDate!) - daysFromToday(b.dueDate!));
}

export function getTodayTasks(tasks: Task[]): Task[] {
  return tasks
    .filter(
      (t) =>
        isOpenTask(t) &&
        !(t.dueDate && isOverdue(t.dueDate)) &&
        (isToday(t.dueDate) || isToday(t.scheduledDate))
    )
    .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
}

/**
 * 日付未設定でも「今やるべき」候補として提示するための優先スコア。
 * 目標→プロジェクト→タスクの優先度を合成し、緊急度(期限)がない領域でも
 * 重要な目標に紐づくタスクが自然と上位に来るようにする。
 */
export function focusScore(
  task: Task,
  goalsById: Map<string, Goal>,
  projectsById: Map<string, Project>
): number {
  let score = priorityWeight(task.priority) * 10;

  const project = task.projectId ? projectsById.get(task.projectId) : undefined;
  if (project) score += priorityWeight(project.priority) * 5;

  const goalId = task.goalId ?? project?.goalId;
  const goal = goalId ? goalsById.get(goalId) : undefined;
  if (goal) score += priorityWeight(goal.priority) * 5;

  if (task.dueDate) {
    const days = daysFromToday(task.dueDate);
    if (days < 0) score += 1000 + Math.abs(days) * 10; // 期限切れは最優先
    else if (days === 0) score += 500;
    else score += Math.max(0, 60 - days * 5); // 近い将来ほど加点
  }
  if (task.scheduledDate && isToday(task.scheduledDate)) score += 400;

  return score;
}

/** 日付未設定・未着手のタスクから「今やるべき」候補を上位N件出す */
export function getFocusSuggestions(
  tasks: Task[],
  goals: Goal[],
  projects: Project[],
  limit = 5
): Task[] {
  const goalsById = new Map(goals.map((g) => [g.id, g]));
  const projectsById = new Map(projects.map((p) => [p.id, p]));

  return tasks
    .filter(
      (t) =>
        isOpenTask(t) &&
        !isToday(t.dueDate) &&
        !isToday(t.scheduledDate) &&
        !(t.dueDate && isOverdue(t.dueDate))
    )
    .map((t) => ({ task: t, score: focusScore(t, goalsById, projectsById) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.task);
}

export function sortByPriorityDesc<T extends { priority: Priority }>(items: T[]): T[] {
  return [...items].sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
}
