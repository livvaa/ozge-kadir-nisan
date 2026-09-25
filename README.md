# Dantel Davetiye

Tek sayfalık, mobil öncelikli dijital davetiye (düğün, nişan vb.). Derleme adımı ve bağımlılık yoktur; dosyalar herhangi bir statik sunucuya olduğu gibi yüklenir.

## Çalıştırma

```
python serve.py
```

Tarayıcı `http://localhost:8000` adresinde açılır. Aynı Wi-Fi'daki telefondan açmak için ekrana yazılan ikinci adresi kullanın. `index.html` dosyasını doğrudan açmak da çalışır. Yayın için klasörün tamamını alan adınızın köküne yükleyin (Cloudflare Pages, Netlify, cPanel vb.).

## Düzenleme

Bütün içerik [js/config.js](js/config.js) dosyasındadır: etkinlik türü, isimler, tarih, mekân, müzik, otomatik kaydırma. Boş bırakılan alanlar sayfada gizlenir.

## Kapalı bölümler

Şu bölümler hem [index.html](index.html) hem [js/config.js](js/config.js) içinde yorum satırına alınmıştır. Açmak için iki dosyada da ilgili bloğun yorum işaretlerini kaldırın:

- **Aileler**: gelinin ve damadın aile isimleri
- **Program**: günün akışı
- **LCV**: katılım anketi

Bölüm renkleri sırayla açık ve koyu değişir; bölüm açıp kapattıkça bu sıra kendiliğinden düzelir.

## Otomatik kaydırma

Zarf açıldıktan sonra sayfa bölüm bölüm kendiliğinden aşağı kayar ve her bölümde birkaç saniye bekler.

- Misafir dokunur ya da kaydırırsa durur; 7 saniye dokunulmazsa kaldığı yerden devam eder.
- Sol alttaki düğme kaydırmayı durdurur veya yeniden başlatır. Düğmenin çevresindeki halka, sayfanın ne kadarının geçildiğini gösterir.
- Sayfanın sonunda durur; düğmeye basılırsa başa döner.
- Alt ortadaki soluk çift ok düğmesi sıradaki bölüme hızlıca geçer. Otomatik kaydırma açıksa orada beklemeye devam eder, kapalıysa kapalı kalır. Sayfanın sonunda düğme kaybolur.

Süreler [js/autoscroll.js](js/autoscroll.js) dosyasının başındaki sabitlerle ayarlanır. `otomatikKaydirma: false` yapılırsa kaydırma kapalı başlar.

Sayfa yenilendiğinde (F5) ya da yeniden açıldığında davetiye her zaman zarftan ve sayfanın en başından başlar; tarayıcının eski kaydırma konumu kullanılmaz.

## Gül yaprakları

Zarf açılıp kaybolduktan sonra, isimlerin olduğu ilk bölümde bir kez gül yaprakları yağar ve birkaç saniye içinde kaybolur ([js/petals.js](js/petals.js)). Yapraklar bu bölüme bağlıdır; sayfa kayınca bölümle birlikte yukarı gider. Kapatmak için `gulYapraklari: false`.

## Harita

Mekân bölümünde gömülü Google Haritası gösterilir (API anahtarı gerekmez). Arama mekân adı ve adresle yapılır; iğne yanlış yere düşerse `mekan.konum` alanına koordinat yazın. Kapatmak için `mekan.harita: false`. Haritanın yüklenmesi için internet bağlantısı gerekir.

## Adres parametreleri

| Parametre | Örnek | Etkisi |
|---|---|---|
| `kime` | `?kime=Ayşe%20Hanım` | Zarfın üstünde "Sayın Ayşe Hanım" yazar (yoksa config'deki `hitap`, örn. "Değerli Misafirimiz") |
| `intro` | `?intro=0` | Zarf açılışını atlar |

## LCV yanıtları (bölüm açılırsa)

- `lcv.adres` doluysa yanıt bu adrese JSON olarak `POST` edilir (Formspree veya kendi API'niz).
- Adres boş, `lcv.whatsapp` doluysa yanıt WhatsApp mesajı olarak hazırlanır.
- İkisi de boşsa yanıt yalnızca misafirin tarayıcısında saklanır; size ulaşmaz.

## Görseller

Dantel, zarf, mühür, şeritler ve kâğıt dokusu [js/lace.js](js/lace.js) içinde SVG olarak kodla üretilir. Açılış videosunun yerini CSS ile yapılan zarf animasyonu alır; bu sayede dosya boyutu küçük kalır, görüntü her ekranda keskin olur ve isimler otomatik olarak işlenir. Renkler [css/style.css](css/style.css) başındaki değişkenlerden değiştirilebilir.

## Müzik

`muzik` alanındaki dosya ([muzik/](muzik/) klasörü), misafir mühre dokunduğunda başlar. Sağ alttaki düğmeyle durdurulup yeniden çalınabilir. Telefon kilitlenince ya da başka uygulamaya/sekmeye geçilince durur, geri dönülünce kaldığı yerden devam eder.

## Karanlık mod

Site hiçbir zaman karanlık moda girmez: telefon, WhatsApp ya da Instagram karanlık modda olsa da açık renkli görünür (`color-scheme: only light` + Samsung Internet için ek önlem, bkz. [css/style.css](css/style.css) başı).

## Sosyal medya önizlemesi ve arama motorları

- Link WhatsApp, Instagram, Facebook, X veya Telegram'da paylaşılınca başlık, açıklama ve [og-image.jpg](og-image.jpg) görseli önizleme olarak çıkar.
- [index.html](index.html) içindeki `og:url` ve `og:image` tam adres olmak zorundadır; şu an GitHub Pages adresine (`https://livvaa.github.io/ozge-kadir-nisan/`) ayarlıdır. Site başka bir alan adına taşınırsa bu iki satırı güncelleyin.
- Önizleme botları JavaScript çalıştırmadığı için başlık/açıklama index.html'de elle yazılıdır; davetiye bilgileri değişirse bu satırları ve og-image.jpg'yi de güncelleyin.
- Site arama motoru sonuçlarında çıkmaz: index.html'deki `noindex` etiketi ve [_headers](_headers) dosyası (Cloudflare Pages / Netlify) bunu sağlar. [robots.txt](robots.txt) bilerek herkese okuma izni verir; arama motorları engellenirse `noindex` etiketini göremez ve link yine de sonuçlarda çıkabilir.
