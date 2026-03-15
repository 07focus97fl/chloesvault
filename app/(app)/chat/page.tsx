"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import { useAuth } from "@/components/providers/AuthProvider";
import { MOCK_MESSAGES } from "@/lib/mock-data";
import type { Message } from "@/lib/types/database";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { role } = useAuth();

  const currentUserRole = role ?? "michael";
  const otherName = currentUserRole === "michael" ? "Chloe" : "Michael";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      from_user: currentUserRole,
      type: "text",
      text,
      voice_url: null,
      duration: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleVoiceSend = (blob: Blob, duration: number) => {
    // In production: upload blob to Supabase Storage, get URL, insert message
    const newMessage: Message = {
      id: crypto.randomUUID(),
      from_user: currentUserRole,
      type: "voice",
      text: null,
      voice_url: URL.createObjectURL(blob),
      duration,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setShowVoiceRecorder(false);
  };

  return (
    <div className="flex flex-col">
      {/* Chat Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
              currentUserRole === "michael" ? "bg-chloe/20 text-chloe" : "bg-michael/20 text-michael"
            }`}>
              {otherName[0]}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg bg-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">{otherName}</h1>
            <p className="text-[11px] text-text-dim">Online</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.from_user === currentUserRole}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {showVoiceRecorder ? (
        <VoiceRecorder
          onSend={handleVoiceSend}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      ) : (
        <ChatInput
          onSend={handleSend}
          onVoiceStart={() => setShowVoiceRecorder(true)}
        />
      )}
    </div>
  );
}
