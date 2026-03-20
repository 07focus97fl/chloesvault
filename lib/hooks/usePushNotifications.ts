"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types/database";

export type PushState =
  | "unsupported"
  | "prompt"
  | "denied"
  | "subscribed"
  | "loading";

export function usePushNotifications(userRole: UserRole | null) {
  const [pushState, setPushState] = useState<PushState>("loading");
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushState("unsupported");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        setRegistration(reg);
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          setPushState("subscribed");
        } else {
          setPushState(
            Notification.permission === "denied" ? "denied" : "prompt"
          );
        }
      })
      .catch(() => {
        setPushState("unsupported");
      });
  }, []);

  const subscribe = useCallback(async () => {
    if (!registration || !userRole) return;

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const json = subscription.toJSON();

      await supabase.from("push_subscriptions").upsert(
        {
          user_role: userRole,
          endpoint: json.endpoint!,
          keys_p256dh: json.keys!.p256dh!,
          keys_auth: json.keys!.auth!,
          device_label: getDeviceLabel(),
        },
        { onConflict: "endpoint" }
      );

      setPushState("subscribed");
    } catch (err) {
      console.error("Push subscription failed:", err);
      if (Notification.permission === "denied") {
        setPushState("denied");
      }
    }
  }, [registration, userRole, supabase]);

  const unsubscribe = useCallback(async () => {
    if (!registration) return;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint);
      setPushState("prompt");
    }
  }, [registration, supabase]);

  return { pushState, subscribe, unsubscribe };
}

function getDeviceLabel(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  return "Desktop";
}
