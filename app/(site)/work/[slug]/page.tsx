import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { notFound } from "next/navigation";
import { getAdjacentImages, getImageBySlug } from "@/lib/data";
import { ZoomableImage } from "@/components/gallery/zoomable-image";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const image = await getImageBySlug(slug);
  if (!image) return {};

  const title = image.title || "Untitled";
  const description = image.description || [image.location, image.cameraInfo].filter(Boolean).join(" · ");

  return {
    title,
    description: description || undefined,
    openGraph: {
      title,
      description: description || undefined,
      images: [`/api/images/${encodeURIComponent(image.objectKey)}__w1600.webp`],
    },
  };
}

export default async function ImageDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const image = await getImageBySlug(slug);
  if (!image) notFound();

  const { prev, next } = await getAdjacentImages(slug);
  const category = image.category as unknown as { name?: string; slug?: string } | undefined;

  return (
    <div className="site-container flex min-h-dvh flex-col gap-8 pt-28 pb-16 lg:flex-row lg:items-center">
      <div className="flex flex-1 items-center justify-center">
        <ZoomableImage
          src={image.objectKey}
          width={image.width}
          height={image.height}
          alt={image.title ?? ""}
        />
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
        <p className="text-sm text-muted-foreground">
          {image.width} × {image.height}
        </p>
        {image.title && <h1 className="text-xl font-medium">{image.title}</h1>}
        {image.description && <p className="text-sm leading-6 text-muted-foreground">{image.description}</p>}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {category?.name && (
            <span className="rounded-full border border-border px-3 py-1">{category.name}</span>
          )}
          {image.location && (
            <span className="rounded-full border border-border px-3 py-1">{image.location}</span>
          )}
          {image.cameraInfo && (
            <span className="rounded-full border border-border px-3 py-1">{image.cameraInfo}</span>
          )}
        </div>

        <a
          href={`/api/images/${encodeURIComponent(image.objectKey)}?download=1`}
          className="mt-2 flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          <Download className="size-4" />
          Download
        </a>

        <nav className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs tracking-[0.1em] text-muted-foreground uppercase">
          <Link href="/work" className="link-wipe">
            Back to work
          </Link>
          <div className="flex gap-4">
            {prev && (
              <Link href={`/work/${prev}`} className="link-wipe">
                Prev
              </Link>
            )}
            {next && (
              <Link href={`/work/${next}`} className="link-wipe">
                Next
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
