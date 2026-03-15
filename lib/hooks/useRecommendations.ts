"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_RECOMMENDATIONS } from "@/lib/mock-data";
import type { Recommendation } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(USE_MOCK ? MOCK_RECOMMENDATIONS : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;
    const fetch = async () => {
      const { data } = await supabase.from("recommendations").select("*").order("created_at", { ascending: false });
      if (data) setRecommendations(data);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const addRec = useCallback(async (rec: Omit<Recommendation, "id" | "created_at">) => {
    if (USE_MOCK) {
      setRecommendations((prev) => [{ ...rec, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
      return;
    }
    await supabase.from("recommendations").insert(rec);
    const { data } = await supabase.from("recommendations").select("*").order("created_at", { ascending: false });
    if (data) setRecommendations(data);
  }, [supabase]);

  const toggleDone = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setRecommendations((prev) => prev.map((r) => r.id === id ? { ...r, done: !r.done } : r));
      return;
    }
    const rec = recommendations.find((r) => r.id === id);
    if (!rec) return;
    await supabase.from("recommendations").update({ done: !rec.done }).eq("id", id);
    setRecommendations((prev) => prev.map((r) => r.id === id ? { ...r, done: !r.done } : r));
  }, [supabase, recommendations]);

  const deleteRec = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    await supabase.from("recommendations").delete().eq("id", id);
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  }, [supabase]);

  return { recommendations, loading, addRec, toggleDone, deleteRec };
}
