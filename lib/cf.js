// Memanggil Cloudflare Workers AI (FLUX.1 schnell) melalui REST API.
const STYLES = {
  none: '',
  realistic: 'photorealistic, highly detailed, natural lighting',
  anime: 'anime style, vibrant colors, clean line art',
  watercolor: 'watercolor painting, soft brush strokes, paper texture',
  render3d: '3D render, soft studio lighting, smooth materials',
  pixel: 'pixel art, retro game style, limited color palette',
};

async function generate(prompt, style, seed) {
  const acc = process.env.CF_ACCOUNT_ID, tok = process.env.CF_API_TOKEN;
  if (!acc || !tok) throw Object.assign(new Error('Cloudflare belum dikonfigurasi di server'), { status: 500 });

  const extra = STYLES[style] || '';
  const body = { prompt: (prompt + (extra ? ', ' + extra : '')).slice(0, 2048), steps: 4 };
  if (Number.isInteger(seed) && seed > 0) body.seed = seed;

  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${acc}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  let j = null; try { j = await r.json(); } catch {}
  const b64 = j && ((j.result && j.result.image) || j.image);
  if (!r.ok || !b64) {
    const msg = (j && j.errors && j.errors[0] && j.errors[0].message) || '';
    const quota = r.status === 429 || /neuron|limit|quota/i.test(msg);
    throw Object.assign(
      new Error(quota ? 'Kuota harian AI telah habis. Cuba lagi selepas 00:00 UTC.' : 'Gagal menjana gambar'),
      { status: quota ? 429 : 502 }
    );
  }
  return Buffer.from(b64, 'base64'); // JPEG
}
module.exports = { generate, STYLES };
