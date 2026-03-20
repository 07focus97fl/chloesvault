"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Send, Loader2, Play, Pause, Trash2 } from "lucide-react";

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => Promise<void> | void;
  onCancel: () => void;
}

// Deterministic waveform heights from a seed
function generateWaveform(seed: number, count: number = 24): number[] {
  return Array.from({ length: count }, (_, i) => {
    const v = (seed * (i + 1) * 2654435761) >>> 0;
    return (v % 16) + 4;
  });
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const waveformSeed = useRef(Date.now());

  const waveformHeights = generateWaveform(waveformSeed.current);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioRef.current?.pause();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setBlobUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      waveformSeed.current = Date.now();
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      console.error("Microphone access denied");
    }
  }, []);

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSend = async () => {
    if (blob && !sending) {
      // Stop playback if playing
      if (audioRef.current) {
        audioRef.current.pause();
        setPlaying(false);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      }
      setSending(true);
      await onSend(blob, duration);
    }
  };

  const handleDiscard = () => {
    // Stop playback and clean up
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlob(null);
    setBlobUrl(null);
    setPlaying(false);
    setProgress(0);
  };

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress(audio.currentTime / audio.duration);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current && blobUrl) {
      audioRef.current = new Audio(blobUrl);
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
  }, [playing, blobUrl, updateProgress]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Review state: blob exists, not recording
  if (blob && !recording) {
    return (
      <div className="shrink-0 border-t border-border bg-surface px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Discard */}
          <button
            onClick={handleDiscard}
            disabled={sending}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:text-heart hover:bg-heart/10 ${sending ? "opacity-50 pointer-events-none" : ""}`}
            title="Discard"
          >
            <Trash2 size={16} />
          </button>

          {/* Play/pause */}
          <button
            onClick={togglePlay}
            disabled={sending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-heart/20 text-heart transition-colors hover:bg-heart/30"
          >
            {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          {/* Waveform + duration */}
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-end gap-[2px]">
              {waveformHeights.map((h, i) => {
                const filled = i / waveformHeights.length <= progress;
                return (
                  <div
                    key={i}
                    className={`w-[2.5px] rounded-full transition-colors ${
                      filled ? "bg-heart" : "bg-heart/30"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                );
              })}
            </div>
            <span className="text-[11px] text-text-dim">{formatTime(duration)}</span>
          </div>

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-bg transition-all hover:bg-accent/90"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    );
  }

  // Recording or idle state
  return (
    <div className="shrink-0 border-t border-border bg-surface px-4 py-4">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-sm text-text-muted hover:text-text">
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {recording && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-heart" />
              <span className="font-mono text-sm text-text">{formatTime(duration)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!recording && (
            <button
              onClick={startRecording}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-heart text-white"
            >
              <Mic size={20} />
            </button>
          )}
          {recording && (
            <button
              onClick={stopRecording}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-heart/20 text-heart"
            >
              <Square size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
