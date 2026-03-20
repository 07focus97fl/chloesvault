"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Mic, ImageIcon } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  onVoiceStart?: () => void;
  onImageSelect?: (file: File) => void;
  onGifOpen?: () => void;
  freakTimeActive?: boolean;
}

export default function ChatInput({ onSend, onVoiceStart, onImageSelect, onGifOpen, freakTimeActive }: ChatInputProps) {
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
    <div className={`shrink-0 border-t px-4 py-3 backdrop-blur-xl transition-colors duration-500 ${freakTimeActive ? "border-pink-200 bg-pink-50/90" : "border-border bg-surface/80"}`}>
      <div className="flex items-end gap-2">
        <button
          onClick={onVoiceStart}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
            freakTimeActive
              ? "bg-pink-200/60 text-pink-500 hover:text-pink-600"
              : "bg-card text-text-muted hover:text-accent"
          }`}
        >
          <Mic size={18} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
            freakTimeActive
              ? "bg-pink-200/60 text-pink-500 hover:text-pink-600"
              : "bg-card text-text-muted hover:text-accent"
          }`}
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
          className={`flex h-10 shrink-0 items-center justify-center rounded-full px-3 text-[11px] font-bold transition-colors ${
            freakTimeActive
              ? "bg-pink-200/60 text-pink-500 hover:text-pink-600"
              : "bg-card text-text-muted hover:text-accent"
          }`}
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
          placeholder={freakTimeActive ? "Say something spicy..." : "Type a message..."}
          className={`flex-1 max-h-32 resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none ${
            freakTimeActive
              ? "border-pink-300 bg-white/70 text-pink-950 placeholder:text-pink-400 focus:border-pink-400"
              : "border-border bg-card text-text placeholder:text-text-dim focus:border-accent/50"
          }`}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-30 ${
            freakTimeActive
              ? "bg-pink-500 text-white hover:bg-pink-600"
              : "bg-accent text-bg hover:bg-accent/90"
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
