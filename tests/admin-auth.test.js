'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { scryptSync, createHmac } = require('node:crypto');
const { readFileSync } = require('node:fs');
const handler = require('../api/admin-auth');
const salt = 'a'.repeat(32);
const testPassword = 'test-only-password';
const hash = `${salt}:${scryptSync(testPassword, salt, 64).toString('hex')}`;
const secret = 'test-only-session-secret-32-characters';
let server, base;
before(async () => {
  process.env.ADMIN_PASSWORD_HASH = hash;
  process.env.ADMIN_SESSION_SECRET = secret;
  process.env.NODE_ENV = 'production';
  server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));
function request(method, password, headers = {}) {
  return fetch(base, { method, headers: { Origin: base, 'X-Requested-With': 'LinkGuard', ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(method === 'POST' ? { body: JSON.stringify({ password }) } : {}) });
}
test('no session and forged legacy browser flag cannot authenticate', async () => {
  const response = await request('GET', null, { Cookie: 'sapak_admin_auth=true; link_guard_staff=forged.token' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { authenticated: false });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('wrong passwords rejected; valid login issues protected cookie', async () => {
  assert.equal((await request('POST', 'wrong-password')).status, 401);
  const response = await request('POST', testPassword);
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  const session = cookie.split(';')[0];
  assert.deepEqual(await (await request('GET', null, { Cookie: session })).json(), { authenticated: true });
  const tampered = session.replace(/.$/, session.endsWith('a') ? 'b' : 'a');
  assert.deepEqual(await (await request('GET', null, { Cookie: tampered })).json(), { authenticated: false });
  process.env.ADMIN_PASSWORD_HASH = `${salt}:${'b'.repeat(128)}`;
  assert.deepEqual(await (await request('GET', null, { Cookie: session })).json(), { authenticated: false });
  process.env.ADMIN_PASSWORD_HASH = hash;
});
test('expired sessions rejected', async () => {
  const payload = Buffer.from(JSON.stringify({ role: 'staff', exp: 1 })).toString('base64url');
  const signature = createHmac('sha256', secret).update(`${payload}.${hash}`).digest('base64url');
  const response = await request('GET', null, { Cookie: `link_guard_staff=${payload}.${signature}` });
  assert.deepEqual(await response.json(), { authenticated: false });
});
test('cross-origin login and logout rejected', async () => {
  assert.equal((await request('POST', testPassword, { Origin: 'https://other.example' })).status, 403);
  assert.equal((await request('DELETE', null, { Origin: 'https://other.example' })).status, 403);
});
test('logout clears cookie', async () => {
  const response = await request('DELETE');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
});
test('missing configuration fails closed', async () => {
  delete process.env.ADMIN_SESSION_SECRET;
  assert.equal((await request('POST', testPassword)).status, 503);
  process.env.ADMIN_SESSION_SECRET = secret;
});
test('unsupported methods and invalid JSON are rejected', async () => {
  assert.equal((await request('PUT')).status, 405);
  const response = await fetch(base, { method: 'POST', headers: { Origin: base, 'X-Requested-With': 'LinkGuard', 'Content-Type': 'application/json' }, body: '{broken' });
  assert.equal(response.status, 400);
});
test('browser source contains no password comparison or stored admin authorization', () => {
  const source = readFileSync('js/app.js', 'utf8');
  assert.doesNotMatch(source, /pass ===|sessionStorage\.setItem\('sapak_admin_auth'/);
  assert.match(source, /fetch\('\/api\/admin-auth'/);
});
test('repeated failed logins are throttled on this instance', async () => {
  let response;
  for (let i = 0; i < 11; i++) response = await request('POST', 'wrong-password');
  assert.equal(response.status, 429);
});
