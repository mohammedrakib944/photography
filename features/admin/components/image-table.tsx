"use client";

import { GalleryImage } from "@/components/gallery-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImageTableActions, NONE_VALUE } from "@/features/admin/hooks/use-image-table-actions";

type ImageRow = {
  _id: string;
  objectKey: string;
  width: number;
  height: number;
  title?: string;
  description?: string;
  location?: string;
  cameraInfo?: string;
  order: number;
  featured: boolean;
  category?: { _id: string; name: string } | null;
};

type CategoryOption = { _id: string; name: string };

export function ImageTable({
  images,
  categories,
}: {
  images: ImageRow[];
  categories: CategoryOption[];
}) {
  const { pendingId, saveImage, deleteImage } = useImageTableActions();

  if (images.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No images yet — upload one above to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium tracking-[0.08em] uppercase text-muted-foreground">
            <th className="p-3.5">Preview</th>
            <th className="p-3.5">Title</th>
            <th className="p-3.5">Description</th>
            <th className="p-3.5">Category</th>
            <th className="p-3.5">Order</th>
            <th className="p-3.5">Featured</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {images.map((img) => (
            <tr key={img._id} className="align-middle transition-colors hover:bg-muted/30">
              <td className="p-3.5">
                <GalleryImage
                  src={img.objectKey}
                  width={img.width}
                  height={img.height}
                  alt={img.title ?? ""}
                  className="rounded-lg"
                  style={{ width: 64, height: 64, objectFit: "cover" }}
                />
              </td>
              <td className="p-3">
                <Input
                  defaultValue={img.title}
                  placeholder="Untitled"
                  className="min-w-[160px]"
                  onBlur={(e) => saveImage(img._id, { title: e.target.value })}
                />
              </td>
              <td className="p-3">
                <Input
                  defaultValue={img.description}
                  placeholder="No description"
                  className="min-w-[180px]"
                  onBlur={(e) => saveImage(img._id, { description: e.target.value })}
                />
              </td>
              <td className="p-3">
                <Select
                  key={img.category?._id ?? NONE_VALUE}
                  defaultValue={img.category?._id ?? NONE_VALUE}
                  onValueChange={(value) =>
                    saveImage(img._id, { categoryId: value === NONE_VALUE ? null : value })
                  }
                >
                  <SelectTrigger className="min-w-[140px]">
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
              </td>
              <td className="p-3">
                <Input
                  type="number"
                  defaultValue={img.order}
                  className="w-16"
                  onBlur={(e) => saveImage(img._id, { order: Number(e.target.value) })}
                />
              </td>
              <td className="p-3">
                <input
                  type="checkbox"
                  defaultChecked={img.featured}
                  onChange={(e) => saveImage(img._id, { featured: e.target.checked })}
                  className="h-4 w-4 cursor-pointer accent-foreground"
                />
              </td>
              <td className="p-3 text-right">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={pendingId === img._id}
                  onClick={() => deleteImage(img._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
