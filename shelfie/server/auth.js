import crypto from 'node:crypto';

const SESSION_DAYS = 30;
const COOKIE = 'shelfie_session';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64);
  return crypto.timingSafeEqual(expected, actual);
}

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

export function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = Date.now() + SESSION_DAYS * 864e5;
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha(token), userId, expires);
  return token;
}

export function destroySession(db, token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token));
}

// Browsers use the httpOnly cookie; a native mobile client can send the same
// token as `Authorization: Bearer <token>`.
export function readToken(req) {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === COOKIE) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}${secure}`,
  );
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export function requireUser(db) {
  const find = db.prepare(
    `SELECT u.id, u.email, u.name, u.diet, u.allergies
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?`,
  );
  return (req, res, next) => {
    const token = readToken(req);
    const user = token && find.get(sha(token), Date.now());
    if (!user) return res.status(401).json({ error: 'Please sign in.' });
    req.user = user;
    next();
  };
}

// Small fixed-window limiter; enough for a single-instance deployment.
export function rateLimit({ windowMs, max, key = (req) => req.ip }) {
  const hits = new Map();
  return (req, res, next) => {
    const k = key(req);
    const now = Date.now();
    const entry = hits.get(k);
    if (!entry || entry.reset < now) {
      hits.set(k, { count: 1, reset: now + windowMs });
      if (hits.size > 10000) for (const [key2, e] of hits) if (e.reset < now) hits.delete(key2);
      return next();
    }
    if (++entry.count > max) {
      return res.status(429).json({ error: 'Too many requests. Give it a minute and try again.' });
    }
    next();
  };
}
