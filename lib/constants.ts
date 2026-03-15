import { Home, MessageCircle, Lock } from "lucide-react";

export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Chat", href: "/chat", icon: MessageCircle },
  { label: "Vault", href: "/vault", icon: Lock },
] as const;

export const REC_CATEGORIES = [
  { value: "all", label: "All", emoji: "✨" },
  { value: "movie", label: "Movies", emoji: "🎬" },
  { value: "show", label: "Shows", emoji: "📺" },
  { value: "book", label: "Books", emoji: "📚" },
  { value: "song", label: "Songs", emoji: "🎵" },
  { value: "podcast", label: "Podcasts", emoji: "🎙️" },
  { value: "other", label: "Other", emoji: "💡" },
] as const;

export const QUOTE_CATEGORIES = [
  { value: "racist", label: "Racist Quote of the Month", emoji: "😬" },
  { value: "out_of_context", label: "Out of Context", emoji: "🤨" },
  { value: "libtard", label: "Libtard Quote of the Month", emoji: "🗳️" },
] as const;

export const VAULT_SECTIONS = [
  { title: "Quotes", href: "/vault/quotes", emoji: "💬", description: "Words that move us" },
  { title: "Moments", href: "/vault/moments", emoji: "✨", description: "Favorite memories" },
  { title: "Recommendations", href: "/vault/recommendations", emoji: "🎬", description: "Things to explore" },
  { title: "Topics", href: "/vault/topics", emoji: "💭", description: "Things to talk about" },
  { title: "Nightmares", href: "/vault/nightmares", emoji: "😱", description: "The scary ones" },
] as const;
