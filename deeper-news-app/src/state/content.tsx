import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { STORIES as SAMPLE_STORIES, THREADS } from '@/data/stories';
import type { Story, Thread } from '@/data/types';

const DRAFTS_KEY = 'deeper-news:drafts';

/**
 * Where every screen gets its stories. Today: the built-in samples plus stories
 * made in the editor, saved on this device. Phase 2 swaps the device storage
 * for the AWS database without the screens changing.
 */
type Content = {
  stories: Story[];
  threads: Thread[];
  getStory: (id: string) => Story | undefined;
  /** Editor stories, newest first. */
  drafts: Story[];
  ready: boolean;
  saveDraft: (story: Story) => void;
  deleteDraft: (id: string) => void;
};

const Ctx = createContext<Content | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Story[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(DRAFTS_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setDrafts(parsed as Story[]);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (next: Story[]) => {
    AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(next)).catch(() => {});
    return next;
  };

  const saveDraft = useCallback((story: Story) => {
    setDrafts((prev) => persist([{ ...story, draft: true }, ...prev.filter((d) => d.id !== story.id)]));
  }, []);

  const deleteDraft = useCallback((id: string) => {
    setDrafts((prev) => persist(prev.filter((d) => d.id !== id)));
  }, []);

  const value = useMemo(() => {
    const draftIds = new Set(drafts.map((d) => d.id));
    // Editor stories come first so new work shows up at the top.
    const stories = [...drafts, ...SAMPLE_STORIES.filter((s) => !draftIds.has(s.id))];
    const byId = new Map(stories.map((s) => [s.id, s]));
    return {
      stories,
      threads: THREADS,
      getStory: (id: string) => byId.get(id),
      drafts,
      ready,
      saveDraft,
      deleteDraft,
    };
  }, [drafts, ready, saveDraft, deleteDraft]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContent(): Content {
  const value = useContext(Ctx);
  if (!value) throw new Error('useContent must be used inside ContentProvider');
  return value;
}
