import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import ImageModel from "@/models/Image";
import SiteSettings from "@/models/SiteSettings";

export async function getSiteSettings() {
  await connectDB();
  const settings = await SiteSettings.findById("singleton").lean();
  return (
    settings ?? {
      siteName: "Photography Portfolio",
      tagline: "Black & white photography",
      bioText: "",
      contactEmail: "",
      socialLinks: {},
    }
  );
}

export async function getCategories() {
  await connectDB();
  return Category.find().sort({ order: 1 }).lean();
}

export async function getFeaturedImages(limit = 6) {
  await connectDB();
  const featured = await ImageModel.find({ featured: true })
    .sort({ order: 1, createdAt: -1 })
    .limit(limit)
    .populate("category")
    .lean();

  // Fall back to the most recent uploads so the homepage is never empty
  // just because nothing has been explicitly marked as featured yet.
  if (featured.length > 0) return featured;
  return ImageModel.find().sort({ createdAt: -1 }).limit(limit).populate("category").lean();
}

export async function getAllImages(categorySlug?: string) {
  await connectDB();
  let categoryId: string | undefined;
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug }).lean();
    if (!category) return [];
    categoryId = String(category._id);
  }
  return ImageModel.find(categoryId ? { category: categoryId } : {})
    .sort({ order: 1, createdAt: -1 })
    .populate("category")
    .lean();
}

export async function getImageBySlug(slug: string) {
  await connectDB();
  return ImageModel.findOne({ slug }).populate("category").lean();
}

/** Neighboring images in gallery order, for prev/next navigation. */
export async function getAdjacentImages(slug: string) {
  await connectDB();
  const all = await ImageModel.find().sort({ order: 1, createdAt: -1 }).select("slug").lean();
  const index = all.findIndex((img) => img.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? all[index - 1].slug : null,
    next: index < all.length - 1 ? all[index + 1].slug : null,
  };
}
