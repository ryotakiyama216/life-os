import { createEntityQueries } from "@/lib/supabase/entity";
import type { Event } from "@/types";

export const eventsQueries = createEntityQueries<Event>("events", { orderBy: "date" });
