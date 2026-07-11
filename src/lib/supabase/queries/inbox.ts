import { createEntityQueries } from "@/lib/supabase/entity";
import type { InboxItem } from "@/types";

export const inboxQueries = createEntityQueries<InboxItem>("inbox_items", { ascending: false });
