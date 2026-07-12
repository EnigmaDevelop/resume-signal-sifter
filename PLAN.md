# Signal Sifter (resume-signal-sifter) — İnteraktif AI Destekli Özgeçmiş

> **Not:** Bu belge projenin ilk kuruluş planıdır ve tarihsel kayıt olarak
> saklanmaktadır. Güncel ürün çerçevesi (iki modlu yapı, mülakat provası,
> güven/metodoloji yüzeyi) için README.md'ye bakın.

## Context

Önceden tanımlı cevapların ötesine geçen bir interaktif özgeçmiş. İki mod: **statik mod** (bucket'lı, %100 kullanıcı kontrollü, deterministik cevaplar) ve **AI modu** (kişinin CV verisiyle temellendirilen gerçek LLM sohbeti). Çift amaç: (1) kullanıcının kendi profesyonel interaktif CV'si, (2) GitHub'da yıldız toplayacak, herkesin fork'layıp JSON doldurarak kullanabileceği açık kaynak şablon (buy-me-a-coffee modeli).

Maliyet hedefi: **0 TL** — GitHub Pages (hosting) + Cloudflare Workers free tier (API proxy) + Groq free tier (LLM, Llama 3.3 70B; alternatif Gemini free tier).

Onaylanan kararlar: Vanilla JS + Vite · çift dilli TR/EN · statik + AI modu v1'de birlikte · proje adı `resume-signal-sifter` (marka adı: **Signal Sifter**) · konum `C:\projects\resume-signal-sifter`.

## Mimari

```
C:\projects\resume-signal-sifter/
├── index.html
├── package.json / vite.config.js
├── src/
│   ├── main.js          # başlatma, mod ve dil yönetimi
│   ├── chat.js          # sohbet motoru: mesaj render, yazıyor... efekti, geçmiş
│   ├── staticMode.js    # bucket navigasyonu (Ana Menü → kategori → soru → cevap)
│   ├── aiMode.js        # Worker'a streaming fetch; hata halinde statik moda düşer
│   ├── i18n.js          # UI metinleri TR/EN + dil değiştirici
│   └── styles.css       # mobile-first sohbet arayüzü, koyu/açık tema
├── content/
│   ├── config.json      # site ayarları, aiMode: {enabled, endpoint}, tema, avatar
│   ├── tr/resume.json   # yapılandırılmış CV: profil, deneyim, projeler, eğitim, yetenekler
│   ├── tr/buckets.json  # statik mod soru/cevap ağacı (kategoriler + cevaplar)
│   ├── tr/story.json    # opsiyonel: AI modu için anlatı verisi (motivasyon, liderlik tarzı, STAR hikayeler)
│   └── en/…             # aynı şema İngilizce
├── worker/
│   ├── src/index.js     # Cloudflare Worker: Groq proxy + system prompt (resume+story) + guardrail
│   └── wrangler.toml
├── .github/workflows/deploy.yml   # GitHub Pages otomatik deploy
├── STORY_GUIDE.md        # story.json'ı doldururken kullanılacak yönerge (STAR yöntemi, liderlik stili testi)
└── README.md            # EN; fork → JSON doldur → deploy rehberi; TR özet bölümü
```

### Kritik tasarım kararları

- **RAG'e gerek yok:** Bir kişinin CV'si LLM context'ine tamamen sığar. Worker, `resume.json`'ı system prompt'a gömer — vector DB, embedding, ek altyapı sıfır.
- **Guardrail'ler (Worker tarafında, system prompt + kural):** sadece CV içeriğinden konuş; bilinmeyen soruya "bu CV'mde yok" de; siyaset/din/para/maaş gibi iş dışı konuları kibarca reddet; cevap dili UI diliyle aynı.
- **Zarif düşüş:** `config.json`'da `aiMode.enabled=false` ise veya Worker erişilemezse site tamamen statik modda çalışır — Worker deploy etmeyen şablon kullanıcısı yine tam işlevsel site alır.
- **Worker güvenliği:** API anahtarı Worker secret'ında; CORS sadece site origin'ine açık; basit rate limit (IP başına dakikalık sınır) free tier'ı korur.
- **İçerik:** v1 placeholder bir demo persona ile kurulur (şablon değeri için de gerekli). Kullanıcının gerçek CV içeriği sonradan JSON'lara işlenir.

## Uygulama Adımları

1. **İskelet:** Vite vanilla projesi, sohbet arayüzü (avatar, "çevrimiçi" durumu, mesaj balonları, yazıyor efekti, mobile-first, koyu/açık tema).
2. **İçerik şeması:** `resume.json` + `buckets.json` şemaları ve TR/EN placeholder içerik; şema README'de belgelenir.
3. **Statik mod:** kategori bucket'ları → soru seçimi → JSON'dan cevap render (metin, liste, link, proje kartı destekli).
4. **i18n:** dil değiştirici, UI metinleri, içerik dosyası seçimi; dil tercihi localStorage'da.
5. **AI modu (istemci):** mod anahtarı (Statik ⇄ AI), serbest metin girişi, Worker'a streaming istek, hata/timeout'ta statik moda düşüş ve bilgilendirme.
6. **Cloudflare Worker:** Groq chat completions proxy'si, system prompt üretimi (resume.json'dan), guardrail kuralları, CORS, rate limit, `wrangler.toml` + deploy talimatı.
7. **Hikaye/Story modülü (AI modu zenginleştirme):** `story.json` (motivasyon, değerler, STAR formatında davranışsal hikayeler, AI moduna giriş konu listesi, `selfAssessments[]` — Takım Rolü/Belbin, Çatışma Tarzı/Thomas-Kilmann, Motivasyon Kaynağı/SDT, Kişilik Anlık Görüntüsü/TIPI, Liderlik Tarzı/Goleman'dan adayın deneyimine uyanları seçip ekleyebildiği bir menü, hiçbiri zorunlu değil) + `STORY_GUIDE.md` (her enstrüman için deterministik öz-değerlendirme testi + STAR yöntemi rehberi); Worker'ın system prompt'una entegre edilir, sadece AI modunu etkiler, tamamen opsiyonel.
8. **Deploy + README:** GitHub Actions ile Pages deploy; README (fork-doldur-yayınla rehberi, Worker kurulumu opsiyonel adım, buy-me-a-coffee bölümü).

## Kapsam dışı (v1 sonrası)

- Link-tabanlı "kendi yolunu seç" PDF sürümü (bonus faz)
- Analytics, çoklu tema galerisi, ses/avatar animasyonu
- B2B mülakat ajanı yönü (bilinçli olarak rafa kalktı)

## Doğrulama

- `npm run dev` → her iki dilde statik mod akışları elle gezilir (menü → kategori → cevap → geri).
- `wrangler dev` ile Worker lokalde çalıştırılır (Groq API anahtarı gerekir — ücretsiz hesap; anahtar yoksa AI modu mock yanıtla test edilir), AI modunda CV içi/dışı ve yasaklı konu soruları denenir.
- `npm run build && npm run preview` → üretim derlemesi ve GitHub Pages base path kontrolü.
- Worker erişilemezken AI modunun statik moda düştüğü doğrulanır.
