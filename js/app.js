/*! Copyright (c) 2026 livvaa — Tüm hakları saklıdır / All rights reserved. Bkz. LICENSE */
(function () {
  'use strict';

  // Davetiye her açılışta zarftan ve sayfanın en başından başlar:
  // yenilemede (F5) tarayıcı eski kaydırma konumunu geri getirmesin,
  // geri tuşuyla önbellekten dönülürse de sayfa baştan yüklensin.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) location.reload();
  });

  // İki parmakla yakınlaştırma kapalı. iOS Safari viewport ayarını yok
  // saydığı için hareketi burada da durdururuz.
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (type) {
    document.addEventListener(type, function (e) { e.preventDefault(); }, { passive: false });
  });
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  var C = window.DAVETIYE;
  var Lace = window.Lace;
  var TZ = C.saatDilimi || 'Europe/Istanbul';
  var date = new Date(C.tarih);
  var params = new URLSearchParams(location.search);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var storeKey = 'davetiye-lcv-' + (C.gelin + '-' + C.damat).toLocaleLowerCase('tr-TR');

  function $(sel) {
    return document.querySelector(sel);
  }

  function $$(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  function fmt(d, opts) {
    return new Intl.DateTimeFormat('tr-TR', Object.assign({ timeZone: TZ }, opts)).format(d);
  }

  function firstLetter(s) {
    return String(s).trim().charAt(0).toLocaleUpperCase('tr-TR');
  }

  function store(value) {
    try {
      if (value === null) localStorage.removeItem(storeKey);
      else localStorage.setItem(storeKey, JSON.stringify(value));
    } catch (e) { /* gizli sekme vb. */ }
  }

  function restore() {
    try {
      return JSON.parse(localStorage.getItem(storeKey) || 'null');
    } catch (e) {
      return null;
    }
  }

  /* ---------- İçerik ---------- */

  function fillContent() {
    var dueDate = C.lcv && C.lcv.sonTarih ? new Date(C.lcv.sonTarih + 'T12:00:00') : null;
    var values = {
      gelin: C.gelin,
      damat: C.damat,
      gelinHarf: firstLetter(C.gelin),
      damatHarf: firstLetter(C.damat),
      ustBaslik: C.ustBaslik,
      gunBasligi: (C.etkinlik || 'Düğün') + ' Günü',
      gelinAilesi: C.gelinAilesi,
      damatAilesi: C.damatAilesi,
      tarihUzun: fmt(date, { day: 'numeric', month: 'long', year: 'numeric' }),
      tarihNoktali: [fmt(date, { day: '2-digit' }), fmt(date, { month: '2-digit' }), fmt(date, { year: 'numeric' })].join(' · '),
      gunAdi: fmt(date, { weekday: 'long' }),
      gunNo: fmt(date, { day: 'numeric' }),
      ayYil: fmt(date, { month: 'long', year: 'numeric' }),
      saat: 'Saat ' + fmt(date, { hour: '2-digit', minute: '2-digit' }),
      mesaj: C.mesaj,
      mekanAdi: C.mekan.ad,
      mekanAdres: C.mekan.adres,
      hashtag: C.hashtag,
      lcvNot: dueDate
        ? 'Lütfen ' + fmt(dueDate, { day: 'numeric', month: 'long' }) + ' tarihine kadar bildiriniz.'
        : 'Katılım durumunuzu bildirmeniz bizi çok mutlu eder.'
    };

    $$('[data-bind]').forEach(function (el) {
      var v = values[el.dataset.bind];
      if (v) el.textContent = v;
      else el.hidden = true;
    });

    var families = $('.families');
    if (families && !C.gelinAilesi && !C.damatAilesi) families.hidden = true;
    document.title = C.gelin + ' & ' + C.damat + ' · ' + (C.etkinlik || 'Düğün') + ' Davetiyesi';

    // Linkte ?kime= varsa kişiye özel, yoksa genel selamlama
    var to = params.get('kime');
    var greeting = to ? 'Sayın ' + to : C.hitap;
    if (greeting) {
      $('#introTo').textContent = greeting;
      $('#introTo').hidden = false;
    }
  }

  function drawLace() {
    $$('[data-lace]').forEach(function (el) {
      var kind = el.dataset.lace;
      if (kind === 'doily') el.innerHTML = Lace.doily();
      else if (kind === 'doily-plain') el.innerHTML = Lace.doily({ plainCenter: true });
      else if (kind === 'doily-wide') el.innerHTML = Lace.doily({ plainCenter: true, scallops: 40, petals: 20 });
      else if (kind === 'flap') el.innerHTML = Lace.flap();
      else if (kind === 'seal') el.innerHTML = Lace.seal();
      else if (kind === 'divider') el.innerHTML = Lace.divider();
    });
    var root = document.documentElement.style;
    root.setProperty('--trim', 'url("' + Lace.trim('#fffdf9', '#d5c3aa') + '")');
    root.setProperty('--grain', 'url("' + Lace.grain() + '")');
  }

  // Bölüm index.html'de yorum satırındaysa hiçbir şey yapmaz
  function buildProgram() {
    var section = $('#program');
    if (!section) return;
    var list = C.program || [];
    if (!list.length) {
      section.hidden = true;
      return;
    }
    var ol = $('#timeline');
    list.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'reveal';
      var time = document.createElement('time');
      time.textContent = item.saat;
      var title = document.createElement('h3');
      title.textContent = item.baslik;
      li.appendChild(time);
      li.appendChild(title);
      if (item.not) {
        var note = document.createElement('p');
        note.textContent = item.not;
        li.appendChild(note);
      }
      ol.appendChild(li);
    });
  }

  /* ---------- Geri sayım ---------- */

  function startCountdown() {
    var cells = {};
    $$('[data-cd]').forEach(function (el) { cells[el.dataset.cd] = el; });
    var timer;

    function tick() {
      var diff = date.getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(timer);
        $('#countdown').hidden = true;
        $('#countdownDone').hidden = false;
        return;
      }
      var s = Math.floor(diff / 1000);
      cells.d.textContent = Math.floor(s / 86400);
      cells.h.textContent = String(Math.floor(s % 86400 / 3600)).padStart(2, '0');
      cells.m.textContent = String(Math.floor(s % 3600 / 60)).padStart(2, '0');
      cells.s.textContent = String(s % 60).padStart(2, '0');
    }

    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Takvim & harita ---------- */

  function downloadIcs() {
    var end = new Date(date.getTime() + (C.sureSaat || 5) * 3600e3);
    function stamp(d) {
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }
    function esc(s) {
      return String(s || '').replace(/[\\,;]/g, function (m) { return '\\' + m; }).replace(/\n/g, '\\n');
    }
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Davetiye//TR', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + stamp(date) + '-' + encodeURIComponent(storeKey) + '@davetiye',
      'DTSTAMP:' + stamp(new Date()),
      'DTSTART:' + stamp(date),
      'DTEND:' + stamp(end),
      'SUMMARY:' + esc((C.etkinlik || 'Düğün') + ': ' + C.gelin + ' & ' + C.damat),
      'LOCATION:' + esc(C.mekan.ad + ', ' + C.mekan.adres),
      'DESCRIPTION:' + esc(C.mesaj),
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'davetiye.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function setupMap() {
    var m = C.mekan;
    var q = m.konum ? m.konum.lat + ',' + m.konum.lng : m.ad + ', ' + m.adres;
    $('#dirBtn').href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q);
    $('#mapBtn').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);

    if (m.harita === false) return;
    $('.venue').classList.add('venue--map');
    $('#venueMap').hidden = false;
    // Anahtarsız Google Haritalar yerleştirmesi; loading="lazy" sayesinde
    // bölüme yaklaşılınca yüklenir
    $('#mapFrame').src = 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&hl=tr&z=16&output=embed';
  }

  /* ---------- LCV ---------- */

  // Bölüm index.html'de yorum satırındaysa hiçbir şey yapmaz
  function setupRsvp() {
    var form = $('#rsvpForm');
    if (!form) return;
    var thanks = $('#rsvpThanks');
    var error = $('#formError');
    var submit = $('#rsvpSubmit');
    var countField = $('#countField');

    function showError(msg) {
      error.textContent = msg;
      error.hidden = !msg;
    }

    function showThanks(data) {
      var coming = data.katilim === 'evet';
      $('#thanksTitle').textContent = coming ? 'Teşekkürler, ' + data.ad + '!' : 'Yanıtınız için teşekkürler';
      $('#thanksText').textContent = coming
        ? data.kisi + ' kişilik katılımınızı not ettik. Sizi görmek için sabırsızlanıyoruz.'
        : 'Aramızda olamayacağınız için üzgünüz; güzel dilekleriniz bizimle.';
      form.hidden = true;
      thanks.hidden = false;
    }

    form.addEventListener('change', function (e) {
      if (e.target.name === 'katilim') countField.hidden = e.target.value === 'hayir';
      showError('');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var data = {
        ad: String(fd.get('ad') || '').trim(),
        katilim: fd.get('katilim'),
        kisi: fd.get('katilim') === 'evet' ? fd.get('kisi') : '0',
        not: String(fd.get('not') || '').trim()
      };
      if (!data.ad) return showError('Lütfen adınızı yazın.');
      if (!data.katilim) return showError('Lütfen katılım durumunuzu seçin.');

      function done() {
        store(data);
        showThanks(data);
        thanks.focus();
      }

      var lcv = C.lcv || {};
      if (lcv.adres) {
        submit.disabled = true;
        submit.textContent = 'Gönderiliyor…';
        fetch(lcv.adres, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.assign({ davetiye: C.gelin + ' & ' + C.damat }, data))
        }).then(function (res) {
          if (!res.ok) throw new Error(res.status);
          done();
        }).catch(function () {
          showError('Yanıtınız gönderilemedi. Lütfen tekrar deneyin.');
        }).finally(function () {
          submit.disabled = false;
          submit.textContent = 'Gönder';
        });
        return;
      }

      if (lcv.whatsapp) {
        var text = data.katilim === 'evet'
          ? 'Merhaba, ben ' + data.ad + '. Düğününüze ' + data.kisi + ' kişi olarak katılıyorum.'
          : 'Merhaba, ben ' + data.ad + '. Maalesef düğününüze katılamıyorum.';
        if (data.not) text += '\n' + data.not;
        window.open('https://wa.me/' + String(lcv.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      }
      done();
    });

    $('#rsvpEdit').addEventListener('click', function () {
      store(null);
      thanks.hidden = true;
      form.hidden = false;
      form.elements.ad.focus();
    });

    var saved = restore();
    if (saved) showThanks(saved);
  }

  /* ---------- Müzik ---------- */

  var audio = $('#audio');
  var musicBtn = $('#musicBtn');

  function setPlaying(on) {
    musicBtn.classList.toggle('is-playing', on);
    musicBtn.setAttribute('aria-pressed', String(on));
    musicBtn.setAttribute('aria-label', on ? 'Müziği durdur' : 'Müziği çal');
  }

  function startMusic() {
    if (!C.muzik) return;
    audio.src = C.muzik;
    audio.volume = 0.6;
    musicBtn.hidden = false;
    audio.play().then(function () { setPlaying(true); }, function () { setPlaying(false); });
  }

  musicBtn.addEventListener('click', function () {
    if (audio.paused) audio.play().then(function () { setPlaying(true); }, function () {});
    else {
      audio.pause();
      setPlaying(false);
    }
  });

  // Telefon kilitlenince, başka uygulamaya ya da sekmeye geçilince müzik durur;
  // misafir geri dönünce, önceden çalıyorsa kaldığı yerden devam eder.
  var resumeOnReturn = false;
  function pauseInBackground() {
    if (audio.paused) return;
    resumeOnReturn = true;
    audio.pause();
    setPlaying(false);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      pauseInBackground();
    } else if (resumeOnReturn) {
      resumeOnReturn = false;
      audio.play().then(function () { setPlaying(true); }, function () {});
    }
  });
  window.addEventListener('pagehide', pauseInBackground);

  /* ---------- Açılış & görünme ---------- */

  function setupReveal() {
    var items = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  var autoScroll = window.AutoScroll.create({
    sections: $$('.hero, .section, .closing'),
    button: $('#autoBtn'),
    nextButton: $('#nextBtn')
  });

  function showPage() {
    window.scrollTo(0, 0);
    document.body.classList.remove('is-locked');
    setupReveal();
    autoScroll.start(C.otomatikKaydirma !== false && !reduceMotion);
  }

  function setupIntro() {
    var intro = $('#intro');
    if (params.get('intro') === '0') {
      intro.remove();
      showPage();
      return;
    }

    function open() {
      if (intro.classList.contains('is-opening')) return;
      intro.classList.add('is-opening');
      startMusic();
      setTimeout(function () {
        intro.classList.add('is-leaving');
        showPage();
        // Zarf kaybolurken isimlerin olduğu ilk bölüme yapraklar yağar
        if (C.gulYapraklari !== false && !reduceMotion) window.Petals.burst($('.hero'));
        $('#names').focus({ preventScroll: true });
        setTimeout(function () { intro.remove(); }, reduceMotion ? 200 : 1000);
      }, reduceMotion ? 0 : 3000);
    }

    $('#seal').addEventListener('click', open);
    $('#env').addEventListener('click', open);
  }

  drawLace();
  fillContent();
  buildProgram();
  setupMap();
  setupRsvp();
  startCountdown();
  $('#addCal').addEventListener('click', downloadIcs);
  setupIntro();
})();
