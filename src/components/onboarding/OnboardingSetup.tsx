import { useMemo, useState } from "react";
import {
  Store,
  User,
  Wallet,
  Volume2,
  Type,
  Gauge,
  Sparkles,
  Rocket,
  ArrowLeft,
} from "lucide-react";

export type OnboardingSetupData = {
  ownerName: string;
  shopName: string;
  difficulty: "rookie" | "dealer" | "legend";
  startingCash: number;
  captionsEnabled: boolean;
  soundEnabled: boolean;
};

type OnboardingSetupProps = {
  initialData?: Partial<OnboardingSetupData>;
  onBack?: () => void;
  onLaunch: (data: OnboardingSetupData) => void;
};

const DEFAULTS: OnboardingSetupData = {
  ownerName: "",
  shopName: "Golden Pawn",
  difficulty: "dealer",
  startingCash: 1500,
  captionsEnabled: true,
  soundEnabled: true,
};

export default function OnboardingSetup({
  initialData,
  onBack,
  onLaunch,
}: OnboardingSetupProps) {
  const merged = useMemo(
    () => ({ ...DEFAULTS, ...initialData }),
    [initialData],
  );

  const [ownerName, setOwnerName] = useState(merged.ownerName);
  const [shopName, setShopName] = useState(merged.shopName);
  const [difficulty, setDifficulty] = useState<OnboardingSetupData["difficulty"]>(
    merged.difficulty,
  );
  const [startingCash, setStartingCash] = useState(merged.startingCash);
  const [captionsEnabled, setCaptionsEnabled] = useState(merged.captionsEnabled);
  const [soundEnabled, setSoundEnabled] = useState(merged.soundEnabled);

  const startingCashLabel = useMemo(() => {
    return `$${startingCash.toLocaleString()}`;
  }, [startingCash]);

  const difficultyCopy = useMemo(() => {
    if (difficulty === "rookie") return "Safer prices, kinder customers, slower pace.";
    if (difficulty === "legend") return "Hardball negotiations and sharper penalties.";
    return "Balanced economy and steady challenge curve.";
  }, [difficulty]);

  const isValid = ownerName.trim().length > 1 && shopName.trim().length > 1;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;

    onLaunch({
      ownerName: ownerName.trim(),
      shopName: shopName.trim(),
      difficulty,
      startingCash,
      captionsEnabled,
      soundEnabled,
    });
  };

  return (
    <div className="game-overlay min-h-screen w-full flex items-center justify-center p-6">
      <div className="game-menu-shell game-scanlines w-full max-w-4xl overflow-hidden">
        <header className="game-menu-header border-b px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="game-label">New Run</div>
            <h1 className="game-title text-2xl md:text-3xl mt-1">Setup Your Pawn Shop</h1>
            <p className="game-text-muted text-sm mt-2">
              Lock in your owner profile, economy settings, and accessibility options.
            </p>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="game-button inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}
        </header>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          <section className="game-panel p-5 space-y-4">
            <div className="game-label">Identity</div>

            <label className="block">
              <span className="game-title text-xs tracking-[0.18em] inline-flex items-center gap-2">
                <User size={14} />
                Owner Name
              </span>
              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Alex Carter"
                className="game-input mt-2 w-full"
                maxLength={32}
                required
              />
            </label>

            <label className="block">
              <span className="game-title text-xs tracking-[0.18em] inline-flex items-center gap-2">
                <Store size={14} />
                Shop Name
              </span>
              <input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Golden Pawn"
                className="game-input mt-2 w-full"
                maxLength={36}
                required
              />
            </label>
          </section>

          <section className="game-panel p-5 space-y-4">
            <div className="game-label">Game Rules</div>

            <div>
              <span className="game-title text-xs tracking-[0.18em] inline-flex items-center gap-2">
                <Gauge size={14} />
                Difficulty
              </span>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: "rookie", label: "Rookie" },
                  { key: "dealer", label: "Dealer" },
                  { key: "legend", label: "Legend" },
                ].map((item) => {
                  const active = difficulty === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setDifficulty(item.key as OnboardingSetupData["difficulty"])
                      }
                      className={`game-button text-sm px-4 py-3 ${
                        active ? "game-menu-tab-active" : ""
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <p className="game-text-muted text-sm mt-3">{difficultyCopy}</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="game-title text-xs tracking-[0.18em] inline-flex items-center gap-2">
                  <Wallet size={14} />
                  Starting Cash
                </span>
                <span className="game-value-chip px-3 py-1 text-sm">{startingCashLabel}</span>
              </div>
              <input
                type="range"
                min={500}
                max={5000}
                step={100}
                value={startingCash}
                onChange={(e) => setStartingCash(Number(e.target.value))}
                className="w-full mt-3 cursor-pointer accent-[#d7aa55]"
              />
            </div>
          </section>

          <section className="game-panel p-5 space-y-4">
            <div className="game-label">Experience</div>

            <div className="game-setting-row flex items-center justify-between gap-4">
              <div>
                <div className="game-title text-xs tracking-[0.18em] inline-flex items-center gap-2">
                  <Type size={14} />
                  Captions
                </div>
                <p className="game-text-muted text-sm mt-1">
                  Show dialogue text during negotiation scenes.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={captionsEnabled}
                  onChange={(e) => setCaptionsEnabled(e.target.checked)}
                />
                <div className="game-toggle-track h-8 w-16 transition-colors after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:transition-transform after:content-[''] peer-checked:after:translate-x-8" />
              </label>
            </div>

            <div className="game-setting-row flex items-center justify-between gap-4">
              <div>
                <div className="game-title text-xs tracking-[0.18em] inline-flex items-center gap-2">
                  <Volume2 size={14} />
                  Sound FX
                </div>
                <p className="game-text-muted text-sm mt-1">
                  Enable menu clicks, phone taps, and HUD feedback sounds.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                <div className="game-toggle-track h-8 w-16 transition-colors after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:transition-transform after:content-[''] peer-checked:after:translate-x-8" />
              </label>
            </div>
          </section>

          <footer className="game-menu-footer border-t px-1 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="game-text-dim text-xs uppercase tracking-[0.2em] inline-flex items-center gap-2">
              <Sparkles size={14} />
              Ready to open the shutters?
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className="game-button-primary px-8 py-3 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rocket size={16} />
              Launch Game
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
