import { useState } from "react";

type Props = {
  onLogin: (name: string) => void;
};

export function LoginScreen({ onLogin }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) { setError("ENTER YOUR NAME, DEALER"); return; }
    localStorage.setItem("pawn-player", name.trim());
    onLogin(name.trim());
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/login-bg.webp')", backgroundColor: "var(--game-bg-0)" }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 max-w-2xl text-center">
        {/* Big dramatic game title */}
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
          Are You Ready to Run<br />Suvo's Pawn Shop?
        </h1>

        <p
          className="uppercase tracking-[0.3em] mb-10 select-none"
          style={{
            fontFamily: "'Bungee', 'Arial Black', sans-serif",
            fontSize: "clamp(0.6rem, 1.5vw, 0.85rem)",
            color: "var(--game-text-muted)",
            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
          }}
        >
          Enter your name and prove yourself
        </p>

        {/* Name input */}
        <input
          className="game-input w-full max-w-md text-center py-4 mb-4 uppercase tracking-wider"
          style={{
            fontFamily: "'Bungee', 'Arial Black', sans-serif",
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            border: "3px solid var(--game-border-strong)",
            background: "var(--game-surface)",
            color: "var(--game-text)",
          }}
          type="text"
          placeholder="YOUR NAME"
          value={name}
          onChange={e => { setName(e.target.value); setError(""); }}
          maxLength={20}
          autoFocus
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />

        {error && (
          <p
            className="uppercase tracking-wider text-lg font-black mb-4"
            style={{ fontFamily: "'Bungee', sans-serif", color: "var(--game-danger)", textShadow: "0 0 10px rgba(239,68,68,0.5)" }}
          >
            {error}
          </p>
        )}

        <button
          className="game-button-primary uppercase tracking-[0.15em] px-12 py-4"
          style={{
            fontFamily: "'Bungee', 'Arial Black', sans-serif",
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
          }}
          onClick={handleSubmit}
        >
          Let's Go
        </button>
      </div>
    </section>
  );
}
