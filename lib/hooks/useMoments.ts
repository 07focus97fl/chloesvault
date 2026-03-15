"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_MOMENTS } from "@/lib/mock-data";
import type { Moment } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useMoments() {
  const [moments, setMoments] = useState<Moment[]>(USE_MOCK ? MOCK_MOMENTS : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;
    const fetch = async () => {
      const { data } = await supabase.from("moments").select("*").order("date", { ascending: false });
      if (data) setMoments(data);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const addMoment = useCallback(async (moment: Omit<Moment, "id" | "created_at">) => {
    if (USE_MOCK) {
      setMoments((prev) => [{ ...moment, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
      return;
    }
    await supabase.from("moments").insert(moment);
    const { data } = await supabase.from("moments").select("*").order("date", { ascending: false });
    if (data) setMoments(data);
  }, [supabase]);

  return { moments, loading, addMoment };
}
