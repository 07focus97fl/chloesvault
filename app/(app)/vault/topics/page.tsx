"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Plus, Check } from "lucide-react";
import { MOCK_TOPICS } from "@/lib/mock-data";
import type { Topic } from "@/lib/types/database";

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>(MOCK_TOPICS);
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState("");

  const unused = topics.filter((t) => !t.used);
  const used = topics.filter((t) => t.used);

  const toggleUsed = (id: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, used: !t.used } : t))
    );
  };

  const handleAdd = () => {
    if (!newText.trim()) return;
    const topic: Topic = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      used: false,
      added_by: "michael",
      created_at: new Date().toISOString(),
    };
    setTopics((prev) => [topic, ...prev]);
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
        {showForm && (
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

        {/* Unused topics */}
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
                <p className="flex-1 text-sm leading-relaxed">{topic.text}</p>
                <button
                  onClick={() => toggleUsed(topic.id)}
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-text-dim transition-all hover:border-accent/30"
                >
                  <Check size={12} />
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* Used topics */}
        {used.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-dim">
              Discussed ({used.length})
            </h3>
            <div className="space-y-2 opacity-60">
              {used.map((topic) => (
                <Card key={topic.id} className="flex items-start gap-3">
                  <span className="mt-0.5 text-base">✅</span>
                  <p className="flex-1 text-sm leading-relaxed line-through text-text-dim">
                    {topic.text}
                  </p>
                  <button
                    onClick={() => toggleUsed(topic.id)}
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent bg-accent/20 text-accent"
                  >
                    <Check size={12} />
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
