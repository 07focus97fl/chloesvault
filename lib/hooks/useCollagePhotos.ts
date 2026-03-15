"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_COLLAGE_PHOTOS } from "@/lib/mock-data";
import type { CollagePhoto, UserRole } from "@/lib/types/database";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url-here";

export function useCollagePhotos() {
  const [photos, setPhotos] = useState<CollagePhoto[]>(USE_MOCK ? MOCK_COLLAGE_PHOTOS : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const supabase = createClient();

  useEffect(() => {
    if (USE_MOCK) return;
    const fetch = async () => {
      const { data } = await supabase.from("collage_photos").select("*").order("created_at", { ascending: false });
      if (data) setPhotos(data);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const addPhoto = useCallback(async (file: File, caption: string, addedBy: UserRole) => {
    if (USE_MOCK) {
      const url = URL.createObjectURL(file);
      setPhotos((prev) => [
        { id: crypto.randomUUID(), url, caption, added_by: addedBy, created_at: new Date().toISOString() },
        ...prev,
      ]);
      return;
    }

    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("collage-photos").upload(fileName, file);
    if (uploadError) return;

    const { data: { publicUrl } } = supabase.storage.from("collage-photos").getPublicUrl(fileName);

    await supabase.from("collage_photos").insert({ url: publicUrl, caption, added_by: addedBy });
    const { data } = await supabase.from("collage_photos").select("*").order("created_at", { ascending: false });
    if (data) setPhotos(data);
  }, [supabase]);

  const removePhoto = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      return;
    }

    const photo = photos.find((p) => p.id === id);
    if (photo) {
      const fileName = photo.url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("collage-photos").remove([fileName]);
      }
    }
    await supabase.from("collage_photos").delete().eq("id", id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, [supabase, photos]);

  return { photos, loading, addPhoto, removePhoto };
}
