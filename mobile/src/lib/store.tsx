import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Entry, PreparedImage } from "./types";

const KEY = "aimed.recent.v1";
const MAX = 30;

interface Store {
  ready: boolean;
  recent: Entry[];
  pending: PreparedImage | null;
  setPending: (img: PreparedImage | null) => void;
  /** Save a live decode to history. Example reads are kept in memory only. */
  addEntry: (entry: Entry) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, patch: Partial<Entry>) => void;
  clearHistory: () => void;
  getEntry: (id: string) => Entry | undefined;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [recent, setRecent] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<PreparedImage | null>(null);
  const temp = useRef(new Map<string, Entry>());

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const list = raw ? JSON.parse(raw) : [];
        if (Array.isArray(list)) setRecent(list);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((list: Entry[]) => {
    AsyncStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))).catch(() => {});
  }, []);

  const addEntry = useCallback(
    (entry: Entry) => {
      if (entry.mode === "example") {
        temp.current.set(entry.id, entry);
        return;
      }
      setRecent((prev) => {
        const next = [entry, ...prev.filter((e) => e.id !== entry.id)].slice(0, MAX);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeEntry = useCallback(
    (id: string) =>
      setRecent((prev) => {
        const next = prev.filter((e) => e.id !== id);
        persist(next);
        return next;
      }),
    [persist],
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<Entry>) => {
      const temp1 = temp.current.get(id);
      if (temp1) {
        temp.current.set(id, { ...temp1, ...patch });
        setRecent((prev) => [...prev]); // re-render readers of example entries
        return;
      }
      setRecent((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearHistory = useCallback(() => {
    setRecent([]);
    persist([]);
  }, [persist]);

  const getEntry = useCallback((id: string) => recent.find((e) => e.id === id) ?? temp.current.get(id), [recent]);

  const value = useMemo(
    () => ({ ready, recent, pending, setPending, addEntry, removeEntry, updateEntry, clearHistory, getEntry }),
    [ready, recent, pending, addEntry, removeEntry, updateEntry, clearHistory, getEntry],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  const m = (Date.now() - d.getTime()) / 60000;
  if (m < 1) return "Just now";
  if (m < 60) return `${Math.round(m)} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
