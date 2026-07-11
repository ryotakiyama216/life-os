import { createEntityQueries } from "@/lib/supabase/entity";
import type { Task } from "@/types";

export const tasksQueries = createEntityQueries<Task>("tasks");
