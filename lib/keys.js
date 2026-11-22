const crypto = require('crypto');
const b64 = (s) => Buffer.from(s).toString('base64url');
const sig = (p) => crypto.createHmac('sha256', process.env.KEY_SECRET || '').update(p).digest('base64url').slice(0, 32);

function safeEq(a, b) {
  const h = (x) => crypto.createHash('sha256').update(String(x)).digest();
  return crypto.timingSafeEqual(h(a), h(b));
}
function create(name) {
  const id = crypto.randomBytes(6).toString('hex');
  const p = b64(JSON.stringify({ n: name, id, t: Date.now() }));
  return { id, key: 'pf_' + p + '.' + sig(p) };
}
function verify(key) {
  if (!process.env.KEY_SECRET || typeof key !== 'string' || !key.startsWith('pf_')) return null;
  const [p, s] = key.slice(3).split('.');
  if (!p || !s) return null;
  const A = Buffer.from(s), B = Buffer.from(sig(p));
  if (A.length !== B.length || !crypto.timingSafeEqual(A, B)) return null;
  let m; try { m = JSON.parse(Buffer.from(p, 'base64url').toString()); } catch { return null; }
  const revoked = (process.env.REVOKED_KEYS || '').split(',').map((x) => x.trim());
  return revoked.includes(m.id) ? null : m;
}
module.exports = { create, verify, safeEq };
