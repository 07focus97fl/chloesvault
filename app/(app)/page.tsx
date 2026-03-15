"use client";

import Link from "next/link";
import { Heart, MessageCircle, Sparkles, BookOpen, MessageSquare } from "lucide-react";
import Card from "@/components/ui/Card";
import { MOCK_QUOTES, MOCK_ACTIVITY } from "@/lib/mock-data";

const currentQuote = MOCK_QUOTES.find((q) => q.is_current);

const quickAccess = [
  { title: "Moments", emoji: "✨", href: "/vault/moments", color: "text-chloe" },
  { title: "Recs", emoji: "🎬", href: "/vault/recommendations", color: "text-michael" },
  { title: "Topics", emoji: "💭", href: "/vault/topics", color: "text-chloe" },
  { title: "Chat", emoji: "💬", href: "/chat", color: "text-michael" },
];

export default function HomePage() {
  return (
    <div className="px-5 pt-14">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Heart size={16} className="text-heart animate-pulse-soft" />
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            ChloeVault
          </h1>
          <Heart size={16} className="text-heart animate-pulse-soft" />
        </div>
        <p className="text-sm text-text-muted">Our little corner of the internet</p>
      </div>

      {/* Quote of the Month */}
      {currentQuote && (
        <Link href="/vault/quotes">
          <Card className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" } as React.CSSProperties}>
            <div className="mb-2 flex items-center gap-2">
              <BookOpen size={14} className="text-accent" />
              <span className="text-xs font-medium text-accent">Quote of the Month</span>
            </div>
            <p className="mb-2 font-heading text-sm italic leading-relaxed text-text/90">
              &ldquo;{currentQuote.text}&rdquo;
            </p>
            <p className="text-xs text-text-muted">— {currentQuote.author}</p>
          </Card>
        </Link>
      )}

      {/* Quick Access Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: "0.2s" } as React.CSSProperties}>
        {quickAccess.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="flex flex-col items-center gap-2 py-5">
              <span className="text-2xl">{item.emoji}</span>
              <span className={`text-sm font-medium ${item.color}`}>{item.title}</span>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" } as React.CSSProperties}>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <h2 className="text-sm font-semibold text-text-muted">Recent Activity</h2>
        </div>
        <div className="space-y-2">
          {MOCK_ACTIVITY.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3"
            >
              <span className="text-base">{item.emoji}</span>
              <span className="flex-1 text-sm text-text/80">{item.text}</span>
              <span className="text-[10px] text-text-dim">
                {new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
