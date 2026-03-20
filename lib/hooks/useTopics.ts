"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_TOPICS } from "@/lib/mock-data";
import type { Topic } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>(USE_MOCK ? MOCK_TOPICS : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;
    const fetch = async () => {
      const { data } = await supabase.from("topics").select("*").order("created_at", { ascending: false });
      if (data) setTopics(data);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const addTopic = useCallback(async (topic: Omit<Topic, "id" | "created_at">) => {
    if (USE_MOCK) {
      setTopics((prev) => [{ ...topic, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
      return;
    }
    await supabase.from("topics").insert(topic);
    const { data } = await supabase.from("topics").select("*").order("created_at", { ascending: false });
    if (data) setTopics(data);
  }, [supabase]);

  const toggleUsed = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setTopics((prev) => prev.map((t) => t.id === id ? { ...t, used: !t.used } : t));
      return;
    }
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;
    await supabase.from("topics").update({ used: !topic.used }).eq("id", id);
    setTopics((prev) => prev.map((t) => t.id === id ? { ...t, used: !t.used } : t));
  }, [supabase, topics]);

  const deleteTopic = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setTopics((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    await supabase.from("topics").delete().eq("id", id);
    setTopics((prev) => prev.filter((t) => t.id !== id));
  }, [supabase]);

  return { topics, loading, addTopic, toggleUsed, deleteTopic };
}
