'use strict';
const { createHmac, randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const deriveKey = promisify(scrypt);
const COOKIE = 'link_guard_staff';
const SESSION_SECONDS = 4 * 60 * 60;
const attempts = new Map();

function reply(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(body));
}
function sign(payload, secret, passwordHash) {
  return createHmac('sha256', secret).update(`${payload}.${passwordHash}`).digest('base64url');
}
function sessionIsValid(req, secret, passwordHash) {
  try {
    const cookie = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(`${COOKIE}=`));
    if (!cookie) return false;
    const [payload, signature, extra] = cookie.slice(COOKIE.length + 1).split('.');
    if (!payload || !signature || extra) return false;
    const expected = Buffer.from(sign(payload, secret, passwordHash));
    const supplied = Buffer.from(signature);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return session.role === 'staff' && Number.isInteger(session.exp) && session.exp > Date.now() / 1000;
  } catch { return false; }
}
function cookie(value, clear = false) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : SESSION_SECONDS}${secure}`;
}
async function readBody(req) {
  if (req.body !== undefined) {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (JSON.stringify(body).length > 4096) throw new Error('Request too large');
    return body;
  }
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 4096) throw new Error('Request too large');
  }
  return JSON.parse(body);
}
module.exports = async function handler(req, res) {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || '';
  const secret = process.env.ADMIN_SESSION_SECRET || '';
  if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash) || secret.length < 32) {
    return reply(res, 503, { error: 'Staff login is not configured.' });
  }
  if (req.method === 'GET') return reply(res, 200, { authenticated: sessionIsValid(req, secret, passwordHash) });
  if (!['POST', 'DELETE'].includes(req.method)) return reply(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET, POST, DELETE' });
  try {
    if (!req.headers.origin || new URL(req.headers.origin).host !== req.headers.host || req.headers['x-requested-with'] !== 'LinkGuard') {
      return reply(res, 403, { error: 'Request origin rejected.' });
    }
  } catch { return reply(res, 403, { error: 'Request origin rejected.' }); }
  if (req.method === 'DELETE') return reply(res, 200, { authenticated: false }, { 'Set-Cookie': cookie('', true) });
  if (!(req.headers['content-type'] || '').startsWith('application/json')) return reply(res, 415, { error: 'JSON required.' });
  // Per-instance backoff; Vercel Firewall should provide distributed rate limiting.
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const address = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const attempt = attempts.get(address) || { count: 0, until: now + 15 * 60 * 1000 };
  if (attempt.count >= 10) return reply(res, 429, { error: 'Too many attempts. Try again later.' }, { 'Retry-After': String(Math.ceil((attempt.until - now) / 1000)) });
  if (attempts.size >= 10000 && !attempts.has(address)) return reply(res, 429, { error: 'Try again later.' });
  attempt.count++;
  attempts.set(address, attempt);
  try {
    const body = await readBody(req);
    if (!body || typeof body.password !== 'string' || body.password.length > 256) return reply(res, 400, { error: 'Enter a valid password.' });
    const [salt, storedHash] = passwordHash.split(':');
    const derived = await deriveKey(body.password, salt, 64);
    if (!timingSafeEqual(derived, Buffer.from(storedHash, 'hex'))) return reply(res, 401, { error: 'Invalid administrator password.' });
    attempts.delete(address);
    const payload = Buffer.from(JSON.stringify({ role: 'staff', exp: Math.floor(now / 1000) + SESSION_SECONDS, nonce: randomBytes(16).toString('hex') })).toString('base64url');
    return reply(res, 200, { authenticated: true }, { 'Set-Cookie': cookie(`${payload}.${sign(payload, secret, passwordHash)}`) });
  } catch { return reply(res, 400, { error: 'Invalid login request.' }); }
};
