"use client";

import { useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  emoji?: string;
}

const HEART_COLORS = ["#f9a8c9", "#f472b6", "#fbb6ce", "#ec4899", "#f9a8d4"];

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
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

export default function FreakTimeOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const particles: Particle[] = [];
    let animId: number;
    let spawnTimer = 0;
    let lastTime = performance.now();

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function spawnParticle() {
      const isFire = Math.random() < 0.3;
      particles.push({
        x: Math.random() * canvas!.width,
        y: canvas!.height + 10,
        vx: (Math.random() - 0.5) * 1,
        vy: -(0.8 + Math.random() * 1.2),
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
        alpha: 0.6 + Math.random() * 0.3,
        decay: 0.003 + Math.random() * 0.003,
        size: isFire ? 14 + Math.random() * 6 : 5 + Math.random() * 8,
        emoji: isFire ? "🔥" : undefined,
      });
    }

    function tick(now: number) {
      const dt = now - lastTime;
      lastTime = now;

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      // Spawn a heart or fire every ~2-3 seconds
      spawnTimer += dt;
      if (spawnTimer > 2000 + Math.random() * 1000) {
        spawnParticle();
        spawnTimer = 0;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.05;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        if (p.emoji) {
          ctx.font = `${p.size}px serif`;
          ctx.fillText(p.emoji, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          drawHeart(ctx, p.x, p.y, p.size);
        }
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 pointer-events-none"
    />
  );
}
