'use strict';
// Festett hatású, kóddal rajzolt hátterek. Ha a hatter/ mappában van kép a pálya nevével,
// az lecseréli a megfelelő réteget (lásd HATTEREK.md). Minden réteg a képernyő teljes
// magasságát fedi, vízszintesen ismétlődik, és a kamera mozgásának egy részével halad.
(function (CS) {
  const SC = 3;          // rajzolási felbontás a 192 pont magas játéktérhez képest
  const VH = 192;        // játéktér magassága pontban
  const HORIZON = 160;   // itt kezdődik a talaj
  const LAYERS = [
    { name: 'eg', factor: 0.04, drift: 3 },
    { name: 'tavoli', factor: 0.22 },
    { name: 'kozeli', factor: 0.5 },
  ];

  let seed = 5;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  function lg(x, x0, y0, x1, y1, stops) {
    const g = x.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
    return g;
  }
  function layer(w, draw) {
    const c = document.createElement('canvas');
    c.width = w * SC; c.height = VH * SC;
    const x = c.getContext('2d');
    x.scale(SC, SC);
    draw(x, w);
    return c;
  }
  // Draws fn at x and at x±w so objects crossing the edge tile seamlessly.
  const wrap = (w, x, span, fn) => { fn(x); if (x + span > w) fn(x - w); if (x < 0) fn(x + w); };

  function cloud(x, cx, cy, s) {
    x.save(); x.translate(cx, cy); x.scale(s, s);
    x.fillStyle = 'rgba(255,255,250,.9)';
    x.beginPath();
    [[0, 0, 7], [8, -3, 8], [17, 0, 6], [-7, 2, 5], [10, 3, 7]].forEach(([a, b, r]) => { x.moveTo(a + r, b); x.arc(a, b, r, 0, 7); });
    x.fill();
    x.fillStyle = 'rgba(190,205,215,.35)';
    x.beginPath(); x.ellipse(5, 5, 13, 2.5, 0, 0, 7); x.fill();
    x.restore();
  }

  function skyClouds() {
    seed = 17;
    return layer(640, (x, w) => {
      for (let i = 0; i < 7; i++) {
        const cx = 20 + i * 90 + rnd() * 30, cy = 18 + rnd() * 40, s = 0.7 + rnd() * 0.6;
        wrap(w, cx - 12, 40, xx => cloud(x, xx + 12, cy, s));
      }
    });
  }

  function tree(x, tx, ty, r, dark) {
    x.fillStyle = lg(x, tx - 1.5, 0, tx + 1.5, 0, ['#6b4a2b', '#402b17']);
    x.fillRect(tx - 1.3, ty - 2, 2.6, HORIZON - ty + 4);
    [[-0.5, -0.2, 1], [-0.55, -0.6, 0.7], [0.45, -0.55, 0.75], [0.1, -1, 0.65], [0.5, -0.1, 0.8]].forEach(([a, b, s]) => {
      const cx = tx + a * r, cy = ty - r + b * r * 0.8, rad = r * s * 0.72;
      const g = x.createRadialGradient(cx - rad * 0.4, cy - rad * 0.5, rad * 0.1, cx, cy, rad);
      g.addColorStop(0, dark ? '#86b35e' : '#9ccc6a'); g.addColorStop(0.55, dark ? '#4d7d3a' : '#5a8f42'); g.addColorStop(1, '#34592b');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rad, 0, 7); x.fill();
    });
  }

  function farLayer() {
    seed = 31;
    return layer(640, (x, w) => {
      const hill = i => 118 - 10 * Math.sin(i / w * Math.PI * 4) - 6 * Math.sin(i / w * Math.PI * 10 + 1);
      x.beginPath(); x.moveTo(0, HORIZON + 10);
      for (let i = 0; i <= w; i += 2) x.lineTo(i, hill(i) - 12);
      x.lineTo(w, HORIZON + 10); x.closePath();
      x.fillStyle = lg(x, 0, 90, 0, HORIZON, ['#a9c7b0', '#8fb39a']); x.fill();
      // Zichy-kastély a dombon
      const cx = 430, cy = hill(cx) - 12;
      x.fillStyle = lg(x, cx - 21, 0, cx + 21, 0, ['#f4dc92', '#d6b762']); x.fillRect(cx - 21, cy - 16, 42, 16);
      x.fillStyle = '#56657a'; for (let i = 0; i < 6; i++) { x.fillRect(cx - 17 + i * 6.3, cy - 12, 1.6, 2.6); x.fillRect(cx - 17 + i * 6.3, cy - 6.5, 1.6, 2.6); }
      x.beginPath(); x.moveTo(cx - 24, cy - 15.5); x.lineTo(cx - 18, cy - 23); x.lineTo(cx + 18, cy - 23); x.lineTo(cx + 24, cy - 15.5); x.closePath();
      x.fillStyle = lg(x, 0, cy - 23, 0, cy - 15, ['#c9603f', '#963c27']); x.fill();
      x.fillStyle = '#ecd384'; x.fillRect(cx - 5, cy - 34, 10, 18);
      x.beginPath(); x.moveTo(cx - 6.5, cy - 33.5); x.lineTo(cx, cy - 43); x.lineTo(cx + 6.5, cy - 33.5); x.closePath(); x.fillStyle = '#b24d31'; x.fill();
      // templomtorony
      const tx = 150, ty = hill(tx) - 10;
      x.fillStyle = lg(x, tx - 4, 0, tx + 4, 0, ['#f7f4ea', '#d9d4c4']); x.fillRect(tx - 4, ty - 34, 8, 34);
      x.fillStyle = '#4c5560'; x.beginPath(); x.moveTo(tx - 5, ty - 34); x.lineTo(tx, ty - 50); x.lineTo(tx + 5, ty - 34); x.closePath(); x.fill();
      x.fillRect(tx - 0.3, ty - 55, 0.6, 5); x.fillRect(tx - 1.6, ty - 53.5, 3.2, 0.6);
      x.fillStyle = '#56657a'; x.beginPath(); x.arc(tx, ty - 26, 1.6, 0, 7); x.fill();
      x.fillStyle = lg(x, 0, ty - 14, 0, ty, ['#f0e8d6', '#d6ccb6']); x.fillRect(tx + 4, ty - 12, 20, 12);
      x.beginPath(); x.moveTo(tx + 3, ty - 12); x.lineTo(tx + 6, ty - 17); x.lineTo(tx + 25, ty - 17); x.lineTo(tx + 25, ty - 12); x.fillStyle = '#9e4a32'; x.fill();
      // nyárfasorok és szőlősorok
      for (let i = 0; i < 26; i++) {
        const px = rnd() * w, py = hill(px) - 8 + rnd() * 10;
        if (Math.abs(px - cx) < 30 || Math.abs(px - tx) < 16) continue;
        wrap(w, px - 3, 6, xx => { x.fillStyle = '#5d8663'; x.beginPath(); x.ellipse(xx + 3, py - 7, 2.2, 8, 0, 0, 7); x.fill(); });
      }
      x.beginPath(); x.moveTo(0, HORIZON + 10);
      for (let i = 0; i <= w; i += 2) x.lineTo(i, hill(i) + 14 + 3 * Math.sin(i / 23));
      x.lineTo(w, HORIZON + 10); x.closePath();
      x.fillStyle = lg(x, 0, 120, 0, HORIZON, ['#8db577', '#77a262']); x.fill();
      x.strokeStyle = 'rgba(70,110,60,.35)'; x.lineWidth = 0.5;
      for (let r = 0; r < 5; r++) { x.beginPath(); for (let i = 0; i <= w; i += 4) x.lineTo(i, hill(i) + 20 + r * 5 + 3 * Math.sin(i / 23)); x.stroke(); }
      x.fillStyle = 'rgba(240,228,200,.18)'; x.fillRect(0, 0, w, VH);
    });
  }

  function house(x, hx, w, h, wall, roof, shutter) {
    const top = HORIZON - h;
    x.fillStyle = 'rgba(40,30,20,.22)'; x.fillRect(hx + 2, HORIZON - 1, w, 3);
    x.fillStyle = lg(x, 0, top, 0, HORIZON, [wall[0], wall[1]]); x.fillRect(hx, top, w, h);
    x.fillStyle = 'rgba(120,90,60,.25)'; x.fillRect(hx, HORIZON - 5, w, 5);
    const rh = 12 + w * 0.12;
    x.beginPath(); x.moveTo(hx - 4, top + 1); x.lineTo(hx + w * 0.22, top - rh); x.lineTo(hx + w * 0.78, top - rh); x.lineTo(hx + w + 4, top + 1); x.closePath();
    x.fillStyle = lg(x, 0, top - rh, 0, top, roof); x.fill();
    x.save(); x.clip(); x.strokeStyle = 'rgba(60,20,10,.28)'; x.lineWidth = 0.35;
    for (let r = top - rh + 2.5; r < top; r += 2.5) { x.beginPath(); x.moveTo(hx - 4, r); x.lineTo(hx + w + 4, r); x.stroke(); }
    x.restore();
    x.fillStyle = '#8e4a36'; x.fillRect(hx + w * 0.65, top - rh - 5, 4, 7);
    const n = Math.max(2, Math.floor(w / 22));
    for (let i = 0; i < n; i++) {
      const wx = hx + (w / n) * (i + 0.5) - 4, wy = top + h * 0.28;
      x.fillStyle = shutter; x.fillRect(wx - 3, wy, 2.4, 11); x.fillRect(wx + 8.6, wy, 2.4, 11);
      x.fillStyle = '#f4f1e8'; x.fillRect(wx - 0.6, wy - 0.6, 9.2, 12.2);
      x.fillStyle = lg(x, wx, wy, wx + 8, wy + 11, ['#6d8fae', '#2d4660']); x.fillRect(wx, wy, 8, 11);
      x.fillStyle = '#f4f1e8'; x.fillRect(wx + 3.6, wy, 0.8, 11); x.fillRect(wx, wy + 4.6, 8, 0.8);
      x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(wx + 1, wy + 1, 1.2, 3);
    }
  }

  function fence(x, fx, w) {
    x.fillStyle = '#efeee6';
    for (let i = 0; i < w; i += 3.2) { x.fillRect(fx + i, HORIZON - 11, 1.8, 12); x.beginPath(); x.moveTo(fx + i, HORIZON - 11); x.lineTo(fx + i + 0.9, HORIZON - 12.4); x.lineTo(fx + i + 1.8, HORIZON - 11); x.fill(); }
    x.fillRect(fx, HORIZON - 8.5, w, 1.1); x.fillRect(fx, HORIZON - 4, w, 1.1);
    x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(fx, HORIZON - 7.4, w, 0.5);
  }

  function nearLayer() {
    seed = 57;
    return layer(768, (x, w) => {
      const walls = [['#f6ecd2', '#e4d4b0'], ['#f7dfa8', '#e5c585'], ['#f1efe8', '#d9d5ca'], ['#f3d2b6', '#e0b594'], ['#e3ecd4', '#c9d6b5']];
      const roofs = [['#c9603f', '#963c27'], ['#b04a36', '#7e2e20'], ['#8e6a55', '#5e4436'], ['#c77a45', '#944f28']];
      const shutters = ['#4f7a4a', '#6b4a2c', '#5c6f8a'];
      // villanyoszlopok és vezetékek
      const poles = [40, 232, 424, 616];
      x.strokeStyle = 'rgba(40,40,45,.55)'; x.lineWidth = 0.35;
      poles.forEach((p, i) => {
        const q = i + 1 < poles.length ? poles[i + 1] : poles[0] + w;
        for (const dy of [0, 3]) { x.beginPath(); x.moveTo(p, 72 + dy); x.quadraticCurveTo((p + q) / 2, 86 + dy, q, 72 + dy); x.stroke(); }
        if (i === poles.length - 1) for (const dy of [0, 3]) { x.beginPath(); x.moveTo(p - w, 72 + dy); x.quadraticCurveTo((p - w + q - w) / 2, 86 + dy, q - w, 72 + dy); x.stroke(); }
      });
      let hx = 6;
      let i = 0;
      while (hx < w - 60) {
        const hw = 56 + Math.floor(rnd() * 26), hh = 30 + Math.floor(rnd() * 8);
        if (rnd() < 0.8) {
          house(x, hx, hw, hh, walls[i % walls.length], roofs[Math.floor(rnd() * roofs.length)], shutters[Math.floor(rnd() * shutters.length)]);
          fence(x, hx - 2, hw + 4);
        }
        const gap = 26 + Math.floor(rnd() * 22);
        tree(x, hx + hw + gap / 2, HORIZON - 26 - rnd() * 10, 11 + rnd() * 5, rnd() < 0.5);
        hx += hw + gap;
        i++;
      }
      poles.forEach(p => {
        x.fillStyle = lg(x, p - 1.2, 0, p + 1.2, 0, ['#8a6a4a', '#5c4028']); x.fillRect(p - 1.2, 66, 2.4, HORIZON - 64);
        x.fillStyle = '#5c4028'; x.fillRect(p - 6, 71, 12, 1.4);
        x.fillStyle = '#e8e4d8'; x.fillRect(p - 5.5, 70.2, 1, 1); x.fillRect(p + 4.5, 70.2, 1, 1);
      });
      x.globalCompositeOperation = 'source-atop';
      x.fillStyle = 'rgba(236,226,200,.14)'; x.fillRect(0, 0, w, VH);
      x.globalCompositeOperation = 'source-over';
    });
  }

  function create(levelId, base = 'hatter/') {
    const bg = {
      layers: { eg: skyClouds(), tavoli: farLayer(), kozeli: nearLayer() },
      images: {},
      front: null,
    };
    // Generált képek betöltése, ha léteznek. Hiányzó fájl esetén a kóddal rajzolt réteg marad.
    for (const name of ['eg', 'tavoli', 'kozeli', 'eloter']) {
      const img = new Image();
      img.onload = () => { if (name === 'eloter') bg.front = img; else bg.images[name] = img; };
      img.src = base + levelId + '-' + name + '.png';
    }
    return bg;
  }

  function drawLayer(ctx, src, off, cw, ch) {
    const s = ch / src.height, w = src.width * s;
    let x = -(((off % w) + w) % w);
    for (; x < cw; x += w) ctx.drawImage(src, Math.floor(x), 0, Math.ceil(w) + 1, ch);
  }

  function draw(bg, ctx, camX, time, cw, ch) {
    const unit = ch / VH;
    if (!bg.images.eg) {
      ctx.fillStyle = lg(ctx, 0, 0, 0, ch, ['#78b8da', '#a7d3e2', '#dfe7d2', '#f6ddab']);
      ctx.fillRect(0, 0, cw, ch);
      const g = ctx.createRadialGradient(cw * 0.18, ch * 0.2, 0, cw * 0.18, ch * 0.2, ch * 0.6);
      g.addColorStop(0, 'rgba(255,240,190,.9)'); g.addColorStop(0.2, 'rgba(255,232,170,.4)'); g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    }
    for (const L of LAYERS) {
      const src = bg.images[L.name] || bg.layers[L.name];
      drawLayer(ctx, src, (camX * L.factor + (L.drift ? time * L.drift : 0)) * unit, cw, ch);
    }
  }

  function drawFront(bg, ctx, camX, cw, ch) {
    if (bg.front) drawLayer(ctx, bg.front, camX * 1.25 * (ch / VH), cw, ch);
  }

  CS.Backgrounds = { create, draw, drawFront, VH, HORIZON };
})(window.CS = window.CS || {});
