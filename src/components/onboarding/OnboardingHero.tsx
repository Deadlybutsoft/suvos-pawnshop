import { useEffect, useState } from "react";

type OnboardingHeroProps = {
  onStart: () => void;
};

export function OnboardingHero({ onStart }: OnboardingHeroProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const timer = setTimeout(onStart, 5000);
    return () => clearTimeout(timer);
  }, [onStart]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? "" : d + ".");
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/pawnshop-hero.png')" }}
    >
      <div className="relative z-10 flex min-h-screen items-end justify-center pb-12">
        <p className="game-text-muted text-sm uppercase tracking-[0.25em]">
          Loading{dots}
        </p>
      </div>
    </section>
  );
}
