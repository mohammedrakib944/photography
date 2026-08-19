import { getAllImages, getCategories, getSiteSettings } from "@/lib/data";
import { HeroBanner } from "@/features/home";
import { GalleryExplorer } from "@/features/gallery";

export default async function Home() {
  const [settings, images, categories] = await Promise.all([
    getSiteSettings(),
    getAllImages(),
    getCategories(),
  ]);

  const toViewerImage = (img: (typeof images)[number]) => ({
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
  });

  const gridImages = images.map(toViewerImage);
  const featuredImages = images
    .filter((img) => img.featured)
    .map(toViewerImage);
  const categoryItems = categories.map((c) => ({
    _id: String(c._id),
    name: c.name,
    slug: c.slug,
  }));

  return (
    <main className="flex flex-1 flex-col bg-background">
      <HeroBanner
        siteName={settings.siteName}
        tagline={settings.tagline}
        featuredImages={featuredImages}
      />

      <section
        id="gallery"
        className="site-container py-12 md:py-16 scroll-mt-24"
      >
        {gridImages.length > 0 ? (
          <GalleryExplorer images={gridImages} categories={categoryItems} />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No photos uploaded yet — visit /admin to add the first one.
          </p>
        )}
      </section>
    </main>
  );
}
