import { useEffect } from "react";

type OnboardingHeroProps = {
  onStart: () => void;
};

export function OnboardingHero({ onStart }: OnboardingHeroProps) {
  useEffect(() => {
    const timer = setTimeout(onStart, 5000);
    return () => clearTimeout(timer);
  }, [onStart]);

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/pawnshop-hero.png')" }}
    >
      {/* Overlay for theme consistency */}
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(37,24,15,0.88)_0%,rgba(37,24,15,0.55)_40%,rgba(37,24,15,0.35)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,204,77,0.16)_0%,transparent_35%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <p className="game-text-muted animate-pulse text-sm uppercase tracking-[0.25em]">
          Loading…
        </p>
      </div>
    </section>
  );
}
