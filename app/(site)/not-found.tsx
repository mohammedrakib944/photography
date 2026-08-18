import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <h1 className="font-heading text-3xl">Not found</h1>
      <p className="text-sm text-muted-foreground">This page doesn&apos;t exist.</p>
      <Link href="/" className="link-wipe text-xs tracking-[0.15em] uppercase">
        Back home
      </Link>
    </main>
  );
}
