import { useState, useEffect } from "react";

type Props = {
  playerName: string;
  onSelectLevel: (level: number) => void;
};

const LEVEL_TITLES: Record<number, string> = {
  1: "Rookie Dealer",
  2: "Street Hustler",
  3: "Sharp Eye",
  4: "Master Dealer",
  5: "Pawn King",
};

export function LevelSelect({ playerName, onSelectLevel }: Props) {
  const saved = localStorage.getItem(`pawn-level-${playerName}`);
  const level = saved ? Math.min(parseInt(saved, 10) || 1, 5) : 1;
  const title = LEVEL_TITLES[level] ?? "Rookie Dealer";

  // 0=hidden, 1=number breaks in (centered), 2=number slides up + rest appears
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/level-bg.webp')", backgroundColor: "var(--game-bg-0)" }}
    >
      <div className="absolute inset-0 bg-black/60" />

      {/* Level number — absolutely centered, then slides up */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center select-none pointer-events-none"
        style={{
          transform: phase >= 2 ? "translateY(-30vh)" : "translateY(0)",
          transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          style={{
            fontFamily: "'Quantico', 'Impact', sans-serif",
            fontSize: "clamp(7rem, 22vw, 16rem)",
            color: "var(--game-accent)",
            textShadow: "0 0 60px rgba(255,204,77,0.6), 0 8px 30px rgba(0,0,0,0.9), 0 0 120px rgba(255,179,0,0.3)",
            lineHeight: 1,
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 2 ? "scale(0.5)" : phase >= 1 ? "scale(1)" : "scale(3)",
            transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
          }}
        >
          <span style={{ fontSize: "0.5em", verticalAlign: "middle", color: "var(--game-text-muted)" }}>★</span> Lv. {level} <span style={{ fontSize: "0.5em", verticalAlign: "middle", color: "var(--game-text-muted)" }}>★</span>
        </div>
      </div>

      {/* Content that fades in after number moves up */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-24">
        {/* Level label */}
        <span
          className="uppercase tracking-[0.4em] mb-4 select-none"
          style={{
            fontFamily: "'Bungee', 'Arial Black', sans-serif",
            fontSize: "clamp(0.55rem, 1.3vw, 0.75rem)",
            color: "var(--game-text-muted)",
            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.5s ease",
          }}
        >
          Level — {title}
        </span>

        {/* Welcome message */}
        <p
          className="select-none mb-12"
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            color: "var(--game-text-muted)",
            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.5s ease 0.2s",
          }}
        >
          Welcome {title}, {playerName}
        </p>

        {/* Continue button */}
        <button
          className="game-button-primary uppercase tracking-[0.15em] px-14 py-5"
          style={{
            fontFamily: "'Bungee', 'Arial Black', sans-serif",
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            boxShadow: "0 0 20px rgba(255,204,77,0.3), 0 6px 20px rgba(0,0,0,0.5)",
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.5s ease 0.4s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.04)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,204,77,0.5), 0 8px 25px rgba(0,0,0,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,204,77,0.3), 0 6px 20px rgba(0,0,0,0.5)"; }}
          onMouseDown={e => { e.currentTarget.style.transform = "translateY(2px) scale(0.97)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.04)"; }}
          onClick={() => { new Audio("/sfx/click.mp3").play().catch(() => {}); onSelectLevel(level); }}
        >
          Continue Your Journey
        </button>
      </div>
    </section>
  );
}
