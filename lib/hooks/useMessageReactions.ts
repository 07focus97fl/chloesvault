"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessageReaction, UserRole } from "@/lib/types/database";

export const REACTION_EMOJIS = ["❤️", "👍", "👎", "😂", "‼️", "❓"] as const;

export function useMessageReactions() {
  const [reactions, setReactions] = useState<Map<string, MessageReaction[]>>(
    new Map()
  );
  const supabase = createClient();
  const initialLoadDone = useRef(false);

  // Fetch all reactions on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const fetchReactions = async () => {
      const { data } = await supabase
        .from("message_reactions")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) {
        const map = new Map<string, MessageReaction[]>();
        for (const r of data) {
          const existing = map.get(r.message_id) || [];
          existing.push(r);
          map.set(r.message_id, existing);
        }
        setReactions(map);
      }
    };

    fetchReactions();

    // Realtime subscription
    const channel = supabase
      .channel("message-reactions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "chloesvault",
          table: "message_reactions",
        },
        (payload) => {
          const newReaction = payload.new as MessageReaction;
          setReactions((prev) => {
            const next = new Map(prev);
            const existing = (next.get(newReaction.message_id) || []).filter(
              (r) => r.from_user !== newReaction.from_user
            );
            existing.push(newReaction);
            next.set(newReaction.message_id, existing);
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "chloesvault",
          table: "message_reactions",
        },
        (payload) => {
          const updated = payload.new as MessageReaction;
          setReactions((prev) => {
            const next = new Map(prev);
            const existing = (next.get(updated.message_id) || []).map((r) =>
              r.id === updated.id ? updated : r
            );
            next.set(updated.message_id, existing);
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "chloesvault",
          table: "message_reactions",
        },
        (payload) => {
          const deleted = payload.old as MessageReaction;
          setReactions((prev) => {
            const next = new Map(prev);
            const existing = (next.get(deleted.message_id) || []).filter(
              (r) => r.id !== deleted.id
            );
            if (existing.length === 0) {
              next.delete(deleted.message_id);
            } else {
              next.set(deleted.message_id, existing);
            }
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string, fromUser: UserRole) => {
      const existing = reactions.get(messageId) || [];
      const myReaction = existing.find((r) => r.from_user === fromUser);

      if (myReaction && myReaction.emoji === emoji) {
        // Remove reaction (same emoji tapped again)
        setReactions((prev) => {
          const next = new Map(prev);
          const filtered = (next.get(messageId) || []).filter(
            (r) => r.id !== myReaction.id
          );
          if (filtered.length === 0) {
            next.delete(messageId);
          } else {
            next.set(messageId, filtered);
          }
          return next;
        });
        await supabase
          .from("message_reactions")
          .delete()
          .eq("id", myReaction.id);
      } else {
        // Upsert reaction (new or changed emoji)
        const optimistic: MessageReaction = {
          id: myReaction?.id || crypto.randomUUID(),
          message_id: messageId,
          from_user: fromUser,
          emoji,
          created_at: new Date().toISOString(),
        };
        setReactions((prev) => {
          const next = new Map(prev);
          const filtered = (next.get(messageId) || []).filter(
            (r) => r.from_user !== fromUser
          );
          filtered.push(optimistic);
          next.set(messageId, filtered);
          return next;
        });
        await supabase.from("message_reactions").upsert(
          {
            message_id: messageId,
            from_user: fromUser,
            emoji,
          },
          { onConflict: "message_id,from_user" }
        );
      }
    },
    [reactions, supabase]
  );

  const getReactions = useCallback(
    (messageId: string): MessageReaction[] => {
      return reactions.get(messageId) || [];
    },
    [reactions]
  );

  return { reactions, getReactions, toggleReaction };
}
