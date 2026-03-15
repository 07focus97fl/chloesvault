"use client";

import { Search, Pin, FolderOpen } from "lucide-react";
import Link from "next/link";

interface ChatHeaderProps {
  otherName: string;
  currentUserRole: "michael" | "chloe";
  onSearchToggle: () => void;
  onPinnedToggle: () => void;
  pinnedCount: number;
}

export default function ChatHeader({
  otherName,
  currentUserRole,
  onSearchToggle,
  onPinnedToggle,
  pinnedCount,
}: ChatHeaderProps) {
  const avatarColor =
    currentUserRole === "michael"
      ? "bg-chloe/20 text-chloe"
      : "bg-michael/20 text-michael";

  return (
    <header className="shrink-0 border-b border-cv-border bg-bg/80 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${avatarColor}`}
          >
            {otherName[0]}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg bg-emerald-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold">{otherName}</h1>
          <p className="text-[11px] text-text-dim">Online</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSearchToggle}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-dim transition-colors hover:bg-surface hover:text-text"
          >
            <Search size={16} />
          </button>
          <button
            onClick={onPinnedToggle}
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-text-dim transition-colors hover:bg-surface hover:text-text"
          >
            <Pin size={16} />
            {pinnedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cv-accent text-[9px] font-bold text-bg">
                {pinnedCount}
              </span>
            )}
          </button>
          <Link
            href="/chat/folders"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-dim transition-colors hover:bg-surface hover:text-text"
          >
            <FolderOpen size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
