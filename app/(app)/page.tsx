"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ChevronDown } from "lucide-react";
import Card from "@/components/ui/Card";
import { MOCK_ACTIVITY } from "@/lib/mock-data";

const quickAccess = [
  { title: "Quotes", emoji: "💬", href: "/vault/quotes", color: "text-accent" },
  { title: "Moments", emoji: "✨", href: "/vault/moments", color: "text-chloe" },
  { title: "Recs", emoji: "🎬", href: "/vault/recommendations", color: "text-michael" },
  { title: "Topics", emoji: "💭", href: "/vault/topics", color: "text-chloe" },
  { title: "Nightmares", emoji: "😱", href: "/vault/nightmares", color: "text-michael" },
  { title: "Chat", emoji: "💬", href: "/chat", color: "text-accent" },
];

function relativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "yesterday";
  return `${diffDays}d ago`;
}

export default function HomePage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const activeEl = useRef<HTMLDivElement | null>(null);

  const visibleItems = MOCK_ACTIVITY.filter((item) => !dismissed.has(item.id));
  const displayItems = expanded ? visibleItems : visibleItems.slice(0, 3);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    activeEl.current = e.currentTarget;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    if (activeEl.current) {
      activeEl.current.style.transform = `translateX(${diff}px)`;
      activeEl.current.style.opacity = `${Math.max(0, 1 - Math.abs(diff) / 200)}`;
    }
  }, []);

  const handleTouchEnd = useCallback((id: string) => {
    const diff = touchCurrentX.current - touchStartX.current;
    if (Math.abs(diff) > 100) {
      if (activeEl.current) {
        activeEl.current.style.transform = `translateX(${diff > 0 ? 300 : -300}px)`;
        activeEl.current.style.opacity = "0";
      }
      setTimeout(() => setDismissed((prev) => new Set(prev).add(id)), 200);
    } else if (activeEl.current) {
      activeEl.current.style.transform = "translateX(0)";
      activeEl.current.style.opacity = "1";
    }
    activeEl.current = null;
  }, []);

  return (
    <div className="px-5 pt-14">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Heart size={16} className="text-heart animate-pulse-soft" />
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Chloe&apos;s Vault
          </h1>
          <Heart size={16} className="text-heart animate-pulse-soft" />
        </div>
        <p className="text-sm text-text-muted">Let&apos;s have fun with this ;)</p>
      </div>

      {/* Recent Activity — expandable */}
      <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" } as React.CSSProperties}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="mb-3 flex w-full items-center justify-between"
        >
          <h2 className="text-sm font-semibold text-text-muted">Recent Activity</h2>
          <ChevronDown
            size={16}
            className={`text-text-dim transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <div className="space-y-2 overflow-hidden">
          {displayItems.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(item.href)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(item.id)}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 transition-all duration-200 active:scale-[0.98]"
            >
              <span className="text-base">{item.emoji}</span>
              <span className="flex-1 text-sm text-text/80">{item.text}</span>
              <span className="text-[10px] text-text-dim whitespace-nowrap">
                {relativeTime(item.created_at)}
              </span>
            </div>
          ))}
          {visibleItems.length === 0 && (
            <p className="py-2 text-center text-xs text-text-dim">All caught up!</p>
          )}
        </div>
      </div>

      {/* Quick Access Grid — 3x2 */}
      <div className="mb-6 grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: "0.2s" } as React.CSSProperties}>
        {quickAccess.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="flex flex-col items-center gap-2 py-5">
              <span className="text-2xl">{item.emoji}</span>
              <span className={`text-sm font-medium ${item.color}`}>{item.title}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
