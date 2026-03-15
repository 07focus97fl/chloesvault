"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MOCK_MOMENTS } from "@/lib/mock-data";
import type { Moment } from "@/lib/types/database";

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>(MOCK_MOMENTS);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newEmoji, setNewEmoji] = useState("✨");
  const [newDesc, setNewDesc] = useState("");

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate) return;
    const moment: Moment = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      date: newDate,
      emoji: newEmoji || "✨",
      description: newDesc.trim(),
      added_by: "michael",
      created_at: new Date().toISOString(),
    };
    setMoments((prev) => [moment, ...prev]);
    setNewTitle("");
    setNewDate("");
    setNewEmoji("✨");
    setNewDesc("");
    setShowForm(false);
  };

  return (
    <div>
      <BackHeader
        title="Moments"
        rightAction={
          <button onClick={() => setShowForm(!showForm)} className="text-accent">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-5 py-4">
        {showForm && (
          <Card className="mb-4 animate-fade-in-up">
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                placeholder="✨"
                className="w-14 rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm text-text focus:border-accent/50 focus:outline-none"
              />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
              />
            </div>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent/50 focus:outline-none"
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe this moment..."
              className="mb-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
              rows={2}
            />
            <Button onClick={handleAdd} size="sm">Add Moment</Button>
          </Card>
        )}

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {moments.map((moment, i) => (
              <div
                key={moment.id}
                className="relative flex gap-4 pl-10 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
              >
                {/* Timeline dot */}
                <div className="absolute left-3.5 top-4 flex h-4 w-4 items-center justify-center rounded-full border-2 border-accent bg-bg">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                </div>

                <Card className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-lg">{moment.emoji}</span>
                    <h3 className="font-medium">{moment.title}</h3>
                  </div>
                  <p className="mb-1 text-sm text-text/80">{moment.description}</p>
                  <p className="text-xs text-text-dim">
                    {new Date(moment.date).toLocaleDateString("en", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
