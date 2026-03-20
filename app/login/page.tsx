"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const VAULT_PASSWORD = "chloe";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"michael" | "chloe" | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Pick who you are!");
      return;
    }

    if (password !== VAULT_PASSWORD) {
      setError("Wrong password");
      return;
    }

    document.cookie = `vault-role=${role}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Heart size={20} className="text-heart animate-pulse-soft" />
            <h1 className="font-heading text-4xl font-bold tracking-tight">
              ChloeVault
            </h1>
            <Heart size={20} className="text-heart animate-pulse-soft" />
          </div>
          <p className="text-sm text-text-muted">Who&apos;s here?</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Role picker */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRole("michael")}
              className={`flex-1 rounded-xl border py-4 text-center text-sm font-medium transition-all ${
                role === "michael"
                  ? "border-michael bg-michael/15 text-michael"
                  : "border-border bg-card text-text-muted hover:border-michael/30"
              }`}
            >
              Michael
            </button>
            <button
              type="button"
              onClick={() => setRole("chloe")}
              className={`flex-1 rounded-xl border py-4 text-center text-sm font-medium transition-all ${
                role === "chloe"
                  ? "border-chloe bg-chloe/15 text-chloe"
                  : "border-border bg-card text-text-muted hover:border-chloe/30"
              }`}
            >
              Chloe
            </button>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
          />

          {error && (
            <p className="text-center text-sm text-heart">{error}</p>
          )}

          <Button type="submit" className="w-full py-3">
            Enter the Vault
          </Button>
        </form>
      </div>
    </div>
  );
}
