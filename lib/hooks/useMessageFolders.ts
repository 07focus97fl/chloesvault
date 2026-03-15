"use client";

import { useState, useCallback, useMemo } from "react";
import { MOCK_FOLDERS, MOCK_FOLDER_ITEMS } from "@/lib/mock-data";
import type { MessageFolder, MessageFolderItem, UserRole } from "@/lib/types/database";

export function useMessageFolders() {
  const [folders, setFolders] = useState<MessageFolder[]>(MOCK_FOLDERS);
  const [folderItems, setFolderItems] = useState<MessageFolderItem[]>(MOCK_FOLDER_ITEMS);

  const createFolder = useCallback(
    (name: string, emoji: string, createdBy: UserRole) => {
      const folder: MessageFolder = {
        id: crypto.randomUUID(),
        name,
        emoji,
        created_by: createdBy,
        created_at: new Date().toISOString(),
      };
      setFolders((prev) => [...prev, folder]);
    },
    []
  );

  const deleteFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setFolderItems((prev) => prev.filter((fi) => fi.folder_id !== folderId));
  }, []);

  const addToFolder = useCallback(
    (folderId: string, messageId: string, addedBy: UserRole) => {
      const exists = folderItems.some(
        (fi) => fi.folder_id === folderId && fi.message_id === messageId
      );
      if (exists) return;
      const item: MessageFolderItem = {
        id: crypto.randomUUID(),
        folder_id: folderId,
        message_id: messageId,
        added_by: addedBy,
        added_at: new Date().toISOString(),
      };
      setFolderItems((prev) => [...prev, item]);
    },
    [folderItems]
  );

  const removeFromFolder = useCallback(
    (folderId: string, messageId: string) => {
      setFolderItems((prev) =>
        prev.filter(
          (fi) => !(fi.folder_id === folderId && fi.message_id === messageId)
        )
      );
    },
    []
  );

  const getMessageFolderIds = useCallback(
    (messageId: string) => {
      return folderItems
        .filter((fi) => fi.message_id === messageId)
        .map((fi) => fi.folder_id);
    },
    [folderItems]
  );

  const getFolderMessageIds = useCallback(
    (folderId: string) => {
      return folderItems
        .filter((fi) => fi.folder_id === folderId)
        .map((fi) => fi.message_id);
    },
    [folderItems]
  );

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const fi of folderItems) {
      counts[fi.folder_id] = (counts[fi.folder_id] || 0) + 1;
    }
    return counts;
  }, [folderItems]);

  return {
    folders,
    folderItems,
    folderCounts,
    createFolder,
    deleteFolder,
    addToFolder,
    removeFromFolder,
    getMessageFolderIds,
    getFolderMessageIds,
  };
}
