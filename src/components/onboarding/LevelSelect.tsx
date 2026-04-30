type Props = {
  playerName: string;
  onSelectLevel: (level: number) => void;
};

const LEVELS = [
  { num: 1, title: "Rookie Dealer" },
  { num: 2, title: "Street Hustler" },
  { num: 3, title: "Sharp Eye" },
  { num: 4, title: "Master Dealer" },
  { num: 5, title: "Pawn King" },
];

export function LevelSelect({ playerName, onSelectLevel }: Props) {
  const saved = localStorage.getItem(`pawn-level-${playerName}`);
  const unlockedLevel = saved ? Math.min(parseInt(saved, 10) || 1, 5) : 1;

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/level-bg.webp')", backgroundColor: "var(--game-bg-0)" }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 max-w-3xl text-center">
        <h1
          className="uppercase leading-none mb-3 select-none"
          style={{
            fontFamily: "'Bungee Shade', 'Impact', cursive",
            fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
            color: "var(--game-accent)",
            textShadow: "0 0 40px rgba(255,204,77,0.5), 0 6px 20px rgba(0,0,0,0.9), 0 0 80px rgba(255,179,0,0.2)",
            letterSpacing: "0.04em",
            lineHeight: 1.15,
          }}
        >
          Choose Your Challenge
        </h1>

        <p
          className="uppercase tracking-[0.3em] mb-12 select-none"
          style={{
            fontFamily: "'Bungee', 'Arial Black', sans-serif",
            fontSize: "clamp(0.55rem, 1.4vw, 0.8rem)",
            color: "var(--game-text-muted)",
            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
          }}
        >
          Welcome back, {playerName}
        </p>

        {/* Level circles */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-14 flex-wrap">
          {LEVELS.map(l => {
            const unlocked = l.num <= unlockedLevel;
            const isCurrent = l.num === unlockedLevel;

            return (
              <div key={l.num} className="flex flex-col items-center gap-2">
                <button
                  disabled={!unlocked}
                  onClick={() => onSelectLevel(l.num)}
                  className="relative rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    width: "clamp(64px, 14vw, 96px)",
                    height: "clamp(64px, 14vw, 96px)",
                    fontFamily: "'Bungee', 'Arial Black', sans-serif",
                    fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                    cursor: unlocked ? "pointer" : "not-allowed",
                    ...(isCurrent
                      ? {
                          background: "linear-gradient(145deg, #ffcc4d, #ffb300, #ffd877)",
                          color: "var(--game-bg-0)",
                          border: "4px solid var(--game-border-strong)",
                          boxShadow: "0 0 25px rgba(255,204,77,0.6), 0 0 60px rgba(255,179,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)",
                          transform: "scale(1.1)",
                        }
                      : unlocked
                        ? {
                            background: "linear-gradient(145deg, var(--game-surface-raised), var(--game-surface-panel))",
                            color: "var(--game-text)",
                            border: "3px solid var(--game-border)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                          }
                        : {
                            background: "var(--game-surface)",
                            color: "var(--game-text-dim)",
                            border: "3px solid rgba(100,70,40,0.3)",
                            opacity: 0.35,
                            filter: "grayscale(1)",
                          }),
                  }}
                >
                  {unlocked ? l.num : "🔒"}
                  {isCurrent && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ border: "2px solid var(--game-accent)", opacity: 0.3 }}
                    />
                  )}
                </button>
                <span
                  className="uppercase tracking-wider select-none"
                  style={{
                    fontFamily: "'Bungee', 'Arial Black', sans-serif",
                    fontSize: "clamp(0.45rem, 1.1vw, 0.6rem)",
                    color: isCurrent ? "var(--game-accent)" : unlocked ? "var(--game-text-muted)" : "var(--game-text-dim)",
                    opacity: unlocked ? 1 : 0.35,
                  }}
                >
                  {l.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Start button */}
        <button
          className="game-button-primary uppercase tracking-[0.15em] px-14 py-5"
          style={{
            fontFamily: "'Bungee', 'Arial Black', sans-serif",
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            boxShadow: "0 0 20px rgba(255,204,77,0.3), 0 6px 20px rgba(0,0,0,0.5)",
          }}
          onClick={() => onSelectLevel(unlockedLevel)}
        >
          Start Your Journey
        </button>
      </div>
    </section>
  );
}
