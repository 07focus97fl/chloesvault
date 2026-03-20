"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_NIGHTMARES } from "@/lib/mock-data";
import type { Nightmare } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useNightmares() {
  const [nightmares, setNightmares] = useState<Nightmare[]>(USE_MOCK ? MOCK_NIGHTMARES : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;
    const fetch = async () => {
      const { data } = await supabase.from("nightmares").select("*").order("created_at", { ascending: false });
      if (data) setNightmares(data);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const addNightmare = useCallback(async (nightmare: Omit<Nightmare, "id" | "created_at">) => {
    if (USE_MOCK) {
      setNightmares((prev) => [{ ...nightmare, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
      return;
    }
    await supabase.from("nightmares").insert(nightmare);
    const { data } = await supabase.from("nightmares").select("*").order("created_at", { ascending: false });
    if (data) setNightmares(data);
  }, [supabase]);

  const updateNightmare = useCallback(async (id: string, text: string) => {
    if (USE_MOCK) {
      setNightmares((prev) => prev.map((n) => n.id === id ? { ...n, text } : n));
      return;
    }
    await supabase.from("nightmares").update({ text }).eq("id", id);
    setNightmares((prev) => prev.map((n) => n.id === id ? { ...n, text } : n));
  }, [supabase]);

  const deleteNightmare = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setNightmares((prev) => prev.filter((n) => n.id !== id));
      return;
    }
    await supabase.from("nightmares").delete().eq("id", id);
    setNightmares((prev) => prev.filter((n) => n.id !== id));
  }, [supabase]);

  return { nightmares, loading, addNightmare, updateNightmare, deleteNightmare };
}
