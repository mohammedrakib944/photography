import { NextResponse } from "next/server";
import { getObjectStream, statObject } from "@/lib/minio";

const CONTENT_TYPES: Record<string, string> = {
  webp: "image/webp",
  avif: "image/avif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  tiff: "image/tiff",
  svg: "image/svg+xml",
};

export async function GET(request: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  const objectKey = decodeURIComponent(key);
  const download = new URL(request.url).searchParams.get("download");

  try {
    await statObject(objectKey);
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const stream = await getObjectStream(objectKey);
  const ext = objectKey.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  if (download) {
    headers["Content-Disposition"] = `attachment; filename="${objectKey}"`;
  }

  return new NextResponse(stream as unknown as ReadableStream, { headers });
}
