export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-foreground">
        Build a Life of <span className="text-primary">Meaning</span>.
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Pillar is the social operating system for Stoics, builders, and deep thinkers. Focus on what you can control.
      </p>

      <div className="flex gap-4">
        <a
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Sign In
        </a>
        <a
          href="/register"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Join the Tribe
        </a>
      </div>

      <div className="mt-16 text-sm text-muted-foreground">
        <p>"Waste no more time arguing what a good man should be. Be one." — Marcus Aurelius</p>
      </div>
    </div>
  );
}
