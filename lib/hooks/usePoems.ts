"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_POEMS } from "@/lib/mock-data";
import type { Poem } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function usePoems() {
  const [poems, setPoems] = useState<Poem[]>(USE_MOCK ? MOCK_POEMS : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;
    const fetch = async () => {
      const { data } = await supabase.from("poems").select("*").order("date", { ascending: false });
      if (data) setPoems(data);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const addPoem = useCallback(async (poem: Omit<Poem, "id" | "created_at">) => {
    if (USE_MOCK) {
      setPoems((prev) => [{ ...poem, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
      return;
    }
    await supabase.from("poems").insert(poem);
    const { data } = await supabase.from("poems").select("*").order("date", { ascending: false });
    if (data) setPoems(data);
  }, [supabase]);

  const deletePoem = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setPoems((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    await supabase.from("poems").delete().eq("id", id);
    setPoems((prev) => prev.filter((p) => p.id !== id));
  }, [supabase]);

  return { poems, loading, addPoem, deletePoem };
}
