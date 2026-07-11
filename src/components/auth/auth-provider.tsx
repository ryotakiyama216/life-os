"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextValue>({ user: null, loading: true });

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const loadAll = useAppStore((s) => s.loadAll);
  const reset = useAppStore((s) => s.reset);
  const loadedOnceRef = React.useRef(false);

  React.useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser && !loadedOnceRef.current) {
        loadedOnceRef.current = true;
        loadAll();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && !loadedOnceRef.current) {
        loadedOnceRef.current = true;
        loadAll();
      }
      if (event === "SIGNED_OUT") {
        loadedOnceRef.current = false;
        reset();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadAll, reset]);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
