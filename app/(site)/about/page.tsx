import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-8 px-4 pt-28 pb-16">
      <h1 className="font-heading text-3xl">About</h1>
      {settings.bioText ? (
        <div className="flex flex-col gap-6 text-base leading-8 text-foreground/80">
          {settings.bioText.split("\n\n").map((paragraph: string, i: number) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Bio coming soon.</p>
      )}
    </main>
  );
}
