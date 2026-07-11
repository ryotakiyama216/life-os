import { createEntityQueries } from "@/lib/supabase/entity";
import type { Project } from "@/types";

export const projectsQueries = createEntityQueries<Project>("projects");
