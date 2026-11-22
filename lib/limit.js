// Had harian menggunakan Upstash Redis (REST). Jika tidak dikonfigurasi, had dilangkau.
async function hit(scope, limit) {
  const url = process.env.UPSTASH_REDIS_REST_URL, tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok || !limit) return { ok: true, count: 0 };
  const key = `rl:${scope}:${new Date().toISOString().slice(0, 10)}`;
  try {
    const r = await fetch(url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, 172800]]),
    });
    const j = await r.json();
    const count = j[0].result;
    return { ok: count <= limit, count };
  } catch {
    return { ok: true, count: 0 };
  }
}
const num = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : d; };
module.exports = { hit, num };
