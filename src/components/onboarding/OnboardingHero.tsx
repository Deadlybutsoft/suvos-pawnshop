import { Coins } from "lucide-react";

type OnboardingHeroProps = {
  onStart: () => void;
  onOpenSetup?: () => void;
};

export function OnboardingHero({ onStart }: OnboardingHeroProps) {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <img
        src="/hero-bg.jpg"
        alt="Suvos Pawn Shop hero background"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2400&auto=format&fit=crop";
        }}
      />

      {/* Overlay for readability + theme */}
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(37,24,15,0.88)_0%,rgba(37,24,15,0.55)_40%,rgba(37,24,15,0.35)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,204,77,0.16)_0%,transparent_35%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 md:px-10 md:py-10">
        <header className="flex items-center">
          <div className="game-value-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] md:text-sm">
            <Coins size={14} />
            Suvos Pawn Shop
          </div>
        </header>

        <div className="flex items-end">
          <button
            onClick={onStart}
            className="game-button-primary px-8 py-4 text-sm md:px-10 md:py-5 md:text-base"
            aria-label="Start Game"
          >
            Start Game
          </button>
        </div>
      </div>
    </section>
  );
}
