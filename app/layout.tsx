import type { Metadata } from "next";
import { displayFont, bodyFont } from "@/lib/fonts";
import { connectDB } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  await connectDB();
  const settings = await SiteSettings.findById("singleton").lean();

  const siteName = settings?.siteName || "Photography Portfolio";
  const tagline = settings?.tagline || "Black & white photography";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: siteName, template: `%s — ${siteName}` },
    description: tagline,
    openGraph: {
      title: siteName,
      description: tagline,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: tagline,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
