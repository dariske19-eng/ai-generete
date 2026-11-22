const { create, safeEq } = require('../lib/keys');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Guna POST' });
  const pw = req.headers['x-admin-password'] || '';
  if (!process.env.ADMIN_PASSWORD || !process.env.KEY_SECRET) return res.status(500).json({ error: 'Env var belum ditetapkan' });
  if (!safeEq(pw, process.env.ADMIN_PASSWORD)) return res.status(401).json({ error: 'Kata laluan admin salah' });
  const name = String((req.body && req.body.name) || '').trim().slice(0, 60);
  if (!name) return res.status(400).json({ error: 'Nama diperlukan' });
  res.status(200).json(create(name));
};
