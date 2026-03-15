"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MessageFolder, UserRole } from "@/lib/types/database";

interface FolderPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: MessageFolder[];
  messageFolderIds: string[];
  onToggleFolder: (folderId: string) => void;
  onCreateFolder: (name: string, emoji: string) => void;
  userRole: UserRole;
}

export default function FolderPicker({
  open,
  onOpenChange,
  folders,
  messageFolderIds,
  onToggleFolder,
  onCreateFolder,
}: FolderPickerProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📁");

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateFolder(newName.trim(), newEmoji);
    setNewName("");
    setNewEmoji("📁");
    setCreating(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl border-cv-border bg-surface pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-sm text-text-muted">Add to Folder</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1">
          {folders.map((folder) => {
            const isInFolder = messageFolderIds.includes(folder.id);
            return (
              <button
                key={folder.id}
                onClick={() => onToggleFolder(folder.id)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-text transition-colors hover:bg-cv-card"
              >
                <span className="text-base">{folder.emoji}</span>
                <span className="flex-1 text-left">{folder.name}</span>
                {isInFolder && <Check size={16} className="text-cv-accent" />}
              </button>
            );
          })}

          {creating ? (
            <div className="flex items-center gap-2 rounded-xl bg-cv-card px-4 py-3">
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-8 bg-transparent text-center text-base focus:outline-none"
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
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-text-muted transition-colors hover:bg-cv-card"
            >
              <Plus size={18} />
              Create New Folder
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
