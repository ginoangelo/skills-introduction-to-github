import { useState } from 'react';
import { api } from './api.js';
import { Logo } from './ui.jsx';

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onAuthed(await api.post(`/auth/${mode}`, form));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <section className="hero">
        <div className="hero-brand"><Logo size={44} /> <span>Shelfie</span></div>
        <h1>Snap your fridge.<br /><em>Cook what you&nbsp;have.</em></h1>
        <p className="hero-sub">
          Take a photo of your fridge or cabinets. Shelfie reads the shelves and the labels, then tells you
          what you can cook tonight and the few ingredients worth buying next.
        </p>
        <ul className="hero-points">
          <li><b>1</b> Snap a shelf</li>
          <li><b>2</b> Check the list</li>
          <li><b>3</b> Get dinner</li>
        </ul>
      </section>

      <form className="card auth-card" onSubmit={submit}>
        <div className="seg" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'is-on' : ''} onClick={() => setMode('signup')}>Create account</button>
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'is-on' : ''} onClick={() => setMode('login')}>Sign in</button>
        </div>
        {mode === 'signup' && (
          <label>Your name
            <input value={form.name} onChange={set('name')} autoComplete="name" required maxLength={60} />
          </label>
        )}
        <label>Email
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={set('password')} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 8 : undefined} />
          {mode === 'signup' && <small>At least 8 characters.</small>}
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-big" disabled={busy}>
          {busy ? 'One sec…' : mode === 'signup' ? 'Start cooking' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
