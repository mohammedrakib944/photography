"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function NavShell({ siteName }: { siteName: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-20 border-b transition-all duration-300 ${
        scrolled
          ? "border-border/60 bg-background/85 shadow-[0_1px_0_0_rgba(0,0,0,0.02)] backdrop-blur-lg"
          : "border-transparent bg-background/40 backdrop-blur-sm"
      }`}
    >
      <div
        className={`site-container flex items-center justify-between text-sm transition-[padding] duration-300 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <Link href="/" className="font-heading text-base font-medium tracking-wide">
          {siteName}
        </Link>
        <nav className="flex gap-7">
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
