"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Plus, Check, Trash2, Loader2 } from "lucide-react";
import { useTopics } from "@/lib/hooks/useTopics";
import { logActivity } from "@/lib/logActivity";
import { useAuth } from "@/components/providers/AuthProvider";

export default function TopicsPage() {
  const { role } = useAuth();
  const currentUserRole = role ?? "michael";
  const { topics, loading, addTopic, toggleUsed, deleteTopic } = useTopics();
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [filter, setFilter] = useState<"all" | "michael" | "chloe">("all");

  const filtered = filter === "all" ? topics : topics.filter((t) => t.added_by === filter);
  const unused = filtered.filter((t) => !t.used);
  const used = filtered.filter((t) => t.used);

  const handleAdd = () => {
    if (!newText.trim()) return;
    addTopic({ text: newText.trim(), used: false, added_by: currentUserRole });
    const name = currentUserRole === "michael" ? "Michael" : "Chloe";
    logActivity("💭", `${name} added a new topic`, "/vault/topics");
    setNewText("");
    setShowForm(false);
  };

  return (
    <div>
      <BackHeader
        title="Topics"
        rightAction={
          <button onClick={() => setShowForm(!showForm)} className="text-accent">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-text-dim" />
          </div>
        ) : null}
        {!loading && showForm && (
          <Card className="mb-4 animate-fade-in-up">
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What should we talk about?"
              className="mb-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
              rows={2}
            />
            <Button onClick={handleAdd} size="sm">Add Topic</Button>
          </Card>
        )}

        {!loading && (
          <div className="mb-4 flex gap-2">
            {(["all", "michael", "chloe"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  filter === option
                    ? option === "michael"
                      ? "bg-michael/20 text-michael border border-michael/30"
                      : option === "chloe"
                        ? "bg-chloe/20 text-chloe border border-chloe/30"
                        : "bg-accent/20 text-accent border border-accent/30"
                    : "border border-border text-text-dim hover:border-text-muted"
                }`}
              >
                {option === "all" ? "All" : option === "michael" ? "Michael" : "Chloe"}
              </button>
            ))}
          </div>
        )}

        {/* Unused topics */}
        {!loading && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-text-muted">
              Up Next ({unused.length})
            </h3>
            <div className="space-y-2">
              {unused.map((topic, i) => (
                <Card
                  key={topic.id}
                  className="flex items-start gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
                >
                  <span className="mt-0.5 text-base">💭</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{topic.text}</p>
                    <div className="flex justify-end mt-1">
                      <span className={`text-xs ${topic.added_by === "michael" ? "text-michael" : "text-chloe"}`}>
                        {topic.added_by === "michael" ? "Michael" : "Chloe"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => toggleUsed(topic.id)}
                      className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border text-text-dim transition-all hover:border-accent/30"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border text-text-dim transition-all hover:border-red-500/50 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Used topics */}
        {!loading && used.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-dim">
              Discussed ({used.length})
            </h3>
            <div className="space-y-2 opacity-60">
              {used.map((topic) => (
                <Card key={topic.id} className="flex items-start gap-3">
                  <span className="mt-0.5 text-base">✅</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-relaxed line-through text-text-dim">
                        {topic.text}
                      </p>
                      <span className={`text-xs shrink-0 ${topic.added_by === "michael" ? "text-michael" : "text-chloe"}`}>
                        Added by {topic.added_by === "michael" ? "Michael" : "Chloe"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => toggleUsed(topic.id)}
                      className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-accent bg-accent/20 text-accent"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border text-text-dim transition-all hover:border-red-500/50 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
