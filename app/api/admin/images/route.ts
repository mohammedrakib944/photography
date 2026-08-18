import { NextResponse } from "next/server";
import sharp from "sharp";
import { encode } from "blurhash";
import { isAdminAuthenticated } from "@/lib/session";
import { getObjectBuffer, putObjectBuffer } from "@/lib/minio";
import { connectDB } from "@/lib/mongodb";
import Image from "@/models/Image";

const VARIANT_WIDTHS = [400, 800, 1600];

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

  const buffer = await getObjectBuffer(objectKey);
  const [blurhash] = await Promise.all([computeBlurhash(buffer), generateVariants(objectKey, buffer)]);

  await connectDB();

  const baseSlug = objectKey.split(".")[0];
  const doc = await Image.create({
    title,
    description,
    slug: baseSlug,
    objectKey,
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
