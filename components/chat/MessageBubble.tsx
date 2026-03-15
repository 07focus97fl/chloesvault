"use client";

import { useState } from "react";
import { Play, Pause } from "lucide-react";
import type { Message } from "@/lib/types/database";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const [playing, setPlaying] = useState(false);

  const bubbleColor = isMine ? "bg-michael/20 border-michael/30" : "bg-chloe/20 border-chloe/30";
  const align = isMine ? "self-end animate-slide-in-right" : "self-start animate-slide-in-left";

  if (message.type === "voice") {
    return (
      <div className={`flex max-w-[75%] flex-col ${align}`}>
        <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${bubbleColor}`}>
          <button
            onClick={() => setPlaying(!playing)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isMine ? "bg-michael/30" : "bg-chloe/30"
            }`}
          >
            {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[3px] rounded-full ${isMine ? "bg-michael/50" : "bg-chloe/50"}`}
                  style={{ height: `${Math.random() * 16 + 4}px` }}
                />
              ))}
            </div>
            <span className="text-[11px] text-text-dim">
              {message.duration ? `${Math.floor(message.duration / 60)}:${(message.duration % 60).toString().padStart(2, "0")}` : "0:12"}
            </span>
          </div>
        </div>
        <span className="mt-1 px-2 text-[10px] text-text-dim">
          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex max-w-[75%] flex-col ${align}`}>
      <div className={`rounded-2xl border px-4 py-2.5 ${bubbleColor}`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
      <span className={`mt-1 text-[10px] text-text-dim ${isMine ? "pr-2 text-right" : "pl-2"}`}>
        {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}
