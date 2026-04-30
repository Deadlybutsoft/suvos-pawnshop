import { useState, useCallback } from "react";

const KEY = "pawn-session";

export type GameSession = {
  playerName: string;
  currentLevel: number;
  rulesAccepted: boolean;
};

const empty: GameSession = { playerName: "", currentLevel: 1, rulesAccepted: false };

function load(): GameSession {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return { ...empty, ...parsed };
  } catch { return empty; }
}

function save(session: GameSession) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function resolveStartStep(session: GameSession): "hero" | "levels" | "rules" | "game" {
  if (!session.playerName) return "hero";
  if (!session.rulesAccepted) return "levels";
  return "game";
}

export function useGameSession() {
  const [session, setSession] = useState<GameSession>(load);

  const update = useCallback((patch: Partial<GameSession>) => {
    setSession(prev => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setSession(empty);
  }, []);

  return { session, update, clear };
}
