"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { _id: string; name: string; slug: string; order: number };

export function CategoryManager({ categories }: { categories: Category[] }) {
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

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={createCategory}
        className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="sm:max-w-xs"
        />
        <Button type="submit" disabled={creating || !name.trim()}>
          Add category
        </Button>
      </form>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No categories yet — add one above to start organizing your images.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium tracking-wide uppercase text-muted-foreground">
                <th className="p-3">Name</th>
                <th className="p-3">Order</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-muted/30">
                  <td className="p-3">
                    <Input
                      defaultValue={c.name}
                      className="min-w-[160px]"
                      onBlur={(e) => e.target.value !== c.name && renameCategory(c._id, e.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      defaultValue={c.order}
                      className="w-16"
                      onBlur={(e) => reorderCategory(c._id, Number(e.target.value))}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <Button type="button" variant="destructive" size="sm" onClick={() => deleteCategory(c._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
