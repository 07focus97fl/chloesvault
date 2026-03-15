"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useNightmares } from "@/lib/hooks/useNightmares";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserRole } from "@/lib/types/database";

export default function PersonNightmaresPage() {
  const params = useParams();
  const person = params.person as UserRole;
  const personName = person === "michael" ? "Michael" : "Chloe";

  const { nightmares, loading, addNightmare, deleteNightmare } = useNightmares();
  const { role } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState("");

  const filtered = nightmares.filter((n) => n.about === person);

  const handleAdd = () => {
    if (!newText.trim()) return;
    addNightmare({
      text: newText.trim(),
      about: person,
      added_by: role || "michael",
    });
    setNewText("");
    setShowForm(false);
  };

  return (
    <div>
      <BackHeader
        title={`${personName}'s Nightmares`}
        rightAction={
          <button onClick={() => setShowForm(!showForm)} className="text-accent">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-5 py-4">
        {showForm && (
          <Card className="mb-4 animate-fade-in-up">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What's the nightmare?"
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} size="sm">Add Nightmare</Button>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="mb-3 text-4xl">😱</span>
            <p className="text-sm text-text-muted">No nightmares yet</p>
            <p className="mt-1 text-xs text-text-dim">Add {personName}&apos;s first nightmare</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n, i) => (
              <Card
                key={n.id}
                className="flex items-start gap-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
              >
                <span className="mt-0.5 text-base">😱</span>
                <p className="flex-1 text-sm leading-relaxed">{n.text}</p>
                <button
                  onClick={() => deleteNightmare(n.id)}
                  className="mt-0.5 shrink-0 text-text-dim transition-colors hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
