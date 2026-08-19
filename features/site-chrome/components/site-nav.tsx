import { getSiteSettings } from "@/lib/data";
import { NavShell } from "./nav-shell";

export async function SiteNav() {
  const settings = await getSiteSettings();
  return <NavShell siteName={settings.siteName} />;
}
