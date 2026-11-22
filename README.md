# Generate Image – generate-image.drizztools.my.id

Teks-ke-gambar menggunakan Cloudflare Workers AI (FLUX.1 schnell), dipanggil dari fungsi Vercel.

## 1. Cloudflare (percuma, tanpa kad kredit)
1. Daftar di dash.cloudflare.com, kemudian buka AI > Workers AI.
2. Klik "Use REST API", kemudian "Create a Workers AI API Token". Salin token.
3. Salin Account ID (tertera pada halaman yang sama).

## 2. Upstash Redis (percuma, untuk had harian)
Daftar di upstash.com, cipta database Redis, salin REST URL dan REST Token.
Tanpa ini, tiada had harian per key/IP (kuota percuma Cloudflare akan habis lebih cepat).

## 3. Deploy ke Vercel
1. Muat naik folder ini ke GitHub, kemudian Vercel > Add New > Project (Framework: Other).
2. Environment Variables: isi semua pembolehubah dalam `.env.example`.
3. Deploy.

## 4. Domain
Vercel > Settings > Domains > tambah `generate-image.drizztools.my.id`.
DNS: CNAME, nama `generate-image`, nilai `cname.vercel-dns.com`.

## Guna
- UI: buka laman, tulis prompt, Generate (had per IP: SITE_IP_DAILY_LIMIT).
- API: tab API Key > masukkan kata laluan admin > cipta key.
  POST https://generate-image.drizztools.my.id/api/generate dengan header `Authorization: Bearer <key>`.
- Batalkan key: tambah ID key ke REVOKED_KEYS, kemudian redeploy.
