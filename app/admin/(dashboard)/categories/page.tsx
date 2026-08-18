import { getCategories } from "@/lib/data";
import { CategoryManager } from "./category-manager";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const rows = categories.map((c) => ({
    _id: String(c._id),
    name: c.name,
    slug: c.slug,
    order: c.order,
  }));

  return (
    <div>
      <h1 className="mb-1 font-heading text-xl tracking-wide">Categories</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Organize your images into categories used for filtering on the public site.
      </p>
      <CategoryManager categories={rows} />
    </div>
  );
}
