/*!
 * Dantel Davetiye — Copyright (c) 2026 livvaa. Tüm hakları saklıdır.
 * 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile korunur. Yazılı izin olmadan
 * kopyalanamaz, uyarlanamaz, başka ad ya da alan adıyla yayımlanamaz.
 * Görülebilir olması kullanım izni vermez.
 * All rights reserved. No copying, adaptation or redeployment without
 * written permission. Ayrıntılar / Details: LICENSE
 */
/*
 * Gül yaprakları: verilen bölümün içinde bir kez yağar, bitince kendini
 * temizler. Bölüme bağlı olduğu için sayfa kayınca yapraklar da onunla gider.
 * Her yaprak iki katmandır: dış katman düşer ve rüzgârla kayar, iç katman
 * havada dönüp salınır.
 */
(function (global) {
  'use strict';

  // Üstten alta renk geçişi: gül, pudra, bordo
  var COLORS = [
    ['#f0b9c1', '#b5485f'],
    ['#f6d3d3', '#d0808e'],
    ['#d0667b', '#7e1f35']
  ];
  var PETAL = 'M20 38C9 31 3 22 4.5 13C6 5 13 2 20 6.5C27 2 34 5 35.5 13C37 22 31 31 20 38Z';

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function gradients() {
    return '<svg width="0" height="0" style="position:absolute"><defs>' +
      COLORS.map(function (c, i) {
        return '<linearGradient id="petal' + i + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient>';
      }).join('') + '</defs></svg>';
  }

  function petalSvg(i) {
    return '<svg viewBox="0 0 40 40"><path fill="url(#petal' + i + ')" d="' + PETAL + '"/>' +
      '<path d="M20 35Q19 21 20 9" fill="none" stroke="rgba(255,255,255,.28)" stroke-width=".8"/></svg>';
  }

  function burst(target) {
    if (!target || !target.animate) return;
    var w = target.clientWidth;
    var h = target.clientHeight;
    var count = Math.round(Math.min(56, Math.max(28, w / 12)));
    var layer = document.createElement('div');
    layer.className = 'petals';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = gradients();
    var longest = 0;

    for (var i = 0; i < count; i++) {
      var size = rand(14, 26);
      var x = rand(-0.05, 1.05) * w;
      var wind = rand(-0.25, 0.25) * w;
      var duration = rand(3800, 6000);
      var delay = rand(0, 1400);
      longest = Math.max(longest, duration + delay);

      var fall = document.createElement('div');
      fall.className = 'petal';
      fall.style.width = fall.style.height = size + 'px';
      var flutter = document.createElement('div');
      flutter.className = 'petal__flutter';
      flutter.innerHTML = petalSvg(i % COLORS.length);
      fall.appendChild(flutter);
      layer.appendChild(fall);

      fall.animate([
        { transform: 'translate(' + x + 'px,' + (-size * 2) + 'px)', opacity: 0 },
        { opacity: 1, offset: 0.08 },
        { opacity: 1, offset: 0.8 },
        { transform: 'translate(' + (x + wind) + 'px,' + (h + size) + 'px)', opacity: 0 }
      ], { duration: duration, delay: delay, easing: 'cubic-bezier(.35,.1,.55,1)', fill: 'both' });

      var turn = rand(0, 360);
      var spin = (Math.random() < 0.5 ? -1 : 1) * rand(60, 160);
      flutter.animate([
        { transform: 'translateX(0) rotate(' + turn + 'deg) rotateX(0deg) rotateY(0deg)' },
        { transform: 'translateX(' + rand(18, 40) + 'px) rotate(' + (turn + spin) + 'deg) rotateX(' + rand(120, 220) + 'deg) rotateY(' + rand(40, 120) + 'deg)' }
      ], { duration: rand(1300, 2400), delay: -rand(0, 1200), iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    }

    target.appendChild(layer);
    setTimeout(function () { layer.remove(); }, longest + 300);
  }

  global.Petals = { burst: burst };
})(window);
