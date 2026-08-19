"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImageUploads, NONE_VALUE } from "@/features/admin/hooks/use-image-uploads";

type CategoryOption = { _id: string; name: string };

export function UploadForm({ categories }: { categories: CategoryOption[] }) {
  const { inputRef, pending, uploading, handleSelect, updateEntry, removeEntry, handleUploadAll } =
    useImageUploads();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          Select images
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/tiff"
          multiple
          onChange={handleSelect}
          className="hidden"
        />
        {pending.length > 0 && (
          <Button type="button" onClick={handleUploadAll} disabled={uploading}>
            {uploading ? "Uploading…" : `Upload ${pending.length} image${pending.length > 1 ? "s" : ""}`}
          </Button>
        )}
      </div>

      {pending.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-2.5 rounded-xl border border-border p-3.5 transition-shadow hover:shadow-sm"
            >
              <div className="relative overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.previewUrl} alt="" className="h-40 w-full object-cover" />
                {entry.status !== "pending" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white uppercase">
                    {entry.status}
                  </div>
                )}
              </div>
              <Input
                value={entry.title}
                placeholder="Title"
                disabled={uploading}
                onChange={(e) => updateEntry(entry.id, { title: e.target.value })}
              />
              <Textarea
                value={entry.description}
                placeholder="Description"
                rows={2}
                disabled={uploading}
                onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
              />
              <Select
                value={entry.categoryId || NONE_VALUE}
                disabled={uploading}
                onValueChange={(value) =>
                  updateEntry(entry.id, { categoryId: value === NONE_VALUE ? "" : (value ?? "") })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Uncategorized">
                    {(value: string) =>
                      categories.find((c) => c._id === value)?.name ?? "Uncategorized"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Uncategorized</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs font-normal">
                  <input
                    type="checkbox"
                    checked={entry.featured}
                    disabled={uploading}
                    onChange={(e) => updateEntry(entry.id, { featured: e.target.checked })}
                    className="h-4 w-4 cursor-pointer accent-foreground"
                  />
                  Featured
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={() => removeEntry(entry.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
