"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}

export default function BackHeader({ title, rightAction }: BackHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={20} />
      </button>
      <h1 className="font-heading text-lg font-semibold">{title}</h1>
      <div className="w-8">{rightAction}</div>
    </header>
  );
}
