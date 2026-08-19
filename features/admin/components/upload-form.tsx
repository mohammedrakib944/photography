"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

type CategoryOption = { _id: string; name: string };

const NONE_VALUE = "__none__";

type PendingUpload = {
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

export function UploadForm({ categories }: { categories: CategoryOption[] }) {
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
                  <SelectValue placeholder="Uncategorized" />
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
