import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import ImageModel from "@/models/Image";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const images = await ImageModel.find().select("slug updatedAt").lean();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const imageRoutes: MetadataRoute.Sitemap = images.map((img) => ({
    url: `${SITE_URL}/work/${img.slug}`,
    lastModified: img.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...imageRoutes];
}
