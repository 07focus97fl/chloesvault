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
import GifPicker from "@/components/chat/GifPicker";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMessages } from "@/lib/hooks/useMessages";
import { useMessageNotes } from "@/lib/hooks/useMessageNotes";
import { groupMessagesByDate } from "@/lib/utils/date";
import { useMessageSearch } from "@/lib/hooks/useMessageSearch";
import { usePinnedMessages } from "@/lib/hooks/usePinnedMessages";
import { useMessageFolders } from "@/lib/hooks/useMessageFolders";
import { usePresence } from "@/lib/hooks/usePresence";
import { Loader2 } from "lucide-react";
import type { Message } from "@/lib/types/database";

export default function ChatPage() {
  const { role } = useAuth();
  const currentUserRole = role ?? "michael";

  const {
    messages,
    setMessages,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    sendMessage,
    sendVoiceNote,
    sendImage,
    sendGif,
    markAsRead,
  } = useMessages();

  const { isOtherOnline } = usePresence(currentUserRole);

  const {
    addNote,
    deleteNote,
    getNotesForMessage,
    fetchNotes,
    promoteToTopic,
  } = useMessageNotes(currentUserRole);

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pinnedPanelOpen, setPinnedPanelOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<Message | null>(null);
  const [folderPickerMessage, setFolderPickerMessage] = useState<Message | null>(null);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInitialScroll = useRef(true);

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

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (loading) return;
    if (isInitialScroll.current) {
      bottomRef.current?.scrollIntoView();
      isInitialScroll.current = false;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Mark messages from the other user as read
  useEffect(() => {
    if (loading || messages.length === 0) return;
    const hasUnread = messages.some(
      (m) => m.from_user !== currentUserRole && m.status !== "read"
    );
    if (hasUnread) markAsRead(currentUserRole);
  }, [messages, loading, currentUserRole, markAsRead]);

  // Scroll to search result
  useEffect(() => {
    if (search.currentMessageId) {
      const el = messageRefs.current.get(search.currentMessageId);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [search.currentMessageId]);

  // Intersection observer for "load more" sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollContainerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          // Save scroll height before prepending
          const prevScrollHeight = container.scrollHeight;
          loadMore().then(() => {
            // Restore scroll position after prepend
            requestAnimationFrame(() => {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop += newScrollHeight - prevScrollHeight;
            });
          });
        }
      },
      { root: container, threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, loadMore]);

  const scrollToMessage = useCallback((messageId: string) => {
    const el = messageRefs.current.get(messageId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("animate-pulse-soft");
      setTimeout(() => el.classList.remove("animate-pulse-soft"), 2000);
    }
  }, []);

  const handleSend = (text: string) => {
    sendMessage(currentUserRole, text);
  };

  const handleVoiceSend = async (blob: Blob, duration: number) => {
    const result = await sendVoiceNote(currentUserRole, blob, duration);
    setShowVoiceRecorder(false);
    if (!result.success) {
      setToast("Failed to send voice note");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleImageSend = (file: File) => {
    sendImage(currentUserRole, file);
  };

  const handleGifSend = (url: string) => {
    sendGif(currentUserRole, url);
    setGifPickerOpen(false);
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

  const handlePromoteToTopic = async (noteText: string) => {
    const success = await promoteToTopic(noteText);
    if (success) {
      setToast("Added to Topics");
      setTimeout(() => setToast(null), 2000);
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-[68px] z-30 mx-auto flex max-w-[430px] flex-col bg-bg">
      <ChatHeader
        otherName={otherName}
        currentUserRole={currentUserRole}
        isOnline={isOtherOnline}
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

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 px-4 py-4">
          {/* Sentinel for loading more */}
          <div ref={sentinelRef} className="h-1" />

          {loadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 size={20} className="animate-spin text-text-dim" />
            </div>
          )}

          {loading ? (
            <div className="flex flex-1 items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-text-dim" />
            </div>
          ) : (
            messageGroups.map((group) => (
              <div key={group.label}>
                <DateSeparator label={group.label} />
                <div className="flex flex-col gap-2">
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      ref={(el) => {
                        if (el) messageRefs.current.set(msg.id, el);
                      }}
                      className={`flex ${msg.from_user === currentUserRole ? "justify-end" : "justify-start"}`}
                    >
                      <MessageBubble
                        message={msg}
                        isMine={msg.from_user === currentUserRole}
                        highlightQuery={searchOpen ? search.query : undefined}
                        isSearchTarget={search.currentMessageId === msg.id}
                        onLongPress={() => setActionMessage(msg)}
                        notes={msg.type === "voice" ? getNotesForMessage(msg.id) : undefined}
                        onAddNote={msg.type === "voice" ? addNote : undefined}
                        onDeleteNote={msg.type === "voice" ? deleteNote : undefined}
                        onPromoteToTopic={msg.type === "voice" ? handlePromoteToTopic : undefined}
                        onFetchNotes={msg.type === "voice" ? fetchNotes : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {showVoiceRecorder ? (
        <VoiceRecorder
          onSend={handleVoiceSend}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      ) : (
        <ChatInput
          onSend={handleSend}
          onVoiceStart={() => setShowVoiceRecorder(true)}
          onImageSelect={handleImageSend}
          onGifOpen={() => setGifPickerOpen(true)}
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

      <GifPicker
        open={gifPickerOpen}
        onOpenChange={setGifPickerOpen}
        onSelect={handleGifSend}
      />

      {/* Toast */}
      {toast && (
        <div className="absolute inset-x-0 bottom-20 flex justify-center pointer-events-none z-50">
          <div className="rounded-full bg-surface border border-border px-4 py-2 text-xs font-medium text-text shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
