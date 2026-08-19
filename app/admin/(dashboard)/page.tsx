import { getAllImages, getCategories } from "@/lib/data";
import { UploadForm, ImageTable } from "@/features/admin";

export default async function AdminPage() {
  const [images, categories] = await Promise.all([getAllImages(), getCategories()]);

  const imageRows = images.map((img) => ({
    _id: String(img._id),
    objectKey: img.objectKey,
    width: img.width,
    height: img.height,
    title: img.title,
    description: img.description,
    location: img.location,
    cameraInfo: img.cameraInfo,
    order: img.order,
    featured: img.featured,
    category: img.category
      ? { _id: String((img.category as { _id: unknown; name: string })._id), name: (img.category as { name: string }).name }
      : null,
  }));

  const categoryOptions = categories.map((c) => ({ _id: String(c._id), name: c.name }));

  return (
    <div>
      <span className="mb-3 block h-px w-10 bg-foreground/30" />
      <h1 className="mb-1 font-heading text-2xl font-light tracking-tight">Images</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Upload new photos or edit, reorder, and delete existing ones.
      </p>
      <div className="mb-8">
        <UploadForm categories={categoryOptions} />
      </div>
      <ImageTable images={imageRows} categories={categoryOptions} />
    </div>
  );
}
