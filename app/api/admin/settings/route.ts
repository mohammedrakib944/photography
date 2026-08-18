import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await connectDB();
  const settings = await SiteSettings.findById("singleton").lean();
  return NextResponse.json({ settings: settings ?? null });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { siteName, tagline, bioText, contactEmail, socialLinks } = body;

  if (!siteName) {
    return NextResponse.json({ error: "siteName is required" }, { status: 400 });
  }

  await connectDB();
  const settings = await SiteSettings.findByIdAndUpdate(
    "singleton",
    { $set: { siteName, tagline, bioText, contactEmail, socialLinks } },
    { new: true, upsert: true }
  );
  return NextResponse.json({ settings });
}
