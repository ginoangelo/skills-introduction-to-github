import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { deviceFixes } from './device-fixes';
import type { ModeId } from './modes';
import type { Fix, ScanReport } from './types';

type State = {
  report: ScanReport | null;
  done: Record<string, boolean>;
  mode: ModeId;
};

type Store = State & {
  ready: boolean;
  fixes: Fix[];
  setReport: (report: ScanReport) => void;
  toggleFix: (id: string) => void;
  setMode: (mode: ModeId) => void;
};

const KEY = 'veil.state.v1';
const initial: State = { report: null, done: {}, mode: 'surface' };
const StoreContext = createContext<Store | null>(null);

/**
 * App state kept on the device only. The email address is never stored; only the
 * scan result, which fixes are done, and the active mode.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...initial, ...(JSON.parse(raw) as Partial<State>) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo<Store>(() => {
    const fixes = [...(state.report?.fixes ?? []), ...deviceFixes()].sort((a, b) => b.points - a.points);
    return {
      ...state,
      ready,
      fixes,
      setReport: (report) => setState((s) => ({ ...s, report })),
      toggleFix: (id) => setState((s) => ({ ...s, done: { ...s.done, [id]: !s.done[id] } })),
      setMode: (mode) => setState((s) => ({ ...s, mode })),
    };
  }, [state, ready]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
