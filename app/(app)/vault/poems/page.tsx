"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Trash2 } from "lucide-react";
import { usePoems } from "@/lib/hooks/usePoems";
import { logActivity } from "@/lib/logActivity";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserRole } from "@/lib/types/database";


export default function PoemsPage() {
  const { poems, loading, addPoem, deletePoem } = usePoems();
  const { role } = useAuth();
  const currentUser = (role || "michael") as UserRole;
  const otherUser: UserRole = currentUser === "michael" ? "chloe" : "michael";

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newToUser, setNewToUser] = useState<UserRole>(otherUser);
  const [newDate, setNewDate] = useState("");

  const handleAdd = () => {
    if (!newTitle.trim() || !newText.trim() || !newDate) return;
    addPoem({
      title: newTitle.trim(),
      text: newText.trim(),
      type: "poem",
      from_user: currentUser,
      to_user: newToUser,
      date: newDate,
    });
    const name = currentUser === "michael" ? "Michael" : "Chloe";
    logActivity("✍️", `${name} wrote a poem: "${newTitle.trim()}"`, "/vault/poems");
    setNewTitle("");
    setNewText("");
    setNewDate("");
    setShowForm(false);
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div>
      <BackHeader title="Poems" />

      <div className="px-5 py-4">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
              <span>✍️</span> Poems
            </h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/30"
          >
            + Write
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <Card className="mb-5 animate-fade-in-up">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Poem title"
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
            />
            <select
              value={newToUser}
              onChange={(e) => setNewToUser(e.target.value as UserRole)}
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent/50 focus:outline-none"
            >
              <option value="michael">To Michael</option>
              <option value="chloe">To Chloe</option>
            </select>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent/50 focus:outline-none"
            />
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Write your poem..."
              className="mb-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none font-mono"
              rows={6}
            />
            <Button onClick={handleAdd} size="sm">Add Poem</Button>
          </Card>
        )}

        {/* Timeline */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-3">
              {poems.map((poem, i) => {
                const isExpanded = !collapsedIds.has(poem.id);
                return (
                  <div
                    key={poem.id}
                    className="relative pl-8 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.08}s` } as React.CSSProperties}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-1.5 top-5 h-3 w-3 rounded-full border-2 border-accent bg-bg" />

                    <Card>
                      <button
                        onClick={() => setCollapsedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(poem.id)) next.delete(poem.id);
                          else next.add(poem.id);
                          return next;
                        })}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-heading text-base font-semibold">{poem.title}</h3>
                            <p className="mt-1 text-xs text-text-dim">
                              {new Date(poem.date).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
                              {" · "}
                              <span className={poem.from_user === "michael" ? "text-michael" : "text-chloe"}>
                                {capitalize(poem.from_user)}
                              </span>
                              <span className="text-text-dim"> → </span>
                              <span className={poem.to_user === "michael" ? "text-michael" : "text-chloe"}>
                                {capitalize(poem.to_user)}
                              </span>
                            </p>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`shrink-0 text-text-dim transition-transform mt-1 ${isExpanded ? "" : "-rotate-90"}`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-3">
                          <div className="border-l-2 border-accent/40 pl-4 py-1">
                            <p className="text-sm italic leading-relaxed text-text/90 whitespace-pre-line">
                              {poem.text}
                            </p>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => deletePoem(poem.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-all hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
