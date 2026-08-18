import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await connectDB();
  const categories = await Category.find().sort({ order: 1 }).lean();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { name, order } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  await connectDB();
  const category = await Category.create({ name, slug: slugify(name), order: order ?? 0 });
  return NextResponse.json({ category });
}
