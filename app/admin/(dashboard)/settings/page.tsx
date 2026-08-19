import { getSiteSettings } from "@/lib/data";
import { SettingsForm } from "@/features/admin";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <span className="mb-3 block h-px w-10 bg-foreground/30" />
      <h1 className="mb-1 font-heading text-2xl font-light tracking-tight">Site Settings</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Update the site name, tagline, bio, and contact details shown on the public site.
      </p>
      <SettingsForm
        initial={{
          siteName: settings.siteName,
          logoObjectKey: settings.logoObjectKey,
          tagline: settings.tagline,
          bioText: settings.bioText,
          contactEmail: settings.contactEmail,
          socialLinks: (settings.socialLinks as Record<string, string>) ?? {},
        }}
      />
    </div>
  );
}
