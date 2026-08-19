import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdjacentImages, getImageBySlug } from "@/lib/data";
import { ImageDetail } from "@/features/work";

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
    <ImageDetail
      image={{
        objectKey: image.objectKey,
        width: image.width,
        height: image.height,
        title: image.title,
        description: image.description,
        location: image.location,
        cameraInfo: image.cameraInfo,
        category,
      }}
      prev={prev}
      next={next}
    />
  );
}
