'use strict';
// Pixeles szereplők és tárgyak. A betűs rajzokban minden karakter egy pont,
// a színeket a PAL táblázat adja ('.' = átlátszó). Ezeket szabadon át lehet rajzolni.
(function (CS) {
  const PAL = {
    k: '#1a1410', g: '#7da23a', G: '#55752a', w: '#ecebe0', b: '#2c4b8e', W: '#dfe3ee', s: '#3a3431', c: '#f4f1e6', o: '#ff7a26',
    d: '#6e4b32', D: '#4a3222', p: '#dd9a8c', y: '#e0b64a', e: '#2f7d3a', l: '#9bd88f',
    E: '#1d3b22', r: '#b0302a', v: '#9be04a', V: '#e6ff9a', a: '#a8642c', A: '#d9a060', M: '#6b7d3a',
    Y: '#fff08a', Z: '#f2cf2c', q: '#2a3f6a', n: '#f7f7f2', R: '#8b1e1e',
  };

  const ORK_TOP = [
    '......kkkkk.....', '.....kgggggk....', '...kkgggggggk...', '..kgkgggggwkgk..', '...kkggggggGkcco', '....kggggwgGk...',
    '....kkggggkk....', '...kkwwwwwwkk...', '..kgkwwwwwwkgk..', '..kgkwwwwwwkgk..', '..kgkwwwwwwkgk..', '..kgkwwwwwwkgk..',
    '..kGkwwwwwwkGk..', '..kggkwwwwkggk..', '...kkbbbbbbkk...', '....kbbbbbbk....',
  ];
  const LEG_STAND = ['....kbWkkWbk....', '....kbWkkWbk....', '....kbWkkWbk....', '....kbWkkWbk....', '....kbbkkbbk....', '....kggkkggk....', '...ksssk.ksssk..', '...kkkkk.kkkkk..'];
  const LEG_WALK = ['....kbWkkWbk....', '...kbWk..kWbk...', '...kbWk...kWbk..', '..kbWk....kWbk..', '..kbbk.....kbbk.', '..kggk.....kggk.', '.ksssk.....ksssk', '.kkkkk.....kkkkk'];
  const LEG_JUMP = ['....kbWkkWbk....', '...kbWkk.kWbk...', '..kbWk....kbbk..', '..kbbk....kggk..', '..kggk...ksssk..', '.ksssk...kkkkk..', '.kkkkk..........', '................'];
  const ORK_SKINS = {
    normal: {},
    pale: { g: '#a9b98a', G: '#7f8f62' },
    glowA: { g: '#c6ff5a', G: '#8fd13a', w: '#fff6a0', b: '#6a3fc0' },
    glowB: { g: '#7ff0d0', G: '#3fb8a0', w: '#ffd0f0', b: '#c03f8a' },
  };

  const BOAR_TOP = [
    '......kk.kkkkkk.....', '.....kDkkDDDDDDkk...', '...kkddddddddddddk..', '..kdwkdddddddddddk..', '.kdddddddddddddddkk.',
    'kpkddddddddddddddkDk', 'kppwddddddddddddddk.', '.kkkddddddddddddddk.', '...kddkkkkkkkkdddk..',
  ];
  const MAGPIE_UP = ['........k.......', '.......kk.......', '......kWk.......', '.kkk.kWWk.......', 'kkwkkkkkkkkqqqq.', '.kkkWWWkkkqqqqqq', '...kWWWWkk......', '....kkkk........'];
  const MAGPIE_DOWN = ['................', '................', '................', '.kkk............', 'kkwkkkkkkkkqqqq.', '.kkkWWWkkkqqqqqq', '...kWWWkkk......', '....kWWk........'];

  const ITEMS = {
    bottle: ['.kyk.', '.kek.', '.kek.', 'keeek', 'kelek', 'kelek', 'keeek', 'keeek', '.kkk.'],
    bottle2: ['.kyk.', '.kek.', '.kek.', 'keeek', 'keelk', 'keelk', 'keeek', 'keeek', '.kkk.'],
    csucso: ['..kk..', '..RR..', '..kk..', '..EE..', '.kEEk.', 'kEEEEk', 'kEEEEk', 'kccccK', 'kcrrck', 'kccccK', 'kEEEEk', 'kEEEEk', 'kEEEEk', '.kkkk.'],
    bag: ['..k..k....', '.k.kk.k...', '.k.kk.k...', 'kkkkkkkkk.', 'kcccccccck', 'kcceeecck.', 'kcecccecck', 'kcceccecck', 'kcccceccck', 'kcceeeccck', 'kcccccccck', '.kkkkkkkk.'],
    lotty: ['...kk...', '...DD...', '..kvvk..', '..kvvk..', '.kvvvvk.', 'kvVvvvvk', 'kvVvvVvk', 'kvvvVvvk', 'kvvvvvvk', '.kvvvvk.', '..kkkk..'],
    fruit: ['...kD...', '..kkkk..', '.kaaaAk.', 'kaaAaaak', 'kaaaaaak', 'kaaaaMak', '.kaaaak.', '..kkkk..'],
    sack: ['.....kk.......', '....kYYk......', '.....kk.......', '....kZZk......', '...kZZZZk.....', '..kZZZZZZk....', '.kZZYZZZZZk...', 'kZZZYZZZZZZk..', 'kZZZZZZZZYZk..', 'kZZZZZZZZZZk..', 'kZZZZZZZZZZk..', 'kZZZZZZZZZZk..', '.kZZZZZZZZk...', '..kkkkkkkk....'],
    handBag: ['.k.k...', 'k.k.k..', 'kccccK.', 'kcccccK', 'kceeecK', 'kcecccK', 'kceeecK', 'kcccccK', '.kkkkk.'],
  };
  ITEMS.csucso = ITEMS.csucso.map(r => r.replace(/K/g, 'k'));
  ITEMS.handBag = ITEMS.handBag.map(r => r.replace(/K/g, 'k'));

  // 3×5-ös pontbetűk a lebegő számokhoz és a táblákhoz.
  const FONT = {
    '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'], '2': ['111', '001', '111', '100', '111'],
    '3': ['111', '001', '111', '001', '111'], '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
    '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'], '8': ['111', '101', '111', '101', '111'],
    '9': ['111', '101', '111', '001', '111'], '+': ['000', '010', '111', '010', '000'], '-': ['000', '000', '111', '000', '000'],
    C: ['111', '100', '100', '100', '111'], O: ['111', '101', '101', '101', '111'], P: ['111', '101', '111', '100', '100'],
    A: ['010', '101', '111', '101', '101'], R: ['110', '101', '110', '101', '101'], L: ['100', '100', '100', '100', '111'],
    M: ['10001', '11011', '10101', '10001', '10001'], E: ['111', '100', '110', '100', '111'], N: ['1001', '1101', '1011', '1001', '1001'],
    T: ['111', '010', '010', '010', '010'], B: ['110', '101', '110', '101', '110'], I: ['1', '1', '1', '1', '1'], U: ['101', '101', '101', '101', '111'],
    S: ['111', '100', '111', '001', '111'], Z: ['111', '001', '010', '100', '111'], ' ': ['0', '0', '0', '0', '0'],
  };
  function pixelText(ctx, str, x, y, color) {
    ctx.fillStyle = color;
    for (const ch of str) {
      const g = FONT[ch];
      if (!g) { x += 3; continue; }
      g.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '1') ctx.fillRect(x + i, y + j, 1, 1); });
      x += g[0].length + 1;
    }
  }
  function textWidth(str) { let w = 0; for (const ch of str) w += (FONT[ch] ? FONT[ch][0].length : 2) + 1; return w - 1; }

  function make(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    draw(ctx, (x, y, ww, hh, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, ww, hh); });
    return c;
  }
  function fromRows(rows, over) {
    const pal = Object.assign({}, PAL, over);
    const w = Math.max(...rows.map(r => r.length));
    return make(w, rows.length, (ctx, R) => rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (pal[row[i]]) R(i, j, 1, 1, pal[row[i]]);
    }));
  }

  let seed = 1;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

  function grassTile(v) {
    seed = 100 + v;
    return make(16, 16, (ctx, R) => {
      R(0, 0, 16, 16, '#8b6a45');
      for (let i = 0; i < 10; i++) R(Math.floor(rnd() * 16), 5 + Math.floor(rnd() * 11), 1 + Math.floor(rnd() * 2), 1, rnd() < 0.5 ? '#a8865e' : '#6d5234');
      R(0, 0, 16, 3, '#6fb13d');
      R(0, 0, 16, 1, '#8fcd5a');
      for (let i = 0; i < 16; i++) R(i, 3, 1, 1 + Math.floor(rnd() * 2), '#4e8a2e');
      for (let i = 0; i < 16; i += 2 + Math.floor(rnd() * 3)) R(i, 0, 1, 1, '#b2e07a');
    });
  }
  function dirtTile(v) {
    seed = 200 + v;
    return make(16, 16, (ctx, R) => {
      R(0, 0, 16, 16, '#7f603d');
      for (let i = 0; i < 12; i++) R(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 1 + Math.floor(rnd() * 2), 1, rnd() < 0.5 ? '#9a7a52' : '#634a2e');
    });
  }
  function stoneTile() {
    return make(16, 16, (ctx, R) => {
      R(0, 0, 16, 16, '#b9a582');
      R(0, 0, 16, 1, '#d8c7a0');
      R(0, 7, 16, 1, '#7d6a4f'); R(0, 15, 16, 1, '#7d6a4f');
      R(7, 0, 1, 7, '#7d6a4f'); R(3, 8, 1, 7, '#7d6a4f'); R(12, 8, 1, 7, '#7d6a4f');
      R(1, 1, 5, 1, '#cdbb94'); R(9, 1, 6, 1, '#cdbb94'); R(5, 9, 6, 1, '#cdbb94');
      R(15, 0, 1, 16, '#9c8866');
    });
  }
  function plankTile() {
    return make(16, 6, (ctx, R) => {
      R(0, 0, 16, 5, '#a06a3a'); R(0, 0, 16, 1, '#c48a50'); R(0, 4, 16, 1, '#5a3820');
      R(2, 2, 1, 1, '#3a2414'); R(13, 2, 1, 1, '#3a2414'); R(7, 1, 3, 1, '#8a5a30');
      R(1, 5, 2, 1, '#5a3820'); R(13, 5, 2, 1, '#5a3820');
    });
  }
  function crate(used) {
    return make(16, 16, (ctx, R) => {
      R(0, 3, 16, 13, '#1a1410');
      R(1, 4, 14, 11, used ? '#6b5a4a' : '#c8412f');
      R(1, 4, 14, 1, used ? '#86725e' : '#e0634a');
      R(1, 13, 14, 2, used ? '#524438' : '#9a2e20');
      R(0, 8, 1, 3, used ? '#6b5a4a' : '#9a2e20'); R(15, 8, 1, 3, used ? '#6b5a4a' : '#9a2e20');
      if (!used) {
        for (let i = 0; i < 4; i++) { const x = 1 + i * 4; R(x, 0, 2, 1, '#e0b64a'); R(x, 1, 2, 3, '#2f7d3a'); R(x, 1, 1, 2, '#6fbf6a'); }
        const q = ['.###.', '#...#', '....#', '..##.', '..#..', '.....', '..#..'];
        q.forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === '#') R(5 + i, 5 + j, 1, 1, '#ffe9a8'); });
      } else {
        R(3, 7, 10, 1, '#524438'); R(3, 10, 10, 1, '#524438');
      }
    });
  }
  function binBody(type) {
    const bio = type === 'n';
    const col = bio ? { f: '#7a4e2c', h: '#a0714a', r: '#5e3b1f' } : { f: '#2f63b8', h: '#5b93dc', r: '#244f96' };
    return make(16, 13, (ctx, R) => {
      R(1, 0, 14, 11, '#1a1410');
      R(2, 0, 12, 10, col.f);
      R(3, 0, 1, 10, col.h);
      R(6, 1, 1, 8, col.r); R(10, 1, 1, 8, col.r);
      if (bio) pixelText(ctx, 'BIO', 4, 3, '#f2ead8');
      R(1, 11, 14, 1, '#1a1410');
      R(3, 11, 2, 2, '#1a1410'); R(11, 11, 2, 2, '#1a1410');
    });
  }
  function binLid(type) {
    const c = type === 'n' ? '#5e3b1f' : '#2b5fae';
    return make(16, 3, (ctx, R) => { R(2, 0, 12, 1, '#1a1410'); R(1, 1, 14, 1, c); R(0, 2, 16, 1, '#1a1410'); R(1, 1, 1, 1, '#1a1410'); R(14, 1, 1, 1, '#1a1410'); });
  }

  // ---------- díszletek (épületek) ----------
  function parliament() {
    return make(68, 58, (ctx, R) => {
      R(9, 20, 3, 38, '#8a5a30'); R(9, 20, 1, 38, '#5a3820'); R(57, 20, 3, 38, '#8a5a30'); R(59, 20, 1, 38, '#5a3820');
      for (let r = 0; r < 18; r++) { const hw = Math.round(8 + r * 1.75); R(34 - hw, 2 + r, hw * 2, 1, r % 3 === 2 ? '#35343d' : '#4b4a55'); }
      R(2, 19, 64, 2, '#8a5a30'); R(2, 21, 64, 1, '#5a3820');
      R(13, 23, 42, 10, '#a06a3a'); R(13, 23, 42, 1, '#c48a50'); R(13, 32, 42, 1, '#5a3820');
      pixelText(ctx, 'PARLAMENT', 15, 25, '#2a190c');
      R(21, 43, 26, 3, '#9a6536'); R(21, 43, 26, 1, '#c08250'); R(23, 46, 2, 12, '#6e4524'); R(43, 46, 2, 12, '#6e4524');
      R(15, 50, 38, 2, '#8a5a30'); R(16, 52, 2, 6, '#5a3820'); R(50, 52, 2, 6, '#5a3820');
      R(31, 37, 2, 1, '#1a1410'); R(30, 38, 4, 5, '#2f7d3a'); R(31, 39, 1, 3, '#9bd88f');
      R(38, 42, 4, 1, '#9aa1a8');
    });
  }
  function jednota() {
    return make(132, 48, (ctx, R) => {
      R(2, 2, 128, 46, '#efece2'); R(2, 44, 128, 4, '#d4cfc0'); R(0, 0, 132, 3, '#8e897d');
      R(2, 4, 128, 5, '#e2782a'); R(2, 9, 128, 1, '#b85c1c');
      R(36, 11, 36, 9, '#c63a2a'); R(36, 11, 36, 1, '#e0594a'); pixelText(ctx, 'COOP', 47, 13, '#ffffff');
      for (let i = 0; i < 5; i++) { const x = 8 + i * 18; R(x, 23, 14, 15, '#2e4660'); R(x, 23, 14, 1, '#e2782a'); R(x + 2, 25, 1, 4, '#7e9dbd'); R(x + 3, 24, 1, 2, '#7e9dbd'); }
      R(100, 16, 24, 32, '#e2782a'); R(102, 18, 20, 30, '#3b566f'); R(111, 18, 2, 30, '#e2782a'); R(104, 20, 1, 8, '#86a5c2'); R(115, 20, 1, 8, '#86a5c2');
      R(100, 12, 24, 3, '#2f7d3a'); R(100, 12, 24, 1, '#4f9d4a');
    });
  }
  function shelter() {
    return make(48, 48, (ctx, R) => {
      R(0, 0, 48, 4, '#5e636b'); R(0, 0, 48, 1, '#8a9099'); R(0, 4, 48, 1, '#3a3e44');
      R(2, 5, 2, 43, '#6f757d'); R(44, 5, 2, 43, '#6f757d'); R(2, 5, 1, 43, '#8a9099');
      R(5, 8, 38, 26, '#a9cbd9'); R(5, 8, 38, 1, '#d6ebf2'); R(10, 10, 1, 8, '#e4f3f8'); R(11, 9, 1, 3, '#e4f3f8'); R(30, 12, 1, 10, '#c8e2ec');
      R(8, 36, 32, 2, '#8a5a30'); R(8, 36, 32, 1, '#b07a45'); R(10, 38, 2, 10, '#555a61'); R(36, 38, 2, 10, '#555a61');
      R(4, 6, 8, 8, '#2f7d3a'); R(5, 7, 6, 4, '#f2f2e6'); R(6, 11, 1, 1, '#1a1410'); R(9, 11, 1, 1, '#1a1410');
    });
  }
  function well() {
    return make(20, 26, (ctx, R) => {
      R(4, 2, 9, 24, '#a9a293'); R(4, 2, 9, 1, '#c8c2b3'); R(4, 2, 1, 24, '#c8c2b3'); R(12, 2, 1, 24, '#7e7768');
      R(4, 9, 9, 1, '#7e7768'); R(4, 16, 9, 1, '#7e7768'); R(8, 3, 1, 6, '#7e7768'); R(6, 10, 1, 6, '#7e7768');
      R(3, 0, 11, 3, '#8e877a'); R(13, 8, 5, 2, '#6f6f6f'); R(17, 8, 1, 3, '#6f6f6f');
      R(12, 21, 8, 5, '#8a8478'); R(13, 22, 6, 2, '#4f8fc0');
    });
  }
  function sign() {
    return make(16, 16, (ctx, R) => {
      R(7, 7, 2, 9, '#6e4524'); R(1, 1, 14, 7, '#a06a3a'); R(1, 1, 14, 1, '#c48a50'); R(1, 7, 14, 1, '#5a3820');
      R(3, 3, 9, 1, '#3a2414'); R(3, 5, 6, 1, '#3a2414');
    });
  }

  CS.pixelText = pixelText;
  CS.pixelTextWidth = textWidth;
  CS.buildSprites = function () {
    const S = { ork: {} };
    for (const [name, over] of Object.entries(ORK_SKINS)) {
      S.ork[name] = {
        stand: fromRows(ORK_TOP.concat(LEG_STAND), over),
        walk: fromRows(ORK_TOP.concat(LEG_WALK), over),
        jump: fromRows(ORK_TOP.concat(LEG_JUMP), over),
      };
    }
    S.boar = [
      fromRows(BOAR_TOP.concat(['...kdk.kdk..kdk.kdk.', '...kkk.kkk..kkk.kkk.'])),
      fromRows(BOAR_TOP.concat(['..kdk..kdk.kdk..kdk.', '..kkk..kkk.kkk..kkk.'])),
    ];
    S.magpie = [fromRows(MAGPIE_UP), fromRows(MAGPIE_DOWN)];
    for (const [k, rows] of Object.entries(ITEMS)) S[k] = fromRows(rows);
    S.grass = [0, 1, 2, 3].map(grassTile);
    S.dirt = [0, 1, 2].map(dirtTile);
    S.stone = stoneTile();
    S.plank = plankTile();
    S.crate = crate(false);
    S.crateUsed = crate(true);
    S.bin = { k: binBody('k'), n: binBody('n') };
    S.lid = { k: binLid('k'), n: binLid('n') };
    S.decor = { parliament: parliament(), jednota: jednota(), shelter: shelter(), well: well(), sign: sign() };
    return S;
  };
})(window.CS = window.CS || {});
