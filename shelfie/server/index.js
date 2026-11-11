import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { openDb } from './db.js';
import {
  hashPassword, verifyPassword, createSession, destroySession, readToken,
  setSessionCookie, clearSessionCookie, requireUser, rateLimit,
} from './auth.js';
import { scanImages, suggestRecipes, aiLive, AiError, CATEGORIES, LOCATIONS } from './ai.js';

const here = path.dirname(fileURLToPath(import.meta.url));

const text = (max) => z.string().trim().max(max);
const Signup = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: text(60).min(1),
  password: z.string().min(8).max(200),
});
const Login = z.object({ email: z.string().trim().toLowerCase(), password: z.string() });
const Profile = z.object({ name: text(60).min(1), diet: text(200), allergies: text(300) }).partial();
const PantryItem = z.object({
  name: text(80).min(1),
  category: z.enum(CATEGORIES).default('other'),
  location: z.enum(LOCATIONS).default('fridge'),
  quantity: text(40).default(''),
  brand: text(60).default(''),
  expires: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
});
const Scan = z.object({
  location: z.enum(LOCATIONS),
  images: z.array(z.object({
    mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    data: z.string().min(100).max(7_000_000),
  })).min(1).max(4),
});
const Suggest = z.object({
  meal: z.enum(['', 'breakfast', 'lunch', 'dinner', 'snack']).default(''),
  maxMinutes: z.number().int().min(5).max(240).nullable().default(null),
  craving: text(120).default(''),
});
const ShoppingItem = z.object({ name: text(80).min(1), reason: text(200).default('') });

const parse = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({ error: `${issue.path.join('.') || 'request'}: ${issue.message}` });
  }
  req.data = result.data;
  next();
};

export function createApp(db = openDb()) {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '30mb' }));

  const auth = requireUser(db);
  const authLimit = rateLimit({ windowMs: 15 * 60e3, max: 30 });
  const aiLimit = rateLimit({ windowMs: 60 * 60e3, max: 40, key: (req) => `u${req.user.id}` });
  const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, diet: u.diet, allergies: u.allergies });

  // ---- auth ----
  app.post('/api/auth/signup', authLimit, parse(Signup), (req, res) => {
    const { email, name, password } = req.data;
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    const info = db.prepare('INSERT INTO users (email, name, pass_hash) VALUES (?, ?, ?)').run(email, name, hashPassword(password));
    const token = createSession(db, Number(info.lastInsertRowid));
    setSessionCookie(res, token);
    res.status(201).json({ user: { id: Number(info.lastInsertRowid), email, name, diet: '', allergies: '' }, token, aiLive: aiLive() });
  });

  app.post('/api/auth/login', authLimit, parse(Login), (req, res) => {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(req.data.email);
    if (!row || !verifyPassword(req.data.password, row.pass_hash)) {
      return res.status(401).json({ error: 'Wrong email or password.' });
    }
    const token = createSession(db, row.id);
    setSessionCookie(res, token);
    res.json({ user: publicUser(row), token, aiLive: aiLive() });
  });

  app.post('/api/auth/logout', (req, res) => {
    destroySession(db, readToken(req));
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.get('/api/me', auth, (req, res) => res.json({ user: publicUser(req.user), aiLive: aiLive() }));

  app.patch('/api/me', auth, parse(Profile), (req, res) => {
    const next = { ...req.user, ...req.data };
    db.prepare('UPDATE users SET name = ?, diet = ?, allergies = ? WHERE id = ?').run(next.name, next.diet, next.allergies, req.user.id);
    res.json({ user: publicUser(next) });
  });

  // ---- scan ----
  // Photos are sent to the vision model and never written to disk.
  app.post('/api/scan', auth, aiLimit, parse(Scan), async (req, res) => {
    const result = await scanImages(req.data);
    res.json({
      demo: result.demo,
      unidentified: result.unidentified,
      items: result.items.map((it) => ({ ...it, location: req.data.location })),
    });
  });

  // ---- pantry ----
  const pantryOf = (userId) =>
    db.prepare('SELECT id, name, category, location, quantity, brand, expires FROM pantry_items WHERE user_id = ? ORDER BY location, category, name').all(userId);
  const insertPantry = db.prepare(
    'INSERT INTO pantry_items (user_id, name, category, location, quantity, brand, expires) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const addPantry = (userId, it) => insertPantry.run(userId, it.name, it.category, it.location, it.quantity, it.brand, it.expires);

  app.get('/api/pantry', auth, (req, res) => res.json({ items: pantryOf(req.user.id) }));

  app.post('/api/pantry', auth, parse(z.object({ items: z.array(PantryItem).min(1).max(200) })), (req, res) => {
    db.exec('BEGIN');
    try {
      for (const it of req.data.items) addPantry(req.user.id, it);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
    res.status(201).json({ items: pantryOf(req.user.id) });
  });

  app.patch('/api/pantry/:id', auth, parse(PantryItem.partial()), (req, res) => {
    const row = db.prepare('SELECT * FROM pantry_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ error: 'Item not found.' });
    const n = { ...row, ...req.data };
    db.prepare('UPDATE pantry_items SET name = ?, category = ?, location = ?, quantity = ?, brand = ?, expires = ? WHERE id = ?')
      .run(n.name, n.category, n.location, n.quantity, n.brand, n.expires, row.id);
    res.json({ items: pantryOf(req.user.id) });
  });

  app.delete('/api/pantry/:id', auth, (req, res) => {
    db.prepare('DELETE FROM pantry_items WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ items: pantryOf(req.user.id) });
  });

  // ---- suggestions ----
  app.post('/api/suggest', auth, aiLimit, parse(Suggest), async (req, res) => {
    const pantry = pantryOf(req.user.id);
    if (pantry.length === 0) {
      return res.status(400).json({ error: 'Your pantry is empty. Scan your fridge or cabinets first.' });
    }
    const result = await suggestRecipes({ pantry, user: req.user, prefs: req.data });
    db.prepare('UPDATE users SET last_suggestions = ? WHERE id = ?').run(JSON.stringify(result), req.user.id);
    res.json(result);
  });

  app.get('/api/suggest/last', auth, (req, res) => {
    const row = db.prepare('SELECT last_suggestions FROM users WHERE id = ?').get(req.user.id);
    res.json(row.last_suggestions ? JSON.parse(row.last_suggestions) : null);
  });

  // ---- saved recipes ----
  const savedOf = (userId) =>
    db.prepare('SELECT id, data FROM saved_recipes WHERE user_id = ? ORDER BY id DESC').all(userId)
      .map((r) => ({ id: r.id, ...JSON.parse(r.data) }));

  app.get('/api/recipes', auth, (req, res) => res.json({ recipes: savedOf(req.user.id) }));

  app.post('/api/recipes', auth, parse(z.object({ recipe: z.object({ title: text(120).min(1) }).passthrough() })), (req, res) => {
    const data = JSON.stringify(req.data.recipe);
    if (data.length > 20000) return res.status(400).json({ error: 'Recipe is too large to save.' });
    db.prepare('INSERT INTO saved_recipes (user_id, data) VALUES (?, ?)').run(req.user.id, data);
    res.status(201).json({ recipes: savedOf(req.user.id) });
  });

  app.delete('/api/recipes/:id', auth, (req, res) => {
    db.prepare('DELETE FROM saved_recipes WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ recipes: savedOf(req.user.id) });
  });

  // ---- shopping list ----
  const shoppingOf = (userId) =>
    db.prepare('SELECT id, name, reason, done FROM shopping_items WHERE user_id = ? ORDER BY done, id DESC').all(userId)
      .map((r) => ({ ...r, done: Boolean(r.done) }));

  app.get('/api/shopping', auth, (req, res) => res.json({ items: shoppingOf(req.user.id) }));

  app.post('/api/shopping', auth, parse(z.object({ items: z.array(ShoppingItem).min(1).max(50) })), (req, res) => {
    const existing = new Set(shoppingOf(req.user.id).filter((i) => !i.done).map((i) => i.name.toLowerCase()));
    const insert = db.prepare('INSERT INTO shopping_items (user_id, name, reason) VALUES (?, ?, ?)');
    for (const it of req.data.items) {
      if (existing.has(it.name.toLowerCase())) continue;
      existing.add(it.name.toLowerCase());
      insert.run(req.user.id, it.name, it.reason);
    }
    res.status(201).json({ items: shoppingOf(req.user.id) });
  });

  app.patch('/api/shopping/:id', auth, parse(z.object({ done: z.boolean() })), (req, res) => {
    db.prepare('UPDATE shopping_items SET done = ? WHERE id = ? AND user_id = ?').run(req.data.done ? 1 : 0, req.params.id, req.user.id);
    res.json({ items: shoppingOf(req.user.id) });
  });

  app.delete('/api/shopping/:id', auth, (req, res) => {
    db.prepare('DELETE FROM shopping_items WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ items: shoppingOf(req.user.id) });
  });

  // Bought items move from the list into the pantry in one step.
  app.post('/api/shopping/stock', auth, (req, res) => {
    const done = shoppingOf(req.user.id).filter((i) => i.done);
    db.exec('BEGIN');
    try {
      for (const it of done) {
        addPantry(req.user.id, { name: it.name, category: 'other', location: 'cabinet', quantity: '', brand: '', expires: null });
      }
      db.prepare('DELETE FROM shopping_items WHERE user_id = ? AND done = 1').run(req.user.id);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
    res.json({ items: shoppingOf(req.user.id), moved: done.length });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

  // ---- web client (production build) ----
  const dist = path.join(here, '../dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get('/{*splat}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use((err, req, res, next) => {
    if (err instanceof AiError) return res.status(err.status).json({ error: err.message });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Those photos are too large.' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed request.' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on our end.' });
  });

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 8787;
  createApp().listen(port, () => {
    console.log(`Shelfie API on http://localhost:${port} (AI: ${aiLive() ? 'live' : 'demo mode, set ANTHROPIC_API_KEY'})`);
  });
}
