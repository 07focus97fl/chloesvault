"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_MESSAGES } from "@/lib/mock-data";
import { compressImage } from "@/lib/utils/image";
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
        const newMsg = payload.new as Message;
        setMessages((prev) => {
          // Skip if we already have this message (optimistic insert)
          const isDuplicate = prev.some((m) => {
            if (m.from_user !== newMsg.from_user || m.type !== newMsg.type) return false;
            const timeDiff = Math.abs(new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime());
            if (timeDiff > 5000) return false;
            if (newMsg.type === "text") return m.text === newMsg.text;
            if (newMsg.type === "image" || newMsg.type === "gif") return m.media_url === newMsg.media_url;
            if (newMsg.type === "voice") return m.voice_url === newMsg.voice_url;
            return false;
          });
          if (isDuplicate) return prev;
          return [...prev, newMsg];
        });
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
    const optimistic: Message = {
      id: crypto.randomUUID(),
      from_user: fromUser,
      type: "text",
      text,
      voice_url: null,
      media_url: null,
      duration: null,
      status: "sent",
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    if (!USE_MOCK) {
      await supabase.from("messages").insert({ from_user: fromUser, type: "text", text });
    }
  }, [supabase]);

  const sendVoiceNote = useCallback(async (fromUser: UserRole, blob: Blob, duration: number): Promise<{ success: boolean }> => {
    const blobUrl = URL.createObjectURL(blob);
    const optimisticId = crypto.randomUUID();
    const optimistic: Message = {
      id: optimisticId,
      from_user: fromUser,
      type: "voice",
      text: null,
      voice_url: blobUrl,
      media_url: null,
      duration,
      status: "sent",
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    if (USE_MOCK) return { success: true };

    try {
      const fileName = `voice-notes/${fromUser}/${Date.now()}.webm`;

      // Get signed upload URL from API route
      const res = await fetch("/api/voice-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, contentType: "audio/webm" }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, publicUrl } = await res.json();

      // Upload directly to GCS (bypasses Vercel body size limit)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "audio/webm" },
        body: blob,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload voice note");

      // Store in Supabase DB
      await supabase.from("messages").insert({
        from_user: fromUser,
        type: "voice",
        voice_url: publicUrl,
        duration,
      });

      // Replace optimistic blob URL with real public URL
      setMessages((prev) => prev.map((m) => m.id === optimisticId ? { ...m, voice_url: publicUrl } : m));
      URL.revokeObjectURL(blobUrl);
      return { success: true };
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      URL.revokeObjectURL(blobUrl);
      return { success: false };
    }
  }, [supabase]);

  const sendImage = useCallback(async (fromUser: UserRole, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const optimistic: Message = {
      id: crypto.randomUUID(),
      from_user: fromUser,
      type: "image",
      text: null,
      voice_url: null,
      media_url: previewUrl,
      duration: null,
      status: "sent",
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    if (!USE_MOCK) {
      const compressed = await compressImage(file);
      const fileName = `${fromUser}/${Date.now()}.webp`;
      await supabase.storage.from("chat-images").upload(fileName, compressed);
      const { data: { publicUrl } } = supabase.storage.from("chat-images").getPublicUrl(fileName);

      await supabase.from("messages").insert({
        from_user: fromUser,
        type: "image",
        media_url: publicUrl,
      });
    }
  }, [supabase]);

  const sendGif = useCallback(async (fromUser: UserRole, gifUrl: string) => {
    const optimistic: Message = {
      id: crypto.randomUUID(),
      from_user: fromUser,
      type: "gif",
      text: null,
      voice_url: null,
      media_url: gifUrl,
      duration: null,
      status: "sent",
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    if (!USE_MOCK) {
      await supabase.from("messages").insert({
        from_user: fromUser,
        type: "gif",
        media_url: gifUrl,
      });
    }
  }, [supabase]);

  return { messages, setMessages, loading, loadingMore, hasMore, loadMore, sendMessage, sendVoiceNote, sendImage, sendGif };
}
