import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Image from "@/models/Image";

type Params = { id: string };

export async function PATCH(request: Request, context: { params: Promise<Params> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const updates = await request.json();

  await connectDB();
  const category = await Category.findByIdAndUpdate(
    id,
    { $set: { ...(updates.name && { name: updates.name }), ...(updates.order !== undefined && { order: updates.order }) } },
    { new: true }
  );
  if (!category) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ category });
}

export async function DELETE(_request: Request, context: { params: Promise<Params> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  await connectDB();
  await Image.updateMany({ category: id }, { $unset: { category: 1 } });
  await Category.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
