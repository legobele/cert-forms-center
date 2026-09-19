/* verifyPin — server-side PIN gate for CERT Forms Center.
 *
 * Why this exists: the old gate compared a SHA-256 hash in shipped client JS,
 * so the 6-digit PIN brute-forced in ~1.7 s offline and `sessionStorage`
 * could be hand-set to "unlocked". The PIN (and its hash) now live ONLY in
 * Secret Manager; the client sends a candidate, the server rate-limits and
 * answers yes/no, and on success returns a short-lived signed JWT the app
 * keeps in sessionStorage. Unlock is no longer client-assertable.
 *
 * Modes (single endpoint, POST JSON):
 *   { "pin": "123456" }  -> 200 {ok:true, token} | 401 {ok:false} | 429 {ok:false, retryAfter}
 *   { "token": "<jwt>" }  -> 200 {ok:true} | 401 {ok:false}   (boot-time revalidation)
 *
 * Rate limiting (server-side, per IP-hash, Firestore pinAttempts/{ipHash}):
 *   5 fails / 10 min -> lockout, exponential backoff (10m, 20m, 40m ... cap 24h)
 *   hard cap 20 attempts / 24 h per IP -> locked until the day window rolls
 * Responses are padded to a fixed minimum latency; failed attempts are logged
 * (IP hash only — PIN candidates are NEVER logged).
 */
'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

const APP_PIN = defineSecret('APP_PIN'); // the 6-digit PIN, server-side only
const APP_TOKEN_SECRET = defineSecret('APP_TOKEN_SECRET'); // HS256 signing key (random 32 bytes)

const ALLOWED_ORIGIN = 'https://legobele.github.io';
const TOKEN_TTL_S = 600; // 10 min — matches the app's default auto-lock
const MIN_LATENCY_MS = 300; // pad every response: no timing oracle
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAY_ATTEMPTS = 20;

function b64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(s) {
  return Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}
function signToken(payload, secret) {
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64url(JSON.stringify(payload));
  const sig = b64url(crypto.createHmac('sha256', secret).update(h + '.' + p).digest());
  return h + '.' + p + '.' + sig;
}
function verifyToken(tok, secret) {
  const parts = String(tok || '').split('.');
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;
  const expect = b64url(crypto.createHmac('sha256', secret).update(h + '.' + p).digest());
  const a = Buffer.from(sig), b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try { payload = JSON.parse(b64urlDecode(p)); } catch (e) { return null; }
  if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) return null;
  return payload;
}
function ipHash(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = fwd || req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
  return crypto.createHash('sha256').update('cfc-pin|' + ip).digest('hex').slice(0, 32);
}

async function checkRateLimit(ref) {
  const now = Date.now();
  const snap = await ref.get();
  const state = snap.exists ? snap.data() : {};
  if (state.lockedUntil && state.lockedUntil > now) {
    return { limited: true, retryAfter: Math.ceil((state.lockedUntil - now) / 1000), state };
  }
  return { limited: false, state };
}

async function recordFail(ref, state) {
  const now = Date.now();
  let { fails = 0, windowStart = now, lockouts = 0, dayStart = now, dayCount = 0 } = state;
  if (now - windowStart > WINDOW_MS) { fails = 0; windowStart = now; }
  if (now - dayStart > DAY_MS) { dayCount = 0; dayStart = now; lockouts = 0; }
  fails += 1; dayCount += 1;
  let lockedUntil = 0;
  if (fails >= MAX_FAILS) {
    lockouts += 1;
    lockedUntil = now + Math.min(WINDOW_MS * Math.pow(2, lockouts - 1), DAY_MS);
    fails = 0; windowStart = now;
  }
  if (dayCount >= MAX_DAY_ATTEMPTS) lockedUntil = Math.max(lockedUntil, dayStart + DAY_MS);
  await ref.set({ fails, windowStart, lockouts, lockedUntil, dayStart, dayCount }, { merge: true });
  return lockedUntil;
}

exports.verifyPin = onRequest(
  { region: 'us-central1', timeoutSeconds: 30, secrets: [APP_PIN, APP_TOKEN_SECRET] },
  async (req, res) => {
    const t0 = Date.now();
    const origin = req.headers.origin;
    if (origin === ALLOWED_ORIGIN) res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      return res.status(204).send('');
    }
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });

    // Pad every response to MIN_LATENCY_MS so right/wrong are indistinguishable by timing.
    const done = (code, body) => {
      const wait = MIN_LATENCY_MS - (Date.now() - t0);
      const send = () => res.status(code).json(body);
      if (wait > 0) return setTimeout(send, wait);
      return send();
    };

    const body = req.body || {};
    const ipH = ipHash(req);
    const ref = db.collection('pinAttempts').doc(ipH);

    // --- token revalidation (boot-time): is this JWT one we signed, unexpired? ---
    if (typeof body.token === 'string' && body.token) {
      const payload = verifyToken(body.token, APP_TOKEN_SECRET.value());
      return done(payload ? 200 : 401, payload ? { ok: true } : { ok: false, error: 'bad_token' });
    }

    // --- PIN verification ---
    const pin = body.pin;
    if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
      return done(400, { ok: false, error: 'bad_pin' });
    }

    const rl = await checkRateLimit(ref);
    if (rl.limited) {
      return done(429, { ok: false, error: 'rate_limited', retryAfter: rl.retryAfter });
    }

    const secret = APP_PIN.value();
    const ok = secret.length === 6 &&
      crypto.timingSafeEqual(Buffer.from(pin), Buffer.from(secret));

    if (!ok) {
      const lockedUntil = await recordFail(ref, rl.state);
      // Log the attempt, never the candidate.
      console.log(JSON.stringify({ ev: 'pin_fail', ip: ipH, at: new Date().toISOString(), locked: lockedUntil > 0 }));
      if (lockedUntil > Date.now()) {
        return done(429, {
          ok: false, error: 'rate_limited',
          retryAfter: Math.ceil((lockedUntil - Date.now()) / 1000),
        });
      }
      return done(401, { ok: false, error: 'bad_pin' });
    }

    await ref.delete().catch(() => {});
    const nowS = Math.floor(Date.now() / 1000);
    const token = signToken(
      { iat: nowS, exp: nowS + TOKEN_TTL_S, jti: crypto.randomBytes(8).toString('hex') },
      APP_TOKEN_SECRET.value()
    );
    return done(200, { ok: true, token });
  }
);
