"use client";

import Link from "next/link";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { useNightmares } from "@/lib/hooks/useNightmares";

export default function NightmaresPage() {
  const { nightmares, loading } = useNightmares();

  const michaelCount = nightmares.filter((n) => n.about === "michael").length;
  const chloeCount = nightmares.filter((n) => n.about === "chloe").length;

  const sections = [
    { name: "Michael", person: "michael", emoji: "😱", count: michaelCount },
    { name: "Chloe", person: "chloe", emoji: "😱", count: chloeCount },
  ];

  return (
    <div>
      <BackHeader title="Nightmares" />

      <div className="px-5 py-4 space-y-3">
        {sections.map((section, i) => (
          <Link key={section.person} href={`/vault/nightmares/${section.person}`}>
            <Card
              className="flex items-center gap-4 animate-fade-in-up mb-3"
              style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-2xl">
                {section.emoji}
              </span>
              <div className="flex-1">
                <h3 className="font-medium">{section.name}&apos;s Nightmares</h3>
                <p className="text-sm text-text-muted">
                  {loading ? "..." : `${section.count} nightmare${section.count !== 1 ? "s" : ""}`}
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
