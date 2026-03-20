"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_ICKS } from "@/lib/mock-data";
import type { Ick } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useIcks() {
  const [icks, setIcks] = useState<Ick[]>(USE_MOCK ? MOCK_ICKS : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;
    const fetch = async () => {
      const { data } = await supabase.from("icks").select("*").order("created_at", { ascending: false });
      if (data) setIcks(data);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const addIck = useCallback(async (ick: Omit<Ick, "id" | "created_at">) => {
    if (USE_MOCK) {
      setIcks((prev) => [{ ...ick, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
      return;
    }
    await supabase.from("icks").insert(ick);
    const { data } = await supabase.from("icks").select("*").order("created_at", { ascending: false });
    if (data) setIcks(data);
  }, [supabase]);

  const updateIck = useCallback(async (id: string, text: string) => {
    if (USE_MOCK) {
      setIcks((prev) => prev.map((i) => i.id === id ? { ...i, text } : i));
      return;
    }
    await supabase.from("icks").update({ text }).eq("id", id);
    setIcks((prev) => prev.map((i) => i.id === id ? { ...i, text } : i));
  }, [supabase]);

  const deleteIck = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setIcks((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    await supabase.from("icks").delete().eq("id", id);
    setIcks((prev) => prev.filter((i) => i.id !== id));
  }, [supabase]);

  return { icks, loading, addIck, updateIck, deleteIck };
}
