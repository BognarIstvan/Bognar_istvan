'use strict';
// Kirajzolás: festett háttér nagy felbontásban, rá a pixeles játékréteg élesen felnagyítva.
(function (CS) {
  const { T } = CS.Engine;

  function prepareLevel(s, S) {
    const c = document.createElement('canvas');
    c.width = s.width; c.height = s.height;
    const x = c.getContext('2d');
    for (const d of s.decor) {
      const img = S.decor[d.type];
      x.drawImage(img, d.x + (d.type === 'jednota' ? -4 : d.type === 'well' ? -2 : 0), d.y - img.height);
    }
    for (let r = 0; r < s.rows; r++) {
      for (let col = 0; col < s.cols; col++) {
        const ch = s.tiles[r][col], px = col * T, py = r * T;
        const v = (col * 7 + r * 3) % 4;
        if (ch === '#') {
          const above = r > 0 ? s.tiles[r - 1][col] : '.';
          x.drawImage(above === '#' ? S.dirt[v % 3] : S.grass[v], px, py);
        } else if (ch === '=') x.drawImage(S.stone, px, py);
        else if (ch === '-') x.drawImage(S.plank, px, py);
      }
    }
    // csatorna: víz a gödrök alján
    for (let col = 0; col < s.cols; col++) {
      if (s.tiles[s.rows - 1][col] === '#') continue;
      const px = col * T, wy = s.height - 22;
      x.fillStyle = '#2f5a63'; x.fillRect(px, wy, T, 22);
      x.fillStyle = '#4f8a92'; x.fillRect(px, wy, T, 2);
      x.fillStyle = '#9fd0d4'; x.fillRect(px + (col * 5) % 11, wy, 4, 1);
      x.fillStyle = '#244750'; x.fillRect(px + (col * 7) % 9, wy + 8, 6, 1);
    }
    return c;
  }

  function sprite(ctx, img, x, y, flipX, flipY) {
    x = Math.round(x); y = Math.round(y);
    if (!flipX && !flipY) { ctx.drawImage(img, x, y); return; }
    ctx.save();
    ctx.translate(x + (flipX ? img.width : 0), y + (flipY ? img.height : 0));
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }

  function drawGame(ctx, s, S, levelCanvas, viewW, viewH) {
    ctx.clearRect(0, 0, viewW, viewH);
    const cam = Math.round(s.camX);
    ctx.save();
    ctx.translate(-cam, 0);
    const x0 = cam - 32, x1 = cam + viewW + 32;
    const vis = o => o.x + (o.w || 16) > x0 && o.x < x1;

    ctx.drawImage(levelCanvas, cam, 0, viewW, viewH, cam, 0, viewW, viewH);

    // kút vize
    for (const d of s.decor) if (d.type === 'well' && vis(d)) {
      ctx.fillStyle = '#7fc4ea';
      for (let i = 0; i < 4; i++) { const yy = d.y - 16 + ((s.time * 30 + i * 3) % 12); ctx.fillRect(d.x + 14, Math.round(yy), 1, 2); }
      if (d.active) { ctx.fillStyle = '#9be04a'; ctx.fillRect(d.x + 1, d.y - 28, 1, 5); ctx.fillRect(d.x + 2, d.y - 28, 3, 2); }
    }

    for (const b of Object.values(s.bins)) {
      const bx = b.c * T, by = b.r * T;
      if (bx + 16 < x0 || bx > x1) continue;
      ctx.drawImage(S.bin[b.type], bx, by + 3);
      const shake = b.lid > 0 ? Math.round(Math.sin(b.lid * 20) * 1) : 0;
      if (b.used) sprite(ctx, S.lid[b.type], bx - 3 + shake, by - 3);
      else ctx.drawImage(S.lid[b.type], bx, by);
    }
    for (const b of Object.values(s.blocks)) {
      const bx = b.c * T, by = b.r * T;
      if (b.hidden || bx + 16 < x0 || bx > x1) continue;
      ctx.drawImage(b.used ? S.crateUsed : S.crate, bx, by - Math.round(Math.sin(b.bump * Math.PI) * 4));
    }
    const glint = Math.floor(s.time * 4) % 4 === 0;
    for (const c of s.coins) if (!c.taken && vis(c)) ctx.drawImage(glint ? S.bottle2 : S.bottle, c.x, Math.round(c.y + Math.sin(s.time * 3 + c.x) * 0.8));
    for (const b of s.loose) {
      if (b.ttl < 1 && Math.floor(b.ttl * 12) % 2) continue;
      sprite(ctx, S.bottle, b.x, b.y);
    }
    for (const it of s.items) {
      const img = S[it.type];
      if (it.emerge > 0) {
        // csak a rekesz fölé kilógó rész látszik
        ctx.save(); ctx.beginPath(); ctx.rect(it.x - 4, 0, it.w + 8, it.top); ctx.clip();
        sprite(ctx, img, it.x, it.y); ctx.restore();
      } else sprite(ctx, img, it.x, it.y);
      if (it.type === 'lotty' && Math.floor(s.time * 8) % 2) { ctx.fillStyle = '#fff6a0'; ctx.fillRect(Math.round(it.x) - 1, Math.round(it.y) + 2, 1, 1); ctx.fillRect(Math.round(it.x) + 8, Math.round(it.y) + 6, 1, 1); }
    }

    for (const e of s.enemies) {
      if (!vis(e) || (!e.active && e.alive)) continue;
      if (e.kind === 'boar') {
        const f = S.boar[Math.floor((e.walk || 0) * 6) % 2];
        sprite(ctx, f, e.x - 1, e.y, e.vx > 0, !e.alive);
      } else {
        const f = S.magpie[Math.floor(s.time * 9 + e.x) % 2];
        sprite(ctx, f, e.x - 1, e.y, e.vx > 0, !e.alive);
        if (e.carry) sprite(ctx, S.bottle, e.x + (e.vx > 0 ? 2 : 8), e.y + 6);
      }
    }

    drawPlayer(ctx, s, S);

    for (const q of s.particles) {
      if (q.kind === 'coinpop') { sprite(ctx, S.bottle, q.x, q.y); continue; }
      if (q.kind === 'smoke') { if (q.life > 0.5) { ctx.fillStyle = q.life > 1 ? '#e2e2da' : '#bfc0b8'; ctx.fillRect(Math.round(q.x), Math.round(q.y), 1, 1); } continue; }
      if (q.kind === 'bubble') { ctx.strokeStyle = '#dff4ff'; ctx.lineWidth = 1; ctx.strokeRect(Math.round(q.x) + 0.5, Math.round(q.y) + 0.5, 2, 2); continue; }
      ctx.fillStyle = q.color; ctx.fillRect(Math.round(q.x), Math.round(q.y), 1, 1);
    }
    for (const q of s.popups) {
      const w = CS.pixelTextWidth(q.text);
      CS.pixelText(ctx, q.text, Math.round(q.x - w / 2) + 1, Math.round(q.y) + 1, '#2a1a0c');
      CS.pixelText(ctx, q.text, Math.round(q.x - w / 2), Math.round(q.y), q.text[0] === '-' ? '#ff8a6a' : '#fff3a0');
    }
    ctx.restore();
  }

  function drawPlayer(ctx, s, S) {
    const p = s.player;
    if (p.hidden) return;
    if (p.inv > 0 && s.phase === 'play' && Math.floor(p.inv * 14) % 2) return;
    let skin = 'normal';
    if (p.boost > 0) skin = Math.floor(s.time * 12) % 2 ? 'glowA' : 'glowB';
    else if (p.hang > 0) skin = 'pale';
    const set = S.ork[skin];
    let frame = set.stand;
    if (s.phase === 'dying' || !p.ground) frame = set.jump;
    else if (Math.abs(p.vx) > 8) frame = Math.floor(p.walkT / 7) % 2 ? set.walk : set.stand;
    const sx = p.x - 3, sy = p.y - 2;
    const flip = p.face < 0;
    const tilt = p.tipsy > 0 ? Math.round(Math.sin(s.time * 4)) : 0;
    sprite(ctx, frame, sx + tilt, sy, flip);
    if (p.bag) sprite(ctx, S.handBag, flip ? sx - 3 : sx + 12, sy + 12, flip);
  }

  CS.Render = { prepareLevel, drawGame };
})(window.CS = window.CS || {});
