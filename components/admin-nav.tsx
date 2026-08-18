import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/admin-logout-button";

const LINKS = [
  { href: "/admin", label: "Images" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  return (
    <nav className="mb-8 flex items-center justify-between border-b border-border pb-4">
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to site
        </Link>
        <span className="h-4 w-px bg-border" aria-hidden />
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="text-foreground hover:underline">
            {link.label}
          </Link>
        ))}
      </div>
      <LogoutButton />
    </nav>
  );
}
