import Link from "next/link";
import { getSiteSettings } from "@/lib/data";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteNav() {
  const settings = await getSiteSettings();

  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="site-container flex items-center justify-between py-4 text-sm">
        <Link href="/" className="font-heading text-base font-medium tracking-wide">
          {settings.siteName}
        </Link>
        <nav className="flex gap-6">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="link-wipe">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
