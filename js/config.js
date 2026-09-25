/*! Copyright (c) 2026 livvaa — Tüm hakları saklıdır / All rights reserved. Bkz. LICENSE */
/*
 * Davetiye bilgileri. Yeni bir davetiye için yalnızca bu dosyayı düzenleyin.
 * Boş bırakılan ("") alanlar sayfada gizlenir.
 */
window.DAVETIYE = {
  etkinlik: 'Nişan', // sayfa başlığında ve "Nişan Günü" başlığında kullanılır
  ustBaslik: 'Nişanlanıyoruz',

  // Zarfın üstündeki selamlama. Linke ?kime=Ayşe%20Hanım eklenirse bunun
  // yerine "Sayın Ayşe Hanım" yazar. Boş bırakılırsa selamlama çıkmaz.
  hitap: 'Değerli Misafirimiz',

  gelin: 'Özge',
  damat: 'Kadir',

  // Aile isimleri bu davetiyede istenmedi. Açmak için alttaki satırların ve
  // index.html'deki "Aileler" bölümünün yorum işaretlerini kaldırın.
  // gelinAilesi: 'Ayşe & Ahmet Yıldız',
  // damatAilesi: 'Zehra & Kemal Aydın',

  // ISO biçimi; sondaki +03:00 Türkiye saatidir
  tarih: '2026-10-25T17:00:00+03:00',
  saatDilimi: 'Europe/Istanbul',
  sureSaat: 4, // takvim kaydı için etkinlik süresi

  mesaj: 'Hayatımızı birleştirme yolunda attığımız ilk adımda, bu mutlu günümüzde sizleri de aramızda görmekten mutluluk duyarız.',

  mekan: {
    ad: 'Silva Davet Evi',
    adres: 'Gaziler, Mehmet Işık Cd. No: 60, 28200 Giresun Merkez / Giresun',
    // Doluysa harita ve bağlantılar adres yerine bu koordinatı kullanır
    // (iğne yanlış yere düşerse Google Haritalar'dan koordinatı alıp buraya yazın)
    konum: null, // örnek: { lat: 40.9128, lng: 38.3895 }
    // Mekân bölümünde gömülü harita gösterilsin mi
    harita: true
  },

  // Günün programı bu davetiyede istenmedi. Açmak için alttaki bloğun ve
  // index.html'deki "Program" bölümünün yorum işaretlerini kaldırın.
  // program: [
  //   { saat: '17:00', baslik: 'Karşılama' },
  //   { saat: '18:00', baslik: 'Yüzük Takma' },
  //   { saat: '19:00', baslik: 'Pasta & Eğlence' }
  // ],

  // Katılım anketi (LCV) bu davetiyede istenmedi. Açmak için alttaki bloğun ve
  // index.html'deki "LCV" bölümünün yorum işaretlerini kaldırın.
  // lcv: {
  //   sonTarih: '2026-10-18',
  //   // Yanıtların JSON olarak gönderileceği adres (Formspree, kendi API'niz vb.)
  //   adres: '',
  //   // Adres yoksa yanıt bu numaraya WhatsApp mesajı olarak hazırlanır (90 ile başlayan)
  //   whatsapp: ''
  // },

  // Sayfa açıldıktan sonra kendiliğinden aşağı kaysın mı? false ise kapalı
  // başlar, misafir sol alttaki düğmeyle başlatabilir.
  otomatikKaydirma: true,

  // Zarf açıldıktan sonra "Nişanlanıyoruz" bölümünde bir kez gül yaprağı yağsın mı
  gulYapraklari: true,

  // Misafir mühre dokununca çalan müzik (davetiye klasörüne göre yol).
  // Boşsa müzik düğmesi çıkmaz.
  muzik: 'muzik/shape-of-my-heart.mp3',

  hashtag: ''
};
