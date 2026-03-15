"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { QUOTE_CATEGORIES } from "@/lib/constants";
import { useQuotes } from "@/lib/hooks/useQuotes";
import { useAuth } from "@/components/providers/AuthProvider";
import type { QuoteCategory } from "@/lib/types/database";

function getCurrentMonth() {
  return new Date().toLocaleDateString("en", { month: "long", year: "numeric" });
}

function shiftMonth(month: string, direction: -1 | 1): string {
  const date = new Date(month + " 1");
  date.setMonth(date.getMonth() + direction);
  return date.toLocaleDateString("en", { month: "long", year: "numeric" });
}

export default function QuotesPage() {
  const { quotes, loading, addQuote, getQuotesByCategoryAndMonth } = useQuotes();
  const { role } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<QuoteCategory | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

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
    setNewText("");
    setNewAuthor("");
    setShowForm(false);
  };

  const handlePrevMonth = () => setSelectedMonth((m) => shiftMonth(m, -1));
  const handleNextMonth = () => {
    if (!isCurrentMonth) setSelectedMonth((m) => shiftMonth(m, 1));
  };

  // Category detail view
  if (selectedCategory) {
    const categoryInfo = QUOTE_CATEGORIES.find((c) => c.value === selectedCategory)!;
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
                  <p className="mb-2 font-heading text-base italic leading-relaxed">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-muted">— {quote.author}</p>
                    <span
                      className="text-xs"
                      style={{ color: quote.added_by === "michael" ? "var(--michael)" : "var(--chloe)" }}
                    >
                      added by {quote.added_by}
                    </span>
                  </div>
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
      <BackHeader title="Quotes" />

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

        {/* Category cards */}
        <div className="space-y-3">
          {QUOTE_CATEGORIES.map((cat, i) => {
            const count = getQuotesByCategoryAndMonth(cat.value, selectedMonth).length;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value as QuoteCategory)}
                className="animate-fade-in-up w-full text-left"
                style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
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
                    <ChevronRight size={16} className="text-text-dim" />
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
