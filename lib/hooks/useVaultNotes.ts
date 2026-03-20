"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types/database";

export interface VaultNote {
  id: string;
  text: string;
  added_by: UserRole;
  created_at: string;
}

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useVaultNotes(currentUserRole: UserRole) {
  const [notes, setNotes] = useState<VaultNote[]>([]);
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
      const { data } = await supabase
        .from("vault_notes")
        .select("*")
        .eq("added_by", currentUserRole)
        .order("created_at", { ascending: false });
      if (data) setNotes(data);
      setLoading(false);
    };

    fetchAll();
  }, [supabase, currentUserRole]);

  const addNote = useCallback(async (text: string) => {
    const optimistic: VaultNote = {
      id: crypto.randomUUID(),
      text,
      added_by: currentUserRole,
      created_at: new Date().toISOString(),
    };
    setNotes((prev) => [optimistic, ...prev]);

    if (!USE_MOCK) {
      await supabase.from("vault_notes").insert({ text, added_by: currentUserRole });
    }
  }, [supabase, currentUserRole]);

  const deleteNote = useCallback(async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));

    if (!USE_MOCK) {
      await supabase.from("vault_notes").delete().eq("id", id);
    }
  }, [supabase]);

  return { notes, loading, addNote, deleteNote };
}
