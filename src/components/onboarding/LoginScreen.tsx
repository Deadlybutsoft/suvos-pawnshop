import { useState, useEffect } from "react";

type Props = {
  onLogin: (name: string) => void;
};

type Account = { name: string; password: string };

export function LoginScreen({ onLogin }: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState("");

  // Check if account already exists
  useEffect(() => {
    const saved = localStorage.getItem("pawn-accounts");
    if (saved) {
      const accounts: Account[] = JSON.parse(saved);
      if (accounts.length > 0) setIsCreating(false);
    }
  }, []);

  const handleSubmit = () => {
    setError("");
    if (!name.trim()) { setError("Enter a name"); return; }
    if (!password || password.length > 5) { setError("Password must be 1–5 digits"); return; }
    if (!/^\d+$/.test(password)) { setError("Password must be digits only"); return; }

    const saved = localStorage.getItem("pawn-accounts");
    const accounts: Account[] = saved ? JSON.parse(saved) : [];

    if (isCreating) {
      if (accounts.find(a => a.name.toLowerCase() === name.trim().toLowerCase())) {
        setError("Name already taken"); return;
      }
      accounts.push({ name: name.trim(), password });
      localStorage.setItem("pawn-accounts", JSON.stringify(accounts));
      onLogin(name.trim());
    } else {
      const match = accounts.find(
        a => a.name.toLowerCase() === name.trim().toLowerCase() && a.password === password
      );
      if (!match) { setError("Wrong name or password"); return; }
      onLogin(match.name);
    }
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/login-bg.png')", backgroundColor: "var(--game-bg-0)" }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="game-menu-shell p-8 rounded-2xl">
          <h1
            className="game-title text-center text-3xl mb-2 uppercase tracking-widest"
            style={{ color: "var(--game-accent)" }}
          >
            {isCreating ? "Create Account" : "Login"}
          </h1>
          <p className="game-text-muted text-center text-sm mb-6">
            {isCreating ? "Choose your character name" : "Welcome back, dealer"}
          </p>

          <div className="space-y-4">
            <div>
              <label className="game-label text-xs uppercase tracking-wider mb-1 block">Name</label>
              <input
                className="game-input w-full"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={20}
                autoFocus
              />
            </div>

            <div>
              <label className="game-label text-xs uppercase tracking-wider mb-1 block">
                Password <span className="game-text-dim">(max 5 digits)</span>
              </label>
              <input
                className="game-input w-full"
                type="password"
                placeholder="•••••"
                value={password}
                onChange={e => { if (/^\d{0,5}$/.test(e.target.value)) setPassword(e.target.value); }}
                maxLength={5}
                inputMode="numeric"
              />
            </div>

            {error && (
              <p className="text-sm font-bold text-center" style={{ color: "var(--game-danger)" }}>
                {error}
              </p>
            )}

            <button className="game-button-primary w-full py-3 text-lg uppercase tracking-wider" onClick={handleSubmit}>
              {isCreating ? "Create Account" : "Login"}
            </button>

            <button
              className="game-button w-full py-2 text-sm uppercase tracking-wider"
              onClick={() => { setIsCreating(!isCreating); setError(""); }}
            >
              {isCreating ? "Already have an account? Login" : "New here? Create Account"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
