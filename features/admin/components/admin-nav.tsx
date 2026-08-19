"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./admin-logout-button";

const LINKS = [
  { href: "/admin", label: "Images" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-10 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="flex w-fit items-center gap-1.5 text-xs tracking-[0.15em] text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to site
        </Link>
        <div className="flex flex-wrap gap-2">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full border border-border px-4 py-1.5 text-sm transition-all duration-200 hover:border-foreground/30",
                  active &&
                    "border-foreground bg-foreground text-background shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)] hover:bg-foreground/90"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
      <LogoutButton />
    </nav>
  );
}
