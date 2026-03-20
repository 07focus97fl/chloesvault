"use client";

import { Search, Pin, FolderOpen } from "lucide-react";
import Link from "next/link";

interface ChatHeaderProps {
  otherName: string;
  currentUserRole: "michael" | "chloe";
  isOnline: boolean;
  onSearchToggle: () => void;
  onPinnedToggle: () => void;
  pinnedCount: number;
  freakTimeActive?: boolean;
  onFreakTimeToggle?: () => void;
}

export default function ChatHeader({
  otherName,
  currentUserRole,
  isOnline,
  onSearchToggle,
  onPinnedToggle,
  pinnedCount,
  freakTimeActive,
  onFreakTimeToggle,
}: ChatHeaderProps) {
  const avatarColor =
    currentUserRole === "michael"
      ? "bg-chloe/20 text-chloe"
      : "bg-michael/20 text-michael";

  return (
    <header className={`shrink-0 border-b px-4 py-3 backdrop-blur-xl transition-colors duration-500 ${freakTimeActive ? "border-pink-200 bg-pink-50/90" : "border-cv-border bg-bg/80"}`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${avatarColor}`}
          >
            {otherName[0]}
          </div>
        </div>
        <div className="flex-1">
          <h1 className={`text-sm font-semibold ${freakTimeActive ? "text-pink-900" : ""}`}>{otherName}</h1>
          {freakTimeActive && (
            <p className="text-[11px] text-pink-600">feeling flirty...</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSearchToggle}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${freakTimeActive ? "text-pink-400 hover:bg-pink-200" : "text-text-dim hover:bg-surface hover:text-text"}`}
          >
            <Search size={16} />
          </button>
          <button
            onClick={onPinnedToggle}
            className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors ${freakTimeActive ? "text-pink-400 hover:bg-pink-200" : "text-text-dim hover:bg-surface hover:text-text"}`}
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
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${freakTimeActive ? "text-pink-400 hover:bg-pink-200" : "text-text-dim hover:bg-surface hover:text-text"}`}
          >
            <FolderOpen size={16} />
          </Link>
          {onFreakTimeToggle && (
            <button
              onClick={onFreakTimeToggle}
              className={`flex h-8 items-center justify-center rounded-full px-2.5 text-[11px] font-bold transition-all ${
                freakTimeActive
                  ? "bg-pink-500/20 text-pink-600 ring-1 ring-pink-400/50"
                  : "text-text-dim hover:bg-surface hover:text-text"
              }`}
            >
              FT
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
