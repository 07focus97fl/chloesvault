"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Plus } from "lucide-react";
import { MOCK_QUOTES } from "@/lib/mock-data";
import type { Quote } from "@/lib/types/database";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  const currentQuote = quotes.find((q) => q.is_current);
  const pastQuotes = quotes.filter((q) => !q.is_current);

  const handleAdd = () => {
    if (!newText.trim() || !newAuthor.trim()) return;
    const quote: Quote = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      author: newAuthor.trim(),
      month: new Date().toLocaleDateString("en", { month: "long", year: "numeric" }),
      added_by: "michael",
      is_current: false,
      created_at: new Date().toISOString(),
    };
    setQuotes((prev) => [quote, ...prev]);
    setNewText("");
    setNewAuthor("");
    setShowForm(false);
  };

  return (
    <div>
      <BackHeader
        title="Quotes"
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
              placeholder="Enter the quote..."
              className="mb-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
              rows={3}
            />
            <input
              type="text"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              placeholder="Author"
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
            />
            <Button onClick={handleAdd} size="sm">Add Quote</Button>
          </Card>
        )}

        {currentQuote && (
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="accent">Current</Badge>
              <span className="text-xs text-text-muted">{currentQuote.month}</span>
            </div>
            <Card className="animate-fade-in-up">
              <p className="mb-2 font-heading text-base italic leading-relaxed">
                &ldquo;{currentQuote.text}&rdquo;
              </p>
              <p className="text-sm text-text-muted">— {currentQuote.author}</p>
            </Card>
          </div>
        )}

        {pastQuotes.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-muted">Past Quotes</h3>
            <div className="space-y-3">
              {pastQuotes.map((quote, i) => (
                <Card
                  key={quote.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
                >
                  <p className="mb-1 text-xs text-text-dim">{quote.month}</p>
                  <p className="mb-2 font-heading text-sm italic leading-relaxed text-text/80">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <p className="text-xs text-text-muted">— {quote.author}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
