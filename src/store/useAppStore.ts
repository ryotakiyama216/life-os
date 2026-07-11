"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Goal,
  GoalStatus,
  Habit,
  HabitLog,
  InboxItem,
  MorningBlock,
  Note,
  Priority,
  Project,
  ProjectStatus,
  Task,
  TaskStatus,
} from "@/types";
import { nowISO } from "@/lib/date";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  // Goal
  addGoal: (input: Pick<Goal, "title" | "description" | "priority" | "targetDate">) => Goal;
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id" | "createdAt">>) => void;
  removeGoal: (id: string) => void;

  // Project
  addProject: (
    input: Pick<Project, "title" | "description" | "priority" | "goalId" | "targetDate">
  ) => Project;
  updateProject: (id: string, patch: Partial<Omit<Project, "id" | "createdAt">>) => void;
  removeProject: (id: string) => void;

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
  ) => Task;
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) => void;
  removeTask: (id: string) => void;
  completeTask: (id: string) => void;

  // Habit
  addHabit: (input: Pick<Habit, "title" | "frequency" | "goalId" | "timeOfDay">) => Habit;
  updateHabit: (id: string, patch: Partial<Omit<Habit, "id" | "createdAt">>) => void;
  removeHabit: (id: string) => void;
  toggleHabitLog: (habitId: string, date: string) => void;

  // Inbox
  addInboxItem: (content: string) => InboxItem;
  removeInboxItem: (id: string) => void;
  markInboxProcessed: (id: string) => void;

  // Note
  addNote: (
    input: Partial<Pick<Note, "type" | "date" | "linkedGoalId" | "linkedProjectId" | "linkedTaskId" | "tags">> &
      Pick<Note, "title" | "content">
  ) => Note;
  updateNote: (id: string, patch: Partial<Omit<Note, "id" | "createdAt">>) => void;
  removeNote: (id: string) => void;

  // MorningBlock
  addMorningBlock: (input: Pick<MorningBlock, "date" | "time" | "title" | "linkedHabitId">) => MorningBlock;
  updateMorningBlock: (id: string, patch: Partial<Omit<MorningBlock, "id">>) => void;
  removeMorningBlock: (id: string) => void;
  toggleMorningBlockDone: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      goals: [],
      projects: [],
      tasks: [],
      habits: [],
      habitLogs: [],
      inboxItems: [],
      notes: [],
      morningBlocks: [],
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      addGoal: (input) => {
        const goal: Goal = {
          id: makeId(),
          title: input.title,
          description: input.description ?? "",
          status: "active",
          priority: input.priority ?? "P3",
          targetDate: input.targetDate,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ goals: [...s.goals, goal] }));
        return goal;
      },
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch, updatedAt: nowISO() } : g)),
        })),
      removeGoal: (id) =>
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== id),
          projects: s.projects.map((p) => (p.goalId === id ? { ...p, goalId: undefined } : p)),
          tasks: s.tasks.map((t) => (t.goalId === id ? { ...t, goalId: undefined } : t)),
        })),

      addProject: (input) => {
        const project: Project = {
          id: makeId(),
          title: input.title,
          description: input.description ?? "",
          goalId: input.goalId,
          status: "active",
          priority: input.priority ?? "P3",
          targetDate: input.targetDate,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ projects: [...s.projects, project] }));
        return project;
      },
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)),
        })),
      removeProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t)),
        })),

      addTask: (input) => {
        const task: Task = {
          id: makeId(),
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
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ tasks: [...s.tasks, task] }));
        return task;
      },
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: nowISO() } : t)),
        })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      completeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status: "done" as TaskStatus, completedAt: nowISO(), updatedAt: nowISO() }
              : t
          ),
        })),

      addHabit: (input) => {
        const habit: Habit = {
          id: makeId(),
          title: input.title,
          goalId: input.goalId,
          frequency: input.frequency,
          timeOfDay: input.timeOfDay,
          active: true,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ habits: [...s.habits, habit] }));
        return habit;
      },
      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch, updatedAt: nowISO() } : h)),
        })),
      removeHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          habitLogs: s.habitLogs.filter((l) => l.habitId !== id),
        })),
      toggleHabitLog: (habitId, date) =>
        set((s) => {
          const existing = s.habitLogs.find((l) => l.habitId === habitId && l.date === date);
          if (existing) {
            return {
              habitLogs: s.habitLogs.map((l) =>
                l.id === existing.id ? { ...l, completed: !l.completed } : l
              ),
            };
          }
          return {
            habitLogs: [...s.habitLogs, { id: makeId(), habitId, date, completed: true }],
          };
        }),

      addInboxItem: (content) => {
        const item: InboxItem = {
          id: makeId(),
          content,
          processed: false,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ inboxItems: [item, ...s.inboxItems] }));
        return item;
      },
      removeInboxItem: (id) => set((s) => ({ inboxItems: s.inboxItems.filter((i) => i.id !== id) })),
      markInboxProcessed: (id) =>
        set((s) => ({
          inboxItems: s.inboxItems.map((i) =>
            i.id === id ? { ...i, processed: true, updatedAt: nowISO() } : i
          ),
        })),

      addNote: (input) => {
        const note: Note = {
          id: makeId(),
          title: input.title,
          content: input.content,
          type: input.type ?? "note",
          date: input.date,
          linkedGoalId: input.linkedGoalId,
          linkedProjectId: input.linkedProjectId,
          linkedTaskId: input.linkedTaskId,
          tags: input.tags ?? [],
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ notes: [note, ...s.notes] }));
        return note;
      },
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: nowISO() } : n)),
        })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      addMorningBlock: (input) => {
        const block: MorningBlock = {
          id: makeId(),
          date: input.date,
          time: input.time,
          title: input.title,
          linkedHabitId: input.linkedHabitId,
          done: false,
        };
        set((s) => ({
          morningBlocks: [...s.morningBlocks, block].sort((a, b) => a.time.localeCompare(b.time)),
        }));
        return block;
      },
      updateMorningBlock: (id, patch) =>
        set((s) => ({
          morningBlocks: s.morningBlocks
            .map((b) => (b.id === id ? { ...b, ...patch } : b))
            .sort((a, b) => a.time.localeCompare(b.time)),
        })),
      removeMorningBlock: (id) =>
        set((s) => ({ morningBlocks: s.morningBlocks.filter((b) => b.id !== id) })),
      toggleMorningBlockDone: (id) =>
        set((s) => ({
          morningBlocks: s.morningBlocks.map((b) => (b.id === id ? { ...b, done: !b.done } : b)),
        })),
    }),
    {
      name: "life-os-store",
      version: 1,
      partialize: (s) => ({
        goals: s.goals,
        projects: s.projects,
        tasks: s.tasks,
        habits: s.habits,
        habitLogs: s.habitLogs,
        inboxItems: s.inboxItems,
        notes: s.notes,
        morningBlocks: s.morningBlocks,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export type { AppState, Priority, GoalStatus, ProjectStatus, TaskStatus };
