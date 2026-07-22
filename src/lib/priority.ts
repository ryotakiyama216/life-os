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

/** 期限日・実施予定日のうち、超過している方の日数（マイナスが大きいほど超過が長い）を返す */
function worstOverdueDays(task: Task): number {
  const days: number[] = [];
  if (task.dueDate && isOverdue(task.dueDate)) days.push(daysFromToday(task.dueDate));
  if (task.scheduledDate && isOverdue(task.scheduledDate)) days.push(daysFromToday(task.scheduledDate));
  return Math.min(...days);
}

/**
 * 期限日(dueDate)または実施予定日(scheduledDate)のどちらかが今日より前になっている
 * 未完了タスクをすべて返す。以前は予定日超過のみのタスクがFocusSuggestionsの
 * 上位5件枠に運良く入らないと表示されない「くじ引き」状態になっていたため、
 * ここで確実に拾い上げるようにしている。
 */
export function getOverdueTasks(tasks: Task[]): Task[] {
  return tasks
    .filter(
      (t) =>
        isOpenTask(t) &&
        ((t.dueDate && isOverdue(t.dueDate)) || (t.scheduledDate && isOverdue(t.scheduledDate)))
    )
    .sort((a, b) => worstOverdueDays(a) - worstOverdueDays(b));
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
        // 実施予定日が決まっているタスクは、今日やること/期限切れ・先送りの
        // いずれかのセクションで確実に表示されるため候補から除外する。
        !t.scheduledDate &&
        !(t.dueDate && (isToday(t.dueDate) || isOverdue(t.dueDate)))
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
