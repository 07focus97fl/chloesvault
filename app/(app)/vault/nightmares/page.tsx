"use client";

import { useState } from "react";
import BackHeader from "@/components/ui/BackHeader";
import Card from "@/components/ui/Card";
import { Plus } from "lucide-react";

export default function NightmaresPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <BackHeader
        title="Nightmares"
        rightAction={
          <button onClick={() => setShowForm(!showForm)} className="text-accent">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-5 py-4">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="mb-3 text-4xl">😱</span>
          <p className="text-sm text-text-muted">Nothing here yet</p>
          <p className="mt-1 text-xs text-text-dim">Add your first nightmare</p>
        </div>
      </div>
    </div>
  );
}
