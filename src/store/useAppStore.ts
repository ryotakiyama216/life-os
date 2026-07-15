"use client";

import { create } from "zustand";
import { toast } from "sonner";
import type {
  Goal,
  GoalStatus,
  Habit,
  HabitLog,
  InboxItem,
  LinkItem,
  MorningBlock,
  Note,
  Priority,
  Project,
  ProjectStatus,
  Task,
  TaskStatus,
} from "@/types";
import { nowISO } from "@/lib/date";
import { goalsQueries } from "@/lib/supabase/queries/goals";
import { projectsQueries } from "@/lib/supabase/queries/projects";
import { tasksQueries } from "@/lib/supabase/queries/tasks";
import { habitsQueries, fetchHabitLogs, toggleHabitLogRow } from "@/lib/supabase/queries/habits";
import { inboxQueries } from "@/lib/supabase/queries/inbox";
import { notesQueries } from "@/lib/supabase/queries/notes";
import { morningBlocksQueries } from "@/lib/supabase/queries/morning-blocks";
import { linksQueries } from "@/lib/supabase/queries/links";

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    return `${fallback}: ${err.message}`;
  }
  return fallback;
}

function sortMorningBlocks(blocks: MorningBlock[]): MorningBlock[] {
  return [...blocks].sort((a, b) => a.time.localeCompare(b.time));
}

interface AppState {
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  inboxItems: InboxItem[];
  notes: Note[];
  morningBlocks: MorningBlock[];
  links: LinkItem[];
  loading: boolean;
  loaded: boolean;
  loadAll: () => Promise<void>;
  reset: () => void;

  // Goal
  addGoal: (
    input: Pick<Goal, "title" | "description" | "priority" | "targetDate">
  ) => Promise<Goal>;
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id" | "createdAt">>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;

  // Project
  addProject: (
    input: Pick<Project, "title" | "description" | "priority" | "goalId" | "targetDate">
  ) => Promise<Project>;
  updateProject: (id: string, patch: Partial<Omit<Project, "id" | "createdAt">>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;

  // Task
  addTask: (
    input: Partial<
      Pick<
        Task,
        | "projectId"
        | "goalId"
        | "dueDate"
        | "scheduledDate"
        | "tags"
        | "estimatedMinutes"
        | "priority"
        | "status"
        | "habitId"
        | "description"
      >
    > &
      Pick<Task, "title">
  ) => Promise<Task>;
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;

  // Habit
  addHabit: (input: Pick<Habit, "title" | "frequency" | "goalId" | "timeOfDay">) => Promise<Habit>;
  updateHabit: (id: string, patch: Partial<Omit<Habit, "id" | "createdAt">>) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleHabitLog: (habitId: string, date: string) => Promise<void>;

  // Inbox
  addInboxItem: (content: string) => Promise<InboxItem>;
  removeInboxItem: (id: string) => Promise<void>;
  markInboxProcessed: (id: string) => Promise<void>;

  // Note
  addNote: (
    input: Partial<
      Pick<Note, "type" | "date" | "linkedGoalId" | "linkedProjectId" | "linkedTaskId" | "tags">
    > &
      Pick<Note, "title" | "content">
  ) => Promise<Note>;
  updateNote: (id: string, patch: Partial<Omit<Note, "id" | "createdAt">>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;

  // MorningBlock
  addMorningBlock: (
    input: Pick<MorningBlock, "date" | "time" | "title" | "linkedHabitId">
  ) => Promise<MorningBlock>;
  updateMorningBlock: (id: string, patch: Partial<Omit<MorningBlock, "id">>) => Promise<void>;
  removeMorningBlock: (id: string) => Promise<void>;
  toggleMorningBlockDone: (id: string) => Promise<void>;

  // Link
  addLink: (input: Pick<LinkItem, "title" | "url" | "category">) => Promise<LinkItem>;
  updateLink: (id: string, patch: Partial<Omit<LinkItem, "id" | "createdAt">>) => Promise<void>;
  removeLink: (id: string) => Promise<void>;
}

const emptyData = {
  goals: [] as Goal[],
  projects: [] as Project[],
  tasks: [] as Task[],
  habits: [] as Habit[],
  habitLogs: [] as HabitLog[],
  inboxItems: [] as InboxItem[],
  notes: [] as Note[],
  morningBlocks: [] as MorningBlock[],
  links: [] as LinkItem[],
};

export const useAppStore = create<AppState>()((set, get) => ({
  ...emptyData,
  loading: false,
  loaded: false,

  loadAll: async () => {
    set({ loading: true });
    try {
      const [goals, projects, tasks, habits, habitLogs, inboxItems, notes, morningBlocks, links] =
        await Promise.all([
          goalsQueries.fetchAll(),
          projectsQueries.fetchAll(),
          tasksQueries.fetchAll(),
          habitsQueries.fetchAll(),
          fetchHabitLogs(),
          inboxQueries.fetchAll(),
          notesQueries.fetchAll(),
          morningBlocksQueries.fetchAll(),
          linksQueries.fetchAll(),
        ]);
      set({
        goals,
        projects,
        tasks,
        habits,
        habitLogs,
        inboxItems,
        notes,
        morningBlocks: sortMorningBlocks(morningBlocks),
        links,
        loaded: true,
        loading: false,
      });
    } catch (err) {
      toast.error(errorMessage(err, "データの読み込みに失敗しました"));
      set({ loading: false });
    }
  },
  reset: () => set({ ...emptyData, loaded: false }),

  // ---- Goal ----
  addGoal: async (input) => {
    try {
      const goal = await goalsQueries.insert({
        title: input.title,
        description: input.description ?? "",
        priority: input.priority ?? "P3",
        targetDate: input.targetDate,
      });
      set((s) => ({ goals: [...s.goals, goal] }));
      return goal;
    } catch (err) {
      toast.error(errorMessage(err, "目標の追加に失敗しました"));
      throw err;
    }
  },
  updateGoal: async (id, patch) => {
    try {
      const goal = await goalsQueries.update(id, patch);
      set((s) => ({ goals: s.goals.map((g) => (g.id === id ? goal : g)) }));
    } catch (err) {
      toast.error(errorMessage(err, "目標の更新に失敗しました"));
      throw err;
    }
  },
  removeGoal: async (id) => {
    try {
      await goalsQueries.remove(id);
      set((s) => ({
        goals: s.goals.filter((g) => g.id !== id),
        projects: s.projects.map((p) => (p.goalId === id ? { ...p, goalId: undefined } : p)),
        tasks: s.tasks.map((t) => (t.goalId === id ? { ...t, goalId: undefined } : t)),
      }));
    } catch (err) {
      toast.error(errorMessage(err, "目標の削除に失敗しました"));
      throw err;
    }
  },

  // ---- Project ----
  addProject: async (input) => {
    try {
      const project = await projectsQueries.insert({
        title: input.title,
        description: input.description ?? "",
        priority: input.priority ?? "P3",
        goalId: input.goalId,
        targetDate: input.targetDate,
      });
      set((s) => ({ projects: [...s.projects, project] }));
      return project;
    } catch (err) {
      toast.error(errorMessage(err, "プロジェクトの追加に失敗しました"));
      throw err;
    }
  },
  updateProject: async (id, patch) => {
    try {
      const current = get().projects.find((p) => p.id === id);
      const finalPatch = { ...patch };
      if (current && patch.status && patch.status !== current.status) {
        if (patch.status === "done") finalPatch.completedAt = nowISO();
        else if (current.status === "done") finalPatch.completedAt = undefined;
      }
      const project = await projectsQueries.update(id, finalPatch);
      set((s) => ({ projects: s.projects.map((p) => (p.id === id ? project : p)) }));
    } catch (err) {
      toast.error(errorMessage(err, "プロジェクトの更新に失敗しました"));
      throw err;
    }
  },
  removeProject: async (id) => {
    try {
      await projectsQueries.remove(id);
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== id),
        tasks: s.tasks.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t)),
      }));
    } catch (err) {
      toast.error(errorMessage(err, "プロジェクトの削除に失敗しました"));
      throw err;
    }
  },

  // ---- Task ----
  addTask: async (input) => {
    try {
      const task = await tasksQueries.insert({
        title: input.title,
        description: input.description ?? "",
        projectId: input.projectId,
        goalId: input.goalId,
        status: input.status ?? "todo",
        priority: input.priority ?? "P3",
        dueDate: input.dueDate,
        scheduledDate: input.scheduledDate,
        tags: input.tags ?? [],
        estimatedMinutes: input.estimatedMinutes,
        habitId: input.habitId,
      });
      set((s) => ({ tasks: [...s.tasks, task] }));
      return task;
    } catch (err) {
      toast.error(errorMessage(err, "タスクの追加に失敗しました"));
      throw err;
    }
  },
  updateTask: async (id, patch) => {
    try {
      const task = await tasksQueries.update(id, patch);
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }));
    } catch (err) {
      toast.error(errorMessage(err, "タスクの更新に失敗しました"));
      throw err;
    }
  },
  removeTask: async (id) => {
    try {
      await tasksQueries.remove(id);
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "タスクの削除に失敗しました"));
      throw err;
    }
  },
  completeTask: async (id) => {
    try {
      const task = await tasksQueries.update(id, {
        status: "done" as TaskStatus,
        completedAt: nowISO(),
      });
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }));
    } catch (err) {
      toast.error(errorMessage(err, "タスクの完了に失敗しました"));
      throw err;
    }
  },

  // ---- Habit ----
  addHabit: async (input) => {
    try {
      const habit = await habitsQueries.insert({
        title: input.title,
        goalId: input.goalId,
        frequency: input.frequency,
        timeOfDay: input.timeOfDay,
        active: true,
      });
      set((s) => ({ habits: [...s.habits, habit] }));
      return habit;
    } catch (err) {
      toast.error(errorMessage(err, "習慣の追加に失敗しました"));
      throw err;
    }
  },
  updateHabit: async (id, patch) => {
    try {
      const habit = await habitsQueries.update(id, patch);
      set((s) => ({ habits: s.habits.map((h) => (h.id === id ? habit : h)) }));
    } catch (err) {
      toast.error(errorMessage(err, "習慣の更新に失敗しました"));
      throw err;
    }
  },
  removeHabit: async (id) => {
    try {
      await habitsQueries.remove(id);
      set((s) => ({
        habits: s.habits.filter((h) => h.id !== id),
        habitLogs: s.habitLogs.filter((l) => l.habitId !== id),
      }));
    } catch (err) {
      toast.error(errorMessage(err, "習慣の削除に失敗しました"));
      throw err;
    }
  },
  toggleHabitLog: async (habitId, date) => {
    try {
      const log = await toggleHabitLogRow(habitId, date);
      set((s) => {
        const idx = s.habitLogs.findIndex((l) => l.habitId === habitId && l.date === date);
        if (idx === -1) return { habitLogs: [...s.habitLogs, log] };
        const next = [...s.habitLogs];
        next[idx] = log;
        return { habitLogs: next };
      });
    } catch (err) {
      toast.error(errorMessage(err, "習慣の記録に失敗しました"));
      throw err;
    }
  },

  // ---- Inbox ----
  addInboxItem: async (content) => {
    try {
      const item = await inboxQueries.insert({ content, processed: false });
      set((s) => ({ inboxItems: [item, ...s.inboxItems] }));
      return item;
    } catch (err) {
      toast.error(errorMessage(err, "Inboxへの追加に失敗しました"));
      throw err;
    }
  },
  removeInboxItem: async (id) => {
    try {
      await inboxQueries.remove(id);
      set((s) => ({ inboxItems: s.inboxItems.filter((i) => i.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "Inboxアイテムの削除に失敗しました"));
      throw err;
    }
  },
  markInboxProcessed: async (id) => {
    try {
      const item = await inboxQueries.update(id, { processed: true });
      set((s) => ({ inboxItems: s.inboxItems.map((i) => (i.id === id ? item : i)) }));
    } catch (err) {
      toast.error(errorMessage(err, "Inboxアイテムの更新に失敗しました"));
      throw err;
    }
  },

  // ---- Note ----
  addNote: async (input) => {
    try {
      const note = await notesQueries.insert({
        title: input.title,
        content: input.content,
        type: input.type ?? "note",
        date: input.date,
        linkedGoalId: input.linkedGoalId,
        linkedProjectId: input.linkedProjectId,
        linkedTaskId: input.linkedTaskId,
        tags: input.tags ?? [],
      });
      set((s) => ({ notes: [note, ...s.notes] }));
      return note;
    } catch (err) {
      toast.error(errorMessage(err, "メモの追加に失敗しました"));
      throw err;
    }
  },
  updateNote: async (id, patch) => {
    try {
      const note = await notesQueries.update(id, patch);
      set((s) => ({ notes: s.notes.map((n) => (n.id === id ? note : n)) }));
    } catch (err) {
      toast.error(errorMessage(err, "メモの更新に失敗しました"));
      throw err;
    }
  },
  removeNote: async (id) => {
    try {
      await notesQueries.remove(id);
      set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "メモの削除に失敗しました"));
      throw err;
    }
  },

  // ---- MorningBlock ----
  addMorningBlock: async (input) => {
    try {
      const block = await morningBlocksQueries.insert({
        date: input.date,
        time: input.time,
        title: input.title,
        linkedHabitId: input.linkedHabitId,
        done: false,
      });
      set((s) => ({ morningBlocks: sortMorningBlocks([...s.morningBlocks, block]) }));
      return block;
    } catch (err) {
      toast.error(errorMessage(err, "時間割ブロックの追加に失敗しました"));
      throw err;
    }
  },
  updateMorningBlock: async (id, patch) => {
    try {
      const block = await morningBlocksQueries.update(id, patch);
      set((s) => ({
        morningBlocks: sortMorningBlocks(s.morningBlocks.map((b) => (b.id === id ? block : b))),
      }));
    } catch (err) {
      toast.error(errorMessage(err, "時間割ブロックの更新に失敗しました"));
      throw err;
    }
  },
  removeMorningBlock: async (id) => {
    try {
      await morningBlocksQueries.remove(id);
      set((s) => ({ morningBlocks: s.morningBlocks.filter((b) => b.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "時間割ブロックの削除に失敗しました"));
      throw err;
    }
  },
  toggleMorningBlockDone: async (id) => {
    const current = get().morningBlocks.find((b) => b.id === id);
    if (!current) return;
    try {
      const block = await morningBlocksQueries.update(id, { done: !current.done });
      set((s) => ({ morningBlocks: s.morningBlocks.map((b) => (b.id === id ? block : b)) }));
    } catch (err) {
      toast.error(errorMessage(err, "時間割ブロックの更新に失敗しました"));
      throw err;
    }
  },

  // ---- Link ----
  addLink: async (input) => {
    try {
      const link = await linksQueries.insert({
        title: input.title,
        url: input.url,
        category: input.category,
      });
      set((s) => ({ links: [link, ...s.links] }));
      return link;
    } catch (err) {
      toast.error(errorMessage(err, "リンクの追加に失敗しました"));
      throw err;
    }
  },
  updateLink: async (id, patch) => {
    try {
      const link = await linksQueries.update(id, patch);
      set((s) => ({ links: s.links.map((l) => (l.id === id ? link : l)) }));
    } catch (err) {
      toast.error(errorMessage(err, "リンクの更新に失敗しました"));
      throw err;
    }
  },
  removeLink: async (id) => {
    try {
      await linksQueries.remove(id);
      set((s) => ({ links: s.links.filter((l) => l.id !== id) }));
    } catch (err) {
      toast.error(errorMessage(err, "リンクの削除に失敗しました"));
      throw err;
    }
  },
}));

export type { AppState, Priority, GoalStatus, ProjectStatus, TaskStatus };
