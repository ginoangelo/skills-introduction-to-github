import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { deleteMyData, getProgress, isDemoMode, putProgress } from './api';
import * as auth from './auth';
import { useStore } from './store';

type Status = 'loading' | 'signedOut' | 'signedIn';

type Account = {
  status: Status;
  email: string | null;
  /** True when Cognito and the API are both configured. */
  available: boolean;
  syncError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AccountContext = createContext<Account | null>(null);

/**
 * Holds the signed-in session and keeps the user's fix progress and privacy mode
 * synced to their account (GET/PUT /me/progress). Must sit inside StoreProvider.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  const [session, setSession] = useState<auth.Session | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [syncError, setSyncError] = useState<string | null>(null);
  const pulled = useRef(false); // a pull has started for this session
  const [synced, setSynced] = useState(false); // the pull finished, so it's safe to push
  const available = auth.authEnabled && !isDemoMode;

  useEffect(() => {
    auth.loadSession().then((s) => {
      setSession(s);
      setStatus(s ? 'signedIn' : 'signedOut');
    });
  }, []);

  /** Returns a valid access token, refreshing it if needed; signs out if the session is dead. */
  const token = useCallback(async () => {
    if (!session) throw new auth.AuthError('Not signed in.');
    try {
      const next = await auth.freshSession(session);
      if (next !== session) setSession(next);
      return next.accessToken;
    } catch (e) {
      if (e instanceof auth.AuthError && e.code === 'NotAuthorizedException') {
        await auth.signOut(session);
        setSession(null);
        setStatus('signedOut');
      }
      throw e;
    }
  }, [session]);

  // After sign-in (or app start while signed in): pull saved progress once and merge it in.
  const { ready, mergeProgress } = store;
  useEffect(() => {
    if (!available || status !== 'signedIn' || !ready || pulled.current) return;
    pulled.current = true;
    token()
      .then(getProgress)
      .then((remote) => {
        mergeProgress(remote.done, remote.mode);
        setSyncError(null);
        setSynced(true);
      })
      .catch(() => {
        pulled.current = false;
        setSyncError('Couldn’t load your saved progress.');
      });
  }, [available, status, ready, token, mergeProgress]);

  // Push changes to the account a moment after the user stops tapping.
  const { done, mode } = store;
  useEffect(() => {
    if (!available || status !== 'signedIn' || !synced) return;
    const timer = setTimeout(() => {
      token()
        .then((t) => putProgress(t, { done, mode }))
        .then(() => setSyncError(null))
        .catch(() => setSyncError('Changes saved on this phone; they’ll sync when you’re back online.'));
    }, 800);
    return () => clearTimeout(timer);
  }, [available, status, synced, done, mode, token]);

  const value = useMemo<Account>(
    () => ({
      status,
      email: session?.email ?? null,
      available,
      syncError,
      signIn: async (email, password) => {
        const s = await auth.signIn(email, password);
        pulled.current = false;
        setSynced(false);
        setSession(s);
        setStatus('signedIn');
      },
      signOut: async () => {
        if (session) await auth.signOut(session);
        setSession(null);
        setStatus('signedOut');
        pulled.current = false;
        setSynced(false);
      },
      deleteAccount: async () => {
        if (!session) return;
        const t = await token();
        await deleteMyData(t);
        await auth.deleteAccount({ ...session, accessToken: t });
        setSession(null);
        setStatus('signedOut');
        pulled.current = false;
        setSynced(false);
      },
    }),
    [status, session, available, syncError, token],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): Account {
  const account = useContext(AccountContext);
  if (!account) throw new Error('useAccount must be used inside AccountProvider');
  return account;
}
