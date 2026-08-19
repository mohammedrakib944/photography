"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { _id: string; name: string; slug: string; order: number };

/**
 * Create/rename/reorder/delete actions for the admin categories page, plus
 * the new-category form's local input state.
 */
export function useCategoryActions(categories: Category[]) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, order: categories.length }),
    });
    setName("");
    setCreating(false);
    router.refresh();
  }

  async function renameCategory(id: string, newName: string) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    router.refresh();
  }

  async function reorderCategory(id: string, order: number) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    router.refresh();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category? Images in it will become uncategorized.")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return {
    name,
    setName,
    creating,
    createCategory,
    renameCategory,
    reorderCategory,
    deleteCategory,
  };
}
