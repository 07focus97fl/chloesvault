"use client";

import { Pin, FolderPlus, Copy, PinOff } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { REACTION_EMOJIS } from "@/lib/hooks/useMessageReactions";
import type { Message, MessageReaction } from "@/lib/types/database";

interface MessageActionsProps {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPin: (message: Message) => void;
  onAddToFolder: (message: Message) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  myReaction?: MessageReaction | null;
}

export default function MessageActions({
  message,
  open,
  onOpenChange,
  onPin,
  onAddToFolder,
  onReaction,
  myReaction,
}: MessageActionsProps) {
  if (!message) return null;

  const actions = [
    {
      icon: message.is_pinned ? PinOff : Pin,
      label: message.is_pinned ? "Unpin Message" : "Pin Message",
      onClick: () => {
        onPin(message);
        onOpenChange(false);
      },
    },
    {
      icon: FolderPlus,
      label: "Add to Folder",
      onClick: () => {
        onAddToFolder(message);
        onOpenChange(false);
      },
    },
    ...(message.type === "text" && message.text
      ? [
          {
            icon: Copy,
            label: "Copy Text",
            onClick: () => {
              navigator.clipboard.writeText(message.text!);
              onOpenChange(false);
            },
          },
        ]
      : []),
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-w-[430px] mx-auto rounded-t-2xl border-cv-border bg-surface pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-sm text-text-muted">Message Actions</SheetTitle>
        </SheetHeader>

        {/* Emoji reaction picker */}
        {onReaction && (
          <div className="flex items-center justify-center gap-2 pb-3 mb-2 border-b border-border">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReaction(message.id, emoji);
                  onOpenChange(false);
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all active:scale-90 ${
                  myReaction?.emoji === emoji
                    ? "bg-accent/20 ring-2 ring-accent/50 scale-110"
                    : "bg-card hover:bg-border/50"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-text transition-colors hover:bg-cv-card"
            >
              <action.icon size={18} className="text-text-muted" />
              {action.label}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
