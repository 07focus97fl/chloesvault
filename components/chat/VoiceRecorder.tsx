"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Send } from "lucide-react";

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
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

  const handleSend = () => {
    if (blob) onSend(blob, duration);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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
          {!recording && !blob && (
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
          {blob && !recording && (
            <button
              onClick={handleSend}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-bg"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
