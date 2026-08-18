import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import Image from "@/models/Image";
import { MINIO_BUCKET, minioClient } from "@/lib/minio";

type Params = { id: string };

const EDITABLE_FIELDS = [
  "title",
  "description",
  "location",
  "cameraInfo",
  "capturedAt",
  "order",
  "featured",
  "categoryId",
] as const;

export async function PATCH(request: Request, context: { params: Promise<Params> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] === undefined) continue;
    if (field === "categoryId") {
      updates.category = body.categoryId || undefined;
    } else if (field === "capturedAt") {
      updates.capturedAt = body.capturedAt ? new Date(body.capturedAt) : undefined;
    } else {
      updates[field] = body[field];
    }
  }

  await connectDB();
  const image = await Image.findByIdAndUpdate(id, { $set: updates }, { new: true });
  if (!image) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ image });
}

export async function DELETE(_request: Request, context: { params: Promise<Params> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  await connectDB();
  const image = await Image.findByIdAndDelete(id);
  if (!image) return NextResponse.json({ error: "not found" }, { status: 404 });

  const keysToRemove = [image.objectKey, `${image.objectKey}__w400.webp`, `${image.objectKey}__w800.webp`, `${image.objectKey}__w1600.webp`];
  await Promise.all(
    keysToRemove.map((key) => minioClient.removeObject(MINIO_BUCKET, key).catch(() => undefined))
  );

  return NextResponse.json({ ok: true });
}
