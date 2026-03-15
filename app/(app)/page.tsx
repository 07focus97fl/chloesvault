"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart, ChevronDown, Camera, X } from "lucide-react";
import { MOCK_ACTIVITY } from "@/lib/mock-data";
import { useCollagePhotos } from "@/lib/hooks/useCollagePhotos";

const ROTATIONS = [-7, 4, -3, 6, -5, 8, -2, 5];
const POSITIONS = [
  { top: "8%", left: "5%" },
  { top: "2%", left: "52%" },
  { top: "45%", left: "15%" },
  { top: "40%", left: "55%" },
  { top: "20%", left: "32%" },
  { top: "55%", left: "38%" },
  { top: "10%", left: "70%" },
  { top: "50%", left: "2%" },
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
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const activeEl = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { photos, addPhoto, removePhoto } = useCollagePhotos();

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

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await addPhoto(file, "", "michael");
    e.target.value = "";
  }, [addPhoto]);

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

      {/* Recent Activity */}
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

      {/* Floating Polaroid Collage */}
      <div
        className="relative mb-6 animate-fade-in-up"
        style={{ animationDelay: "0.2s", height: "280px" } as React.CSSProperties}
      >
        <h2 className="mb-2 text-sm font-semibold text-text-muted">Our Photos</h2>
        <div className="relative h-full w-full">
          {photos.map((photo, i) => {
            const rotation = ROTATIONS[i % ROTATIONS.length];
            const pos = POSITIONS[i % POSITIONS.length];
            const delay = i * 0.7;
            return (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(selectedPhoto === photo.id ? null : photo.id)}
                className="polaroid-float absolute cursor-pointer transition-transform duration-200 hover:scale-110 hover:z-10"
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: `rotate(${rotation}deg)`,
                  animationDelay: `${delay}s`,
                  zIndex: selectedPhoto === photo.id ? 20 : i,
                }}
              >
                <div className="relative rounded-sm bg-white p-[6px] shadow-lg" style={{ width: "110px" }}>
                  <img
                    src={photo.url}
                    alt={photo.caption || "Collage photo"}
                    className="h-[90px] w-full rounded-[2px] object-cover"
                  />
                  {photo.caption && (
                    <p className="mt-1 text-center text-[9px] text-gray-500 leading-tight truncate">
                      {photo.caption}
                    </p>
                  )}
                  {selectedPhoto === photo.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(photo.id);
                        setSelectedPhoto(null);
                      }}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add photo button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-md transition-transform active:scale-95"
          >
            <Camera size={18} className="text-text-muted" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Float animation style */}
      <style jsx>{`
        @keyframes polaroid-float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotation)); }
          50% { transform: translateY(-8px) rotate(var(--rotation)); }
        }
        .polaroid-float {
          animation: polaroid-float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
