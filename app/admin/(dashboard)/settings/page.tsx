import { getSiteSettings } from "@/lib/data";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-1 font-heading text-xl tracking-wide">Site Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Update the site name, tagline, bio, and contact details shown on the public site.
      </p>
      <SettingsForm
        initial={{
          siteName: settings.siteName,
          tagline: settings.tagline,
          bioText: settings.bioText,
          contactEmail: settings.contactEmail,
          socialLinks: (settings.socialLinks as Record<string, string>) ?? {},
        }}
      />
    </div>
  );
}
