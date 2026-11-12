# oy-ui — Okulum Yeryüzü web sitesi

okulumyeryuzu.com'un genel web sitesi. Next.js 16 (App Router, Server Components), Tailwind CSS v4.
API sözleşmesi: `../docs/API.md`.

## Çalıştırma

```bash
npm install
cp .env.example .env.local   # değerleri düzenleyin
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
npm run lint
```

Sitede örnek (fallback) içerik **yoktur**; her zaman API'deki gerçek içerik gösterilir. Sayfalar ISR ile önbelleğe
alınır (1 saat, panelden yayınlanınca anında yenilenir). API yavaşlarsa ya da çökerse Next son başarılı sayfayı
göstermeye devam eder; yalnızca hiç başarıyla oluşturulmamış bir sayfa "Sayfa şu an yüklenemedi" ekranını gösterir.
`npm run build` sayfaları canlı API'den üretir, bu yüzden build sırasında API erişilebilir olmalıdır
(Docker build'de `API_URL` build argümanı, varsayılan `https://service.okulumyeryuzu.com`).

## Ortam değişkenleri

| Değişken | Açıklama | Varsayılan |
|---|---|---|
| `API_URL` | oy-service adresi (yalnızca sunucu tarafı) | `http://localhost:8080` |
| `REVALIDATE_SECRET` | Revalidation webhook'u için ortak anahtar | — (boşsa webhook 401 döner) |
| `SITE_URL` | Canonical, sitemap ve OpenGraph adresleri | `https://okulumyeryuzu.com` |
| `NEXT_PUBLIC_MEDIA_HOST` | Ek görsel host'ları, virgülle ayrılmış (build sırasında okunur) | — |
| `PANEL_ORIGINS` | `/onizleme` önizlemesini iframe içinde açabilen panel adresleri, virgülle ayrılmış. `frame-ancestors` başlığı (`proxy.ts`) ve postMessage kontrolü çalışma anında okunur | `http://localhost:3001,http://localhost:5173` |

`localhost:8080` ve `service.okulumyeryuzu.com` görsel host'ları her zaman izinlidir.

## Önbellek ve revalidation

- Tüm GET istekleri `lib/api.ts` üzerinden yapılır ve `next: { tags, revalidate: 3600 }` ile önbelleğe alınır.
  Etiketler: `page:{slug}`, `programs`, `themes`, `team`.
- API'ye ulaşılamazsa sayfa örnek içerikle üretilir ve 60 saniye sonra yeniden denenir
  (ör. Docker build'den sonra gerçek içerik ilk dakika içinde gelir).
- İçerik değiştiğinde oy-service şu isteği gönderir; ilgili etiketler anında geçersiz kılınır:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tags":["page:contact","programs"]}'
# → {"revalidated":true,...}   hatalı anahtar → 401
```

## Formlar

Ön kayıt (`POST /api/public/enrollments`) ve iletişim (`POST /api/public/contact`) formları
Server Action ile sunucudan gönderilir; `API_URL` tarayıcıya hiç açılmaz. Gizli bir honeypot alanı
basit bot korumasıdır.

## Docker

```bash
docker build -t oy-ui --build-arg SITE_URL=https://okulumyeryuzu.com .
docker run -p 3000:3000 \
  -e API_URL=http://oy-service:8080 \
  -e REVALIDATE_SECRET=... \
  -e SITE_URL=https://okulumyeryuzu.com \
  oy-ui
```

## Görsel düzenleyici

Sözleşme: `../docs/VISUAL_EDITOR.md`.

- Blok stilleri (`style`) ve header/footer stilleri `lib/style.ts` ile CSS değişkenlerine + birkaç sınıfa çevrilir;
  bu değişkenleri kullanan kurallar `app/globals.css` içindeki "Style system" bölümündedir. Token değerleri yalnızca `lib/style.ts` içindedir.
- `/onizleme/{token}` (`app/onizleme/[token]`): panelin kaydedilmemiş halini her istekte (önbelleksiz) gerçek bileşenlerle çizer;
  `components/PreviewBridge.tsx` panel ile postMessage üzerinden konuşur (seçim, satır içi düzenleme, sürükle-bırak).
  Düzenleme öznitelikleri (`data-edit-*`, `data-block-id`) yalnızca önizlemede eklenir.

## Yapı

- `app/` — `(site)/` altında genel sayfalar (header/footer bu grubun layout'unda), `onizleme/` düzenleyici önizlemesi, `sitemap.ts`, `robots.ts`, `api/revalidate`
- `components/` — küçük arayüz bileşenleri (istemci bileşenleri: `MobileNav`, `NavLinks`, formlar, program filtre/slider, `PreviewBridge`)
- `lib/` — `api.ts` (veri), `types.ts` (sözleşme tipleri), `format.ts` (tr-TR biçimlendirme), `actions.ts` (Server Actions), `style.ts` (blok stilleri), `edit.ts` (önizleme düzenleme öznitelikleri), `panel.ts` (`PANEL_ORIGINS`)
- Renk ve yazı tipi token'ları: `app/globals.css` içindeki `@theme`
