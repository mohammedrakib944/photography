import type { Metadata } from "next";
import { getAllImages, getCategories } from "@/lib/data";
import { GalleryExplorer } from "@/components/gallery/gallery-explorer";

export const metadata: Metadata = {
  title: "Work",
  description: "Full gallery of black & white photography, filterable by category.",
};

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [images, categories] = await Promise.all([getAllImages(), getCategories()]);

  const imageItems = images.map((img) => ({
    _id: String(img._id),
    slug: img.slug,
    objectKey: img.objectKey,
    width: img.width,
    height: img.height,
    title: img.title,
    description: img.description,
    sizeBytes: img.sizeBytes,
    location: img.location,
    cameraInfo: img.cameraInfo,
    category: img.category
      ? {
          slug: (img.category as unknown as { slug: string }).slug,
          name: (img.category as unknown as { name: string }).name,
        }
      : null,
  }));

  const categoryItems = categories.map((c) => ({ _id: String(c._id), name: c.name, slug: c.slug }));

  return (
    <main className="site-container flex flex-1 flex-col pt-28 pb-12">
      <GalleryExplorer
        images={imageItems}
        categories={categoryItems}
        urlSyncCategory
        activeCategory={category}
      />
    </main>
  );
}
