type Props = {
  playerName: string;
  onSelectLevel: (level: number) => void;
};

export function LevelSelect({ playerName, onSelectLevel }: Props) {
  // Unlock progress from localStorage
  const saved = localStorage.getItem(`pawn-level-${playerName}`);
  const unlockedLevel = saved ? Math.min(parseInt(saved, 10) || 1, 5) : 1;

  const levels = [
    { num: 1, title: "Rookie Dealer", desc: "Learn the ropes" },
    { num: 2, title: "Street Hustler", desc: "Tougher customers" },
    { num: 3, title: "Sharp Eye", desc: "More fakes in the mix" },
    { num: 4, title: "Master Dealer", desc: "High stakes deals" },
    { num: 5, title: "Pawn King", desc: "Only the best survive" },
  ];

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/level-bg.png')", backgroundColor: "var(--game-bg-0)" }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="game-menu-shell p-8 rounded-2xl">
          <p className="game-text-muted text-center text-sm uppercase tracking-wider mb-1">
            Welcome, {playerName}
          </p>
          <h1
            className="game-title text-center text-3xl mb-6 uppercase tracking-widest"
            style={{ color: "var(--game-accent)" }}
          >
            Select Level
          </h1>

          <div className="space-y-3">
            {levels.map(l => {
              const locked = l.num > unlockedLevel;
              return (
                <button
                  key={l.num}
                  disabled={locked}
                  onClick={() => onSelectLevel(l.num)}
                  className={`w-full text-left px-5 py-4 rounded-xl flex items-center gap-4 transition-all duration-150 ${
                    locked
                      ? "opacity-40 cursor-not-allowed"
                      : "game-button hover:scale-[1.02]"
                  }`}
                  style={!locked ? { border: "2px solid var(--game-border)" } : { border: "2px solid var(--game-border)", filter: "grayscale(0.6)" }}
                >
                  <span
                    className="text-2xl font-black w-10 h-10 flex items-center justify-center rounded-lg"
                    style={{
                      background: locked ? "var(--game-surface)" : "var(--game-accent)",
                      color: locked ? "var(--game-text-dim)" : "var(--game-bg-0)",
                    }}
                  >
                    {locked ? "🔒" : l.num}
                  </span>
                  <div>
                    <div className="game-label text-base uppercase tracking-wider">{l.title}</div>
                    <div className="game-text-dim text-xs">{l.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
