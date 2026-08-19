import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";
import { ContactContent } from "@/features/contact";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const socialLinks = (settings.socialLinks ?? {}) as Record<string, string>;

  return <ContactContent contactEmail={settings.contactEmail} socialLinks={socialLinks} />;
}
