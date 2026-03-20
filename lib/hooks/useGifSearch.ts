"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface KlipyGif {
  slug: string;
  title: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

const API_KEY = process.env.NEXT_PUBLIC_KLIPY_API_KEY ?? "";
const KLIPY_BASE = `https://api.klipy.com/api/v1/${API_KEY}/gifs`;

interface KlipyFileFormat {
  url: string;
  width: number;
  height: number;
  size: number;
}

interface KlipySizeTier {
  gif: KlipyFileFormat;
  webp: KlipyFileFormat;
  jpg: KlipyFileFormat;
  mp4: KlipyFileFormat;
}

interface KlipyItem {
  slug: string;
  title: string;
  file: {
    hd: KlipySizeTier;
    md: KlipySizeTier;
    sm: KlipySizeTier;
    xs: KlipySizeTier;
  };
}

function mapResults(items: KlipyItem[]): KlipyGif[] {
  return items.map((item) => {
    const full = item.file.md.gif;
    const thumb = item.file.sm.webp;
    return {
      slug: item.slug,
      title: item.title,
      url: full.url,
      preview: thumb.url,
      width: thumb.width,
      height: thumb.height,
    };
  });
}

export function useGifSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KlipyGif[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGifs = useCallback(async (q: string) => {
    if (!API_KEY) return;
    setLoading(true);
    try {
      const endpoint = q.trim()
        ? `${KLIPY_BASE}/search?q=${encodeURIComponent(q)}&per_page=20`
        : `${KLIPY_BASE}/trending?per_page=20`;
      const res = await fetch(endpoint);
      const json = await res.json();
      setResults(mapResults(json.data?.data ?? []));
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
