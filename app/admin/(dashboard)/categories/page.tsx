import { getCategories } from "@/lib/data";
import { CategoryManager } from "@/features/admin";

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
      <span className="mb-3 block h-px w-10 bg-foreground/30" />
      <h1 className="mb-1 font-heading text-2xl font-light tracking-tight">Categories</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Organize your images into categories used for filtering on the public site.
      </p>
      <CategoryManager categories={rows} />
    </div>
  );
}
