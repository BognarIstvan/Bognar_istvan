'use strict';
// Játéklogika: fizika, ütközés, ellenfelek, tárgyak, naptár. Rajzolás nincs benne,
// így Node alatt is tesztelhető (test/engine-test.cjs).
//
// Gazdaság (az eredeti Ork szimulátor szerint): a palack 15 centet ér a Jednotában,
// a csucsó 75 cent, a cigipapír 15 cent, a nagy szatyor 60 cent. 5 csikk + 1 papír = 1 sodrás.
// A műszak célja 3 csucsót leadni a Parlamentnél.
(function (CS) {
  const T = 16;
  const ROWS = 12;
  const DAYS = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
  // Amit a „karón kiabálók” (az utcai hangszórók) bemondanak a pálya elején.
  const DAY_NOTES = [
    'Csendes nap. A kukákban a szokásos.',
    'Holnap BIO-ürítés! A barna kukákban ma erjedt gyümölcs is akad.',
    'Ma ürítették a barna BIO-kukákat. Azok üresek.',
    'Holnap kék kukás ürítés! Ma még csordultig vannak.',
    'Ma ürítették a kék kukákat. Azokban nincs semmi.',
    'Sárgazsák-nap! A házak előtt sárga zsákok, bennük PET-palack.',
    'Vasárnap. Mindenki pihen, a vaddisznók is lustábbak.',
  ];
  const PRICES = { bottle: 15, wine: 75, paper: 15, bigBag: 60 };
  const GOAL_WINE = 3;
  const SOLID = new Set(['#', '=']);
  const BLOCKS = new Set(['?', '$', 'S', 'L', 'U']);
  const BINS = new Set(['k', 'n']);
  const ITEM_SIZE = { lotty: [8, 11], csucso: [6, 14], fruit: [8, 8], sack: [14, 14] };
  const DAMAGE = { boar: 30, magpie: 15, pit: 25 };

  const PHYS = {
    walk: 82, run: 135, accGround: 430, accRun: 540, accAir: 300,
    friction: 560, airFriction: 120, jump: 318, jumpSpeedBonus: 0.22,
    gravityHold: 880, gravity: 1750, maxFall: 400, coyote: 0.08, buffer: 0.12,
  };

  const key = (c, r) => c + ',' + r;
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function newInventory() {
    return { cash: 0, bottles: 0, capacity: 12, butts: 0, paper: 1, wine: 0, cigs: 0, delivered: 0, rolled: 0, energy: 100 };
  }

  function createGame(level, opts = {}) {
    const rows = level.rows;
    const cols = rows[0].length;
    const tiles = rows.map(r => r.split(''));
    const s = {
      level, cols, rows: ROWS, width: cols * T, height: ROWS * T,
      tiles, blocks: {}, bins: {}, coins: [], loose: [], items: [], enemies: [], clouds: [],
      particles: [], popups: [], decor: [], signs: [], events: [],
      day: ((opts.day || 0) % 7 + 7) % 7,
      inv: opts.inv || newInventory(),
      time: 0, phase: 'play', viewW: opts.viewW || 320, camX: 0,
      checkpoint: null, goal: null, sign: null, told: {}, smokeT: 0, fullT: 0,
    };
    const goalType = level.goal || 'J';
    let signIndex = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = tiles[r][c];
        const x = c * T, y = r * T;
        if (BLOCKS.has(ch)) {
          s.blocks[key(c, r)] = { type: ch, c, r, hits: ch === '$' ? 5 : 1, used: false, bump: 0, hidden: ch === 'U' };
          continue;
        }
        if (BINS.has(ch)) { s.bins[key(c, r)] = { type: ch, c, r, used: false, lid: 0 }; continue; }
        if (SOLID.has(ch) || ch === '-' || ch === '.') continue;
        tiles[r][c] = '.';
        if (ch === 'o') s.coins.push({ kind: 'bottle', x: x + 5, y: y + 3, w: 6, h: 10, taken: false });
        else if (ch === 'c') s.coins.push({ kind: 'butt', x: x + 4, y: y + 13, w: 8, h: 3, taken: false });
        else if (ch === 'b') s.enemies.push({ kind: 'boar', x: x - 1, y: y + 5, w: 18, h: 11, vx: -28, vy: 0, alive: true, active: false, stun: 0 });
        else if (ch === 'm') s.enemies.push({ kind: 'magpie', x, y, w: 14, h: 8, vx: -35, vy: 0, baseX: x, baseY: y, t: c, mode: 'patrol', cool: 0, alive: true, active: false, stun: 0 });
        else if (ch === 'z') { if (s.day === 5) s.items.push(makeItem('sack', x + 1, y + 2)); }
        else if (ch === 'C') s.decor.push({ type: 'well', x, y: y + T, active: false });
        else if (ch === 'T') s.signs.push({ x: x + 8, text: (level.signs || [])[signIndex++] || '' }), s.decor.push({ type: 'sign', x, y: y + T });
        else if (ch === 'P') {
          s.decor.push({ type: 'parliament', x, y: y + T });
          if (goalType === 'P') s.goal = { x: x - 8, door: x + 34 };
          else s.start = { x: x + 84, y: y + T - 22 };
        } else if (ch === 'J') {
          s.decor.push({ type: 'jednota', x, y: y + T });
          if (goalType === 'J') s.goal = { x: x + 12, door: x + 110 };
          else s.start = { x: x + 140, y: y + T - 22 };
        } else if (ch === 'B') {
          s.decor.push({ type: 'shelter', x, y: y + T });
          for (let i = 0; i < 3; i++) if (tiles[r - 2][c + i] === '.') tiles[r - 2][c + i] = '-';
        }
      }
    }
    if (!s.start) s.start = { x: 32, y: 9 * T - 22 };
    s.checkpoint = { ...s.start };
    s.player = newPlayer(s.start);
    s.camX = clampCam(s, s.player.x - s.viewW * 0.4);
    return s;
  }

  function newPlayer(p) {
    return {
      x: p.x, y: p.y, w: 10, h: 22, vx: 0, vy: 0, face: 1, ground: false, coyote: 0, jumpBuf: 0,
      boost: 0, hang: 0, tipsy: 0, inv: 0, walkT: 0, dying: 0, hidden: false, prevBottom: p.y + 22,
    };
  }

  function makeItem(type, x, y, extra = {}) {
    const [w, h] = ITEM_SIZE[type];
    return Object.assign({ type, x, y, w, h, vx: 0, vy: 0, emerge: 0, ground: false }, extra);
  }

  // ---------- tiles ----------
  function tileAt(s, c, r) {
    if (c < 0 || c >= s.cols) return '=';
    if (r < 0 || r >= ROWS) return '.';
    return s.tiles[r][c];
  }
  function isSolid(s, c, r) {
    const ch = tileAt(s, c, r);
    if (SOLID.has(ch) || BINS.has(ch)) return true;
    if (BLOCKS.has(ch)) return !s.blocks[key(c, r)].hidden;
    return false;
  }
  function isHidden(s, c, r) {
    const b = s.blocks[key(c, r)];
    return !!(b && b.hidden);
  }

  // Közös mozgatás testekhez (játékos, tárgyak, ellenfelek). Visszaadja, mibe ütközött.
  function moveBody(s, o, dt, opts = {}) {
    const hit = { wall: false, floor: null, ceil: [] };
    o.x += o.vx * dt;
    const r0 = Math.floor(o.y / T), r1 = Math.floor((o.y + o.h - 0.01) / T);
    if (o.vx > 0) {
      const c = Math.floor((o.x + o.w) / T);
      for (let r = r0; r <= r1; r++) if (isSolid(s, c, r)) { o.x = c * T - o.w - 0.001; o.vx = 0; hit.wall = true; break; }
    } else if (o.vx < 0) {
      const c = Math.floor(o.x / T);
      for (let r = r0; r <= r1; r++) if (isSolid(s, c, r)) { o.x = (c + 1) * T; o.vx = 0; hit.wall = true; break; }
    }
    const prevBottom = o.y + o.h;
    o.y += o.vy * dt;
    o.ground = false;
    const c0 = Math.floor(o.x / T), c1 = Math.floor((o.x + o.w - 0.01) / T);
    if (o.vy > 0) {
      const r = Math.floor((o.y + o.h) / T);
      for (let c = c0; c <= c1; c++) {
        const oneWay = tileAt(s, c, r) === '-' && prevBottom <= r * T + 0.5;
        if (isSolid(s, c, r) || oneWay) { hit.floor = { c, r, speed: o.vy }; break; }
      }
      if (hit.floor) {
        // prefer a bin under the body's centre when standing across two tiles
        const cc = Math.floor((o.x + o.w / 2) / T);
        if (BINS.has(tileAt(s, cc, hit.floor.r))) hit.floor.c = cc;
        o.y = hit.floor.r * T - o.h; o.vy = 0; o.ground = true;
      }
    } else if (o.vy < 0) {
      const r = Math.floor(o.y / T);
      for (let c = c0; c <= c1; c++) if (isSolid(s, c, r) || (opts.hitsHidden && isHidden(s, c, r))) hit.ceil.push(c);
      if (hit.ceil.length) {
        o.y = (r + 1) * T; o.vy = 0;
        const mid = o.x + o.w / 2;
        hit.ceil.sort((a, b) => Math.abs(a * T + 8 - mid) - Math.abs(b * T + 8 - mid));
        hit.ceilRow = r;
      }
    }
    return hit;
  }

  // ---------- events ----------
  const sfx = (s, n) => s.events.push({ t: 'sfx', n });
  const toast = (s, text) => s.events.push({ t: 'toast', text });
  function popup(s, x, y, text) { s.popups.push({ x, y, text, life: 0.9 }); }
  function puff(s, x, y, n, color, spread = 40) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      s.particles.push({ x, y, vx: Math.cos(a) * spread * Math.random(), vy: -Math.random() * spread, life: 0.5, max: 0.5, color, g: 120 });
    }
  }
  function tell(s, id, text) {
    if (s.told[id]) return;
    s.told[id] = true;
    toast(s, text);
  }
  function bagFull(s) {
    if (s.fullT > 0) return;
    s.fullT = 4;
    toast(s, 'Tele a szatyor! (' + s.inv.capacity + ' palack) Váltsd be a Jednotában.');
  }

  // Palack felvétele: csak ha fér a szatyorba.
  function takeBottle(s, x, y) {
    if (s.inv.bottles >= s.inv.capacity) { bagFull(s); return false; }
    s.inv.bottles++;
    sfx(s, 'coin');
    popup(s, x, y, '+15');
    return true;
  }
  function takeButt(s, x, y) {
    s.inv.butts++;
    sfx(s, 'butt');
    popup(s, x, y, '+1');
    if (s.inv.butts === 5) tell(s, 'butt5', 'Megvan az 5 csikk! Cigipapírral a Parlamentnél sodrás lesz belőle.');
  }

  // ---------- blocks and bins ----------
  function hitBlock(s, c, r) {
    const b = s.blocks[key(c, r)];
    if (!b) { sfx(s, 'bump'); return; }
    b.bump = 1;
    for (const e of s.enemies) {
      if (e.alive && e.kind === 'boar' && overlap(e, { x: c * T, y: r * T - 4, w: T, h: 4 })) defeat(s, e);
    }
    if (b.used) { sfx(s, 'bump'); return; }
    const x = c * T, y = r * T;
    if (b.hidden) b.hidden = false;
    if (b.type === '?' || b.type === '$') {
      if (s.inv.bottles >= s.inv.capacity) spill(s, x + 8, y, 'bottle', 1, Infinity);
      else {
        s.particles.push({ kind: 'coinpop', x: x + 5, y: y - 10, vx: 0, vy: -220, life: 0.45, max: 0.45, g: 900 });
        takeBottle(s, x + 8, y - 12);
      }
      if (--b.hits <= 0) b.used = true;
      return;
    }
    b.used = true;
    if (b.type === 'S') {
      s.inv.paper++;
      s.particles.push({ kind: 'paperpop', x: x + 4, y: y - 8, vx: 0, vy: -200, life: 0.45, max: 0.45, g: 900 });
      sfx(s, 'coin');
      toast(s, 'Cigipapír! (' + s.inv.paper + ' db)');
      return;
    }
    sfx(s, 'sprout');
    if (b.type === 'L') s.items.push(makeItem('lotty', x + 4, y, { emerge: 0.5, vx: 55, top: y }));
    if (b.type === 'U') s.items.push(makeItem('csucso', x + 5, y, { emerge: 0.5, vx: 45, top: y }));
  }

  function spill(s, x, y, kind, n, ttl) {
    for (let i = 0; i < n; i++) {
      const spread = n > 1 ? (i / (n - 1) - 0.5) * 2 : 0;
      const w = kind === 'bottle' ? 6 : 8, h = kind === 'bottle' ? 10 : 3;
      s.loose.push({ kind, x: x - w / 2, y: y - 10, w, h, vx: spread * 55 + (Math.random() - 0.5) * 20, vy: -190 - Math.random() * 60, age: 0, ttl, ground: false });
    }
  }

  function stompBin(s, bin) {
    if (bin.used) return;
    bin.used = true;
    bin.lid = 1;
    sfx(s, 'bin');
    const x = bin.c * T + 8, y = bin.r * T;
    let n = 0;
    if (bin.type === 'k') {
      if (s.day === 4) return tell(s, 'kek', 'Üres. A kék kukákat ma ürítették.');
      n = s.day === 3 ? 4 : 2;
    } else {
      if (s.day === 2) return tell(s, 'bio', 'Üres. A BIO-kukákat ma ürítették.');
      n = 1;
      if (s.day === 1) s.items.push(makeItem('fruit', x - 4, y - 10, { vy: -200, vx: -30 }));
    }
    spill(s, x, y, 'bottle', n, Infinity);
    spill(s, x, y, 'butt', 1, Infinity);
  }

  // ---------- player ----------
  function hurt(s, amount) {
    const p = s.player;
    if (p.inv > 0 || p.boost > 0 || s.phase !== 'play') return;
    s.inv.energy = Math.max(0, s.inv.energy - amount);
    p.inv = 1.5;
    p.vy = -170; p.vx = -p.face * 90;
    const n = Math.min(s.inv.bottles, 4);
    s.inv.bottles -= n;
    spill(s, p.x + p.w / 2, p.y + 8, 'bottle', n, 4);
    sfx(s, 'hurt');
    if (s.inv.energy <= 0) faint(s, false);
    else if (n) tell(s, 'scatter', 'Kiszóródtak a palackok! Kapd el őket, mielőtt eltűnnek!');
  }

  // Kidőlés vagy csatornába esés: vissza a legutóbbi kúthoz.
  function faint(s, pit) {
    const p = s.player;
    if (s.phase !== 'play') return;
    s.phase = 'dying';
    p.pit = pit;
    p.dying = pit ? 0.9 : 1.8;
    p.vx = 0;
    p.vy = pit ? 0 : -330;
    p.boost = 0; p.hang = 0; p.tipsy = 0;
    sfx(s, pit ? 'splash' : 'die');
  }

  function respawn(s) {
    const pit = s.player.pit;
    if (pit) s.inv.energy = Math.max(0, s.inv.energy - DAMAGE.pit);
    const fainted = s.inv.energy <= 0;
    if (fainted) s.inv.energy = 100;
    const p = newPlayer(s.checkpoint);
    p.inv = 2;
    s.player = p;
    s.phase = 'play';
    s.camX = clampCam(s, p.x - s.viewW * 0.4);
    toast(s, fainted ? 'Kidőltél. A kútnál tértél magadhoz.' : 'Kimásztál a csatornából. Vizes lettél, de megvagy.');
  }

  function collectItem(s, it) {
    const p = s.player;
    if (it.type === 'lotty') {
      p.boost = 20; p.hang = 0; p.tipsy = 0;
      sfx(s, 'power');
      toast(s, 'Gyanús lötty! 20 mp orkerő: gyorsabb vagy és sérthetetlen.');
    } else if (it.type === 'csucso') {
      s.inv.wine++;
      sfx(s, 'oneup');
      popup(s, it.x, it.y - 4, '+1');
      toast(s, 'Egy üveg CSUCSÓ! Ezt is leadhatod a Parlamentnél.');
    } else if (it.type === 'fruit') {
      p.tipsy = 8;
      sfx(s, 'hic');
      toast(s, 'Erjedt gyümölcs... kótyagos lettél egy kicsit.');
    } else if (it.type === 'sack') {
      const free = s.inv.capacity - s.inv.bottles;
      const n = Math.min(3, free);
      if (n <= 0) { bagFull(s); return false; }
      s.inv.bottles += n;
      sfx(s, 'coin');
      popup(s, it.x + 6, it.y, '+' + n);
      tell(s, 'sack', 'Sárgazsák: PET-palackok!');
    }
    return true;
  }

  function defeat(s, e, how) {
    if (!e.alive) return;
    e.alive = false;
    e.deadT = 1.2;
    e.vy = how === 'kick' ? -200 : -120;
    e.vx = how === 'kick' ? (e.x > s.player.x ? 80 : -80) : 0;
    sfx(s, how === 'kick' ? 'kick' : 'stomp');
    puff(s, e.x + e.w / 2, e.y + e.h / 2, 6, '#e8dcc0');
  }

  // Sodrás elszívása: füstfelhő, ami elkábítja a közeli ellenfeleket.
  function smoke(s) {
    const p = s.player;
    if (s.inv.cigs <= 0) { tell(s, 'nocig', 'Nincs sodrásod. 5 csikkből és 1 cigipapírból a Parlamentnél sodorhatsz.'); return; }
    s.inv.cigs--;
    s.clouds.push({ x: p.x + p.w / 2 + p.face * 16, y: p.y + 8, r: 3, max: 30, life: 2.6 });
    sfx(s, 'puff');
  }

  function updatePlayer(s, input, dt) {
    const p = s.player;
    p.prevBottom = p.y + p.h;
    if (s.phase === 'dying') {
      p.dying -= dt;
      if (!p.pit && p.dying < 1.45) { p.vy = Math.min(p.vy + 900 * dt, 400); p.y += p.vy * dt; }
      if (p.dying <= 0) respawn(s);
      return;
    }
    if (s.phase === 'goal') {
      p.vx = 50; p.face = 1; p.walkT += 50 * dt;
      p.vy = Math.min(p.vy + PHYS.gravity * dt, PHYS.maxFall);
      moveBody(s, p, dt);
      if (p.x + p.w / 2 >= s.goal.door) {
        p.hidden = s.level.goal !== 'P';
        p.vx = 0;
        s.phase = 'done';
        sfx(s, 'goal');
        s.events.push({ t: 'goal', at: s.level.goal || 'J' });
      }
      return;
    }
    if (s.phase !== 'play') return;

    let maxSpeed = input.run ? PHYS.run : PHYS.walk;
    if (p.boost > 0) maxSpeed *= 1.35;
    if (p.hang > 0) maxSpeed *= 0.55;
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let target = dir * maxSpeed;
    if (p.tipsy > 0) target += Math.sin(s.time * 2.3) * 38;
    if (dir) p.face = dir;
    if (target !== 0 && p.inv < 1.2) {
      let acc = p.ground ? (input.run ? PHYS.accRun : PHYS.accGround) : PHYS.accAir;
      if (p.ground && dir && Math.sign(p.vx) === -dir) acc *= 1.8;
      p.vx = p.vx < target ? Math.min(target, p.vx + acc * dt) : Math.max(target, p.vx - acc * dt);
    } else if (target === 0) {
      const f = (p.ground ? PHYS.friction : PHYS.airFriction) * dt;
      p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
    }

    if (input.jumpPressed) p.jumpBuf = PHYS.buffer;
    else p.jumpBuf = Math.max(0, p.jumpBuf - dt);
    p.coyote = p.ground ? PHYS.coyote : Math.max(0, p.coyote - dt);
    if (p.jumpBuf > 0 && p.coyote > 0) {
      p.vy = -(PHYS.jump + Math.abs(p.vx) * PHYS.jumpSpeedBonus) * (p.hang > 0 ? 0.82 : 1);
      p.ground = false; p.coyote = 0; p.jumpBuf = 0;
      sfx(s, 'jump');
    }
    if (input.smokePressed) smoke(s);
    const g = p.vy < 0 && input.jump ? PHYS.gravityHold : PHYS.gravity;
    p.vy = Math.min(p.vy + g * dt, PHYS.maxFall);

    const wasGround = p.ground;
    const hit = moveBody(s, p, dt, { hitsHidden: true });
    if (hit.ceil.length) hitBlock(s, hit.ceil[0], hit.ceilRow);
    if (hit.floor) {
      const bin = s.bins[key(hit.floor.c, hit.floor.r)];
      if (bin && hit.floor.speed > 60) stompBin(s, bin);
      if (!wasGround && hit.floor.speed > 220) puff(s, p.x + p.w / 2, p.y + p.h, 4, '#d9c9a4', 30);
    }
    if (p.ground && Math.abs(p.vx) > 1) p.walkT += Math.abs(p.vx) * dt;
    if (p.y > s.height + 24) faint(s, true);

    if (p.boost > 0) { p.boost -= dt; if (p.boost <= 0) { p.boost = 0; p.hang = 6; toast(s, 'Elmúlt az orkerő. Jön a józanodás...'); } }
    if (p.hang > 0) p.hang = Math.max(0, p.hang - dt);
    if (p.tipsy > 0) {
      p.tipsy = Math.max(0, p.tipsy - dt);
      if (Math.random() < dt * 1.2) s.particles.push({ kind: 'bubble', x: p.x + p.w / 2 + p.face * 5, y: p.y, vx: 0, vy: -14, life: 1.2, max: 1.2, g: 0 });
    }
    if (p.inv > 0) p.inv = Math.max(0, p.inv - dt);
    if (s.fullT > 0) s.fullT -= dt;

    s.smokeT -= dt;
    if (s.smokeT <= 0) {
      s.smokeT = 0.3;
      s.particles.push({ kind: 'smoke', x: p.x + p.w / 2 + p.face * 8, y: p.y + 4, vx: p.face * 3, vy: -9, life: 1.4, max: 1.4, g: 0 });
    }

    // artézi kút, cél, táblák
    for (const d of s.decor) {
      if (d.type === 'well' && !d.active && p.x > d.x - 4) {
        d.active = true;
        s.checkpoint = { x: d.x + 20, y: d.y - 22 };
        s.inv.energy = 100;
        p.tipsy = 0; p.hang = 0;
        sfx(s, 'check');
        toast(s, 'Artézi kút: erőnlét feltöltve, józan vagy. Ha elesel, innen folytatod.');
      }
    }
    if (s.goal && p.x > s.goal.x) {
      s.phase = 'goal'; p.boost = 0;
      toast(s, s.level.goal === 'P' ? 'Megjött az ellátmány! Ülésezik a Parlament.' : 'Irány a bolt!');
    }
    s.sign = null;
    for (const sg of s.signs) if (Math.abs(sg.x - (p.x + p.w / 2)) < 26) s.sign = sg.text;
  }

  // ---------- world ----------
  function updateWorld(s, dt) {
    const p = s.player;
    const alive = s.phase === 'play';
    for (const b of Object.values(s.blocks)) if (b.bump > 0) b.bump = Math.max(0, b.bump - dt * 7);
    for (const b of Object.values(s.bins)) if (b.lid > 0) b.lid = Math.max(0, b.lid - dt * 2);

    for (const c of s.coins) {
      if (c.taken || !alive || !overlap(p, c)) continue;
      if (c.kind === 'butt') { c.taken = true; takeButt(s, c.x + 4, c.y - 6); }
      else if (takeBottle(s, c.x + 3, c.y)) { c.taken = true; puff(s, c.x + 3, c.y + 4, 4, '#fff3a0', 30); }
    }

    for (const b of s.loose) {
      b.age += dt;
      if (b.ttl !== Infinity) b.ttl -= dt;
      b.vy = Math.min(b.vy + 700 * dt, 400);
      const hit = moveBody(s, b, dt);
      if (hit.wall) b.vx = -b.vx * 0.5;
      if (b.ground) b.vx *= Math.max(0, 1 - dt * 6);
      if (alive && b.age > 0.3 && overlap(p, b)) {
        if (b.kind === 'butt') { b.gone = true; takeButt(s, b.x + 4, b.y - 4); }
        else if (takeBottle(s, b.x + 3, b.y)) b.gone = true;
      }
      if (b.ttl <= 0 || b.y > s.height + 20) b.gone = true;
    }
    s.loose = s.loose.filter(b => !b.gone);

    for (const it of s.items) {
      if (it.emerge > 0) { it.emerge -= dt; it.y -= (it.h + 1) / 0.5 * dt; continue; }
      it.vy = Math.min(it.vy + 900 * dt, 400);
      const hit = moveBody(s, it, dt);
      if (hit.wall) it.vx = -it.vx || 0;
      if (it.ground && it.type === 'lotty') it.vy = -230;
      if (it.ground && (it.type === 'fruit' || it.type === 'sack')) it.vx = 0;
      if (alive && overlap(p, it) && collectItem(s, it) !== false) it.gone = true;
      if (it.y > s.height + 20) it.gone = true;
    }
    s.items = s.items.filter(i => !i.gone);

    for (const c of s.clouds) {
      c.life -= dt;
      c.r = Math.min(c.max, c.r + 60 * dt);
      for (const e of s.enemies) {
        if (e.alive && e.stun <= 0 && Math.hypot(e.x + e.w / 2 - c.x, e.y + e.h / 2 - c.y) < c.r + 6) {
          e.stun = 4;
          popup(s, e.x + e.w / 2, e.y - 4, 'ZZZ');
        }
      }
    }
    s.clouds = s.clouds.filter(c => c.life > 0);

    const speed = s.day === 6 ? 0.7 : 1;
    for (const e of s.enemies) {
      if (!e.alive) {
        if (e.deadT > 0) { e.deadT -= dt; e.vy += 700 * dt; e.x += e.vx * dt; e.y += e.vy * dt; }
        continue;
      }
      if (!e.active) { if (e.x < s.camX + s.viewW + 40) e.active = true; else continue; }
      if (e.stun > 0) {
        e.stun -= dt;
        if (e.kind === 'boar') { e.vy = Math.min(e.vy + 900 * dt, 400); const d = e.vx; e.vx = 0; moveBody(s, e, dt); e.vx = d; }
      } else if (e.kind === 'boar') updateBoar(s, e, dt, speed);
      else updateMagpie(s, e, dt);
      if (!e.alive || !alive) continue;
      if (e.mode === 'flee' || !overlap(p, e)) continue;
      if (p.boost > 0) defeat(s, e, 'kick');
      else if (p.vy > 0 && p.prevBottom <= e.y + 6) {
        defeat(s, e);
        p.vy = -(e.kind === 'boar' ? 250 : 220);
      } else if (e.stun > 0) continue;
      else if (e.kind === 'magpie' && s.inv.bottles > 0 && p.inv <= 0) {
        s.inv.bottles--;
        e.mode = 'flee'; e.carry = true;
        e.vx = e.x > p.x ? 90 : -90; e.vy = -60;
        p.inv = 0.8;
        sfx(s, 'steal');
        popup(s, p.x + p.w / 2, p.y - 4, '-1');
        tell(s, 'magpie', 'A szarka elcsórt egy palackot!');
      } else hurt(s, DAMAGE[e.kind]);
    }
    s.enemies = s.enemies.filter(e => e.alive || e.deadT > 0);

    for (const q of s.particles) { q.life -= dt; q.vy += (q.g ?? 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    s.particles = s.particles.filter(q => q.life > 0);
    for (const q of s.popups) { q.life -= dt; q.y -= 22 * dt; }
    s.popups = s.popups.filter(q => q.life > 0);
  }

  function updateBoar(s, e, dt, speed) {
    const dir = Math.sign(e.vx) || -1;
    e.vx = dir * 28 * speed;
    e.vy = Math.min(e.vy + 900 * dt, 400);
    const hit = moveBody(s, e, dt);
    let turn = hit.wall;
    if (e.ground && !turn) {
      const fc = Math.floor((dir > 0 ? e.x + e.w + 1 : e.x - 1) / T);
      const fr = Math.floor((e.y + e.h + 1) / T);
      if (!isSolid(s, fc, fr) && tileAt(s, fc, fr) !== '-') turn = true;
    }
    if (turn) e.vx = -dir * 28 * speed;
    e.walk = (e.walk || 0) + dt;
    if (e.y > s.height + 20) e.alive = false;
  }

  function updateMagpie(s, e, dt) {
    const p = s.player;
    e.t += dt;
    e.cool = Math.max(0, e.cool - dt);
    if (e.mode === 'patrol') {
      e.x += e.vx * dt;
      if (Math.abs(e.x - e.baseX) > 56) { e.x = e.baseX + Math.sign(e.x - e.baseX) * 56; e.vx = -e.vx; }
      e.y = e.baseY + Math.sin(e.t * 3) * 6;
      const dx = p.x + p.w / 2 - (e.x + e.w / 2);
      if (s.phase === 'play' && e.cool <= 0 && Math.abs(dx) < 72 && p.y > e.y + 8) {
        const dy = p.y + 6 - e.y, len = Math.hypot(dx, dy) || 1;
        e.mode = 'dive'; e.diveT = 1; e.vx = dx / len * 115; e.vy = dy / len * 115;
      }
    } else if (e.mode === 'dive') {
      e.x += e.vx * dt; e.y += e.vy * dt; e.diveT -= dt;
      if (e.diveT <= 0 || e.y > s.height - 40) { e.mode = 'return'; e.vy = -70; }
    } else if (e.mode === 'return') {
      e.x += e.vx * 0.3 * dt; e.y += e.vy * dt;
      if (e.y <= e.baseY) { e.y = e.baseY; e.mode = 'patrol'; e.cool = 1.5; e.baseX = e.x; e.vx = e.vx > 0 ? 35 : -35; }
    } else if (e.mode === 'flee') {
      e.x += e.vx * dt; e.y += e.vy * dt;
      if (e.y < -30) { e.alive = false; e.deadT = 0; }
    }
  }

  function clampCam(s, x) { return Math.max(0, Math.min(s.width - s.viewW, x)); }

  function update(s, input, dt) {
    s.time += dt;
    s.events.length = 0;
    updatePlayer(s, input, dt);
    updateWorld(s, dt);
    const p = s.player;
    if (s.phase === 'play' || s.phase === 'goal') {
      const target = clampCam(s, p.x + p.w / 2 - s.viewW * 0.42 + p.face * 14);
      s.camX += (target - s.camX) * Math.min(1, dt * 5);
      s.camX = clampCam(s, s.camX);
    }
  }

  // ---------- Jednota és Parlament (a pályák közötti képernyők) ----------
  const Shop = {
    redeem(inv) { const n = inv.bottles; inv.cash += n * PRICES.bottle; inv.bottles = 0; return n; },
    buyWine(inv) { if (inv.cash < PRICES.wine) return false; inv.cash -= PRICES.wine; inv.wine++; return true; },
    buyPaper(inv) { if (inv.cash < PRICES.paper) return false; inv.cash -= PRICES.paper; inv.paper++; return true; },
    buyBigBag(inv) { if (inv.cash < PRICES.bigBag || inv.capacity > 12) return false; inv.cash -= PRICES.bigBag; inv.capacity = 20; return true; },
  };
  const Parliament = {
    deliver(inv) { const n = Math.min(inv.wine, GOAL_WINE - inv.delivered); if (n <= 0) return 0; inv.wine -= n; inv.delivered += n; return n; },
    roll(inv) { if (inv.butts < 5 || inv.paper < 1) return false; inv.butts -= 5; inv.paper--; inv.cigs++; return true; },
    offerCig(inv) { if (inv.cigs < 1) return false; inv.cigs--; inv.rolled++; return true; },
    rest(inv) { inv.energy = 100; },
    won(inv) { return inv.delivered >= GOAL_WINE; },
  };

  CS.Engine = { T, ROWS, DAYS, DAY_NOTES, PHYS, PRICES, GOAL_WINE, createGame, update, newInventory, Shop, Parliament, respawn, isSolid, tileAt, key };
})(typeof window !== 'undefined' ? (window.CS = window.CS || {}) : (globalThis.CS = globalThis.CS || {}));
