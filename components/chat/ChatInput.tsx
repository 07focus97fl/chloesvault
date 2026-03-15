"use client";

import { useState } from "react";
import { Send, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  onVoiceStart?: () => void;
}

export default function ChatInput({ onSend, onVoiceStart }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="shrink-0 border-t border-border bg-surface/80 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={onVoiceStart}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-text-muted transition-colors hover:text-accent"
        >
          <Mic size={18} />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-bg transition-all hover:bg-accent/90 disabled:opacity-30"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
