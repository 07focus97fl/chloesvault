"use client";

import { useRef, useEffect } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  currentIndex: number;
  totalCount: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function SearchBar({
  query,
  onQueryChange,
  onClose,
  currentIndex,
  totalCount,
  onNext,
  onPrev,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="animate-fade-in-up border-b border-cv-border bg-surface/90 px-4 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search messages..."
          className="flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
        />
        {query && totalCount > 0 && (
          <span className="shrink-0 text-[11px] text-text-dim">
            {currentIndex + 1} of {totalCount}
          </span>
        )}
        {query && totalCount > 0 && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={onPrev}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim hover:bg-cv-card hover:text-text"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={onNext}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim hover:bg-cv-card hover:text-text"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        )}
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim hover:bg-cv-card hover:text-text"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
