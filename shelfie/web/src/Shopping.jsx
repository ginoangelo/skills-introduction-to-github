import { useState } from 'react';
import { api } from './api.js';
import { Empty, Icon } from './ui.jsx';

export default function Shopping({ shopping, setShopping, setPantry, guard, notify }) {
  const [name, setName] = useState('');
  const apply = (out) => out && setShopping(out.items);

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    apply(await guard(() => api.post('/shopping', { items: [{ name }] })));
    setName('');
  }

  // Tick immediately; the server response then confirms or reverts it.
  async function toggle(item, done) {
    setShopping((list) => list.map((i) => (i.id === item.id ? { ...i, done } : i)));
    const out = await guard(() => api.patch(`/shopping/${item.id}`, { done }));
    if (out) setShopping(out.items);
    else setShopping((list) => list.map((i) => (i.id === item.id ? { ...i, done: !done } : i)));
  }

  async function stock() {
    const out = await guard(() => api.post('/shopping/stock'));
    if (!out) return;
    setShopping(out.items);
    const p = await guard(() => api.get('/pantry'));
    if (p) setPantry(p.items);
    notify(`Moved ${out.moved} item${out.moved === 1 ? '' : 's'} to your pantry`);
  }

  const done = shopping.filter((i) => i.done).length;

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Shopping list</h1>
        <p>Tick things off as you shop, then move them straight into your pantry.</p>
      </div>

      <form className="add-row" onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add an item" maxLength={80} aria-label="Add an item" />
        <button className="btn btn-lime" aria-label="Add to list"><Icon name="plus" size={18} /></button>
      </form>

      {shopping.length === 0 ? (
        <Empty emoji="🛒" title="Your list is clear">Missing ingredients and smart buys you add from the Cook tab show up here.</Empty>
      ) : (
        <ul className="list">
          {shopping.map((it) => (
            <li key={it.id} className={`row ${it.done ? 'is-done' : ''}`}>
              <input type="checkbox" checked={it.done} aria-label={`Bought ${it.name}`}
                onChange={(e) => toggle(it, e.target.checked)} />
              <span className="row-main">
                <strong>{it.name}</strong>
                {it.reason && <small>{it.reason}</small>}
              </span>
              <button className="icon-btn" aria-label={`Remove ${it.name}`} onClick={async () => apply(await guard(() => api.del(`/shopping/${it.id}`)))}>
                <Icon name="x" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {done > 0 && (
        <div className="sticky-actions">
          <button className="btn btn-primary grow" onClick={stock}>Move {done} bought item{done === 1 ? '' : 's'} to pantry</button>
        </div>
      )}
    </div>
  );
}
