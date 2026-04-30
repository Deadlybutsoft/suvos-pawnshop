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

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 max-w-5xl text-center">
        {/* Big dramatic game title */}
        <h1
          className="leading-none mb-6 select-none"
          style={{
            fontFamily: "'MedievalSharp', 'Bungee Shade', cursive",
            fontSize: "clamp(2.2rem, 7vw, 4.5rem)",
            color: "var(--game-accent)",
            textShadow: "0 0 40px rgba(255,204,77,0.5), 0 6px 20px rgba(0,0,0,0.9), 0 0 80px rgba(255,179,0,0.2)",
            letterSpacing: "0.02em",
            lineHeight: 1.2,
          }}
        >
          Are You Ready to Run<br />Suvo's Pawn Shop?
        </h1>

        <p
          className="mb-8 select-none"
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
            color: "var(--game-text-muted)",
            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
          }}
        >
          Enter your name and prove yourself
        </p>

        {/* Name input + Let's Go button */}
        <div className="flex items-center gap-3 w-full max-w-md mb-6 mt-16">
          <input
            className="game-input flex-1 text-center py-4 uppercase tracking-wider"
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
          <button
            className="game-button-primary uppercase tracking-[0.15em] px-8 py-4 shrink-0"
            style={{
              fontFamily: "'Bungee', 'Arial Black', sans-serif",
              fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
            }}
            onClick={handleSubmit}
          >
            Let's Go
          </button>
        </div>

        {error && (
          <p
            className="uppercase tracking-wider text-lg font-black"
            style={{ fontFamily: "'Bungee', sans-serif", color: "var(--game-danger)", textShadow: "0 0 10px rgba(239,68,68,0.5)" }}
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
