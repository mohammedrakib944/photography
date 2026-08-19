export function AboutContent({ bioText }: { bioText?: string }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-10 px-4 pt-32 pb-20">
      <div className="flex flex-col gap-3">
        <span className="h-px w-10 bg-foreground/30" />
        <h1 className="font-heading text-4xl font-light tracking-tight md:text-5xl">About</h1>
      </div>
      {bioText ? (
        <div className="flex flex-col gap-6 text-base leading-8 text-foreground/80">
          {bioText.split("\n\n").map((paragraph: string, i: number) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Bio coming soon.</p>
      )}
    </main>
  );
}
