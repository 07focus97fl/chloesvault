"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_QUOTE_CATEGORIES } from "@/lib/mock-data";
import type { QuoteCategory } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useQuoteCategories() {
  const [categories, setCategories] = useState<QuoteCategory[]>(USE_MOCK ? MOCK_QUOTE_CATEGORIES : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;
    const fetch = async () => {
      const { data } = await supabase.from("quote_categories").select("*").order("created_at", { ascending: true });
      if (data) setCategories(data);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const addCategory = useCallback(async (cat: Omit<QuoteCategory, "id" | "created_at">) => {
    if (USE_MOCK) {
      setCategories((prev) => [...prev, { ...cat, id: crypto.randomUUID(), created_at: new Date().toISOString() }]);
      return;
    }
    await supabase.from("quote_categories").insert(cat);
    const { data } = await supabase.from("quote_categories").select("*").order("created_at", { ascending: true });
    if (data) setCategories(data);
  }, [supabase]);

  const deleteCategory = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    await supabase.from("quote_categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, [supabase]);

  return { categories, loading, addCategory, deleteCategory };
}
