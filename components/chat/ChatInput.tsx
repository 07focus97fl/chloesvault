"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Mic, ImageIcon } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  onVoiceStart?: () => void;
  onImageSelect?: (file: File) => void;
  onGifOpen?: () => void;
}

export default function ChatInput({ onSend, onVoiceStart, onImageSelect, onGifOpen }: ChatInputProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    // Reset height after sending
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
    // Reset so the same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="shrink-0 border-t border-border bg-surface/80 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-end gap-2">
        <button
          onClick={onVoiceStart}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-text-muted transition-colors hover:text-accent"
        >
          <Mic size={18} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-text-muted transition-colors hover:text-accent"
        >
          <ImageIcon size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={onGifOpen}
          className="flex h-10 shrink-0 items-center justify-center rounded-full bg-card px-3 text-[11px] font-bold text-text-muted transition-colors hover:text-accent"
        >
          GIF
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            resizeTextarea();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Type a message..."
          className="flex-1 max-h-32 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
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
