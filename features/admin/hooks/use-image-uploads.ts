"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export const NONE_VALUE = "__none__";

export type PendingUpload = {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  categoryId: string;
  featured: boolean;
  status: "pending" | "uploading" | "done" | "error";
};

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function baseName(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

/**
 * Orchestrates the whole "select files → edit metadata → upload" flow for
 * the admin upload form: staging picked files as pending entries, editing
 * their fields, and pushing each through the upload-url → object-storage PUT
 * → create-image-record pipeline.
 */
export function useImageUploads() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [uploading, setUploading] = useState(false);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const entries: PendingUpload[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      title: baseName(file.name),
      description: "",
      categoryId: "",
      featured: false,
      status: "pending",
    }));

    setPending((prev) => [...prev, ...entries]);
    e.target.value = "";
  }

  function updateEntry(id: string, updates: Partial<PendingUpload>) {
    setPending((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)));
  }

  function removeEntry(id: string) {
    setPending((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((e) => e.id !== id);
    });
  }

  async function uploadOne(entry: PendingUpload) {
    updateEntry(entry.id, { status: "uploading" });

    const urlRes = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: entry.file.type }),
    });
    if (!urlRes.ok) {
      updateEntry(entry.id, { status: "error" });
      return;
    }
    const { url, objectKey } = await urlRes.json();

    const putRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": entry.file.type },
      body: entry.file,
    });
    if (!putRes.ok) {
      updateEntry(entry.id, { status: "error" });
      return;
    }

    const { width, height } = await readImageDimensions(entry.file);

    const metaRes = await fetch("/api/admin/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectKey,
        width,
        height,
        title: entry.title,
        description: entry.description,
        categoryId: entry.categoryId || undefined,
        featured: entry.featured,
      }),
    });

    updateEntry(entry.id, { status: metaRes.ok ? "done" : "error" });
  }

  async function handleUploadAll() {
    setUploading(true);
    for (const entry of pending) {
      if (entry.status === "pending" || entry.status === "error") {
        await uploadOne(entry);
      }
    }
    setUploading(false);
    router.refresh();
    setPending((prev) => {
      const remaining = prev.filter((e) => e.status !== "done");
      prev.filter((e) => e.status === "done").forEach((e) => URL.revokeObjectURL(e.previewUrl));
      return remaining;
    });
  }

  return {
    inputRef,
    pending,
    uploading,
    handleSelect,
    updateEntry,
    removeEntry,
    handleUploadAll,
  };
}
