"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export const NONE_VALUE = "__none__";

/**
 * Save/delete actions for a row in the admin image table — PATCHes or
 * DELETEs the image, then refreshes the server-rendered list. `pendingId`
 * tracks which row (if any) currently has a request in flight, so its
 * controls can be disabled.
 */
export function useImageTableActions() {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function saveImage(id: string, updates: Record<string, unknown>) {
    setPendingId(id);
    await fetch(`/api/admin/images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setPendingId(null);
    startTransition(() => router.refresh());
  }

  async function deleteImage(id: string) {
    if (!confirm("Delete this image permanently?")) return;
    setPendingId(id);
    await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
    setPendingId(null);
    startTransition(() => router.refresh());
  }

  return { pendingId, saveImage, deleteImage };
}
