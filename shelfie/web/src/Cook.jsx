import { useEffect, useState } from 'react';
import { api } from './api.js';
import { Empty, Icon } from './ui.jsx';

const MEALS = ['', 'breakfast', 'lunch', 'dinner', 'snack'];
const TIMES = [{ v: '', l: 'Any time' }, { v: 15, l: '15 min' }, { v: 30, l: '30 min' }, { v: 60, l: '1 hour' }];

export default function Cook({ pantry, shopping, setShopping, guard, notify, go }) {
  const [view, setView] = useState('ideas');
  const [prefs, setPrefs] = useState({ meal: '', maxMinutes: '', craving: '' });
  const [ideas, setIdeas] = useState(null);
  const [saved, setSaved] = useState([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    guard(() => api.get('/suggest/last')).then((r) => r && setIdeas(r));
    guard(() => api.get('/recipes')).then((r) => r && setSaved(r.recipes));
  }, [guard]);

  async function generate() {
    setBusy(true);
    const out = await guard(() =>
      api.post('/suggest', { meal: prefs.meal, maxMinutes: prefs.maxMinutes ? Number(prefs.maxMinutes) : null, craving: prefs.craving }),
    );
    setBusy(false);
    if (out) { setIdeas(out); setOpen(null); }
  }

  async function addToList(names, reason) {
    const out = await guard(() => api.post('/shopping', { items: names.map((name) => ({ name, reason })) }));
    if (!out) return;
    setShopping(out.items);
    notify(names.length === 1 ? `Added ${names[0]} to your list` : `Added ${names.length} items to your list`);
  }

  async function toggleSave(recipe) {
    const existing = saved.find((s) => s.title === recipe.title);
    const out = await guard(() => (existing ? api.del(`/recipes/${existing.id}`) : api.post('/recipes', { recipe })));
    if (!out) return;
    setSaved(out.recipes);
    notify(existing ? 'Removed from saved' : 'Saved for later');
  }

  const onList = new Set(shopping.filter((i) => !i.done).map((i) => i.name.toLowerCase()));

  if (pantry.length === 0) {
    return (
      <Empty emoji="🍳" title="Your pantry is empty">
        Scan your fridge or cabinets and I'll work out what you can cook.
        <br /><button className="btn btn-primary" onClick={() => go('scan')}>Scan something</button>
      </Empty>
    );
  }

  const renderRecipe = (r, key) => {
    const isOpen = open === key;
    const isSaved = saved.some((s) => s.title === r.title);
    const missing = r.missing || [];
    return (
      <article key={key} className={`card recipe ${r.status === 'ready' ? 'recipe-ready' : 'recipe-almost'}`}>
        <button className="recipe-head" onClick={() => setOpen(isOpen ? null : key)} aria-expanded={isOpen}>
          <div className="recipe-chips">
            <span className={`chip ${r.status === 'ready' ? 'chip-lime' : 'chip-sun'}`}>
              {r.status === 'ready' ? 'Ready now' : `Need ${missing.length} more`}
            </span>
            <span className="meta"><Icon name="clock" size={14} /> {r.minutes} min · {r.difficulty} · serves {r.servings}</span>
          </div>
          <h3>{r.title}</h3>
          <p>{r.blurb}</p>
        </button>
        {isOpen && (
          <div className="recipe-body">
            <h4>From your kitchen</h4>
            <ul className="pills">{r.uses.map((u) => <li key={u}>{u}</li>)}</ul>
            {missing.length > 0 && (
              <>
                <h4>You'll need to buy</h4>
                <ul className="pills pills-missing">{missing.map((m) => <li key={m}>{m}</li>)}</ul>
                <button className="btn btn-small" onClick={() => addToList(missing, `for ${r.title}`)}>
                  <Icon name="cart" size={16} /> Add missing to list
                </button>
              </>
            )}
            <h4>Method</h4>
            <ol className="steps">{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </div>
        )}
        <button className={`save-btn ${isSaved ? 'is-saved' : ''}`} onClick={() => toggleSave(r)} aria-label={isSaved ? `Unsave ${r.title}` : `Save ${r.title}`} aria-pressed={isSaved}>
          <Icon name="heart" size={20} />
        </button>
      </article>
    );
  };

  return (
    <div className="stack">
      <div className="page-head">
        <h1>What's cooking?</h1>
        <p>Dishes built from the {pantry.length} items you already have.</p>
      </div>

      <div className="seg" role="tablist">
        <button role="tab" aria-selected={view === 'ideas'} className={view === 'ideas' ? 'is-on' : ''} onClick={() => setView('ideas')}>Ideas</button>
        <button role="tab" aria-selected={view === 'saved'} className={view === 'saved' ? 'is-on' : ''} onClick={() => setView('saved')}>Saved ({saved.length})</button>
      </div>

      {view === 'saved' ? (
        saved.length === 0
          ? <Empty emoji="💛" title="No saved dishes yet">Tap the heart on any dish to keep it here.</Empty>
          : saved.map((r) => renderRecipe(r, `s${r.id}`))
      ) : (
        <>
          <div className="card filters">
            <div className="grid-2">
              <label>Meal
                <select value={prefs.meal} onChange={(e) => setPrefs({ ...prefs, meal: e.target.value })}>
                  {MEALS.map((m) => <option key={m} value={m}>{m ? m[0].toUpperCase() + m.slice(1) : 'Any meal'}</option>)}
                </select>
              </label>
              <label>Time
                <select value={prefs.maxMinutes} onChange={(e) => setPrefs({ ...prefs, maxMinutes: e.target.value })}>
                  {TIMES.map((t) => <option key={t.l} value={t.v}>{t.l}</option>)}
                </select>
              </label>
            </div>
            <label>In the mood for
              <input value={prefs.craving} onChange={(e) => setPrefs({ ...prefs, craving: e.target.value })} placeholder="spicy, cosy, something light…" maxLength={120} />
            </label>
            <button className="btn btn-primary btn-big" onClick={generate} disabled={busy}>
              {busy ? <><span className="spinner" /> Thinking up dishes…</> : <><Icon name="spark" size={18} /> {ideas ? 'Give me new ideas' : 'Find dishes'}</>}
            </button>
          </div>

          {ideas?.demo && <p className="note">Demo mode: ideas come from a small built-in recipe book. Add an API key on the server for dishes written for your pantry.</p>}

          {ideas && (
            <>
              {ideas.recipes.map((r, i) => renderRecipe(r, `i${i}`))}

              {ideas.smartBuys?.length > 0 && (
                <section className="smart">
                  <h2>Smart buys</h2>
                  <p>A few ingredients that would unlock the most new dishes with what you already own.</p>
                  <ul className="list">
                    {ideas.smartBuys.map((b) => {
                      const added = onList.has(b.item.toLowerCase());
                      return (
                        <li key={b.item} className="row smart-row">
                          <div className="row-main">
                            <strong>{b.item}</strong>
                            <small>{b.why}</small>
                            <small className="unlocks">Unlocks: {b.unlocks.join(', ')}</small>
                          </div>
                          <button className="btn btn-small btn-lime" disabled={added} onClick={() => addToList([b.item], 'smart buy')}>
                            {added ? 'On list' : <><Icon name="plus" size={16} /> Add</>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
