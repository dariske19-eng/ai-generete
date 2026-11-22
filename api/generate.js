// API untuk laman web luar (perlukan API key).
const { verify } = require('../lib/keys');
const { generate, STYLES } = require('../lib/cf');
const { hit, num } = require('../lib/limit');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-API-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = req.headers.authorization || '';
  const key = auth.startsWith('Bearer ') ? auth.slice(7) : req.headers['x-api-key'];
  const meta = verify(key);
  if (!meta) return res.status(401).json({ error: 'API key tidak sah atau telah dibatalkan' });

  const q = req.method === 'POST' ? req.body || {} : req.query || {};
  const prompt = String(q.prompt || '').trim().slice(0, 500);
  if (!prompt) return res.status(400).json({ error: 'prompt diperlukan' });
  const style = Object.prototype.hasOwnProperty.call(STYLES, q.style) ? q.style : 'none';

  const k = await hit('key:' + meta.id, num(process.env.DAILY_LIMIT_PER_KEY, 20));
  if (!k.ok) return res.status(429).json({ error: 'Had harian untuk key ini telah dicapai' });
  const g = await hit('global', num(process.env.GLOBAL_DAILY_LIMIT, 40));
  if (!g.ok) return res.status(429).json({ error: 'Had harian perkhidmatan telah dicapai' });

  try {
    const img = await generate(prompt, style, parseInt(q.seed, 10));
    if (q.format === 'base64') return res.status(200).json({ mime: 'image/jpeg', image_base64: img.toString('base64') });
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).send(img);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
};
