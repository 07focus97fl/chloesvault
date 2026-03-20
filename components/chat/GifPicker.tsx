"use client";

import { Search, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGifSearch } from "@/lib/hooks/useGifSearch";

interface GifPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export default function GifPicker({ open, onOpenChange, onSelect }: GifPickerProps) {
  const { query, setQuery, results, loading } = useGifSearch();

  const handleSelect = (url: string) => {
    onSelect(url);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh] rounded-t-2xl bg-bg">
        <SheetHeader>
          <SheetTitle className="text-text">GIFs</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <Search size={14} className="text-text-dim" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GIFs..."
              className="flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-text-dim" />
            </div>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-dim">
              {query ? "No GIFs found" : "Search for a GIF to get started"}
            </p>
          ) : (
            <div className="columns-2 gap-2">
              {results.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleSelect(gif.url)}
                  className="mb-2 w-full overflow-hidden rounded-lg transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <img
                    src={gif.preview}
                    alt="GIF"
                    width={gif.width}
                    height={gif.height}
                    className="w-full rounded-lg"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
