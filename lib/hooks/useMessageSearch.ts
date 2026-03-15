"use client";

import { useState, useMemo, useCallback } from "react";
import type { Message } from "@/lib/types/database";

export function useMessageSearch(messages: Message[]) {
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return messages.filter(
      (m) => m.type === "text" && m.text?.toLowerCase().includes(q)
    );
  }, [messages, query]);

  const goNext = useCallback(() => {
    if (results.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % results.length);
  }, [results.length]);

  const goPrev = useCallback(() => {
    if (results.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
  }, [results.length]);

  const setSearchQuery = useCallback((q: string) => {
    setQuery(q);
    setCurrentIndex(0);
  }, []);

  const currentMessageId = results[currentIndex]?.id ?? null;

  return {
    query,
    setQuery: setSearchQuery,
    results,
    currentIndex,
    currentMessageId,
    totalCount: results.length,
    goNext,
    goPrev,
  };
}
