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
      style={{ backgroundImage: "url('/login-bg.png')", backgroundColor: "var(--game-bg-0)" }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 max-w-2xl text-center">
        {/* Big dramatic title */}
        <h1
          className="uppercase leading-tight mb-4 select-none"
          style={{
            fontFamily: "'Impact', 'Arial Black', 'Haettenschweiler', sans-serif",
            fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
            color: "var(--game-accent)",
            textShadow: "0 0 30px rgba(255,204,77,0.4), 0 4px 12px rgba(0,0,0,0.8)",
            letterSpacing: "0.06em",
            lineHeight: 1.1,
          }}
        >
          Are You Ready to Run<br />Suvo's Pawn Shop?
        </h1>

        <p
          className="uppercase tracking-[0.3em] mb-10 select-none"
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontSize: "clamp(0.7rem, 1.8vw, 1rem)",
            color: "var(--game-text-muted)",
            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
          }}
        >
          Enter your name and prove yourself
        </p>

        {/* Name input — big and bold */}
        <input
          className="game-input w-full max-w-md text-center text-2xl py-4 mb-4 uppercase tracking-wider"
          style={{
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
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
            style={{ color: "var(--game-danger)", textShadow: "0 0 10px rgba(239,68,68,0.5)" }}
          >
            {error}
          </p>
        )}

        <button
          className="game-button-primary uppercase tracking-[0.2em] font-black px-12 py-4"
          style={{
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
          }}
          onClick={handleSubmit}
        >
          Let's Go
        </button>
      </div>
    </section>
  );
}
