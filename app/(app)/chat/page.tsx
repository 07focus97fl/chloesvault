"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import ChatHeader from "@/components/chat/ChatHeader";
import DateSeparator from "@/components/chat/DateSeparator";
import SearchBar from "@/components/chat/SearchBar";
import MessageActions from "@/components/chat/MessageActions";
import PinnedMessagesPanel from "@/components/chat/PinnedMessagesPanel";
import FolderPicker from "@/components/chat/FolderPicker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/providers/AuthProvider";
import { MOCK_MESSAGES } from "@/lib/mock-data";
import { groupMessagesByDate } from "@/lib/utils/date";
import { useMessageSearch } from "@/lib/hooks/useMessageSearch";
import { usePinnedMessages } from "@/lib/hooks/usePinnedMessages";
import { useMessageFolders } from "@/lib/hooks/useMessageFolders";
import type { Message } from "@/lib/types/database";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pinnedPanelOpen, setPinnedPanelOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<Message | null>(null);
  const [folderPickerMessage, setFolderPickerMessage] = useState<Message | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { role } = useAuth();

  const currentUserRole = role ?? "michael";
  const otherName = currentUserRole === "michael" ? "Chloe" : "Michael";

  const search = useMessageSearch(messages);
  const { pinnedMessages, togglePin } = usePinnedMessages(messages, setMessages);
  const {
    folders,
    createFolder,
    addToFolder,
    removeFromFolder,
    getMessageFolderIds,
  } = useMessageFolders();

  const messageGroups = groupMessagesByDate(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll to search result
  useEffect(() => {
    if (search.currentMessageId) {
      const el = messageRefs.current.get(search.currentMessageId);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [search.currentMessageId]);

  const scrollToMessage = useCallback((messageId: string) => {
    const el = messageRefs.current.get(messageId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("animate-pulse-soft");
      setTimeout(() => el.classList.remove("animate-pulse-soft"), 2000);
    }
  }, []);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      from_user: currentUserRole,
      type: "text",
      text,
      voice_url: null,
      duration: null,
      status: "sent",
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleVoiceSend = (blob: Blob, duration: number) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      from_user: currentUserRole,
      type: "voice",
      text: null,
      voice_url: URL.createObjectURL(blob),
      duration,
      status: "sent",
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setShowVoiceRecorder(false);
  };

  const handlePinFromAction = (msg: Message) => {
    togglePin(msg.id, currentUserRole);
  };

  const handleToggleFolderItem = (folderId: string) => {
    if (!folderPickerMessage) return;
    const currentFolderIds = getMessageFolderIds(folderPickerMessage.id);
    if (currentFolderIds.includes(folderId)) {
      removeFromFolder(folderId, folderPickerMessage.id);
    } else {
      addToFolder(folderId, folderPickerMessage.id, currentUserRole);
    }
  };

  return (
    <div className="flex flex-col">
      <ChatHeader
        otherName={otherName}
        currentUserRole={currentUserRole}
        onSearchToggle={() => setSearchOpen((v) => !v)}
        onPinnedToggle={() => setPinnedPanelOpen(true)}
        pinnedCount={pinnedMessages.length}
      />

      {searchOpen && (
        <SearchBar
          query={search.query}
          onQueryChange={search.setQuery}
          onClose={() => {
            setSearchOpen(false);
            search.setQuery("");
          }}
          currentIndex={search.currentIndex}
          totalCount={search.totalCount}
          onNext={search.goNext}
          onPrev={search.goPrev}
        />
      )}

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 px-4 py-4">
          {messageGroups.map((group) => (
            <div key={group.label}>
              <DateSeparator label={group.label} />
              <div className="flex flex-col gap-2">
                {group.messages.map((msg) => (
                  <div
                    key={msg.id}
                    ref={(el) => {
                      if (el) messageRefs.current.set(msg.id, el);
                    }}
                  >
                    <MessageBubble
                      message={msg}
                      isMine={msg.from_user === currentUserRole}
                      highlightQuery={searchOpen ? search.query : undefined}
                      isSearchTarget={search.currentMessageId === msg.id}
                      onLongPress={() => setActionMessage(msg)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {showVoiceRecorder ? (
        <VoiceRecorder
          onSend={handleVoiceSend}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      ) : (
        <ChatInput
          onSend={handleSend}
          onVoiceStart={() => setShowVoiceRecorder(true)}
        />
      )}

      <MessageActions
        message={actionMessage}
        open={!!actionMessage}
        onOpenChange={(open) => !open && setActionMessage(null)}
        onPin={handlePinFromAction}
        onAddToFolder={(msg) => {
          setActionMessage(null);
          setFolderPickerMessage(msg);
        }}
      />

      <PinnedMessagesPanel
        open={pinnedPanelOpen}
        onOpenChange={setPinnedPanelOpen}
        pinnedMessages={pinnedMessages}
        onMessageClick={scrollToMessage}
      />

      <FolderPicker
        open={!!folderPickerMessage}
        onOpenChange={(open) => !open && setFolderPickerMessage(null)}
        folders={folders}
        messageFolderIds={
          folderPickerMessage ? getMessageFolderIds(folderPickerMessage.id) : []
        }
        onToggleFolder={handleToggleFolderItem}
        onCreateFolder={(name, emoji) => createFolder(name, emoji, currentUserRole)}
        userRole={currentUserRole}
      />
    </div>
  );
}
