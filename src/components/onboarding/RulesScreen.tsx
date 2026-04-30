import { useState } from "react";

type Props = {
  onAccept: () => void;
};

const RULES = [
  "Sellers walk in with items — haggle hard, buy low, or walk away.",
  "Some items are FAKE and some are STOLEN — trust no one blindly.",
  "Selling a fake or stolen item to a buyer means instant arrest — game over.",
  "Buying stolen goods has a 50% chance of police catching you — game over.",
  "Call experts from your phone to verify items — but it costs money and they may not pick up.",
  "Run ads to attract buyers — no buyers means no profit.",
  "Pay your rent on time or lose everything — this shop doesn't run itself.",
];

export function RulesScreen({ onAccept }: Props) {
  const [accepted, setAccepted] = useState(false);

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/rules-bg.png')", backgroundColor: "var(--game-bg-0)" }}
    >
      <div className="absolute inset-0 bg-black/65" />

      <div className="relative z-10 w-full max-w-2xl mx-4 px-6">
        {/* Title */}
        <h1
          className="uppercase leading-none mb-8 text-center select-none"
          style={{
            fontFamily: "'Bungee Shade', 'Impact', cursive",
            fontSize: "clamp(1.3rem, 3.5vw, 2.2rem)",
            color: "var(--game-accent)",
            textShadow: "0 0 40px rgba(255,204,77,0.5), 0 6px 20px rgba(0,0,0,0.9)",
            lineHeight: 1.2,
          }}
        >
          You Must Read the Rules<br />Before Sitting in Suvo's Pawn Shop
        </h1>

        {/* Rules list */}
        <div className="space-y-3 mb-8">
          {RULES.map((rule, i) => (
            <div
              key={i}
              className="flex gap-3 items-start"
              style={{
                background: "rgba(63,42,26,0.7)",
                border: "1px solid var(--game-border)",
                borderRadius: "12px",
                padding: "12px 16px",
              }}
            >
              <span
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{
                  fontFamily: "'Bungee', sans-serif",
                  background: "var(--game-accent)",
                  color: "var(--game-bg-0)",
                }}
              >
                {i + 1}
              </span>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "'Bungee', sans-serif", color: "var(--game-text)", fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)" }}
              >
                {rule}
              </p>
            </div>
          ))}
        </div>

        {/* Checkbox */}
        <label
          className="flex items-start gap-3 cursor-pointer mb-6 select-none"
          style={{ padding: "12px 16px", background: "rgba(63,42,26,0.5)", borderRadius: "12px", border: "1px solid var(--game-border)" }}
        >
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            className="mt-1 w-5 h-5 accent-[#ffcc4d] shrink-0"
          />
          <span
            style={{ fontFamily: "'Bungee', sans-serif", color: "var(--game-text-muted)", fontSize: "clamp(0.6rem, 1.3vw, 0.75rem)" }}
          >
            I have read all the rules and I promise I will run this shop to the best of my ability
          </span>
        </label>

        {/* Continue button */}
        <div className="text-center">
          <button
            disabled={!accepted}
            onClick={onAccept}
            className={`game-button-primary uppercase tracking-[0.15em] px-12 py-4 transition-all ${!accepted ? "opacity-30 cursor-not-allowed" : ""}`}
            style={{ fontFamily: "'Bungee', sans-serif", fontSize: "clamp(1rem, 2.2vw, 1.3rem)" }}
          >
            I'm Ready
          </button>
        </div>
      </div>
    </section>
  );
}
