"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";

export default function NotificationToggle() {
  const { role } = useAuth();
  const { pushState, subscribe, unsubscribe } = usePushNotifications(role);

  if (pushState === "unsupported" || pushState === "loading") return null;

  if (pushState === "denied") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3">
        <BellOff size={18} className="text-text-dim shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-muted">
            Notifications blocked
          </p>
          <p className="text-[11px] text-text-dim">
            Enable in your device settings
          </p>
        </div>
      </div>
    );
  }

  if (pushState === "subscribed") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3">
        <BellRing size={18} className="text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text">
            Notifications enabled
          </p>
        </div>
        <button
          onClick={unsubscribe}
          className="text-[11px] text-text-dim underline underline-offset-2"
        >
          Disable
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3 transition-colors active:bg-border/50"
    >
      <Bell size={18} className="text-accent shrink-0" />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-text">Enable notifications</p>
        <p className="text-[11px] text-text-dim">
          Get notified when something happens
        </p>
      </div>
    </button>
  );
}
