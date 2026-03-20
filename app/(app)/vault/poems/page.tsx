"use client";

import BackHeader from "@/components/ui/BackHeader";

export default function PoemsPage() {
  return (
    <div className="min-h-screen">
      <BackHeader title="Poems" />
      <div className="flex flex-col items-center justify-center px-5 pt-32 text-center">
        <span className="text-5xl mb-4">📝</span>
        <h2 className="font-heading text-xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-sm text-text-muted">This section is under construction.</p>
      </div>
    </div>
  );
}
