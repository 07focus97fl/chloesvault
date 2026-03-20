"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { VAULT_SECTIONS } from "@/lib/constants";

export default function VaultPage() {
  return (
    <div className="flex flex-col px-5 pt-14 pb-24 min-h-screen">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Vault
        </h1>
        <p className="text-sm text-text-muted mt-1">Your shared treasure chest</p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1 auto-rows-fr">
        {VAULT_SECTIONS.map((section, i) => (
          <Link
            key={section.href}
            href={section.href}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 0.04}s` } as React.CSSProperties}
          >
            <Card className="h-full flex flex-col justify-center items-center gap-2 text-center">
              <span className="text-3xl">{section.emoji}</span>
              <span className="font-heading font-semibold text-sm">{section.title}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
