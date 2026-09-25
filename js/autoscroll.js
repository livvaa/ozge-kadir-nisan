/*!
 * Dantel Davetiye — Copyright (c) 2026 livvaa. Tüm hakları saklıdır.
 * 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile korunur. Yazılı izin olmadan
 * kopyalanamaz, uyarlanamaz, başka ad ya da alan adıyla yayımlanamaz.
 * Görülebilir olması kullanım izni vermez.
 * All rights reserved. No copying, adaptation or redeployment without
 * written permission. Ayrıntılar / Details: LICENSE
 */
/*
 * Otomatik kaydırma.
 * Sayfa bölüm bölüm süzülür ve her durakta bir süre bekler. Misafir dokunur,
 * kaydırır ya da forma yazarsa durur; bir süre dokunulmazsa kaldığı yerden
 * devam eder. Düğmeyle durdurulursa kendiliğinden yeniden başlamaz.
 * Alttaki "sonraki" düğmesi sıradaki durağa hızlıca geçer.
 */
(function (global) {
  'use strict';

  var FIRST_DWELL = 4500;   // açılıştan sonra ilk bölümde bekleme; gül yaprakları bu sırada yağar (ms)
  var DWELL = 4200;         // her durakta bekleme (ms)
  var IDLE_RESUME = 7000;   // son dokunuştan sonra devam etmeden önce (ms)
  var SPEED = 260;          // geçiş hızı (px/sn); süre aşağıdaki sınırlarla kırpılır
  var MIN_GLIDE = 1400;
  var MAX_GLIDE = 4200;
  var FAST_GLIDE = 650;     // "sonraki" düğmesiyle geçiş süresi (ms)
  var MIN_STEP = 0.45;      // uzun bölümde iki durak arası en az (ekran yüksekliği oranı)
  var MERGE = 0.3;          // bundan yakın duraklar birleştirilir (ekran yüksekliği oranı)
  var TOLERANCE = 3;        // bizim dışımızda bu kadar px kayma "misafir kaydırdı" demektir
  var NAV_KEYS = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];

  function ease(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function create(opts) {
    var sections = opts.sections;
    var button = opts.button;
    var nextButton = opts.nextButton;
    var fill = button.querySelector('.autoscroll__fill');

    // off | dwell | glide | idle | manual | ended
    var state = 'off';
    var raf = 0;
    var last = 0;
    var dwellLeft = 0;
    var idleLeft = 0;
    var glide = null;
    var expectedY = null;
    // Otomatik kaydırma kapalıyken "sonraki" düğmesinin kendi animasyonu
    var jump = null;
    var jumpRaf = 0;

    function isOn() {
      return state === 'dwell' || state === 'glide' || state === 'idle';
    }

    function maxScroll() {
      return document.documentElement.scrollHeight - window.innerHeight;
    }

    // iOS Safari'de innerHeight adres çubuğu açılıp kapandıkça değişir;
    // duraklar oynamasın diye sabit yerleşim yüksekliğini kullanırız
    function viewportHeight() {
      return document.documentElement.clientHeight || window.innerHeight;
    }

    // Ekrana sığan bölüm ortalanır. Sığmayan bölümde üstteki boşluğun bir
    // kısmı atlanır ki başlık görünsün; geriye kalan fazlalık yarım ekrandan
    // azsa tek durak yeterlidir (birkaç yüz piksellik "minik kayma" olmaz),
    // fazlaysa bölüm eşit ve geniş aralıklı duraklarla gezilir.
    function computeStops() {
      var vh = viewportHeight();
      var max = maxScroll();
      var raw = [max];
      sections.forEach(function (el) {
        if (el.hidden || !el.offsetHeight) return;
        var top = el.getBoundingClientRect().top + window.scrollY;
        var over = el.offsetHeight - vh;
        if (over <= 0) {
          raw.push(top + over / 2);
          return;
        }
        var start = top + Math.min(over, (parseFloat(getComputedStyle(el).paddingTop) || 0) * 0.75);
        var rest = top + over - start;
        if (rest < vh * MIN_STEP) {
          raw.push(start);
          return;
        }
        var n = Math.max(1, Math.round(rest / (vh * 0.6)));
        for (var k = 0; k <= n; k++) raw.push(start + rest * k / n);
      });
      raw = raw.map(function (y) { return Math.round(Math.max(0, Math.min(max, y))); })
        .sort(function (a, b) { return a - b; });
      // Birbirine çok yakın duraklardan sonraki kalır (son durak her zaman sayfa sonudur)
      var stops = [];
      raw.forEach(function (y) {
        if (stops.length && y - stops[stops.length - 1] < vh * MERGE) stops[stops.length - 1] = y;
        else stops.push(y);
      });
      return stops;
    }

    // Bulunulan yere çok yakın bir durak atlanır; misafir elle biraz
    // kaydırdıktan sonra devam edilirken de minik kayma olmaz
    function nextStop(fromY) {
      var y = fromY === undefined ? window.scrollY : fromY;
      var stops = computeStops();
      var gap = viewportHeight() * MERGE;
      for (var i = 0; i < stops.length; i++) {
        if (stops[i] > y + gap) return stops[i];
      }
      return null;
    }

    function glideTo(to, fixedDur) {
      cancelJump();
      var from = window.scrollY;
      var dur = fixedDur || Math.min(MAX_GLIDE, Math.max(MIN_GLIDE, Math.abs(to - from) / SPEED * 1000));
      glide = { from: from, to: to, t: 0, dur: dur };
      setState('glide');
    }

    function glideNext() {
      var to = nextStop();
      if (to === null) setState('ended');
      else glideTo(to);
    }

    function scrollTo(y) {
      window.scrollTo(0, y);
      expectedY = window.scrollY;
    }

    // Misafir forma yazıyor ya da haritayı (iframe) kullanıyor
    function userBusy() {
      var el = document.activeElement;
      return !!(el && (el.tagName === 'IFRAME' || (el.closest && el.closest('form'))));
    }

    function frame(now) {
      raf = 0;
      var dt = Math.min(100, last ? now - last : 16);
      last = now;

      // Kaydırma çubuğu, ivmeli kaydırma gibi bizim yapmadığımız hareketler
      if ((state === 'glide' || state === 'dwell') && expectedY !== null &&
          Math.abs(window.scrollY - expectedY) > TOLERANCE) {
        pauseForUser();
      }

      if (state === 'dwell') {
        dwellLeft -= dt;
        if (dwellLeft <= 0) glideNext();
      } else if (state === 'glide') {
        glide.t += dt;
        var p = Math.min(1, glide.t / glide.dur);
        scrollTo(glide.from + (glide.to - glide.from) * ease(p));
        if (p >= 1) {
          dwellLeft = DWELL;
          setState('dwell');
        }
      } else if (state === 'idle') {
        if (!userBusy()) idleLeft -= dt;
        if (idleLeft <= 0) glideNext();
      }

      if (isOn()) loop();
      else last = 0;
    }

    function loop() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function setState(s) {
      state = s;
      var on = isOn();
      button.classList.toggle('is-on', on);
      button.classList.toggle('is-waiting', s === 'idle');
      button.setAttribute('aria-pressed', String(on));
      button.setAttribute('aria-label', on ? 'Otomatik kaydırmayı durdur' : 'Otomatik kaydırmayı başlat');
      if (s !== 'glide' && s !== 'dwell') expectedY = null;
      if (on) loop();
    }

    function pauseForUser() {
      idleLeft = IDLE_RESUME;
      setState('idle');
    }

    function cancelJump() {
      if (jumpRaf) cancelAnimationFrame(jumpRaf);
      jump = null;
      jumpRaf = 0;
    }

    function jumpFrame(now) {
      var dt = Math.min(100, jump.last ? now - jump.last : 16);
      jump.last = now;
      jump.t += dt;
      var p = Math.min(1, jump.t / jump.dur);
      window.scrollTo(0, jump.from + (jump.to - jump.from) * ease(p));
      if (p < 1) jumpRaf = requestAnimationFrame(jumpFrame);
      else cancelJump();
    }

    // Sıradaki durağa hızlı geçiş. Art arda basılırsa gidilmekte olan
    // durağın bir sonrasına geçer.
    function jumpNext() {
      var from = jump ? jump.to : (state === 'glide' ? glide.to : window.scrollY);
      var to = nextStop(from);
      if (to === null) return;
      if (isOn()) {
        // Otomatik kaydırma açık: hızlı geçişten sonra orada beklemeye devam eder
        glideTo(to, FAST_GLIDE);
      } else {
        cancelJump();
        jump = { from: window.scrollY, to: to, t: 0, dur: FAST_GLIDE, last: 0 };
        jumpRaf = requestAnimationFrame(jumpFrame);
      }
    }

    function onInput(e) {
      if (e.target.closest && e.target.closest('[data-scroll-control]')) return;
      if (e.type === 'keydown' && NAV_KEYS.indexOf(e.key) === -1 && !userBusy()) return;
      cancelJump();
      if (isOn()) pauseForUser();
    }

    function onScroll() {
      var max = maxScroll();
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      fill.style.strokeDasharray = (p * 100).toFixed(2) + ' 100';
      // Sayfanın sonunda "sonraki" düğmesi kaybolur
      nextButton.classList.toggle('is-end', window.scrollY >= max - 8);
    }

    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (type) {
      window.addEventListener(type, onInput, { passive: true });
    });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Haritaya (iframe) dokunulunca olaylar bu sayfaya gelmez; odak iframe'e
    // geçtiği için pencere "blur" olur, bunu dokunuş sayarız
    window.addEventListener('blur', function () {
      setTimeout(function () {
        var el = document.activeElement;
        if (el && el.tagName === 'IFRAME' && isOn()) pauseForUser();
      }, 0);
    });

    button.addEventListener('click', function () {
      if (isOn()) {
        setState('manual');
      } else if (state === 'ended') {
        glideTo(0);
      } else {
        glideNext();
      }
    });

    nextButton.addEventListener('click', jumpNext);

    return {
      // autoplay=false ise düğmeler görünür ama kaydırma kapalı başlar
      start: function (autoplay) {
        button.hidden = false;
        nextButton.hidden = false;
        onScroll();
        if (autoplay) {
          dwellLeft = FIRST_DWELL;
          setState('dwell');
          scrollTo(window.scrollY);
        } else {
          setState('manual');
        }
      }
    };
  }

  global.AutoScroll = { create: create };
})(window);
