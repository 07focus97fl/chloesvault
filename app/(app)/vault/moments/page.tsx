"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import { useMoments } from "@/lib/hooks/useMoments";
import { logActivity } from "@/lib/logActivity";
import { useAuth } from "@/components/providers/AuthProvider";

export default function MomentsPage() {
  const { moments, loading, addMoment, deleteMoment, updateMoment } = useMoments();
  const { role } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newEmoji, setNewEmoji] = useState("✨");
  const [newDesc, setNewDesc] = useState("");

  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Group moments by month
  const groupedMoments = moments.reduce<Record<string, typeof moments>>((groups, moment) => {
    const d = new Date(moment.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(moment);
    return groups;
  }, {});

  const sortedMonthKeys = Object.keys(groupedMoments).sort((a, b) => b.localeCompare(a));

  const toggleMonth = (key: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const formatMonthKey = (key: string) => {
    const [year, month] = key.split("-");
    return new Date(Number(year), Number(month)).toLocaleDateString("en", { month: "long", year: "numeric" });
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate) return;
    addMoment({
      title: newTitle.trim(),
      date: newDate,
      emoji: newEmoji || "✨",
      description: newDesc.trim(),
      added_by: role || "michael",
    });
    const name = (role || "michael") === "michael" ? "Michael" : "Chloe";
    logActivity("✨", `${name} added a moment: "${newTitle.trim()}"`, "/vault/moments");
    setNewTitle("");
    setNewDate("");
    setNewEmoji("✨");
    setNewDesc("");
    setShowForm(false);
  };

  const startEdit = (moment: typeof moments[0]) => {
    setEditingId(moment.id);
    setEditTitle(moment.title);
    setEditDate(moment.date);
    setEditEmoji(moment.emoji);
    setEditDesc(moment.description);
  };

  const saveEdit = () => {
    if (!editingId || !editTitle.trim() || !editDate) return;
    updateMoment(editingId, {
      title: editTitle.trim(),
      date: editDate,
      emoji: editEmoji || "✨",
      description: editDesc.trim(),
    });
    setEditingId(null);
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

        <div className="space-y-6">
          {sortedMonthKeys.map((monthKey) => {
            const isCollapsed = collapsedMonths.has(monthKey);
            const monthMoments = groupedMoments[monthKey];
            return (
              <div key={monthKey}>
                {/* Month divider */}
                <button
                  onClick={() => toggleMonth(monthKey)}
                  className="mb-3 flex w-full items-center gap-3 group"
                >
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                    {formatMonthKey(monthKey)}
                    <span className="text-text-dim">({monthMoments.length})</span>
                    <ChevronDown
                      size={14}
                      className={`text-text-dim transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                    />
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </button>

                {!isCollapsed && (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                    <div className="space-y-4">
                      {monthMoments.map((moment, i) => (
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
                            {editingId === moment.id ? (
                              <div>
                                <div className="mb-2 flex gap-2">
                                  <input
                                    type="text"
                                    value={editEmoji}
                                    onChange={(e) => setEditEmoji(e.target.value)}
                                    className="w-12 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm text-text focus:border-accent/50 focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text focus:border-accent/50 focus:outline-none"
                                  />
                                </div>
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="mb-2 w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text focus:border-accent/50 focus:outline-none"
                                />
                                <textarea
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  className="mb-2 w-full resize-none rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text focus:border-accent/50 focus:outline-none"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <Button onClick={saveEdit} size="sm">Save</Button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="rounded-lg px-3 py-1 text-xs text-text-dim hover:text-text transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="text-lg">{moment.emoji}</span>
                                  <h3 className="flex-1 font-medium">{moment.title}</h3>
                                  <button
                                    onClick={() => startEdit(moment)}
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-all hover:bg-accent/10 hover:text-accent"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() => deleteMoment(moment.id)}
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-all hover:bg-red-500/10 hover:text-red-400"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                <p className="mb-1 text-sm text-text/80">{moment.description}</p>
                                <p className="text-xs text-text-dim">
                                  {new Date(moment.date).toLocaleDateString("en", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </>
                            )}
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
