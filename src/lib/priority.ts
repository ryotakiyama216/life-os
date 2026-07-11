import { addDays, format } from "date-fns";
import type { Goal, Priority, Project, Task } from "@/types";
import { PRIORITY_ORDER } from "@/types";
import { daysFromToday, isOverdue, isToday, todayISO } from "@/lib/date";

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
    .filter((t) => isOpenTask(t) && (isToday(t.dueDate) || isToday(t.scheduledDate)))
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
  if (task.scheduledDate && isOverdue(task.scheduledDate)) {
    // 予定日を過ぎても未完了＝先送りされている。再度「今日やるか」判断してほしいので高めに加点
    score += 800 + Math.abs(daysFromToday(task.scheduledDate)) * 10;
  }

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
        // 実施予定日が「今日以降」で決まっているタスクだけ候補から除外する。
        // 予定日が過去（先送りされたまま未完了）のタスクは、再度判断が必要なので候補に残す。
        !(t.scheduledDate && !isOverdue(t.scheduledDate)) &&
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

/**
 * 「明日に延期」の更新内容を計算する。期限日は常に明日にする。
 * 実施予定日が今日以前（今日/期限切れ）に設定されている場合は、
 * それも明日に押し出さないと「今日やること」に残り続けてしまうため一緒に動かす。
 * 予定日が既に未来に設定されている場合はそのまま触らない。
 */
export function getPostponeToTomorrowPatch(
  task: Task
): { dueDate: string; scheduledDate?: string } {
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const patch: { dueDate: string; scheduledDate?: string } = { dueDate: tomorrow };
  if (task.scheduledDate && task.scheduledDate <= todayISO()) {
    patch.scheduledDate = tomorrow;
  }
  return patch;
}
