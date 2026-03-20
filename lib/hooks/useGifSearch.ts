"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface TenorGif {
  id: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

const API_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY ?? "";
const TENOR_BASE = "https://tenor.googleapis.com/v2";

function mapResults(results: Record<string, unknown>[]): TenorGif[] {
  return results.map((r: Record<string, unknown>) => {
    const formats = r.media_formats as Record<string, { url: string; dims: number[] }>;
    const gif = formats.gif ?? formats.mediumgif;
    const tiny = formats.tinygif ?? gif;
    return {
      id: r.id as string,
      url: gif.url,
      preview: tiny.url,
      width: tiny.dims[0],
      height: tiny.dims[1],
    };
  });
}

export function useGifSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGifs = useCallback(async (q: string) => {
    if (!API_KEY) return;
    setLoading(true);
    try {
      const endpoint = q.trim()
        ? `${TENOR_BASE}/search?q=${encodeURIComponent(q)}&key=${API_KEY}&limit=20&media_filter=gif,tinygif`
        : `${TENOR_BASE}/featured?key=${API_KEY}&limit=20&media_filter=gif,tinygif`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setResults(mapResults(data.results ?? []));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchGifs(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchGifs]);

  return { query, setQuery, results, loading };
}
