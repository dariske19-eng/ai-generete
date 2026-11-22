// Untuk UI laman web ini sendiri (tanpa key, dihadkan mengikut IP).
const { generate, STYLES } = require('../lib/cf');
const { hit, num } = require('../lib/limit');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Guna POST' });
  const q = req.body || {};
  const prompt = String(q.prompt || '').trim().slice(0, 500);
  if (!prompt) return res.status(400).json({ error: 'Tulis deskripsi gambar dahulu' });
  const style = Object.prototype.hasOwnProperty.call(STYLES, q.style) ? q.style : 'none';

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const a = await hit('ip:' + ip, num(process.env.SITE_IP_DAILY_LIMIT, 5));
  if (!a.ok) return res.status(429).json({ error: 'Had harian anda dicapai. Cuba lagi esok.' });
  const g = await hit('global', num(process.env.GLOBAL_DAILY_LIMIT, 40));
  if (!g.ok) return res.status(429).json({ error: 'Had harian perkhidmatan dicapai. Cuba lagi esok.' });

  try {
    const img = await generate(prompt, style, parseInt(q.seed, 10));
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(img);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
};
