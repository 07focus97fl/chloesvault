"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function useFreakTime() {
  const [freakTimeActive, setFreakTimeActive] = useState(false);
  const supabase = createClient();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const fetch = async () => {
      const { data } = await supabase
        .from("app_state")
        .select("freak_time")
        .eq("id", "singleton")
        .single();
      if (data) setFreakTimeActive(data.freak_time);
    };

    fetch();

    const channel = supabase
      .channel("app-state")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "chloesvault",
          table: "app_state",
          filter: "id=eq.singleton",
        },
        (payload) => {
          const updated = payload.new as { freak_time: boolean };
          setFreakTimeActive(updated.freak_time);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const toggleFreakTime = useCallback(async () => {
    const newValue = !freakTimeActive;
    setFreakTimeActive(newValue);
    await supabase
      .from("app_state")
      .update({ freak_time: newValue, updated_at: new Date().toISOString() })
      .eq("id", "singleton");
  }, [freakTimeActive, supabase]);

  return { freakTimeActive, toggleFreakTime };
}
