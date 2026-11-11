import { useState } from 'react';
import { api } from './api.js';

const DIETS = ['', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-free', 'Dairy-free', 'Keto', 'Halal', 'Kosher'];

export default function Profile({ session, setSession, guard, notify }) {
  const [form, setForm] = useState({ name: session.user.name, diet: session.user.diet, allergies: session.user.allergies });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    const out = await guard(() => api.patch('/me', form));
    if (!out) return;
    setSession({ ...session, user: out.user });
    notify('Preferences saved');
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    setSession(null);
  }

  return (
    <div className="stack">
      <div className="page-head">
        <h1>You</h1>
        <p>{session.user.email}</p>
      </div>
      <form className="card form" onSubmit={save}>
        <label>Name
          <input value={form.name} onChange={set('name')} required maxLength={60} />
        </label>
        <label>Diet
          <select value={form.diet} onChange={set('diet')}>
            {DIETS.map((d) => <option key={d} value={d}>{d || 'No restrictions'}</option>)}
          </select>
        </label>
        <label>Allergies
          <input value={form.allergies} onChange={set('allergies')} placeholder="e.g. peanuts, shellfish" maxLength={300} />
          <small>Dish ideas avoid these. Always double-check labels yourself.</small>
        </label>
        <button className="btn btn-primary">Save preferences</button>
      </form>
      <button className="btn" onClick={logout}>Sign out</button>
    </div>
  );
}
