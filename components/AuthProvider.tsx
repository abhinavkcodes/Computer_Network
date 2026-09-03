"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {});
    return () => listener.subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
