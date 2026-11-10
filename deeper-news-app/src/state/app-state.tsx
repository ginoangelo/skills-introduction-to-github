import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { LOCATION_OPTIONS, type UserLocation } from '@/data/places';

const LOCATION_KEY = 'deeper-news:location';
const PROGRESS_KEY = 'deeper-news:progress';

type SavedProgress = { seen?: string[]; followed?: string[]; guesses?: [string, boolean][] };

/**
 * App state for the prototype. The chosen location is saved on the device;
 * "seen" and "followed" move into the Amplify backend in Phase 2.
 */
type AppState = {
  /** null until the person picks where they are. */
  location: UserLocation | null;
  /** False until the saved location has been read from the device. */
  locationReady: boolean;
  setLocation: (loc: UserLocation) => void;
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
  /** "What happens next?" answers: story id -> whether the guess was right. */
  guesses: ReadonlyMap<string, boolean>;
  recordGuess: (storyId: string, correct: boolean) => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());
  const [followed, setFollowed] = useState<ReadonlySet<string>>(new Set(['harlan-river']));
  const [chain, setChain] = useState<readonly string[]>([]);
  const [location, setLocationState] = useState<UserLocation | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [guesses, setGuesses] = useState<ReadonlyMap<string, boolean>>(new Map());

  const [progressReady, setProgressReady] = useState(false);

  const recordGuess = useCallback((id: string, correct: boolean) => {
    setGuesses((prev) => (prev.has(id) ? prev : new Map(prev).set(id, correct)));
  }, []);

  // Watched stories, follows and guesses are saved on the device.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(PROGRESS_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const p = JSON.parse(raw) as SavedProgress;
        if (Array.isArray(p.seen)) setSeen(new Set(p.seen));
        if (Array.isArray(p.followed)) setFollowed(new Set(p.followed));
        if (Array.isArray(p.guesses)) setGuesses(new Map(p.guesses));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProgressReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Wait for the saved copy to load, so it isn't overwritten with an empty one.
    if (!progressReady) return;
    const p: SavedProgress = { seen: [...seen], followed: [...followed], guesses: [...guesses] };
    AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(p)).catch(() => {});
  }, [progressReady, seen, followed, guesses]);

  // Read the saved location once. Storage can fail (private browsing), so fall back to none.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(LOCATION_KEY)
      .then((id) => {
        if (!cancelled && id) setLocationState(LOCATION_OPTIONS.find((o) => o.id === id) ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLocationReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocation = useCallback((loc: UserLocation) => {
    setLocationState(loc);
    AsyncStorage.setItem(LOCATION_KEY, loc.id).catch(() => {});
  }, []);

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
    () => ({ location, locationReady, setLocation, seen, followed, chain, markSeen, toggleFollow, startChain, pushChain, popChain, guesses, recordGuess }),
    [location, locationReady, setLocation, seen, followed, chain, markSeen, toggleFollow, startChain, pushChain, popChain, guesses, recordGuess],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const value = useContext(Ctx);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
