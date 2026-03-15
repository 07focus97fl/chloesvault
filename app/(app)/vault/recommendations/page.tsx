"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Plus, Check, Trash2, ExternalLink } from "lucide-react";
import { REC_CATEGORIES } from "@/lib/constants";
import { useRecommendations } from "@/lib/hooks/useRecommendations";
import { useAuth } from "@/components/providers/AuthProvider";
import type { RecCategory } from "@/lib/types/database";

export default function RecommendationsPage() {
  const { recommendations, loading, addRec, toggleDone, deleteRec } = useRecommendations();
  const { role } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<RecCategory>("movie");
  const [newLink, setNewLink] = useState("");

  const filtered = filter === "all" ? recommendations : recommendations.filter((r) => r.category === filter);
  const pending = filtered.filter((r) => !r.done);
  const done = filtered.filter((r) => r.done);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addRec({
      title: newTitle.trim(),
      category: newCategory,
      from_user: role || "michael",
      emoji: REC_CATEGORIES.find((c) => c.value === newCategory)?.emoji || "✨",
      done: false,
      link: newLink.trim() || null,
    });
    setNewTitle("");
    setNewLink("");
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
        {/* Category filter pills — wrapped rows */}
        <div className="mb-4 flex flex-wrap gap-2">
          {REC_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
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
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as RecCategory)}
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent/50 focus:outline-none"
            >
              {REC_CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="Link (optional)"
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
            />
            <Button onClick={handleAdd} size="sm">Add</Button>
          </Card>
        )}

        {/* Pending recommendations */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-text-muted">
            To Check Out ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map((rec, i) => (
              <Card
                key={rec.id}
                className="flex items-center gap-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
              >
                <span className="text-xl">{rec.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium">{rec.title}</h3>
                  <p className="text-xs text-text-dim capitalize">{rec.category}</p>
                </div>
                {rec.link && (
                  <a
                    href={rec.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-accent transition-all hover:bg-accent/10"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                <button
                  onClick={() => deleteRec(rec.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-all hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => toggleDone(rec.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-text-dim transition-all hover:border-accent/30"
                >
                  <Check size={14} />
                </button>
              </Card>
            ))}
            {pending.length === 0 && (
              <p className="text-center text-sm text-text-dim py-4">Nothing here yet</p>
            )}
          </div>
        </div>

        {/* Done recommendations */}
        {done.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-dim">
              Done ({done.length})
            </h3>
            <div className="space-y-2 opacity-60">
              {done.map((rec) => (
                <Card key={rec.id} className="flex items-center gap-3">
                  <span className="text-xl">{rec.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium line-through text-text-dim">{rec.title}</h3>
                    <p className="text-xs text-text-dim capitalize">{rec.category}</p>
                  </div>
                  {rec.link && (
                    <a
                      href={rec.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-accent transition-all hover:bg-accent/10"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => deleteRec(rec.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-all hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => toggleDone(rec.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-accent bg-accent/20 text-accent"
                  >
                    <Check size={14} />
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
