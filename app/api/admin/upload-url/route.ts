import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/session";
import { getPresignedPutUrl } from "@/lib/minio";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/tiff": "tiff",
  "image/svg+xml": "svg",
};

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { contentType } = await request.json();
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    return NextResponse.json({ error: "unsupported content type" }, { status: 400 });
  }

  const objectKey = `${randomUUID()}.${ext}`;
  const url = await getPresignedPutUrl(objectKey);

  return NextResponse.json({ url, objectKey });
}
