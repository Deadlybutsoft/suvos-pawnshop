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
            fontFamily: "'Bungee Shade', 'Impact', cursive",
            fontSize: "clamp(2rem, 6vw, 4.5rem)",
            color: "var(--game-accent)",
            textShadow: "0 0 40px rgba(255,204,77,0.5), 0 6px 20px rgba(0,0,0,0.9), 0 0 80px rgba(255,179,0,0.2)",
            letterSpacing: "0.04em",
            lineHeight: 1.05,
          }}
        >
          Suvo's Pawnshop
        </h1>

        {show && (
          <p
            className="uppercase tracking-[0.3em] select-none animate-pulse"
            style={{
              fontFamily: "'Bungee', 'Arial Black', sans-serif",
              fontSize: "clamp(0.6rem, 1.5vw, 0.9rem)",
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
