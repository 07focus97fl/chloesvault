"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, ChevronRight, Plus, Loader2 } from "lucide-react";
import BackHeader from "@/components/ui/BackHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessageFolders } from "@/lib/hooks/useMessageFolders";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatMessageTime } from "@/lib/utils/date";
import type { Message } from "@/lib/types/database";

export default function FoldersPage() {
  const { role } = useAuth();
  const currentUserRole = role ?? "michael";
  const {
    folders,
    folderCounts,
    getFolderMessages,
    createFolder,
    deleteFolder,
  } = useMessageFolders();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderMessages, setFolderMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📁");

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  const loadFolderMessages = useCallback(async (folderId: string) => {
    setLoadingMessages(true);
    const messages = await getFolderMessages(folderId);
    setFolderMessages(messages);
    setLoadingMessages(false);
  }, [getFolderMessages]);

  useEffect(() => {
    if (selectedFolderId) {
      loadFolderMessages(selectedFolderId);
    } else {
      setFolderMessages([]);
    }
  }, [selectedFolderId, loadFolderMessages]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createFolder(newName.trim(), newEmoji, currentUserRole);
    setNewName("");
    setNewEmoji("📁");
    setCreating(false);
  };

  if (selectedFolder) {
    return (
      <div className="flex flex-col">
        <BackHeader
          title={`${selectedFolder.emoji} ${selectedFolder.name}`}
          onBack={() => setSelectedFolderId(null)}
        />
        <ScrollArea className="flex-1">
          {loadingMessages ? (
            <div className="flex justify-center py-20">
              <Loader2 size={24} className="animate-spin text-text-dim" />
            </div>
          ) : folderMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-20">
              <p className="text-sm text-text-muted">No messages in this folder</p>
              <p className="text-xs text-text-dim">
                Long-press a message in chat to add it here
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-4">
              {folderMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex flex-col gap-1.5 rounded-xl border border-cv-border bg-cv-card p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize text-text-muted">
                      {msg.from_user}
                    </span>
                    <span className="text-[10px] text-text-dim">
                      {new Date(msg.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {formatMessageTime(msg.created_at)}
                    </span>
                  </div>
                  {msg.type === "text" ? (
                    <p className="text-sm leading-relaxed text-text">{msg.text}</p>
                  ) : msg.type === "image" ? (
                    <p className="text-sm text-text-muted">📷 Photo</p>
                  ) : msg.type === "gif" ? (
                    <p className="text-sm text-text-muted">GIF</p>
                  ) : (
                    <p className="text-sm text-text-muted">
                      🎙️ Voice note ({msg.duration}s)
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <BackHeader title="Message Folders" />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className="group flex items-center gap-3 rounded-xl border border-cv-border bg-cv-card p-4 text-left transition-colors hover:bg-surface"
            >
              <span className="text-2xl">{folder.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">{folder.name}</p>
                <p className="text-xs text-text-dim">
                  {folderCounts[folder.id] || 0} message
                  {(folderCounts[folder.id] || 0) !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder.id);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim opacity-0 transition-all hover:bg-heart/10 hover:text-heart group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={16} className="text-text-dim" />
              </div>
            </button>
          ))}

          {creating ? (
            <div className="flex items-center gap-3 rounded-xl border border-cv-border bg-cv-card p-4">
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-8 bg-transparent text-center text-2xl focus:outline-none"
                maxLength={2}
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Folder name..."
                className="flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="text-xs font-medium text-cv-accent disabled:opacity-30"
              >
                Create
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-cv-border p-4 text-sm text-text-muted transition-colors hover:border-cv-accent/30 hover:text-text"
            >
              <Plus size={16} />
              Create New Folder
            </button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
