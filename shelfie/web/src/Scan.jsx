import { useEffect, useRef, useState } from 'react';
import { api, shrinkImage } from './api.js';
import { CATEGORY_EMOJI, Icon, LOCATIONS } from './ui.jsx';

const MAX_PHOTOS = 4;

export default function Scan({ session, pantry, setPantry, notify, guard, go }) {
  const [location, setLocation] = useState('fridge');
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { items: [{..., keep}], unidentified }
  const cameraRef = useRef(null);
  const uploadRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, [Boolean(result)]);

  async function addFiles(e) {
    const files = [...e.target.files].slice(0, MAX_PHOTOS - photos.length);
    e.target.value = '';
    try {
      const shrunk = await Promise.all(files.map((f) => shrinkImage(f)));
      setPhotos((p) => [...p, ...shrunk]);
    } catch {
      notify('That file could not be read as a photo.', 'error');
    }
  }

  async function scan() {
    setBusy(true);
    const out = await guard(() =>
      api.post('/scan', { location, images: photos.map(({ mediaType, data }) => ({ mediaType, data })) }),
    );
    setBusy(false);
    if (!out) return;
    setResult({ ...out, items: out.items.map((it, i) => ({ ...it, key: i, keep: true })) });
  }

  const update = (key, patch) =>
    setResult((r) => ({ ...r, items: r.items.map((it) => (it.key === key ? { ...it, ...patch } : it)) }));

  async function save() {
    const items = result.items
      .filter((it) => it.keep && it.name.trim())
      .map(({ name, category, location: loc, quantity, brand, expires }) => ({ name, category, location: loc, quantity, brand, expires }));
    setBusy(true);
    const out = await guard(() => api.post('/pantry', { items }));
    setBusy(false);
    if (!out) return;
    setPantry(out.items);
    setResult(null);
    setPhotos([]);
    notify(`Added ${items.length} item${items.length === 1 ? '' : 's'} to your pantry`);
    go('cook');
  }

  if (result) {
    const kept = result.items.filter((i) => i.keep).length;
    return (
      <div className="stack">
        <div className="page-head">
          <h1>Here's what I spotted</h1>
          <p>Untick anything I got wrong and fix names or amounts before saving.</p>
        </div>
        {result.demo && (
          <p className="note">Demo mode: this is a sample scan, not your photo. Add an API key on the server for real results.</p>
        )}
        <ul className="list">
          {result.items.map((it) => (
            <li key={it.key} className={`row review-row ${it.keep ? '' : 'is-off'}`}>
              <input type="checkbox" checked={it.keep} onChange={(e) => update(it.key, { keep: e.target.checked })} aria-label={`Keep ${it.name}`} />
              <span className="row-emoji" aria-hidden="true">{CATEGORY_EMOJI[it.category]}</span>
              <div className="review-fields">
                <input className="inline-input strong" value={it.name} onChange={(e) => update(it.key, { name: e.target.value })} aria-label="Item name" maxLength={80} />
                <input className="inline-input" value={it.quantity} placeholder="amount" onChange={(e) => update(it.key, { quantity: e.target.value })} aria-label="Amount" maxLength={40} />
              </div>
              {it.confidence !== 'high' && <span className={`chip ${it.confidence === 'low' ? 'chip-tomato' : 'chip-sun'}`}>{it.confidence === 'low' ? 'Guess' : 'Unsure'}</span>}
            </li>
          ))}
        </ul>
        {result.unidentified?.length > 0 && (
          <p className="note">Couldn't identify: {result.unidentified.join('; ')}.</p>
        )}
        <div className="sticky-actions">
          <button className="btn" onClick={() => setResult(null)} disabled={busy}>Back</button>
          <button className="btn btn-primary grow" onClick={save} disabled={busy || kept === 0}>
            {busy ? 'Saving…' : `Add ${kept} to pantry`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Hey {session.user.name.split(' ')[0]}, what's on the shelves?</h1>
        <p>Open the door, take a photo. Up to {MAX_PHOTOS} shots per scan, and close-ups of labels help.</p>
      </div>

      <div className="seg seg-wide" role="radiogroup" aria-label="Where are you scanning?">
        {LOCATIONS.map((l) => (
          <button key={l.id} role="radio" aria-checked={location === l.id} className={location === l.id ? 'is-on' : ''} onClick={() => setLocation(l.id)}>
            <span aria-hidden="true">{l.emoji}</span> {l.label}
          </button>
        ))}
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={addFiles} />
      <input ref={uploadRef} type="file" accept="image/*" multiple hidden onChange={addFiles} />

      {photos.length === 0 ? (
        <button className="shutter" onClick={() => cameraRef.current.click()}>
          <span className="shutter-ring"><Icon name="camera" size={44} /></span>
          <strong>Take a photo</strong>
          <span>of your {location}</span>
        </button>
      ) : (
        <div className="photos">
          {photos.map((p, i) => (
            <figure key={i} className="photo">
              <img src={p.preview} alt={`Photo ${i + 1}`} />
              <button className="photo-x" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`}><Icon name="x" size={16} /></button>
            </figure>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button className="photo photo-add" onClick={() => cameraRef.current.click()} aria-label="Add another photo"><Icon name="plus" size={28} /></button>
          )}
        </div>
      )}

      <div className="actions">
        <button className="btn" onClick={() => uploadRef.current.click()} disabled={photos.length >= MAX_PHOTOS}>
          <Icon name="upload" size={18} /> Upload from library
        </button>
        {photos.length > 0 && (
          <button className="btn btn-primary grow" onClick={scan} disabled={busy}>
            {busy ? <><span className="spinner" /> Reading your shelves…</> : <><Icon name="spark" size={18} /> Scan {photos.length} photo{photos.length === 1 ? '' : 's'}</>}
          </button>
        )}
      </div>

      <p className="fineprint">Photos are analysed and then discarded. Shelfie never stores them.</p>

      {pantry.length > 0 && (
        <button className="card card-link" onClick={() => go('cook')}>
          <span className="big-num">{pantry.length}</span>
          <span><strong>items in your pantry</strong><br />See what you can cook →</span>
        </button>
      )}
    </div>
  );
}
