"use client";

import { Pin, FolderPlus, Copy, PinOff } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Message } from "@/lib/types/database";

interface MessageActionsProps {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPin: (message: Message) => void;
  onAddToFolder: (message: Message) => void;
}

export default function MessageActions({
  message,
  open,
  onOpenChange,
  onPin,
  onAddToFolder,
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
