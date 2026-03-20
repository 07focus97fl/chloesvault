import { createClient } from "@/lib/supabase/client";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export async function logActivity(emoji: string, text: string, href?: string) {
  if (USE_MOCK) return;
  const supabase = createClient();
  await supabase.from("activity").insert({ emoji, text, href: href ?? null });
}
