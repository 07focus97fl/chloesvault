"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, Camera, X, Plus, Grid3X3, Trash2, ChevronDown } from "lucide-react";
import { useActivity } from "@/lib/hooks/useActivity";
import { useCollagePhotos } from "@/lib/hooks/useCollagePhotos";
import { useAuth } from "@/components/providers/AuthProvider";
import NotificationToggle from "@/components/settings/NotificationToggle";
import type { CollagePhoto } from "@/lib/types/database";

const RELATIONSHIP_START = new Date("2026-02-19T00:00:00Z");
type RelStatus = "talking" | "dating";

const FIREWORK_COLORS = [
  "#c8956c", "#d4726a", "#6b8fbd", "#e8c170", "#f2a4b8",
  "#ffffff", "#ffd700", "#ff6b9d", "#c49bff", "#7dd3fc",
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  isHeart?: boolean;
}

interface Rocket {
  x: number; y: number;
  vy: number;
  targetY: number;
  exploded: boolean;
  color: string;
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.3);
  ctx.bezierCurveTo(x - s, y + s * 0.7, x, y + s, x, y + s * 1.2);
  ctx.bezierCurveTo(x, y + s, x + s, y + s * 0.7, x + s, y + s * 0.3);
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.3);
  ctx.closePath();
  ctx.fill();
}

function launchFireworks(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: Particle[] = [];
  const rockets: Rocket[] = [];
  let elapsed = 0;
  let lastTime = performance.now();
  const DURATION = 5000;

  function spawnRocket() {
    rockets.push({
      x: Math.random() * canvas.width,
      y: canvas.height,
      vy: -(8 + Math.random() * 5),
      targetY: canvas.height * (0.15 + Math.random() * 0.35),
      exploded: false,
      color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
    });
  }

  function spawnHeart() {
    const colors = ["#d4726a", "#ff6b9d", "#f2a4b8", "#e8455a", "#ff3366"];
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(1.5 + Math.random() * 2),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.9,
      decay: 0.005 + Math.random() * 0.005,
      size: 6 + Math.random() * 10,
      isHeart: true,
    });
  }

  function explode(r: Rocket) {
    const count = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x: r.x, y: r.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() < 0.3
          ? FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)]
          : r.color,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.015,
        size: 1.5 + Math.random() * 2,
      });
    }
  }

  let rocketTimer = 0;
  let heartTimer = 0;

  function tick(now: number) {
    const dt = now - lastTime;
    lastTime = now;
    elapsed += dt;

    if (elapsed > DURATION && particles.length === 0) {
      canvas.style.display = "none";
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Red wave flash overlay
    if (elapsed < 4000) {
      const wave = Math.sin(elapsed * 0.004 * Math.PI) * 0.5 + 0.5;
      const flashAlpha = wave * 0.12;
      ctx.fillStyle = `rgba(200, 30, 30, ${flashAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Spawn rockets during first 3.5s
    if (elapsed < 3500) {
      rocketTimer += dt;
      if (rocketTimer > 120) {
        spawnRocket();
        rocketTimer = 0;
      }
    }

    // Spawn floating hearts during first 4s
    if (elapsed < 4000) {
      heartTimer += dt;
      if (heartTimer > 200) {
        spawnHeart();
        heartTimer = 0;
      }
    }

    // Update rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y += r.vy;
      if (!r.exploded) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();
      }
      if (r.y <= r.targetY && !r.exploded) {
        r.exploded = true;
        explode(r);
      }
      if (r.exploded) rockets.splice(i, 1);
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.isHeart) {
        p.vx += (Math.random() - 0.5) * 0.1; // drift
      } else {
        p.vy += 0.06; // gravity for firework sparks
      }
      p.alpha -= p.decay;
      if (p.alpha <= 0) { particles.splice(i, 1); continue; }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      if (p.isHeart) {
        drawHeart(ctx, p.x, p.y, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(tick);
  }

  canvas.style.display = "block";
  requestAnimationFrame(tick);
}

const ACTIVITY_COLORS = [
  "border-l-emerald-500/70",
  "border-l-rose-400/70",
  "border-l-violet-400/70",
  "border-l-blue-400/70",
  "border-l-amber-400/70",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "GOOD MORNING,";
  if (hour < 17) return "GOOD AFTERNOON,";
  return "GOOD EVENING,";
}

function getDayCount(from: Date): number {
  const now = new Date();
  const diff = now.getTime() - from.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

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
  const { role } = useAuth();
  const [dismissed] = useState<Set<string>>(new Set());
  const [viewingPhoto, setViewingPhoto] = useState<CollagePhoto | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [relStatus, setRelStatus] = useState<RelStatus>("talking");
  const [datingStart, setDatingStart] = useState<Date | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const fireworksRef = useRef<HTMLCanvasElement>(null);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const activeEl = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { photos, addPhoto, removePhoto } = useCollagePhotos();
  const { activity, deleteActivity } = useActivity();

  const containerRef = useRef<HTMLDivElement>(null);
  const photoElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const physicsRef = useRef<PhysicsBody[]>([]);
  const rafRef = useRef<number>(0);

  // Load persisted relationship status
  useEffect(() => {
    const saved = localStorage.getItem("vault-rel-status");
    if (saved === "talking" || saved === "dating") {
      setRelStatus(saved);
      if (saved === "dating") {
        const savedDate = localStorage.getItem("vault-dating-start");
        if (savedDate) setDatingStart(new Date(savedDate));
      }
    }
  }, []);

  const handleStatusChange = (newStatus: RelStatus) => {
    setStatusOpen(false);
    if (newStatus === relStatus) return;
    setRelStatus(newStatus);
    localStorage.setItem("vault-rel-status", newStatus);
    if (newStatus === "dating") {
      const now = new Date();
      setDatingStart(now);
      localStorage.setItem("vault-dating-start", now.toISOString());
      if (fireworksRef.current) launchFireworks(fireworksRef.current);
    } else {
      setDatingStart(null);
      localStorage.removeItem("vault-dating-start");
    }
  };

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

  const visibleItems = activity.filter((item) => !dismissed.has(item.id));
  const displayName = role === "chloe" ? "Chloe" : "Michael";

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
      setTimeout(() => deleteActivity(id), 200);
    } else if (activeEl.current) {
      activeEl.current.style.transform = "translateX(0)";
      activeEl.current.style.opacity = "1";
    }
    activeEl.current = null;
  }, [deleteActivity]);

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
      <div className="mb-6 flex items-start justify-between animate-fade-in-up">
        <div>
          <p className="text-xs font-medium tracking-widest text-text-muted">
            {getGreeting()}
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-tight mt-1">
            {displayName}
          </h1>
        </div>
        <Heart size={20} className="text-text-muted/40 mt-1" />
      </div>

      {/* Day Counter */}
      <div
        className="mb-8 flex items-center justify-between rounded-2xl border border-border bg-card/60 px-5 py-4 animate-fade-in-up"
        style={{ animationDelay: "0.05s" } as React.CSSProperties}
      >
        <div>
          <p className="text-xl font-bold tracking-tight">{getDayCount(relStatus === "dating" && datingStart ? datingStart : RELATIONSHIP_START).toLocaleString()} days</p>
          <p className="text-xs text-text-muted">
            we have been {relStatus}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition-colors active:bg-border/50"
          >
            {relStatus === "talking" ? "Talking" : "Dating"}
            <ChevronDown size={12} className={`transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`} />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-32 overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-fade-in-up">
              <button
                onClick={() => handleStatusChange("talking")}
                className={`flex w-full items-center px-4 py-2.5 text-xs transition-colors active:bg-border/50 ${relStatus === "talking" ? "text-accent font-medium" : "text-text-muted"}`}
              >
                Talking
              </button>
              <div className="mx-3 h-px bg-border" />
              <button
                onClick={() => handleStatusChange("dating")}
                className={`flex w-full items-center px-4 py-2.5 text-xs transition-colors active:bg-border/50 ${relStatus === "dating" ? "text-accent font-medium" : "text-text-muted"}`}
              >
                Dating
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Toggle */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.08s" } as React.CSSProperties}>
        <NotificationToggle />
      </div>

      {/* Recent Activity */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" } as React.CSSProperties}>
        <h2 className="font-heading text-lg font-bold mb-3">Recent Activity</h2>
        <div className="space-y-2.5">
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => item.href && router.push(item.href)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(item.id)}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border border-border border-l-[3px] ${ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]} bg-card/50 px-4 py-3.5 transition-all duration-200 active:scale-[0.98]`}
            >
              <span className="text-base mt-0.5">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text">{item.text}</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {relativeTime(item.created_at)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteActivity(item.id);
                }}
                className="text-text-dim/50 hover:text-text-muted mt-0.5 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {visibleItems.length === 0 && (
            <p className="py-4 text-center text-xs text-text-dim">All caught up!</p>
          )}
        </div>
      </div>

      {/* Our Photos */}
      <div className="mb-2 animate-fade-in-up" style={{ animationDelay: "0.15s" } as React.CSSProperties}>
        <h2 className="font-heading text-lg font-bold">Our Photos</h2>
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
              <p className="text-sm text-text-dim">Tap + Add to add your first photo</p>
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

      {/* Fireworks canvas */}
      <canvas
        ref={fireworksRef}
        className="fixed inset-0 z-[100] pointer-events-none"
        style={{ display: "none" }}
      />

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
