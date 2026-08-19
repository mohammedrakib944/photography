import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";
import { AboutContent } from "@/features/about";

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return <AboutContent bioText={settings.bioText} />;
}
