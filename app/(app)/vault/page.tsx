"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import Card from "@/components/ui/Card";
import { VAULT_SECTIONS } from "@/lib/constants";

export default function VaultPage() {
  return (
    <div className="px-5 pt-14">
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Lock size={16} className="text-accent" />
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            The Vault
          </h1>
        </div>
        <p className="text-sm text-text-muted">Our shared collection</p>
      </div>

      <div className="space-y-3">
        {VAULT_SECTIONS.map((section, i) => (
          <Link key={section.href} href={section.href}>
            <Card
              className="flex items-center gap-4 animate-fade-in-up mb-3"
              style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-2xl">
                {section.emoji}
              </span>
              <div className="flex-1">
                <h3 className="font-medium">{section.title}</h3>
                <p className="text-sm text-text-muted">{section.description}</p>
              </div>
              <span className="text-text-dim">&rsaquo;</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
