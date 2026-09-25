/*!
 * Dantel Davetiye — Copyright (c) 2026 livvaa. Tüm hakları saklıdır.
 * 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile korunur. Yazılı izin olmadan
 * kopyalanamaz, uyarlanamaz, başka ad ya da alan adıyla yayımlanamaz.
 * Görülebilir olması kullanım izni vermez.
 * All rights reserved. No copying, adaptation or redeployment without
 * written permission. Ayrıntılar / Details: LICENSE
 */
/*
 * Dantel süsleri.
 * Sayfadaki tüm dantel, zarf kapağı, mühür ve kâğıt dokusu burada SVG olarak
 * üretilir; hiçbir görsel dosyaya ihtiyaç yoktur. Delikler "evenodd" dolgu
 * kuralıyla açılır: iç içe geçen her alt yol, bir öncekinin dolgusunu tersine
 * çevirir.
 */
(function (global) {
  'use strict';

  var TAU = Math.PI * 2;
  var TOP = -Math.PI / 2;

  function n2(n) {
    return Math.round(n * 100) / 100;
  }

  function pt(r, a) {
    return n2(r * Math.cos(a)) + ' ' + n2(r * Math.sin(a));
  }

  function circle(cx, cy, r) {
    return 'M' + n2(cx - r) + ' ' + n2(cy) +
      'a' + r + ' ' + r + ' 0 1 0 ' + n2(2 * r) + ' 0' +
      'a' + r + ' ' + r + ' 0 1 0 ' + n2(-2 * r) + ' 0Z';
  }

  function polarCircle(r, a, size) {
    return circle(r * Math.cos(a), r * Math.sin(a), size);
  }

  // Dış kenarı fistolu (yarım ay tırtıklı) daire
  function scallopRing(r, count) {
    var step = TAU / count;
    var ar = n2(r * Math.sin(step / 2));
    var d = 'M' + pt(r, TOP);
    for (var i = 1; i <= count; i++) {
      d += 'A' + ar + ' ' + ar + ' 0 0 1 ' + pt(r, TOP + i * step);
    }
    return d + 'Z';
  }

  // Merkezden dışa uzanan mercek biçimli yaprak
  function petal(rIn, rOut, a, width) {
    var c = Math.cos(a), s = Math.sin(a), mid = (rIn + rOut) / 2;
    function p(x, y) {
      return n2(x * c - y * s) + ' ' + n2(x * s + y * c);
    }
    return 'M' + p(rIn, 0) + 'Q' + p(mid, width) + ' ' + p(rOut, 0) +
      'Q' + p(mid, -width) + ' ' + p(rIn, 0) + 'Z';
  }

  /*
   * Yuvarlak dantel (doily). viewBox -100..100.
   * plainCenter: ortası düz kalır, üstüne yazı konabilir.
   */
  function doily(opts) {
    var o = opts || {};
    var count = o.scallops || 32;
    var petals = o.petals || 16;
    var R = 90;
    var step = TAU / count;
    var bumpCenter = R * Math.cos(step / 2);
    var d = scallopRing(R, count);
    var i;

    for (i = 0; i < count; i++) {
      d += polarCircle(bumpCenter + 2, TOP + (i + 0.5) * step, 2.3);
      d += polarCircle(82, TOP + i * step, 2);
    }
    d += circle(0, 0, 75.5) + circle(0, 0, 74);

    var ps = TAU / petals;
    for (i = 0; i < petals; i++) {
      d += petal(58, 71, TOP + i * ps, 4.5);
      d += polarCircle(64.5, TOP + (i + 0.5) * ps, 1.5);
    }

    var thread = circle(0, 0, 78.5) + circle(0, 0, 56.5);

    if (!o.plainCenter) {
      d += circle(0, 0, 54.5) + circle(0, 0, 53);
      for (i = 0; i < 10; i++) {
        d += petal(24, 48, TOP + i * TAU / 10, 9);
        d += polarCircle(44, TOP + (i + 0.5) * TAU / 10, 2);
      }
      d += circle(0, 0, 15.5) + circle(0, 0, 14);
      for (i = 0; i < 8; i++) d += polarCircle(10, TOP + i * TAU / 8, 1.6);
      d += circle(0, 0, 4);
      thread += circle(0, 0, 19);
    }

    return '<svg class="lace ' + (o.className || '') + '" viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">' +
      '<path class="lace__body" fill-rule="evenodd" d="' + d + '"/>' +
      '<path class="lace__thread" d="' + thread + '"/></svg>';
  }

  // A'dan B'ye giden kenar boyunca dışa taşan fistolar ve iç tarafta ilikler.
  // Şekil saat yönünde dolaşılmalıdır (dışa taşma yönü buna bağlı).
  function scallopEdge(ax, ay, bx, by, count) {
    var len = Math.hypot(bx - ax, by - ay);
    var ux = (bx - ax) / len, uy = (by - ay) / len;
    var seg = len / count, ar = n2(seg / 2);
    var d = '', holes = '';
    for (var i = 1; i <= count; i++) {
      d += 'A' + ar + ' ' + ar + ' 0 0 1 ' + n2(ax + ux * seg * i) + ' ' + n2(ay + uy * seg * i);
      var mx = ax + ux * seg * (i - 0.5), my = ay + uy * seg * (i - 0.5);
      holes += circle(mx - uy * 6, my + ux * 6, 2.2);
    }
    return { d: d, holes: holes };
  }

  // Zarf kapağı: üst kenarı düz, iki yanı dantel kenarlı üçgen. viewBox 300x140.
  function flap() {
    var W = 300, T = 125;
    var right = scallopEdge(W, 0, W / 2, T, 9);
    var left = scallopEdge(W / 2, T, 0, 0, 9);
    var body = 'M0 0H' + W + right.d + left.d + 'Z' + right.holes + left.holes;
    var inset = 26, tip = n2(T - inset * T / (W / 2));
    return '<svg class="flap" viewBox="0 0 300 140" aria-hidden="true" focusable="false">' +
      '<path class="flap__body" fill-rule="evenodd" d="' + body + '"/>' +
      '<path class="flap__stitch" d="M' + (W - inset) + ' 0L' + W / 2 + ' ' + tip + 'L' + inset + ' 0"/></svg>';
  }

  // Mum mühür: hafif dalgalı kenarlı yuvarlak
  function seal() {
    var d = '';
    for (var i = 0; i <= 90; i++) {
      var a = i / 90 * TAU;
      var r = 46 + Math.sin(a * 7) * 1.4 + Math.sin(a * 13 + 1) * 0.9 + Math.sin(a * 3 + 2) * 1.2;
      d += (i ? 'L' : 'M') + pt(r, a);
    }
    return '<svg class="seal__svg" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="sealGrad" cx="38%" cy="32%" r="75%">' +
      '<stop offset="0" stop-color="#a0434f"/><stop offset=".55" stop-color="#732536"/>' +
      '<stop offset="1" stop-color="#4c1523"/></radialGradient></defs>' +
      '<path d="' + d + 'Z" fill="url(#sealGrad)"/>' +
      '<circle r="34" fill="none" stroke="rgba(40,5,15,.35)" stroke-width="2.4"/>' +
      '<circle r="34" fill="none" stroke="rgba(255,214,196,.28)" stroke-width="1" transform="translate(-.7 -.7)"/>' +
      '<circle r="29" fill="none" stroke="rgba(255,214,196,.22)" stroke-width=".8" stroke-dasharray="1 2.4"/></svg>';
  }

  // Ortasında küçük dantel düğüm olan ayraç
  function divider() {
    return '<span class="divider__line"></span><span class="divider__knot">' +
      doily({ scallops: 20, petals: 10 }) + '</span><span class="divider__line"></span>';
  }

  function svgUrl(svg) {
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  // Yatay tekrarlanan dantel şerit (24x16 birim)
  function trim(fill, edge) {
    var holes = circle(12, 9.5, 2.6) + circle(6, 3.2, 1) + circle(18, 3.2, 1);
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='16' viewBox='0 0 24 16'>" +
      "<path fill='" + fill + "' fill-rule='evenodd' d='M0 0H24V7A13 13 0 0 1 0 7Z" + holes + "'/>" +
      "<path fill='none' stroke='" + edge + "' stroke-width='.5' d='M24 7A13 13 0 0 1 0 7" + holes + "'/></svg>";
    return svgUrl(svg);
  }

  // Kâğıt dokusu için hafif gren
  function grain() {
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>" +
      "<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/>" +
      "<feColorMatrix values='0 0 0 0 .42 0 0 0 0 .33 0 0 0 0 .25 0 0 0 .07 0'/></filter>" +
      "<rect width='100%' height='100%' filter='url(#g)'/></svg>";
    return svgUrl(svg);
  }

  global.Lace = {
    doily: doily,
    flap: flap,
    seal: seal,
    divider: divider,
    trim: trim,
    grain: grain
  };
})(window);
