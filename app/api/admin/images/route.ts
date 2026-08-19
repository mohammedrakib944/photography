import { NextResponse } from "next/server";
import sharp from "sharp";
import { encode } from "blurhash";
import { isAdminAuthenticated } from "@/lib/session";
import { getObjectBuffer, putObjectBuffer, removeObject } from "@/lib/minio";
import { connectDB } from "@/lib/mongodb";
import Image from "@/models/Image";

const VARIANT_WIDTHS = [400, 800, 1600];
const MAX_ORIGINAL_BYTES = 5 * 1024 * 1024; // 5MB
const COMPRESS_QUALITY_STEPS = [90, 80, 70, 60, 50, 40];

/**
 * Re-encodes an over-size original as mozjpeg, stepping quality down until it
 * fits under MAX_ORIGINAL_BYTES (or the quality floor is hit) — resolution is
 * never touched, only compression. SVGs are vector and left alone. Non-jpeg
 * sources land on a new `.jpg` key (the served content-type is derived from
 * the extension), and the oversized original is removed from storage.
 */
async function compressOriginal(objectKey: string, buffer: Buffer) {
  if (buffer.length <= MAX_ORIGINAL_BYTES) {
    return { objectKey, buffer };
  }

  const ext = objectKey.split(".").pop()?.toLowerCase();
  if (ext === "svg") {
    return { objectKey, buffer };
  }

  let compressed = buffer;
  for (const quality of COMPRESS_QUALITY_STEPS) {
    compressed = await sharp(buffer).rotate().jpeg({ quality, mozjpeg: true }).toBuffer();
    if (compressed.length <= MAX_ORIGINAL_BYTES) break;
  }

  const finalKey = ext === "jpg" || ext === "jpeg" ? objectKey : `${objectKey.split(".")[0]}.jpg`;
  await putObjectBuffer(finalKey, compressed, "image/jpeg");
  if (finalKey !== objectKey) {
    await removeObject(objectKey);
  }

  return { objectKey: finalKey, buffer: compressed };
}

async function computeBlurhash(buffer: Buffer) {
  const { data, info } = await sharp(buffer)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
}

async function generateVariants(objectKey: string, buffer: Buffer) {
  await Promise.all(
    VARIANT_WIDTHS.map(async (width) => {
      const resized = await sharp(buffer)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      await putObjectBuffer(`${objectKey}__w${width}.webp`, resized, "image/webp");
    })
  );
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await connectDB();
  const images = await Image.find().sort({ order: 1, createdAt: -1 }).populate("category").lean();
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { objectKey, width, height, title, description, categoryId, location, cameraInfo, capturedAt, featured, order } = body;

  if (!objectKey || !width || !height) {
    return NextResponse.json({ error: "objectKey, width, and height are required" }, { status: 400 });
  }

  const rawBuffer = await getObjectBuffer(objectKey);
  const { objectKey: finalObjectKey, buffer } = await compressOriginal(objectKey, rawBuffer);
  const [blurhash] = await Promise.all([computeBlurhash(buffer), generateVariants(finalObjectKey, buffer)]);

  await connectDB();

  const baseSlug = finalObjectKey.split(".")[0];
  const doc = await Image.create({
    title,
    description,
    slug: baseSlug,
    objectKey: finalObjectKey,
    width,
    height,
    sizeBytes: buffer.length,
    blurhash,
    location,
    cameraInfo,
    capturedAt: capturedAt ? new Date(capturedAt) : undefined,
    featured: Boolean(featured),
    order: order ?? 0,
    category: categoryId || undefined,
  });

  return NextResponse.json({ id: String(doc._id), slug: doc.slug });
}
