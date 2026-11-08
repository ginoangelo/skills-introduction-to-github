import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * In-memory app state for the prototype. Phase 2 moves "seen" and "followed"
 * into the Amplify backend so they survive restarts and sync across devices.
 */
type AppState = {
  seen: ReadonlySet<string>;
  followed: ReadonlySet<string>;
  /** Stories watched in the current chain, oldest first. */
  chain: readonly string[];
  markSeen: (storyId: string) => void;
  toggleFollow: (threadId: string) => void;
  startChain: (storyId: string) => void;
  pushChain: (storyId: string) => void;
  /** Removes the current story and returns the previous one, if any. */
  popChain: () => string | undefined;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());
  const [followed, setFollowed] = useState<ReadonlySet<string>>(new Set(['harlan-river']));
  const [chain, setChain] = useState<readonly string[]>([]);

  const markSeen = useCallback((id: string) => {
    setSeen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const toggleFollow = useCallback((id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const startChain = useCallback((id: string) => setChain([id]), []);
  const pushChain = useCallback((id: string) => setChain((prev) => [...prev, id]), []);
  const popChain = useCallback(() => {
    if (chain.length < 2) return undefined;
    const previous = chain[chain.length - 2];
    setChain(chain.slice(0, -1));
    return previous;
  }, [chain]);

  const value = useMemo(
    () => ({ seen, followed, chain, markSeen, toggleFollow, startChain, pushChain, popChain }),
    [seen, followed, chain, markSeen, toggleFollow, startChain, pushChain, popChain],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const value = useContext(Ctx);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
