"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, ChevronDown, Camera, X, Plus, Grid3X3, Trash2 } from "lucide-react";
import { MOCK_ACTIVITY } from "@/lib/mock-data";
import { useCollagePhotos } from "@/lib/hooks/useCollagePhotos";
import type { CollagePhoto } from "@/lib/types/database";

const MAX_DISPLAY = 4;
const ROTATE_INTERVAL = 30000;

const ROTATIONS = [-7, 4, -3, 6, -5, 8, -2, 5];
const PHOTO_W = 120;
const PHOTO_H = 100;
const SPEED_MIN = 0.15;
const SPEED_MAX = 0.35;
const BOUNCE_DAMPING = 0.8;

interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
}

function randomSpeed() {
  const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
  return Math.random() < 0.5 ? speed : -speed;
}

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
  const [viewingPhoto, setViewingPhoto] = useState<CollagePhoto | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const activeEl = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { photos, addPhoto, removePhoto } = useCollagePhotos();

  const containerRef = useRef<HTMLDivElement>(null);
  const photoElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const physicsRef = useRef<PhysicsBody[]>([]);
  const rafRef = useRef<number>(0);

  // Rotate displayed photos every 30s if more than MAX_DISPLAY
  useEffect(() => {
    if (photos.length <= MAX_DISPLAY) return;
    const timer = setInterval(() => {
      setFadeState("out");
      setTimeout(() => {
        setRotationOffset((prev) => (prev + MAX_DISPLAY) % photos.length);
        setFadeState("in");
      }, 400);
    }, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [photos.length]);

  const displayedPhotos = useMemo(() => {
    if (photos.length <= MAX_DISPLAY) return photos;
    const result: CollagePhoto[] = [];
    for (let i = 0; i < MAX_DISPLAY; i++) {
      result.push(photos[(rotationOffset + i) % photos.length]);
    }
    return result;
  }, [photos, rotationOffset]);

  // Physics simulation
  useEffect(() => {
    const container = containerRef.current;
    if (!container || displayedPhotos.length === 0) return;

    const cW = container.offsetWidth;
    const cH = container.offsetHeight;

    // Initialize physics bodies for each displayed photo
    const bodies: PhysicsBody[] = displayedPhotos.map((_, i) => {
      const existing = physicsRef.current[i];
      if (existing && existing.x < cW - PHOTO_W && existing.y < cH - PHOTO_H) {
        return existing;
      }
      return {
        x: Math.random() * Math.max(0, cW - PHOTO_W),
        y: Math.random() * Math.max(0, cH - PHOTO_H),
        vx: randomSpeed(),
        vy: randomSpeed(),
        rotation: ROTATIONS[i % ROTATIONS.length],
      };
    });
    physicsRef.current = bodies;

    function tick() {
      const els = photoElsRef.current;
      const b = physicsRef.current;
      const contW = container!.offsetWidth;
      const contH = container!.offsetHeight;

      for (let i = 0; i < b.length; i++) {
        const body = b[i];
        body.x += body.vx;
        body.y += body.vy;

        // Wall bounce
        if (body.x < 0) {
          body.x = 0;
          body.vx = Math.abs(body.vx) * BOUNCE_DAMPING;
        } else if (body.x + PHOTO_W > contW) {
          body.x = contW - PHOTO_W;
          body.vx = -Math.abs(body.vx) * BOUNCE_DAMPING;
        }
        if (body.y < 0) {
          body.y = 0;
          body.vy = Math.abs(body.vy) * BOUNCE_DAMPING;
        } else if (body.y + PHOTO_H > contH) {
          body.y = contH - PHOTO_H;
          body.vy = -Math.abs(body.vy) * BOUNCE_DAMPING;
        }

        // Re-boost if speed gets too low
        const speed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
        if (speed < SPEED_MIN) {
          body.vx = randomSpeed();
          body.vy = randomSpeed();
        }
      }

      // Photo-photo collision (circle-based for smooth response)
      const collisionRadius = (PHOTO_W + PHOTO_H) / 4; // average half-dimension
      for (let i = 0; i < b.length; i++) {
        for (let j = i + 1; j < b.length; j++) {
          const a = b[i];
          const o = b[j];
          const dx = (o.x + PHOTO_W / 2) - (a.x + PHOTO_W / 2);
          const dy = (o.y + PHOTO_H / 2) - (a.y + PHOTO_H / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = collisionRadius * 2;

          if (dist < minDist && dist > 0) {
            // Normal vector from a to o
            const nx = dx / dist;
            const ny = dy / dist;

            // Relative velocity of a toward o
            const dvx = a.vx - o.vx;
            const dvy = a.vy - o.vy;
            const relVelAlongNormal = dvx * nx + dvy * ny;

            // Only resolve if moving toward each other (prevents jitter)
            if (relVelAlongNormal > 0) {
              a.vx -= relVelAlongNormal * nx;
              a.vy -= relVelAlongNormal * ny;
              o.vx += relVelAlongNormal * nx;
              o.vy += relVelAlongNormal * ny;
            }

            // Separate so they no longer overlap
            const overlap = minDist - dist;
            const sepX = (overlap / 2 + 0.5) * nx;
            const sepY = (overlap / 2 + 0.5) * ny;
            a.x -= sepX;
            a.y -= sepY;
            o.x += sepX;
            o.y += sepY;
          }
        }
      }

      // Apply transforms
      for (let i = 0; i < b.length; i++) {
        const el = els[i];
        if (el) {
          el.style.transform = `translate(${b[i].x}px, ${b[i].y}px) rotate(${b[i].rotation}deg)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [displayedPhotos]);

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
    setShowMenu(false);
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
        <p className="text-sm text-text-muted">Let&apos;s have some fun 😉</p>
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
        ref={containerRef}
        className="relative mb-6 animate-fade-in-up overflow-hidden"
        style={{ animationDelay: "0.2s", height: "280px" } as React.CSSProperties}
      >
        <div className={`relative h-full w-full transition-opacity duration-400 ${fadeState === "out" ? "opacity-0" : "opacity-100"}`}>
          {displayedPhotos.map((photo, i) => {
            return (
              <div
                key={photo.id}
                ref={(el) => { photoElsRef.current[i] = el; }}
                onClick={() => setViewingPhoto(photo)}
                className="absolute cursor-pointer hover:scale-110 hover:z-10"
                style={{ zIndex: i + 1, willChange: "transform" }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg" style={{ width: "120px" }}>
                  <img
                    src={photo.url}
                    alt={photo.caption || "Collage photo"}
                    className="h-[100px] w-full object-cover"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4">
                      <p className="text-[9px] text-white leading-tight truncate">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {photos.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-text-dim">Tap the camera to add your first photo</p>
            </div>
          )}
        </div>

        {/* Camera menu button */}
        <div className="absolute bottom-2 right-2 z-30">
          {showMenu && (
            <div className="absolute bottom-12 right-0 mb-1 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-fade-in-up">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowMenu(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-sm text-text transition-colors active:bg-border/50"
              >
                <Plus size={16} className="text-text-muted" />
                Add photo
              </button>
              <div className="mx-3 h-px bg-border" />
              <button
                onClick={() => {
                  setShowLibrary(true);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-text transition-colors active:bg-border/50"
              >
                <Grid3X3 size={16} className="text-text-muted" />
                See library
              </button>
            </div>
          )}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-md transition-transform active:scale-95"
          >
            <Camera size={18} className="text-text-muted" />
          </button>
        </div>

        <input
          id="collage-file-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute w-0 h-0 overflow-hidden opacity-0"
        />
      </div>

      {/* Full-size photo viewer */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 animate-fade-in"
          onClick={() => setViewingPhoto(null)}
        >
          <div
            className="relative max-h-[80vh] max-w-[90vw] rounded-lg bg-white p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingPhoto(null)}
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-md"
            >
              <X size={16} className="text-text-muted" />
            </button>
            <img
              src={viewingPhoto.url}
              alt={viewingPhoto.caption || "Photo"}
              className="max-h-[70vh] max-w-full rounded object-contain"
            />
            {viewingPhoto.caption && (
              <p className="mt-2 text-center text-sm text-gray-500">{viewingPhoto.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Photo Library */}
      {showLibrary && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-bg animate-fade-in"
        >
          <div className="flex items-center justify-between px-5 pt-14 pb-4">
            <h2 className="font-heading text-xl font-bold">Photo Library</h2>
            <button
              onClick={() => setShowLibrary(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card"
            >
              <X size={16} className="text-text-muted" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-8">
            {photos.length === 0 ? (
              <p className="py-12 text-center text-sm text-text-dim">No photos yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Photo"}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 active:opacity-100"
                      style={{ opacity: 1 }}
                    >
                      <Trash2 size={14} />
                    </button>
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4">
                        <p className="text-[10px] text-white truncate">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setShowLibrary(false);
              }}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-text transition-colors active:bg-border/50"
            >
              <Plus size={16} />
              Add photo
            </button>
          </div>
        </div>
      )}

      {/* Fade-in animation style */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
