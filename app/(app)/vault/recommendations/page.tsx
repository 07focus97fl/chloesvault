"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { MOCK_RECOMMENDATIONS } from "@/lib/mock-data";
import { REC_CATEGORIES } from "@/lib/constants";
import type { Recommendation, RecCategory } from "@/lib/types/database";

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS);
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<RecCategory>("movie");
  const [newEmoji, setNewEmoji] = useState("🎬");

  const filtered = filter === "all" ? recs : recs.filter((r) => r.category === filter);

  const toggleDone = (id: string) => {
    setRecs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    );
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const rec: Recommendation = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      category: newCategory,
      from_user: "michael",
      emoji: newEmoji || "🎬",
      done: false,
      created_at: new Date().toISOString(),
    };
    setRecs((prev) => [rec, ...prev]);
    setNewTitle("");
    setShowForm(false);
  };

  return (
    <div>
      <BackHeader
        title="Recommendations"
        rightAction={
          <button onClick={() => setShowForm(!showForm)} className="text-accent">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-5 py-4">
        {/* Category filter pills */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {REC_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                filter === cat.value
                  ? "bg-accent text-bg"
                  : "border border-border bg-card text-text-muted"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {showForm && (
          <Card className="mb-4 animate-fade-in-up">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
            />
            <div className="mb-3 flex gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as RecCategory)}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent/50 focus:outline-none"
              >
                {REC_CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-14 rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm focus:border-accent/50 focus:outline-none"
              />
            </div>
            <Button onClick={handleAdd} size="sm">Add</Button>
          </Card>
        )}

        <div className="space-y-2">
          {filtered.map((rec, i) => (
            <Card
              key={rec.id}
              className="flex items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
            >
              <span className="text-xl">{rec.emoji}</span>
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${rec.done ? "line-through text-text-dim" : ""}`}>
                  {rec.title}
                </h3>
                <p className="text-xs text-text-dim capitalize">{rec.category}</p>
              </div>
              <button
                onClick={() => toggleDone(rec.id)}
                className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                  rec.done
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-border text-text-dim hover:border-accent/30"
                }`}
              >
                {rec.done && <Check size={14} />}
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
