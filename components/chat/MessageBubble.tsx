"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Pin, Check, CheckCheck } from "lucide-react";
import { useLongPress } from "@/lib/hooks/useLongPress";
import SearchHighlight from "@/components/chat/SearchHighlight";
import { formatMessageTime } from "@/lib/utils/date";
import type { Message } from "@/lib/types/database";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  highlightQuery?: string;
  isSearchTarget?: boolean;
  onLongPress?: () => void;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function StatusIcon({ status, isMine }: { status: string; isMine: boolean }) {
  if (!isMine) return null;
  if (status === "sent") return <Check size={12} className="text-text-dim" />;
  if (status === "delivered") return <CheckCheck size={12} className="text-text-dim" />;
  return <CheckCheck size={12} className="text-michael" />;
}

export default function MessageBubble({
  message,
  isMine,
  highlightQuery,
  isSearchTarget,
  onLongPress,
}: MessageBubbleProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const longPressHandlers = useLongPress(() => onLongPress?.(), { threshold: 500 });

  const bubbleColor = isMine
    ? "bg-michael/10 border-michael/20"
    : "bg-chloe/10 border-chloe/20";
  const align = isMine ? "self-end" : "self-start";

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress(audio.currentTime / audio.duration);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current && message.voice_url) {
      audioRef.current = new Audio(message.voice_url);
      audioRef.current.onended = () => {
        setPlaying(false);
        setProgress(0);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      audio.play();
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    setPlaying(!playing);
  }, [playing, message.voice_url, updateProgress]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioRef.current?.pause();
    };
  }, []);

  const hash = hashCode(message.id);
  const waveformHeights = Array.from({ length: 24 }, (_, i) => {
    const seed = (hash * (i + 1) * 2654435761) >>> 0;
    return ((seed % 16) + 4);
  });

  const timeStr = formatMessageTime(message.created_at);

  if (message.type === "voice") {
    return (
      <div
        className={`flex max-w-[80%] flex-col ${align}`}
        {...longPressHandlers}
      >
        <div
          className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${bubbleColor} ${
            isSearchTarget ? "ring-2 ring-cv-accent/50" : ""
          }`}
        >
          {message.is_pinned && (
            <Pin size={10} className="absolute right-2 top-2 text-cv-accent" />
          )}
          <button
            onClick={togglePlay}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              isMine ? "bg-michael/20 hover:bg-michael/30" : "bg-chloe/20 hover:bg-chloe/30"
            }`}
          >
            {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="relative flex items-end gap-[2px]">
              {waveformHeights.map((h, i) => {
                const filled = i / waveformHeights.length <= progress;
                return (
                  <div
                    key={i}
                    className={`w-[2.5px] rounded-full transition-colors ${
                      filled
                        ? isMine
                          ? "bg-michael"
                          : "bg-chloe"
                        : isMine
                          ? "bg-michael/30"
                          : "bg-chloe/30"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-dim">
                {message.duration
                  ? `${Math.floor(message.duration / 60)}:${(message.duration % 60)
                      .toString()
                      .padStart(2, "0")}`
                  : "0:12"}
              </span>
              <span className="text-[10px] text-text-dim">{timeStr}</span>
              <StatusIcon status={message.status} isMine={isMine} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex max-w-[80%] flex-col ${align}`}
      {...longPressHandlers}
    >
      <div
        className={`relative rounded-2xl border px-4 py-2.5 transition-colors ${bubbleColor} ${
          isSearchTarget ? "ring-2 ring-cv-accent/50" : ""
        }`}
      >
        {message.is_pinned && (
          <Pin size={10} className="absolute right-2 top-2 text-cv-accent" />
        )}
        <p className="text-sm leading-relaxed">
          {highlightQuery && message.text ? (
            <SearchHighlight text={message.text} query={highlightQuery} />
          ) : (
            message.text
          )}
        </p>
        <div className={`mt-1 flex items-center gap-1.5 ${isMine ? "justify-end" : ""}`}>
          <span className="text-[10px] text-text-dim">{timeStr}</span>
          <StatusIcon status={message.status} isMine={isMine} />
        </div>
      </div>
    </div>
  );
}
