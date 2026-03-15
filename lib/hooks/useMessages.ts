"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_MESSAGES } from "@/lib/mock-data";
import type { Message, UserRole } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";
const PAGE_SIZE = 25;

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const initialLoadDone = useRef(false);
  const supabase = createClient();

  // Initial fetch — most recent PAGE_SIZE messages
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    if (USE_MOCK) {
      const slice = MOCK_MESSAGES.slice(-PAGE_SIZE);
      setMessages(slice);
      setHasMore(MOCK_MESSAGES.length > PAGE_SIZE);
      setLoading(false);
      return;
    }

    const fetchInitial = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);
      if (data) {
        setMessages(data.reverse());
        setHasMore(data.length === PAGE_SIZE);
      }
      setLoading(false);
    };

    fetchInitial();

    const channel = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "chloesvault", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  // Load older messages
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);

    const oldestTimestamp = messages[0].created_at;

    if (USE_MOCK) {
      // Find all messages older than current oldest
      const olderMessages = MOCK_MESSAGES.filter(m => m.created_at < oldestTimestamp);
      const slice = olderMessages.slice(-PAGE_SIZE);
      setMessages((prev) => [...slice, ...prev]);
      setHasMore(olderMessages.length > PAGE_SIZE);
      setLoadingMore(false);
      return;
    }

    const { data } = await supabase
      .from("messages")
      .select("*")
      .lt("created_at", oldestTimestamp)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (data) {
      setMessages((prev) => [...data.reverse(), ...prev]);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoadingMore(false);
  }, [loadingMore, hasMore, messages, supabase]);

  const sendMessage = useCallback(async (fromUser: UserRole, text: string) => {
    if (USE_MOCK) {
      const msg: Message = {
        id: crypto.randomUUID(),
        from_user: fromUser,
        type: "text",
        text,
        voice_url: null,
        duration: null,
        status: "sent",
        is_pinned: false,
        pinned_at: null,
        pinned_by: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      return;
    }
    await supabase.from("messages").insert({ from_user: fromUser, type: "text", text });
  }, [supabase]);

  const sendVoiceNote = useCallback(async (fromUser: UserRole, blob: Blob, duration: number) => {
    if (USE_MOCK) {
      const msg: Message = {
        id: crypto.randomUUID(),
        from_user: fromUser,
        type: "voice",
        text: null,
        voice_url: URL.createObjectURL(blob),
        duration,
        status: "sent",
        is_pinned: false,
        pinned_at: null,
        pinned_by: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      return;
    }

    const fileName = `${fromUser}/${Date.now()}.webm`;
    await supabase.storage.from("voice-notes").upload(fileName, blob);
    const { data: { publicUrl } } = supabase.storage.from("voice-notes").getPublicUrl(fileName);

    await supabase.from("messages").insert({
      from_user: fromUser,
      type: "voice",
      voice_url: publicUrl,
      duration,
    });
  }, [supabase]);

  return { messages, setMessages, loading, loadingMore, hasMore, loadMore, sendMessage, sendVoiceNote };
}
