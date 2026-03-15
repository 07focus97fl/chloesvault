"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_MESSAGES } from "@/lib/mock-data";
import type { Message, UserRole } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>(USE_MOCK ? MOCK_MESSAGES : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
      setLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "chloesvault", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

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

  return { messages, loading, sendMessage, sendVoiceNote };
}
