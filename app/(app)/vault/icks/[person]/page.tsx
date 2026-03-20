"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useIcks } from "@/lib/hooks/useIcks";
import { logActivity } from "@/lib/logActivity";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserRole } from "@/lib/types/database";

export default function PersonIcksPage() {
  const params = useParams();
  const person = params.person as UserRole;
  const personName = person === "michael" ? "Michael" : "Chloe";

  const { icks, loading, addIck, updateIck, deleteIck } = useIcks();
  const { role } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const filtered = icks.filter((i) => i.about === person);

  const handleAdd = () => {
    if (!newText.trim()) return;
    addIck({
      text: newText.trim(),
      about: person,
      added_by: role || "michael",
    });
    const name = (role || "michael") === "michael" ? "Michael" : "Chloe";
    logActivity("🫠", `${name} added an ick for ${personName}`, "/vault/icks");
    setNewText("");
    setShowForm(false);
  };

  return (
    <div>
      <BackHeader title="Icks" />

      <div className="px-5 py-4">
        {/* Person header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
              <span>🫠</span> {personName}&apos;s Icks
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              {loading ? "..." : `${filtered.length} absolute dealbreaker${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/30"
          >
            + Add
          </button>
        </div>

        {showForm && (
          <Card className="mb-4 animate-fade-in-up">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What's the ick?"
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} size="sm">Add Ick</Button>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="mb-3 text-4xl">🫠</span>
            <p className="text-sm text-text-muted">No icks yet</p>
            <p className="mt-1 text-xs text-text-dim">Add {personName}&apos;s first ick</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((ick, i) => (
              <Card
                key={ick.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-base">🚩</span>
                  {editingId === ick.id ? (
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editText.trim()) {
                          updateIck(ick.id, editText.trim());
                          setEditingId(null);
                        } else if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                      autoFocus
                      className="flex-1 rounded-lg border border-accent/50 bg-surface px-2 py-1 text-sm text-text focus:outline-none"
                    />
                  ) : (
                    <p className="flex-1 text-sm leading-relaxed">{ick.text}</p>
                  )}
                  <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
                    {editingId === ick.id ? (
                      <>
                        <button
                          onClick={() => {
                            if (editText.trim()) updateIck(ick.id, editText.trim());
                            setEditingId(null);
                          }}
                          className="text-text-dim transition-colors hover:text-green-400"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-text-dim transition-colors hover:text-text-muted"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(ick.id); setEditText(ick.text); }}
                          className="text-text-dim transition-colors hover:text-accent"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteIck(ick.id)}
                          className="text-text-dim transition-colors hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editingId !== ick.id && (
                  <div className="flex justify-end mt-1.5">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${
                      ick.added_by === "michael"
                        ? "bg-michael/15 text-michael"
                        : "bg-chloe/15 text-chloe"
                    }`}>
                      {ick.added_by === "michael" ? "Michael" : "Chloe"}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
