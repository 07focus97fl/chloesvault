import type { Message } from "@/lib/types/database";

export interface MessageGroup {
  label: string;
  messages: Message[];
}

export function groupMessagesByDate(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let currentLabel = "";
  let currentGroup: Message[] = [];

  for (const msg of messages) {
    const label = getDateLabel(msg.created_at);
    if (label !== currentLabel) {
      if (currentGroup.length > 0) {
        groups.push({ label: currentLabel, messages: currentGroup });
      }
      currentLabel = label;
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  }

  if (currentGroup.length > 0) {
    groups.push({ label: currentLabel, messages: currentGroup });
  }

  return groups;
}

function getDateLabel(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = today.getTime() - dateDay.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) return "Today";
  if (daysDiff === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function formatMessageTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
