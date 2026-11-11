import { useState } from 'react';
import { api } from './api.js';
import { CATEGORIES, CATEGORY_EMOJI, Empty, ExpiryChip, Icon, LOCATIONS } from './ui.jsx';

const BLANK = { name: '', quantity: '', category: 'other', location: 'fridge', expires: '' };

export default function Pantry({ pantry, setPantry, guard, notify, go }) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // item being edited, or BLANK for a new one

  async function save(e) {
    e.preventDefault();
    const body = {
      name: editing.name, quantity: editing.quantity, category: editing.category,
      location: editing.location, expires: editing.expires || null,
    };
    const out = await guard(() =>
      editing.id ? api.patch(`/pantry/${editing.id}`, body) : api.post('/pantry', { items: [body] }),
    );
    if (!out) return;
    setPantry(out.items);
    setEditing(null);
  }

  async function remove(item) {
    const out = await guard(() => api.del(`/pantry/${item.id}`));
    if (!out) return;
    setPantry(out.items);
    setEditing(null);
    notify(`Removed ${item.name}`);
  }

  const q = query.trim().toLowerCase();
  const shown = q ? pantry.filter((i) => i.name.toLowerCase().includes(q)) : pantry;

  return (
    <div className="stack">
      <div className="page-head row-between">
        <div>
          <h1>Pantry</h1>
          <p>{pantry.length} item{pantry.length === 1 ? '' : 's'} across your kitchen</p>
        </div>
        <button className="btn btn-lime" onClick={() => setEditing(BLANK)}><Icon name="plus" size={18} /> Add</button>
      </div>

      {pantry.length === 0 ? (
        <Empty emoji="🫙" title="Nothing here yet">
          Scan your fridge or a cabinet and your items will land here.
          <br /><button className="btn btn-primary" onClick={() => go('scan')}>Scan something</button>
        </Empty>
      ) : (
        <>
          <input className="search" type="search" placeholder="Search your pantry" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search your pantry" />
          {LOCATIONS.map((loc) => {
            const items = shown.filter((i) => i.location === loc.id);
            if (items.length === 0) return null;
            return (
              <section key={loc.id}>
                <h2 className="group-title"><span aria-hidden="true">{loc.emoji}</span> {loc.label} <small>{items.length}</small></h2>
                <ul className="list">
                  {items.map((it) => (
                    <li key={it.id}>
                      <button className="row row-button" onClick={() => setEditing({ ...it, expires: it.expires || '' })}>
                        <span className="row-emoji" aria-hidden="true">{CATEGORY_EMOJI[it.category]}</span>
                        <span className="row-main">
                          <strong>{it.name}</strong>
                          {(it.quantity || it.brand) && <small>{[it.quantity, it.brand].filter(Boolean).join(' · ')}</small>}
                        </span>
                        <ExpiryChip expires={it.expires} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {shown.length === 0 && <p className="note">Nothing matches "{query}".</p>}
        </>
      )}

      {editing && (
        <div className="sheet-backdrop" onClick={() => setEditing(null)}>
          <form className="sheet" onSubmit={save} onClick={(e) => e.stopPropagation()}>
            <div className="row-between">
              <h2>{editing.id ? 'Edit item' : 'Add an item'}</h2>
              <button type="button" className="icon-btn" onClick={() => setEditing(null)} aria-label="Close"><Icon name="x" /></button>
            </div>
            <label>Name
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required maxLength={80} autoFocus={!editing.id} />
            </label>
            <div className="grid-2">
              <label>Amount
                <input value={editing.quantity} onChange={(e) => setEditing({ ...editing, quantity: e.target.value })} maxLength={40} placeholder="e.g. 2 cans" />
              </label>
              <label>Best by
                <input type="date" value={editing.expires} onChange={(e) => setEditing({ ...editing, expires: e.target.value })} />
              </label>
              <label>Where
                <select value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })}>
                  {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </label>
              <label>Type
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
                </select>
              </label>
            </div>
            <div className="actions">
              {editing.id && <button type="button" className="btn btn-danger" onClick={() => remove(editing)}>Remove</button>}
              <button className="btn btn-primary grow">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
