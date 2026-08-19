export function ContactContent({
  contactEmail,
  socialLinks,
}: {
  contactEmail?: string;
  socialLinks: Record<string, string>;
}) {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-10 px-4 pt-32 pb-20">
      <div className="flex flex-col gap-3">
        <span className="h-px w-10 bg-foreground/30" />
        <h1 className="font-heading text-4xl font-light tracking-tight md:text-5xl">Contact</h1>
      </div>
      <div className="flex flex-col gap-4 text-base">
        {contactEmail && (
          <a href={`mailto:${contactEmail}`} className="link-wipe w-fit">
            {contactEmail}
          </a>
        )}
        {Object.entries(socialLinks)
          .filter(([, url]) => Boolean(url))
          .map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              className="link-wipe w-fit text-xs tracking-[0.15em] uppercase"
              target="_blank"
              rel="noopener noreferrer"
            >
              {platform}
            </a>
          ))}
      </div>
    </main>
  );
}
