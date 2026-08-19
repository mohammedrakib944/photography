"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategoryActions } from "@/features/admin/hooks/use-category-actions";

type Category = { _id: string; name: string; slug: string; order: number };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const { name, setName, creating, createCategory, renameCategory, reorderCategory, deleteCategory } =
    useCategoryActions(categories);

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={createCategory}
        className="flex flex-col gap-3 rounded-2xl border border-border p-5 shadow-sm sm:flex-row sm:items-center"
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
        <p className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No categories yet — add one above to start organizing your images.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium tracking-[0.08em] uppercase text-muted-foreground">
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Order</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c._id} className="transition-colors hover:bg-muted/30">
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
