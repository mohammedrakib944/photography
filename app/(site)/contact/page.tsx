import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const socialLinks = (settings.socialLinks ?? {}) as Record<string, string>;

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-8 px-4 pt-28 pb-16">
      <h1 className="font-heading text-3xl">Contact</h1>
      <div className="flex flex-col gap-4 text-sm">
        {settings.contactEmail && (
          <a href={`mailto:${settings.contactEmail}`} className="link-wipe w-fit">
            {settings.contactEmail}
          </a>
        )}
        {Object.entries(socialLinks)
          .filter(([, url]) => Boolean(url))
          .map(([platform, url]) => (
            <a key={platform} href={url} className="link-wipe w-fit uppercase" target="_blank" rel="noopener noreferrer">
              {platform}
            </a>
          ))}
      </div>
    </main>
  );
}
