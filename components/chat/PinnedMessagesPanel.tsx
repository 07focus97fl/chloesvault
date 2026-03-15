"use client";

import { Pin } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/lib/types/database";
import { formatMessageTime } from "@/lib/utils/date";

interface PinnedMessagesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinnedMessages: Message[];
  onMessageClick: (messageId: string) => void;
}

export default function PinnedMessagesPanel({
  open,
  onOpenChange,
  pinnedMessages,
  onMessageClick,
}: PinnedMessagesPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full border-cv-border bg-bg p-0 sm:max-w-[380px]">
        <SheetHeader className="border-b border-cv-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-sm text-text">
            <Pin size={16} className="text-cv-accent" />
            Pinned Messages
            <span className="ml-auto text-xs text-text-dim">{pinnedMessages.length}</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-72px)]">
          {pinnedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                <Pin size={24} className="text-text-dim" />
              </div>
              <p className="text-sm text-text-muted">No pinned messages yet</p>
              <p className="text-center text-xs text-text-dim">
                Long-press a message to pin it
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-4">
              {pinnedMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    onMessageClick(msg.id);
                    onOpenChange(false);
                  }}
                  className="flex flex-col gap-1.5 rounded-xl border border-cv-border bg-cv-card p-3.5 text-left transition-colors hover:bg-surface"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize text-text-muted">
                      {msg.from_user}
                    </span>
                    <span className="text-[10px] text-text-dim">
                      {new Date(msg.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {formatMessageTime(msg.created_at)}
                    </span>
                  </div>
                  {msg.type === "text" ? (
                    <p className="line-clamp-2 text-sm leading-relaxed text-text">
                      {msg.text}
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted">
                      🎙️ Voice note ({msg.duration}s)
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
