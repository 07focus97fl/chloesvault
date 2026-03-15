"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_MESSAGE_NOTES } from "@/lib/mock-data";
import type { MessageNote, UserRole } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useMessageNotes(currentUserRole: UserRole) {
  const [notes, setNotes] = useState<Map<string, MessageNote[]>>(() => {
    if (!USE_MOCK) return new Map();
    // Pre-populate from mock data, filtered by current user
    const map = new Map<string, MessageNote[]>();
    for (const note of MOCK_MESSAGE_NOTES) {
      if (note.added_by !== currentUserRole) continue;
      const existing = map.get(note.message_id) || [];
      map.set(note.message_id, [...existing, note]);
    }
    return map;
  });

  const supabase = createClient();

  const fetchNotes = useCallback(async (messageId: string) => {
    if (USE_MOCK) return; // Already populated from mock data

    const { data } = await supabase
      .from("message_notes")
      .select("*")
      .eq("message_id", messageId)
      .eq("added_by", currentUserRole)
      .order("created_at", { ascending: true });

    if (data) {
      setNotes((prev) => {
        const next = new Map(prev);
        next.set(messageId, data);
        return next;
      });
    }
  }, [supabase, currentUserRole]);

  const addNote = useCallback(async (messageId: string, text: string) => {
    const note: MessageNote = {
      id: USE_MOCK ? crypto.randomUUID() : "",
      message_id: messageId,
      text,
      added_by: currentUserRole,
      created_at: new Date().toISOString(),
    };

    if (USE_MOCK) {
      setNotes((prev) => {
        const next = new Map(prev);
        const existing = next.get(messageId) || [];
        next.set(messageId, [...existing, note]);
        return next;
      });
      return;
    }

    const { data } = await supabase
      .from("message_notes")
      .insert({ message_id: messageId, text, added_by: currentUserRole })
      .select()
      .single();

    if (data) {
      setNotes((prev) => {
        const next = new Map(prev);
        const existing = next.get(messageId) || [];
        next.set(messageId, [...existing, data]);
        return next;
      });
    }
  }, [supabase, currentUserRole]);

  const deleteNote = useCallback(async (noteId: string, messageId: string) => {
    if (USE_MOCK) {
      setNotes((prev) => {
        const next = new Map(prev);
        const existing = next.get(messageId) || [];
        next.set(messageId, existing.filter((n) => n.id !== noteId));
        return next;
      });
      return;
    }

    await supabase.from("message_notes").delete().eq("id", noteId);
    setNotes((prev) => {
      const next = new Map(prev);
      const existing = next.get(messageId) || [];
      next.set(messageId, existing.filter((n) => n.id !== noteId));
      return next;
    });
  }, [supabase]);

  const getNotesForMessage = useCallback((messageId: string) => {
    return notes.get(messageId) || [];
  }, [notes]);

  const promoteToTopic = useCallback(async (noteText: string): Promise<boolean> => {
    if (USE_MOCK) return true;

    const { error } = await supabase
      .from("topics")
      .insert({ text: noteText, added_by: currentUserRole });

    return !error;
  }, [supabase, currentUserRole]);

  return { notes, fetchNotes, addNote, deleteNote, getNotesForMessage, promoteToTopic };
}
