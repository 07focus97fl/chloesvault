"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react";
import { useQuotes } from "@/lib/hooks/useQuotes";
import { logActivity } from "@/lib/logActivity";
import { useQuoteCategories } from "@/lib/hooks/useQuoteCategories";
import { useAuth } from "@/components/providers/AuthProvider";

function getCurrentMonth() {
  return new Date().toLocaleDateString("en", { month: "long", year: "numeric" });
}

function shiftMonth(month: string, direction: -1 | 1): string {
  const date = new Date(month + " 1");
  date.setMonth(date.getMonth() + direction);
  return date.toLocaleDateString("en", { month: "long", year: "numeric" });
}

export default function QuotesPage() {
  const { quotes, loading, addQuote, deleteQuote, updateQuote, getQuotesByCategoryAndMonth } = useQuotes();
  const { categories, addCategory, deleteCategory } = useQuoteCategories();
  const { role } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  // New category form
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("📝");

  // Edit quote state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editAuthor, setEditAuthor] = useState("");

  const isCurrentMonth = selectedMonth === getCurrentMonth();

  const handleAdd = () => {
    if (!newText.trim() || !newAuthor.trim() || !selectedCategory) return;
    addQuote({
      text: newText.trim(),
      author: newAuthor.trim(),
      category: selectedCategory,
      month: selectedMonth,
      added_by: role || "michael",
    });
    const name = (role || "michael") === "michael" ? "Michael" : "Chloe";
    logActivity("💬", `${name} added a quote`, "/vault/quotes");
    setNewText("");
    setNewAuthor("");
    setShowForm(false);
  };

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) return;
    const value = newCatLabel.trim().toLowerCase().replace(/\s+/g, "_");
    addCategory({ value, label: newCatLabel.trim(), emoji: newCatEmoji || "📝" });
    setNewCatLabel("");
    setNewCatEmoji("📝");
    setShowNewCategory(false);
  };

  const handlePrevMonth = () => setSelectedMonth((m) => shiftMonth(m, -1));
  const handleNextMonth = () => {
    if (!isCurrentMonth) setSelectedMonth((m) => shiftMonth(m, 1));
  };

  // Category detail view
  if (selectedCategory) {
    const categoryInfo = categories.find((c) => c.value === selectedCategory);
    if (!categoryInfo) {
      setSelectedCategory(null);
      return null;
    }
    const categoryQuotes = getQuotesByCategoryAndMonth(selectedCategory, selectedMonth);

    return (
      <div>
        <BackHeader
          title={categoryInfo.emoji + " " + categoryInfo.label}
          rightAction={
            isCurrentMonth ? (
              <button onClick={() => setShowForm(!showForm)} className="text-accent">
                <Plus size={20} />
              </button>
            ) : undefined
          }
          onBack={() => {
            setSelectedCategory(null);
            setShowForm(false);
          }}
        />

        <div className="px-5 py-4">
          {/* Month nav */}
          <div className="mb-5 flex items-center justify-between">
            <button onClick={handlePrevMonth} className="rounded-lg p-2 text-text-muted active:bg-surface">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-text">{selectedMonth}</span>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className="rounded-lg p-2 text-text-muted active:bg-surface disabled:opacity-20"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Add form */}
          {showForm && isCurrentMonth && (
            <Card className="mb-4 animate-fade-in-up">
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="What did they say?..."
                className="mb-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
                rows={3}
              />
              <input
                type="text"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Who said it?"
                className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
              />
              <Button onClick={handleAdd} size="sm">Add Quote</Button>
            </Card>
          )}

          {/* Quotes list */}
          {categoryQuotes.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl">{categoryInfo.emoji}</p>
              <p className="mt-2 text-sm text-text-muted">
                {isCurrentMonth ? "No quotes yet this month. Add the first one!" : "No quotes this month."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryQuotes.map((quote, i) => (
                <Card
                  key={quote.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` } as React.CSSProperties}
                >
                  {editingId === quote.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="mb-2 w-full resize-none rounded-lg border border-accent/50 bg-surface px-3 py-2 text-sm text-text focus:outline-none"
                        rows={3}
                      />
                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="mb-2 w-full rounded-lg border border-accent/50 bg-surface px-3 py-2 text-sm text-text focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (editText.trim() && editAuthor.trim()) {
                              updateQuote(quote.id, { text: editText.trim(), author: editAuthor.trim() });
                            }
                            setEditingId(null);
                          }}
                          size="sm"
                        >
                          Save
                        </Button>
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
                      <p className="mb-2 font-heading text-base italic leading-relaxed">
                        &ldquo;{quote.text}&rdquo;
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-text-muted">— {quote.author}</p>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-xs mr-1"
                            style={{ color: quote.added_by === "michael" ? "var(--michael)" : "var(--chloe)" }}
                          >
                            {quote.added_by === "michael" ? "Michael" : "Chloe"}
                          </span>
                          <button
                            onClick={() => { setEditingId(quote.id); setEditText(quote.text); setEditAuthor(quote.author); }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-all hover:bg-accent/10 hover:text-accent"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteQuote(quote.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-all hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Landing view — category picker
  return (
    <div>
      <BackHeader
        title="Quotes"
        rightAction={
          <button onClick={() => setShowNewCategory(!showNewCategory)} className="text-accent">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-5 py-4">
        {/* Month nav */}
        <div className="mb-5 flex items-center justify-between">
          <button onClick={handlePrevMonth} className="rounded-lg p-2 text-text-muted active:bg-surface">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-text">{selectedMonth}</span>
          <button
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            className="rounded-lg p-2 text-text-muted active:bg-surface disabled:opacity-20"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* New category form */}
        {showNewCategory && (
          <Card className="mb-4 animate-fade-in-up">
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
                placeholder="📝"
                className="w-14 rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm text-text focus:border-accent/50 focus:outline-none"
              />
              <input
                type="text"
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder="Category name"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
              />
            </div>
            <Button onClick={handleAddCategory} size="sm">Create Category</Button>
          </Card>
        )}

        {/* Category cards */}
        <div className="space-y-3">
          {categories.map((cat, i) => {
            const count = getQuotesByCategoryAndMonth(cat.value, selectedMonth).length;
            return (
              <div
                key={cat.id}
                className="animate-fade-in-up flex items-center gap-2"
                style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
              >
                <button
                  onClick={() => setSelectedCategory(cat.value)}
                  className="flex-1 text-left"
                >
                  <Card className="transition-colors active:bg-surface">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <div className="flex-1">
                        <p className="font-heading text-base font-semibold text-text">{cat.label}</p>
                        <p className="text-xs text-text-muted">
                          {count === 0 ? "No quotes yet" : `${count} quote${count !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-text-dim transition-all hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
