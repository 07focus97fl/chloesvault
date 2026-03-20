"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_FOLDERS, MOCK_FOLDER_ITEMS, MOCK_MESSAGES } from "@/lib/mock-data";
import type { Message, MessageFolder, MessageFolderItem, UserRole } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useMessageFolders() {
  const [folders, setFolders] = useState<MessageFolder[]>([]);
  const [folderItems, setFolderItems] = useState<MessageFolderItem[]>([]);
  const initialLoadDone = useRef(false);
  const supabase = createClient();

  // Fetch folders and items on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    if (USE_MOCK) {
      setFolders([...MOCK_FOLDERS]);
      setFolderItems([...MOCK_FOLDER_ITEMS]);
      return;
    }

    const fetchData = async () => {
      const [foldersRes, itemsRes] = await Promise.all([
        supabase.from("message_folders").select("*").order("created_at"),
        supabase.from("message_folder_items").select("*"),
      ]);
      if (foldersRes.data) setFolders(foldersRes.data);
      if (itemsRes.data) setFolderItems(itemsRes.data);
    };

    fetchData();
  }, [supabase]);

  const createFolder = useCallback(
    async (name: string, emoji: string, createdBy: UserRole) => {
      const optimistic: MessageFolder = {
        id: crypto.randomUUID(),
        name,
        emoji,
        created_by: createdBy,
        created_at: new Date().toISOString(),
      };
      setFolders((prev) => [...prev, optimistic]);

      if (!USE_MOCK) {
        const { data } = await supabase
          .from("message_folders")
          .insert({ name, emoji, created_by: createdBy })
          .select()
          .single();
        if (data) {
          setFolders((prev) =>
            prev.map((f) => (f.id === optimistic.id ? data : f))
          );
        }
      }
    },
    [supabase]
  );

  const deleteFolder = useCallback(
    async (folderId: string) => {
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setFolderItems((prev) => prev.filter((fi) => fi.folder_id !== folderId));

      if (!USE_MOCK) {
        await supabase.from("message_folders").delete().eq("id", folderId);
      }
    },
    [supabase]
  );

  const addToFolder = useCallback(
    async (folderId: string, messageId: string, addedBy: UserRole) => {
      // Check duplicates from current state
      setFolderItems((prev) => {
        if (prev.some((fi) => fi.folder_id === folderId && fi.message_id === messageId)) {
          return prev;
        }
        const item: MessageFolderItem = {
          id: crypto.randomUUID(),
          folder_id: folderId,
          message_id: messageId,
          added_by: addedBy,
          added_at: new Date().toISOString(),
        };
        return [...prev, item];
      });

      if (!USE_MOCK) {
        await supabase
          .from("message_folder_items")
          .insert({ folder_id: folderId, message_id: messageId, added_by: addedBy });
      }
    },
    [supabase]
  );

  const removeFromFolder = useCallback(
    async (folderId: string, messageId: string) => {
      setFolderItems((prev) =>
        prev.filter(
          (fi) => !(fi.folder_id === folderId && fi.message_id === messageId)
        )
      );

      if (!USE_MOCK) {
        await supabase
          .from("message_folder_items")
          .delete()
          .eq("folder_id", folderId)
          .eq("message_id", messageId);
      }
    },
    [supabase]
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

  const getFolderMessages = useCallback(
    async (folderId: string): Promise<Message[]> => {
      const messageIds = folderItems
        .filter((fi) => fi.folder_id === folderId)
        .map((fi) => fi.message_id);

      if (messageIds.length === 0) return [];

      if (USE_MOCK) {
        return MOCK_MESSAGES.filter((m) => messageIds.includes(m.id));
      }

      const { data } = await supabase
        .from("messages")
        .select("*")
        .in("id", messageIds)
        .order("created_at");

      return data ?? [];
    },
    [folderItems, supabase]
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
    getFolderMessages,
  };
}
