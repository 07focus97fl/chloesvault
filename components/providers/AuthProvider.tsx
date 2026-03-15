"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/types/database";

interface AuthContextType {
  role: UserRole | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  loading: true,
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cookieRole = getCookie("vault-role");
    if (cookieRole === "michael" || cookieRole === "chloe") {
      setRole(cookieRole);
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    document.cookie = "vault-role=; path=/; max-age=0";
    setRole(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
