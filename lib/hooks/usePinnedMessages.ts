"use client";

import { useCallback } from "react";
import type { Message, UserRole } from "@/lib/types/database";

export function usePinnedMessages(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const pinnedMessages = messages.filter((m) => m.is_pinned);

  const togglePin = useCallback(
    (messageId: string, pinnedBy: UserRole) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                is_pinned: !m.is_pinned,
                pinned_at: m.is_pinned ? null : new Date().toISOString(),
                pinned_by: m.is_pinned ? null : pinnedBy,
              }
            : m
        )
      );
    },
    [setMessages]
  );

  return { pinnedMessages, togglePin };
}
