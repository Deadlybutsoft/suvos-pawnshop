import { useState, useEffect } from "react";

type OnboardingHeroProps = {
  onStart: () => void;
};

export function OnboardingHero({ onStart }: OnboardingHeroProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show) return;
    const handler = () => onStart();
    window.addEventListener("keydown", handler);
    window.addEventListener("pointerdown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("pointerdown", handler);
    };
  }, [show, onStart]);

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center flex flex-col items-center justify-end pb-16 cursor-pointer"
      style={{ backgroundImage: "url('/pawnshop-hero.png')", backgroundColor: "var(--game-bg-0)" }}
      onClick={() => show && onStart()}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1
          className="uppercase select-none mb-4"
          style={{
            fontFamily: "'Impact', 'Arial Black', 'Haettenschweiler', sans-serif",
            fontSize: "clamp(2.5rem, 7vw, 5rem)",
            color: "var(--game-accent)",
            textShadow: "0 0 40px rgba(255,204,77,0.4), 0 4px 16px rgba(0,0,0,0.9)",
            letterSpacing: "0.08em",
            lineHeight: 1.05,
          }}
        >
          Suvo's Pawnshop
        </h1>

        {show && (
          <p
            className="uppercase tracking-[0.4em] select-none animate-pulse"
            style={{
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              fontSize: "clamp(0.7rem, 2vw, 1.1rem)",
              color: "var(--game-text-muted)",
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            Press any key or tap to start
          </p>
        )}
      </div>
    </section>
  );
}
