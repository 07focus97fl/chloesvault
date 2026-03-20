"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types/database";

export interface NoteWithMessage {
  id: string;
  text: string;
  created_at: string;
  message_id: string;
  message_from_user: UserRole;
  message_created_at: string;
  message_duration: number | null;
}

export interface MessageGroup {
  message_id: string;
  from_user: UserRole;
  created_at: string;
  duration: number | null;
  notes: { id: string; text: string; created_at: string }[];
}

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useAllNotes(currentUserRole: UserRole) {
  const [groups, setGroups] = useState<MessageGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    if (USE_MOCK) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      // Fetch notes with parent message info
      const { data } = await supabase
        .from("message_notes")
        .select("id, text, created_at, message_id, messages:message_id(from_user, created_at, duration)")
        .eq("added_by", currentUserRole)
        .order("created_at", { ascending: false });

      if (data) {
        // Group by message
        const map = new Map<string, MessageGroup>();
        for (const row of data as any[]) {
          const msg = row.messages;
          if (!msg) continue;
          if (!map.has(row.message_id)) {
            map.set(row.message_id, {
              message_id: row.message_id,
              from_user: msg.from_user,
              created_at: msg.created_at,
              duration: msg.duration,
              notes: [],
            });
          }
          map.get(row.message_id)!.notes.push({
            id: row.id,
            text: row.text,
            created_at: row.created_at,
          });
        }
        // Sort groups by most recent note
        setGroups(Array.from(map.values()));
      }
      setLoading(false);
    };

    fetchAll();
  }, [supabase, currentUserRole]);

  const deleteNote = async (noteId: string, messageId: string) => {
    setGroups((prev) =>
      prev
        .map((g) =>
          g.message_id === messageId
            ? { ...g, notes: g.notes.filter((n) => n.id !== noteId) }
            : g
        )
        .filter((g) => g.notes.length > 0)
    );

    if (!USE_MOCK) {
      await supabase.from("message_notes").delete().eq("id", noteId);
    }
  };

  return { groups, loading, deleteNote };
}
