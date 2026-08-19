import Link from "next/link";
import { getSiteSettings } from "@/lib/data";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="site-container flex flex-col items-center gap-5 py-12 text-sm text-muted-foreground md:flex-row md:justify-between">
        <p className="font-heading text-xs tracking-[0.15em] uppercase">
          © {year} {settings.siteName}
        </p>
        <nav className="flex gap-7">
          <Link href="/#gallery" className="link-wipe">
            Gallery
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
