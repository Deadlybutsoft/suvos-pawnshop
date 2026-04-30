import { useState } from "react";

type Props = {
  onAccept: () => void;
};

const RULES = [
  "Buy low, sell high — fakes & stolen goods mean jail.",
  "Call experts to verify — costs money, may not pick up.",
  "Run ads to attract buyers — no buyers, no profit.",
  "Pay rent on time or lose everything.",
];

export function RulesScreen({ onAccept }: Props) {
  const [accepted, setAccepted] = useState(false);

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/rules-bg.webp')", backgroundColor: "var(--game-bg-0)" }}
    >
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 w-full max-w-3xl mx-4 px-6 flex flex-col items-center">
        {/* Title */}
        <h1
          className="mb-10 text-center select-none"
          style={{
            fontFamily: "'MedievalSharp', 'Bungee Shade', cursive",
            fontSize: "clamp(2.8rem, 8vw, 5rem)",
            color: "var(--game-accent)",
            textShadow: "0 0 40px rgba(255,204,77,0.5), 0 6px 20px rgba(0,0,0,0.9)",
            lineHeight: 1.2,
          }}
        >
          Know the Rules Before You Deal!
        </h1>

        {/* Rules list */}
        <div className="space-y-4 mb-10 w-full max-w-xl">
          {RULES.map((rule, i) => (
            <div
              key={i}
              className="flex gap-3 items-center"
              style={{
                background: "rgba(63,42,26,0.7)",
                border: "1px solid var(--game-border)",
                borderRadius: "10px",
                padding: "14px 18px",
              }}
            >
              <span
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  fontFamily: "'Quantico', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  background: "var(--game-accent)",
                  color: "var(--game-bg-0)",
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontFamily: "'Bungee', sans-serif", color: "var(--game-text)", fontSize: "clamp(0.6rem, 1.4vw, 0.78rem)" }}>
                {rule}
              </p>
            </div>
          ))}
        </div>

        {/* Toggle accept */}
        <div
          className="flex items-center gap-4 mb-8 cursor-pointer select-none"
          onClick={() => setAccepted(a => !a)}
        >
          <div
            className="relative shrink-0"
            style={{
              width: "56px",
              height: "30px",
              borderRadius: "15px",
              background: accepted ? "var(--game-accent)" : "var(--game-surface)",
              border: "2px solid var(--game-border-strong)",
              transition: "background 0.2s ease",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: accepted ? "28px" : "3px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: accepted ? "var(--game-bg-0)" : "var(--game-text-dim)",
                transition: "left 0.2s ease, background 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
              }}
            />
          </div>
          <span style={{ fontFamily: "'Dancing Script', cursive", color: "var(--game-text-muted)", fontSize: "clamp(1rem, 2vw, 1.2rem)" }}>
            I accept the rules
          </span>
        </div>

        {/* Enter button */}
        <button
          disabled={!accepted}
          className={`game-button-primary uppercase tracking-[0.15em] px-14 py-5 ${!accepted ? "opacity-30 cursor-not-allowed" : ""}`}
          style={{
            fontFamily: "'Bungee', sans-serif",
            fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
            boxShadow: accepted ? "0 0 20px rgba(255,204,77,0.3), 0 6px 20px rgba(0,0,0,0.5)" : "none",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={e => { if (accepted) { e.currentTarget.style.transform = "translateY(-2px) scale(1.04)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,204,77,0.5), 0 8px 25px rgba(0,0,0,0.6)"; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = accepted ? "0 0 20px rgba(255,204,77,0.3), 0 6px 20px rgba(0,0,0,0.5)" : "none"; }}
          onMouseDown={e => { if (accepted) e.currentTarget.style.transform = "translateY(2px) scale(0.97)"; }}
          onMouseUp={e => { if (accepted) e.currentTarget.style.transform = "translateY(-2px) scale(1.04)"; }}
          onClick={() => { if (accepted) { new Audio("/sfx/click.mp3").play().catch(() => {}); onAccept(); } }}
        >
          Open the Shop
        </button>
      </div>
    </section>
  );
}
