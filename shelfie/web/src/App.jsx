import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import Auth from './Auth.jsx';
import Scan from './Scan.jsx';
import Pantry from './Pantry.jsx';
import Cook from './Cook.jsx';
import Shopping from './Shopping.jsx';
import Profile from './Profile.jsx';
import { Icon, Logo } from './ui.jsx';

const TABS = [
  { id: 'scan', label: 'Scan', icon: 'camera' },
  { id: 'pantry', label: 'Pantry', icon: 'shelf' },
  { id: 'cook', label: 'Cook', icon: 'pan' },
  { id: 'list', label: 'List', icon: 'cart' },
  { id: 'me', label: 'Me', icon: 'user' },
];

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  const [tab, setTab] = useState('scan');
  const [pantry, setPantry] = useState([]);
  const [shopping, setShopping] = useState([]);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, kind = 'ok') => {
    setToast({ message, kind, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    api.get('/me').then(setSession).catch(() => setSession(null));
  }, []);

  useEffect(() => {
    if (!session) return;
    Promise.all([api.get('/pantry'), api.get('/shopping')])
      .then(([p, s]) => { setPantry(p.items); setShopping(s.items); })
      .catch((e) => notify(e.message, 'error'));
  }, [session?.user.id, notify]);

  useEffect(() => { window.scrollTo(0, 0); }, [tab, session?.user.id]);

  // Any request can discover the session has expired.
  const guard = useCallback(async (fn) => {
    try {
      return await fn();
    } catch (e) {
      if (e.status === 401) setSession(null);
      else notify(e.message, 'error');
      return undefined;
    }
  }, [notify]);

  if (session === undefined) {
    return <div className="splash"><Logo size={56} /></div>;
  }
  if (!session) return <Auth onAuthed={setSession} />;

  const openItems = shopping.filter((i) => !i.done).length;
  const ctx = { session, setSession, pantry, setPantry, shopping, setShopping, notify, guard, go: setTab };

  return (
    <div className="shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab('scan')} aria-label="Shelfie home">
          <Logo size={34} /> <span>Shelfie</span>
        </button>
        {!session.aiLive && <span className="chip chip-sun" title="No AI key configured on the server">Demo mode</span>}
      </header>

      <main className="main" key={tab}>
        {tab === 'scan' && <Scan {...ctx} />}
        {tab === 'pantry' && <Pantry {...ctx} />}
        {tab === 'cook' && <Cook {...ctx} />}
        {tab === 'list' && <Shopping {...ctx} />}
        {tab === 'me' && <Profile {...ctx} />}
      </main>

      <nav className="tabs" aria-label="Main">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <span className="tab-icon">
              <Icon name={t.icon} />
              {t.id === 'list' && openItems > 0 && <b className="badge">{openItems}</b>}
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      {toast && <div key={toast.key} className={`toast toast-${toast.kind}`} role="status">{toast.message}</div>}
    </div>
  );
}
