"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useUnreadCount(currentUser: UserRole) {
  const [unreadCount, setUnreadCount] = useState(0);
  const initialDone = useRef(false);

  useEffect(() => {
    if (initialDone.current) return;
    initialDone.current = true;

    if (USE_MOCK) return;

    const supabase = createClient();

    const fetchCount = async () => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .neq("from_user", currentUser)
        .neq("status", "read");
      setUnreadCount(count ?? 0);
    };

    fetchCount();

    const channel = supabase
      .channel("unread-count")
      .on("postgres_changes", { event: "INSERT", schema: "chloesvault", table: "messages" }, (payload) => {
        const msg = payload.new as { from_user: string; status: string };
        if (msg.from_user !== currentUser && msg.status !== "read") {
          setUnreadCount((prev) => prev + 1);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "chloesvault", table: "messages" }, (payload) => {
        const oldMsg = payload.old as { status: string };
        const newMsg = payload.new as { from_user: string; status: string };
        if (newMsg.from_user !== currentUser && oldMsg.status !== "read" && newMsg.status === "read") {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  return { unreadCount };
}
