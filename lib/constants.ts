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

export const DEFAULT_QUOTE_CATEGORIES = [
  { value: "racist", label: "Racist Quote of the Month", emoji: "😬" },
  { value: "out_of_context", label: "Out of Context", emoji: "🤨" },
  { value: "libtard", label: "Libtard Quote of the Month", emoji: "🗳️" },
];

export const VAULT_SECTIONS = [
  { title: "Topics", href: "/vault/topics", emoji: "💭", description: "Conversation starters & discussion ideas" },
  { title: "Notes", href: "/vault/notes", emoji: "🗒️", description: "Voice note annotations" },
  { title: "Recommendations", href: "/vault/recommendations", emoji: "🎬", description: "Movies, shows, books & more to share" },
  { title: "Moments", href: "/vault/moments", emoji: "✨", description: "Your relationship timeline & milestones" },
  { title: "Quotes", href: "/vault/quotes", emoji: "💬", description: "The most unhinged things we've said" },
  { title: "Nightmares", href: "/vault/nightmares", emoji: "😱", description: "Worst-case scenarios about each other" },
  { title: "Icks", href: "/vault/icks", emoji: "🫠", description: "Things that make us go absolutely not" },
  { title: "Poems", href: "/vault/poems", emoji: "📝", description: "Little verses we write for each other" },
] as const;
