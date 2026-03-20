"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Pin, Check, CheckCheck, StickyNote, X, MessageSquarePlus, RotateCcw, RotateCw, ChevronDown } from "lucide-react";
import { useLongPress } from "@/lib/hooks/useLongPress";
import ImageLightbox from "@/components/chat/ImageLightbox";
import SearchHighlight from "@/components/chat/SearchHighlight";
import { formatMessageTime } from "@/lib/utils/date";
import type { Message, MessageNote, MessageReaction } from "@/lib/types/database";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  highlightQuery?: string;
  isSearchTarget?: boolean;
  onLongPress?: () => void;
  notes?: MessageNote[];
  reactions?: MessageReaction[];
  onAddNote?: (messageId: string, text: string) => void;
  onDeleteNote?: (noteId: string, messageId: string) => void;
  onPromoteToTopic?: (noteText: string) => void;
  onFetchNotes?: (messageId: string) => void;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function ReactionBadges({ reactions, isMine }: { reactions: MessageReaction[]; isMine: boolean }) {
  if (reactions.length === 0) return null;

  // Group by emoji
  const grouped = new Map<string, number>();
  for (const r of reactions) {
    grouped.set(r.emoji, (grouped.get(r.emoji) || 0) + 1);
  }

  return (
    <div className={`flex gap-1 -mt-1.5 mb-1 ${isMine ? "justify-end pr-2" : "justify-start pl-2"}`}>
      <div className="flex items-center gap-0.5 rounded-full border border-border bg-card px-1.5 py-0.5 shadow-sm">
        {Array.from(grouped.entries()).map(([emoji, count]) => (
          <span key={emoji} className="flex items-center text-sm">
            {emoji}
            {count > 1 && <span className="text-[10px] text-text-dim ml-0.5">{count}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ status, isMine }: { status: string; isMine: boolean }) {
  if (!isMine) return null;
  if (status === "sent") return <Check size={12} className="text-text-dim" />;
  if (status === "delivered") return <CheckCheck size={12} className="text-text-dim" />;
  return <CheckCheck size={12} className="text-michael" />;
}

export default function MessageBubble({
  message,
  isMine,
  highlightQuery,
  isSearchTarget,
  onLongPress,
  notes = [],
  reactions = [],
  onAddNote,
  onDeleteNote,
  onPromoteToTopic,
  onFetchNotes,
}: MessageBubbleProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  // Eagerly fetch notes for voice messages so badge count is available
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (message.type === "voice" && onFetchNotes && !fetchedRef.current) {
      fetchedRef.current = true;
      onFetchNotes(message.id);
    }
  }, [message.type, message.id, onFetchNotes]);

  const { onTouchStart, onTouchMove, onTouchEnd, firedRef } = useLongPress(
    () => onLongPress?.(),
    { threshold: 500 }
  );

  const handleClick = () => {
    if (firedRef.current) return;
    onLongPress?.();
  };

  const bubbleColor = isMine
    ? "bg-michael/10 border-michael/20"
    : "bg-chloe/10 border-chloe/20";
  const align = isMine ? "self-end" : "self-start";

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress(audio.currentTime / audio.duration);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current && message.voice_url) {
      audioRef.current = new Audio(message.voice_url);
      audioRef.current.onended = () => {
        setPlaying(false);
        setProgress(0);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      audio.play();
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    setPlaying(!playing);
  }, [playing, message.voice_url, updateProgress]);

  const seek = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
    if (audio.duration) setProgress(audio.currentTime / audio.duration);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (notesOpen && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [notesOpen]);

  const handleAddNote = () => {
    const trimmed = noteText.trim();
    if (!trimmed || !onAddNote) return;
    onAddNote(message.id, trimmed);
    setNoteText("");
  };

  const hash = hashCode(message.id);
  const waveformHeights = Array.from({ length: 24 }, (_, i) => {
    const seed = (hash * (i + 1) * 2654435761) >>> 0;
    return ((seed % 16) + 4);
  });

  const timeStr = formatMessageTime(message.created_at);

  if (message.type === "voice") {
    return (
      <div
        className={`flex max-w-[80%] flex-col ${align}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleClick}
      >
        <div
          className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${bubbleColor} ${
            isSearchTarget ? "ring-2 ring-cv-accent/50" : ""
          }`}
        >
          {message.is_pinned && (
            <Pin size={10} className="absolute right-2 top-2 text-cv-accent" />
          )}
          <div className="flex shrink-0 items-center gap-1">
            {playing && (
              <button
                onClick={(e) => { e.stopPropagation(); seek(-5); }}
                className="flex h-6 w-6 items-center justify-center rounded-full text-text-dim hover:text-text transition-colors"
              >
                <RotateCcw size={11} />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                isMine ? "bg-michael/20 hover:bg-michael/30" : "bg-chloe/20 hover:bg-chloe/30"
              }`}
            >
              {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>
            {playing && (
              <button
                onClick={(e) => { e.stopPropagation(); seek(5); }}
                className="flex h-6 w-6 items-center justify-center rounded-full text-text-dim hover:text-text transition-colors"
              >
                <RotateCw size={11} />
              </button>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="relative flex items-end gap-[2px]">
              {waveformHeights.map((h, i) => {
                const filled = i / waveformHeights.length <= progress;
                return (
                  <div
                    key={i}
                    className={`w-[2.5px] rounded-full transition-colors ${
                      filled
                        ? isMine
                          ? "bg-michael"
                          : "bg-chloe"
                        : isMine
                          ? "bg-michael/30"
                          : "bg-chloe/30"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-dim">
                {message.duration
                  ? `${Math.floor(message.duration / 60)}:${(message.duration % 60)
                      .toString()
                      .padStart(2, "0")}`
                  : "0:12"}
              </span>
              <span className="text-[10px] text-text-dim">{timeStr}</span>
              <StatusIcon status={message.status} isMine={isMine} />
              {onAddNote && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotesOpen((v) => !v);
                  }}
                  className={`ml-auto flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-colors ${
                    notesOpen
                      ? "bg-cv-accent/20 text-cv-accent"
                      : "text-text-dim hover:text-text"
                  }`}
                  title="Notes"
                >
                  <StickyNote size={12} />
                  {!notesOpen && notes.length > 0 && (
                    <span className="text-[10px] font-medium">{notes.length}</span>
                  )}
                  <ChevronDown size={10} className={`transition-transform ${notesOpen ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        <ReactionBadges reactions={reactions} isMine={isMine} />

        {/* Notes section */}
        {notesOpen && (
          <div className="mt-1.5 flex flex-col gap-1.5 px-1" onClick={(e) => e.stopPropagation()}>
            {notes.map((note) => (
              <div
                key={note.id}
                className="group rounded-lg bg-surface/60 px-2.5 py-2 text-xs"
              >
                <p className="whitespace-pre-wrap text-text-dim leading-relaxed">{note.text}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-text-dim/50">
                    {new Date(note.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {onPromoteToTopic && (
                      <button
                        onClick={() => onPromoteToTopic(note.text)}
                        className="rounded p-0.5 text-text-dim hover:text-cv-accent"
                        title="Add to Topics"
                      >
                        <MessageSquarePlus size={12} />
                      </button>
                    )}
                    {onDeleteNote && (
                      <button
                        onClick={() => onDeleteNote(note.id, message.id)}
                        className="rounded p-0.5 text-text-dim hover:text-red-400"
                        title="Delete note"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-1.5">
              <textarea
                ref={noteInputRef as React.RefObject<HTMLTextAreaElement>}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddNote(); }
                  if (e.key === "Escape") setNotesOpen(false);
                }}
                placeholder="Jot a note... (Shift+Enter for new line)"
                rows={2}
                className="flex-1 resize-none rounded-lg border border-border bg-surface/40 px-2.5 py-1.5 text-xs text-text placeholder:text-text-dim/50 focus:border-cv-accent/40 focus:outline-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                className="mt-0.5 rounded-lg bg-cv-accent/20 px-2 py-1.5 text-[10px] font-medium text-cv-accent transition-colors hover:bg-cv-accent/30 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (message.type === "image" || message.type === "gif") {
    return (
      <>
        <div
          className={`flex max-w-[80%] flex-col ${align}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={handleClick}
        >
          <div
            className={`relative overflow-hidden rounded-2xl border transition-colors ${bubbleColor} ${
              isSearchTarget ? "ring-2 ring-cv-accent/50" : ""
            }`}
          >
            {message.is_pinned && (
              <Pin size={10} className="absolute right-2 top-2 z-10 text-cv-accent drop-shadow" />
            )}
            {message.media_url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (message.type === "image") setLightboxOpen(true);
                }}
                className="block w-full"
              >
                <img
                  src={message.media_url}
                  alt={message.type === "gif" ? "GIF" : "Photo"}
                  className="max-w-[240px] w-full rounded-t-xl object-cover"
                  loading="lazy"
                />
              </button>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 ${isMine ? "justify-end" : ""}`}>
              <span className="text-[10px] text-text-dim">{timeStr}</span>
              <StatusIcon status={message.status} isMine={isMine} />
            </div>
          </div>
          <ReactionBadges reactions={reactions} isMine={isMine} />
        </div>
        {message.type === "image" && (
          <ImageLightbox
            src={message.media_url}
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
          />
        )}
      </>
    );
  }

  return (
    <div
      className={`flex max-w-[80%] flex-col ${align}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleClick}
    >
      <div
        className={`relative rounded-2xl border px-4 py-2.5 transition-colors ${bubbleColor} ${
          isSearchTarget ? "ring-2 ring-cv-accent/50" : ""
        }`}
      >
        {message.is_pinned && (
          <Pin size={10} className="absolute right-2 top-2 text-cv-accent" />
        )}
        <p className="text-sm leading-relaxed">
          {highlightQuery && message.text ? (
            <SearchHighlight text={message.text} query={highlightQuery} />
          ) : (
            message.text
          )}
        </p>
        <div className={`mt-1 flex items-center gap-1.5 ${isMine ? "justify-end" : ""}`}>
          <span className="text-[10px] text-text-dim">{timeStr}</span>
          <StatusIcon status={message.status} isMine={isMine} />
        </div>
      </div>
      <ReactionBadges reactions={reactions} isMine={isMine} />
    </div>
  );
}
