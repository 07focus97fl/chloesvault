"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_QUOTES } from "@/lib/mock-data";
import type { Quote } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>(USE_MOCK ? MOCK_QUOTES : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;
    const fetch = async () => {
      const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
      if (data) setQuotes(data);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const addQuote = useCallback(async (quote: Omit<Quote, "id" | "created_at">) => {
    if (USE_MOCK) {
      setQuotes((prev) => [{ ...quote, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
      return;
    }
    await supabase.from("quotes").insert(quote);
    const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
    if (data) setQuotes(data);
  }, [supabase]);

  const setCurrentQuote = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setQuotes((prev) => prev.map((q) => ({ ...q, is_current: q.id === id })));
      return;
    }
    await supabase.from("quotes").update({ is_current: false }).neq("id", id);
    await supabase.from("quotes").update({ is_current: true }).eq("id", id);
    const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
    if (data) setQuotes(data);
  }, [supabase]);

  return { quotes, loading, addQuote, setCurrentQuote };
}
