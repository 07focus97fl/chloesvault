"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_ACTIVITY } from "@/lib/mock-data";
import type { Activity } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useActivity() {
  const [activity, setActivity] = useState<Activity[]>(USE_MOCK ? MOCK_ACTIVITY : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setActivity(data);
      setLoading(false);
    };

    fetch();

    const channel = supabase
      .channel("activity")
      .on("postgres_changes", { event: "INSERT", schema: "chloesvault", table: "activity" }, (payload) => {
        setActivity((prev) => [payload.new as Activity, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const logActivity = useCallback(async (emoji: string, text: string) => {
    if (USE_MOCK) {
      setActivity((prev) => [{ id: crypto.randomUUID(), emoji, text, created_at: new Date().toISOString() }, ...prev]);
      return;
    }
    await supabase.from("activity").insert({ emoji, text });
  }, [supabase]);

  const deleteActivity = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setActivity((prev) => prev.filter((a) => a.id !== id));
      return;
    }
    await supabase.from("activity").delete().eq("id", id);
    setActivity((prev) => prev.filter((a) => a.id !== id));
  }, [supabase]);

  return { activity, loading, logActivity, deleteActivity };
}
