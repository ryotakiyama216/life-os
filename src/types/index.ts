// 将来のSupabaseスキーマと1:1になるように設計したドメイン型。
// 今はZustand + localStorageで永続化するが、DB接続時はこの型定義をほぼそのまま
// テーブル定義（スネークケース化）に流用する想定。

export type Priority = "P1" | "P2" | "P3" | "P4";

export type GoalStatus = "active" | "done" | "archived";
export type ProjectStatus = "active" | "on_hold" | "done" | "archived";
export type TaskStatus = "todo" | "in_progress" | "done" | "someday" | "waiting";

export type HabitFrequency =
  | { type: "daily" }
  | { type: "weekly"; days: number[] } // 0=Sun ... 6=Sat
  | { type: "custom"; days: number[] };

export interface BaseEntity {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Goal extends BaseEntity {
  title: string;
  description: string; // markdown
  status: GoalStatus;
  priority: Priority;
  targetDate?: string; // ISO date
}

export interface Project extends BaseEntity {
  title: string;
  description: string; // markdown
  goalId?: string;
  status: ProjectStatus;
  priority: Priority;
  targetDate?: string; // ISO date
  completedAt?: string; // ISO datetime、statusが'done'になった時刻（振り返り画面で使用）
}

export interface Task extends BaseEntity {
  title: string;
  description: string; // markdown
  projectId?: string;
  goalId?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO date - 締切
  scheduledDate?: string; // ISO date - 実施予定日（todayに出す基準）
  tags: string[];
  estimatedMinutes?: number;
  habitId?: string; // 習慣から生成されたタスクの場合
  completedAt?: string;
}

export interface Habit extends BaseEntity {
  title: string;
  goalId?: string;
  frequency: HabitFrequency;
  timeOfDay?: string; // "06:30" 朝スケジュールに紐づけるため
  active: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO date
  completed: boolean;
}

export interface InboxItem extends BaseEntity {
  content: string;
  processed: boolean;
}

export type NoteType = "note" | "daily";

export interface Note extends BaseEntity {
  title: string;
  content: string; // markdown
  type: NoteType;
  date?: string; // ISO date, dailyページ用
  linkedGoalId?: string;
  linkedProjectId?: string;
  linkedTaskId?: string;
  tags: string[];
}

export interface MorningBlock {
  id: string;
  date: string; // ISO date
  time: string; // "06:00"
  title: string;
  linkedHabitId?: string;
  done: boolean;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  P1: "P1・最優先",
  P2: "P2・重要",
  P3: "P3・通常",
  P4: "P4・低",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  P1: 4,
  P2: 3,
  P3: 2,
  P4: 1,
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
  someday: "いつか",
  waiting: "保留中",
};

export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = {
  active: "進行中",
  done: "達成",
  archived: "アーカイブ",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "進行中",
  on_hold: "保留",
  done: "完了",
  archived: "アーカイブ",
};
