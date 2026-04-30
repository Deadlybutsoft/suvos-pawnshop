import { useState, useEffect, useRef } from "react";

type OnboardingHeroProps = {
  onStart: () => void;
};

export function OnboardingHero({ onStart }: OnboardingHeroProps) {
  const [show, setShow] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Auto-play vintage music on mount (retry on first user interaction if blocked)
  useEffect(() => {
    const audio = new Audio("/music/pawnshop-theme.mp3");
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    const tryPlay = () => {
      audio.play().then(() => {
        window.removeEventListener("keydown", tryPlay);
        window.removeEventListener("pointerdown", tryPlay);
      }).catch(() => {});
    };
    tryPlay();
    window.addEventListener("keydown", tryPlay);
    window.addEventListener("pointerdown", tryPlay);
    return () => {
      window.removeEventListener("keydown", tryPlay);
      window.removeEventListener("pointerdown", tryPlay);
      audio.pause();
      audio.src = "";
    };
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
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-end pb-16 cursor-pointer"
      style={{ backgroundColor: "var(--game-bg-0)" }}
      onClick={() => show && onStart()}
    >
      {/* Shaking background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/pawnshop-hero.webp')",
          animation: "hero-shake 3s ease-in-out infinite",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {show && (
          <p
            className="uppercase tracking-[0.3em] select-none"
            style={{
              fontFamily: "'Bungee', 'Arial Black', sans-serif",
              fontSize: "clamp(0.45rem, 1vw, 0.7rem)",
              color: "var(--game-text-dim)",
              animation: "hero-glow-blink 1.8s ease-in-out infinite",
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
