import Link from "next/link";
import { getSiteSettings } from "@/lib/data";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="site-container flex flex-col items-center gap-4 py-10 text-sm text-muted-foreground md:flex-row md:justify-between">
        <p>
          © {year} {settings.siteName}
        </p>
        <nav className="flex gap-6">
          <Link href="/work" className="link-wipe">
            Work
          </Link>
          <Link href="/about" className="link-wipe">
            About
          </Link>
          <Link href="/contact" className="link-wipe">
            Contact
          </Link>
          <Link href="/admin" className="link-wipe">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
}
