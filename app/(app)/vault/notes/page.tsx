"use client";

import { useState } from "react";
import { ChevronDown, Mic, Plus, X, Loader2 } from "lucide-react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { useAllNotes } from "@/lib/hooks/useAllNotes";
import { useVaultNotes } from "@/lib/hooks/useVaultNotes";
import { useAuth } from "@/components/providers/AuthProvider";

export default function NotesPage() {
  const { role } = useAuth();
  const currentUserRole = role ?? "michael";
  const { notes: vaultNotes, loading: vaultLoading, addNote, deleteNote: deleteVaultNote } = useVaultNotes(currentUserRole);
  const { groups, loading: annotationsLoading, deleteNote: deleteAnnotation } = useAllNotes(currentUserRole);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState("");

  const loading = vaultLoading || annotationsLoading;

  const formatDuration = (d: number | null) => {
    if (!d) return "voice note";
    return `${Math.floor(d / 60)}:${(d % 60).toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });

  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    addNote(trimmed);
    setNewText("");
    setShowForm(false);
  };

  if (loading) {
    return (
      <div>
        <BackHeader title="Notes" />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-text-dim" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackHeader
        title="Notes"
        rightAction={
          <button onClick={() => setShowForm(!showForm)} className="text-accent">
            <Plus size={20} />
          </button>
        }
      />
      <div className="px-5 py-4">
        {/* Add note form */}
        {showForm && (
          <Card className="mb-4 animate-fade-in-up">
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
              }}
              placeholder="Jot something down..."
              className="mb-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
              rows={3}
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={!newText.trim()}
              className="rounded-lg bg-cv-accent/20 px-3 py-1.5 text-xs font-medium text-cv-accent transition-colors hover:bg-cv-accent/30 disabled:opacity-40"
            >
              Save Note
            </button>
          </Card>
        )}

        {/* My Notes section */}
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-text-muted">
            My Notes ({vaultNotes.length})
          </h3>
          {vaultNotes.length === 0 ? (
            <p className="text-xs text-text-dim">
              Tap + to add notes about things to remember
            </p>
          ) : (
            <div className="space-y-2">
              {vaultNotes.map((note, i) => (
                <Card
                  key={note.id}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
                >
                  <div className="flex items-start gap-2">
                    <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-text">
                      {note.text}
                    </p>
                    <button
                      onClick={() => deleteVaultNote(note.id)}
                      className="shrink-0 rounded p-1 text-text-dim opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                      title="Delete note"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="mt-1.5 text-[10px] text-text-dim/50">
                    {formatDate(note.created_at)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Voice Note Annotations section */}
        {groups.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-dim">
              Voice Note Annotations ({groups.reduce((sum, g) => sum + g.notes.length, 0)})
            </h3>
            <div className="space-y-2">
              {groups.map((group) => {
                const isExpanded = expandedMessage === group.message_id;
                return (
                  <Card key={group.message_id}>
                    <button
                      onClick={() => setExpandedMessage(isExpanded ? null : group.message_id)}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface">
                        <Mic size={14} className="text-text-dim" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium capitalize text-text-muted">
                          {group.from_user}&apos;s voice note &middot; {formatDuration(group.duration)}
                        </p>
                        <p className="text-[10px] text-text-dim">
                          {formatDate(group.created_at)} &middot; {group.notes.length} note{group.notes.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-text-dim transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2">
                        {group.notes.map((note) => (
                          <div key={note.id} className="group/note flex items-start gap-2 rounded-lg bg-surface/60 px-2.5 py-1.5">
                            <p className="flex-1 whitespace-pre-wrap text-xs leading-relaxed text-text-dim">
                              {note.text}
                            </p>
                            <button
                              onClick={() => deleteAnnotation(note.id, group.message_id)}
                              className="shrink-0 rounded p-0.5 text-text-dim opacity-0 transition-opacity hover:text-red-400 group-hover/note:opacity-100"
                              title="Delete"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
