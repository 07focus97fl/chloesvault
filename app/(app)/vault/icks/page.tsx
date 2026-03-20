"use client";

import Link from "next/link";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { useIcks } from "@/lib/hooks/useIcks";

export default function IcksPage() {
  const { icks, loading } = useIcks();

  const michaelCount = icks.filter((i) => i.about === "michael").length;
  const chloeCount = icks.filter((i) => i.about === "chloe").length;

  const sections = [
    { name: "Michael", person: "michael", count: michaelCount },
    { name: "Chloe", person: "chloe", count: chloeCount },
  ];

  return (
    <div>
      <BackHeader title="Icks" />

      <div className="px-5 py-4 space-y-3">
        {sections.map((section, i) => (
          <Link key={section.person} href={`/vault/icks/${section.person}`}>
            <Card
              className="flex items-center gap-4 animate-fade-in-up mb-3"
              style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-2xl">
                🫠
              </span>
              <div className="flex-1">
                <h3 className="font-medium">{section.name}&apos;s Icks</h3>
                <p className="text-sm text-text-muted">
                  {loading ? "..." : `${section.count} ick${section.count !== 1 ? "s" : ""}`}
                </p>
              </div>
              <span className="text-text-dim">&rsaquo;</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
