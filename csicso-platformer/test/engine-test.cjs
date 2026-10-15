'use strict';
// Futtatás: node test/engine-test.cjs
// A játéklogikát böngésző nélkül ellenőrzi: pályaformátum, fizika, szatyor férőhelye, kukák és naptár,
// rekeszek, sérülés és palackszóródás, kidőlés, ellenfelek, füst, kút, Jednota-bolt, Parlament,
// és hogy mindkét pálya végigjátszható.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ctx = { Math, console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['levels.js', 'engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f });
const { Engine: E, LEVELS } = ctx.CS;
const T = E.T;
const idle = () => ({ left: false, right: false, run: false, jump: false, jumpPressed: false, smokePressed: false });
const step = (s, input, seconds) => { for (let i = 0; i < seconds * 120; i++) { E.update(s, input, 1 / 120); input.jumpPressed = false; input.smokePressed = false; } };
const passed = [];
const test = (name, fn) => { fn(); passed.push(name); };
const [L1, L2] = LEVELS;
const game = (level, opts = {}) => E.createGame(level, Object.assign({ day: 0, inv: E.newInventory() }, opts));
const loot = s => s.inv.bottles + s.loose.filter(b => b.kind === 'bottle').length;

test('pályaformátum', () => {
  for (const L of LEVELS) {
    assert.strictEqual(L.rows.length, E.ROWS, L.id + ': 12 sor kell');
    const w = L.rows[0].length;
    L.rows.forEach((r, i) => assert.strictEqual(r.length, w, L.id + ': a(z) ' + i + '. sor hossza eltér'));
    const all = L.rows.join('');
    assert.strictEqual(all.split('P').length - 1, 1, L.id + ': pontosan egy P');
    assert.strictEqual(all.split('J').length - 1, 1, L.id + ': pontosan egy J');
    assert.strictEqual(all.split('T').length - 1, L.signs.length, L.id + ': minden táblának van szövege');
    assert.ok(/^[.#=\-?$SLUknoczbmCTPJB]+$/.test(all), L.id + ': ismeretlen jel a pályán');
    assert.ok(L.goal === 'J' || L.goal === 'P');
  }
});

test('gravitáció és talaj', () => {
  const s = game(L1);
  step(s, idle(), 1);
  assert.ok(s.player.ground, 'áll a földön');
  assert.strictEqual(s.player.y + s.player.h, 10 * T);
});

test('mozgás, ugrás, fal', () => {
  const s = game(L1);
  step(s, idle(), 0.5);
  const x0 = s.player.x;
  step(s, { ...idle(), right: true }, 0.5);
  assert.ok(s.player.x > x0 + 20, 'jobbra halad');
  E.update(s, { ...idle(), jump: true, jumpPressed: true }, 1 / 120);
  assert.ok(s.player.vy < -300, 'elugrik');
  const s2 = game(L1);
  s2.player.x = 25 * T; s2.player.y = 10 * T - 22;
  step(s2, { ...idle(), right: true }, 1.5);
  assert.ok(s2.player.x + s2.player.w <= 27 * T + 0.01, 'a fal megállít');
});

test('palack és csikk felvétele, tele szatyor', () => {
  const s = game(L1);
  const bottle = s.coins.find(c => c.kind === 'bottle'), butt = s.coins.find(c => c.kind === 'butt');
  s.player.x = butt.x; s.player.y = 10 * T - 22;
  step(s, idle(), 0.1);
  assert.strictEqual(s.inv.butts, 1, 'csikk felvéve');
  s.inv.bottles = 12;
  s.player.x = bottle.x - 2; s.player.y = bottle.y - 6;
  step(s, idle(), 0.05);
  assert.strictEqual(s.inv.bottles, 12, 'tele szatyorba nem fér');
  assert.ok(!bottle.taken, 'a palack a helyén marad');
  s.inv.bottles = 11;
  s.player.x = bottle.x - 2; s.player.y = bottle.y - 6;
  step(s, idle(), 0.05);
  assert.strictEqual(s.inv.bottles, 12);
});

function stompBinAt(day, c) {
  const s = game(L1, { day });
  const bin = s.bins[E.key(c, 9)];
  s.player.x = c * T + 3; s.player.y = 9 * T - 60; s.player.vy = 50;
  step(s, idle(), 0.6);
  return { s, bin };
}

test('kék kuka a naptár szerint, palack és csikk', () => {
  const mon = stompBinAt(0, 23);
  assert.ok(mon.bin.used, 'kinyílt');
  assert.strictEqual(loot(mon.s), 2, 'hétfőn 2 palack');
  assert.strictEqual(mon.s.inv.butts + mon.s.loose.filter(b => b.kind === 'butt').length, 1, 'és 1 csikk');
  assert.strictEqual(loot(stompBinAt(3, 23).s), 4, 'csütörtökön 4 palack');
  assert.strictEqual(loot(stompBinAt(4, 23).s), 0, 'pénteken üres');
});

test('BIO-kuka: kedden erjedt gyümölcs, szerdán üres', () => {
  const tue = stompBinAt(1, 56);
  assert.ok(tue.s.items.some(i => i.type === 'fruit') || tue.s.player.tipsy > 0, 'kedden gyümölcs');
  assert.strictEqual(loot(stompBinAt(2, 56).s), 0);
});

test('sárgazsák csak szombaton', () => {
  assert.strictEqual(game(L1, { day: 5 }).items.filter(i => i.type === 'sack').length, 3);
  assert.strictEqual(game(L1, { day: 0 }).items.filter(i => i.type === 'sack').length, 0);
});

test('rekeszek: palack és cigipapír', () => {
  const s = game(L1);
  s.player.x = 17 * T + 3; s.player.y = 10 * T - 22;
  step(s, idle(), 0.2);
  E.update(s, { ...idle(), jump: true, jumpPressed: true }, 1 / 120);
  step(s, { ...idle(), jump: true }, 0.6);
  assert.strictEqual(s.inv.bottles, 1);
  assert.ok(s.blocks[E.key(17, 6)].used);
  const paper = s.inv.paper;
  // a 32. oszlop rekesze (S) alá állunk
  s.player.x = 32 * T + 3; s.player.y = 10 * T - 22;
  step(s, idle(), 0.2);
  E.update(s, { ...idle(), jump: true, jumpPressed: true }, 1 / 120);
  step(s, { ...idle(), jump: true }, 0.6);
  assert.strictEqual(s.inv.paper, paper + 1, 'cigipapír a rekeszből');
});

test('sérülés: erőnlét fogy, palackok szóródnak', () => {
  const s = game(L1);
  s.inv.bottles = 6;
  const boar = s.enemies.find(e => e.kind === 'boar');
  s.player.x = boar.x - 12; s.player.y = 10 * T - 22; boar.active = true;
  step(s, { ...idle(), right: true }, 0.5);
  assert.strictEqual(s.inv.energy, 70, 'erőnlét -30');
  assert.strictEqual(loot(s), 6, 'a palackok szétszóródtak, nem tűntek el');
  boar.alive = false;
  step(s, idle(), 5);
  assert.ok(s.loose.every(b => b.ttl === Infinity), 'a szétszórt palackok eltűnnek');
  assert.strictEqual(s.phase, 'play');
});

test('kidőlés és csatorna: vissza az ellenőrzőpontra', () => {
  const s = game(L1);
  s.inv.energy = 20;
  s.player.x = 41 * T + 4; s.player.y = 10 * T - 22;
  step(s, idle(), 0.6);
  assert.strictEqual(s.phase, 'dying', 'csatornába esett');
  step(s, idle(), 1.5);
  assert.strictEqual(s.phase, 'play');
  assert.strictEqual(s.inv.energy, 100, 'kidőlés után a kútnál magához tér');
  s.player.x = 41 * T + 4; s.player.y = 10 * T - 22;
  step(s, idle(), 2);
  assert.strictEqual(s.inv.energy, 75, 'csatorna: -25 erőnlét');
});

test('vaddisznó rátaposva', () => {
  const s = game(L1);
  const boar = s.enemies.find(e => e.kind === 'boar');
  boar.active = true;
  s.player.x = boar.x + 4; s.player.y = boar.y - 40; s.player.vy = 100;
  step(s, idle(), 0.3);
  assert.strictEqual(boar.alive, false);
  assert.strictEqual(s.inv.energy, 100);
});

test('szarka palackot lop', () => {
  const s = game(L1);
  s.inv.bottles = 3;
  const m = s.enemies.find(e => e.kind === 'magpie');
  m.active = true;
  s.player.x = m.x; s.player.y = m.y + 2; s.player.vy = -10;
  step(s, idle(), 1 / 60);
  assert.strictEqual(s.inv.bottles, 2);
  assert.strictEqual(m.mode, 'flee');
});

test('sodrás füstje elkábít', () => {
  const s = game(L1);
  s.inv.cigs = 1;
  const boar = s.enemies.find(e => e.kind === 'boar');
  boar.active = true;
  s.player.x = boar.x - 24; s.player.y = 10 * T - 22; s.player.face = 1;
  step(s, idle(), 0.05);
  E.update(s, { ...idle(), smokePressed: true }, 1 / 120);
  step(s, idle(), 0.6);
  assert.strictEqual(s.inv.cigs, 0);
  assert.ok(boar.stun > 0, 'a vaddisznó elkábult');
  const x = boar.x;
  step(s, idle(), 1);
  assert.ok(Math.abs(boar.x - x) < 0.5, 'kábultan nem mozdul');
});

test('Gyanús lötty, utána józanodás', () => {
  const s = game(L1);
  s.items.push({ type: 'lotty', x: s.player.x, y: s.player.y, w: 8, h: 11, vx: 0, vy: 0, emerge: 0 });
  step(s, idle(), 0.1);
  assert.ok(s.player.boost > 19);
  step(s, idle(), 20);
  assert.ok(s.player.boost === 0 && s.player.hang > 0, 'lassulás jön');
});

test('kút: ellenőrzőpont és erőnlét', () => {
  const s = game(L1);
  s.inv.energy = 40;
  s.player.x = 81 * T; s.player.y = 10 * T - 22;
  step(s, idle(), 0.2);
  assert.ok(s.checkpoint.x > 81 * T);
  assert.strictEqual(s.inv.energy, 100);
});

test('Jednota: visszaváltás és vásárlás', () => {
  const v = E.newInventory();
  v.bottles = 11;
  assert.strictEqual(E.Shop.redeem(v), 11);
  assert.strictEqual(v.cash, 165);
  assert.ok(E.Shop.buyWine(v)); assert.strictEqual(v.cash, 90);
  assert.ok(E.Shop.buyPaper(v)); assert.strictEqual(v.cash, 75);
  assert.ok(E.Shop.buyBigBag(v)); assert.strictEqual(v.capacity, 20); assert.strictEqual(v.cash, 15);
  assert.ok(!E.Shop.buyBigBag(v), 'nagy szatyor csak egyszer');
  assert.ok(!E.Shop.buyWine(v), 'pénz nélkül nincs csucsó');
});

test('Parlament: leadás, sodrás, győzelem', () => {
  const v = E.newInventory();
  v.wine = 4; v.butts = 6; v.paper = 1;
  assert.strictEqual(E.Parliament.deliver(v), 3);
  assert.strictEqual(v.wine, 1, 'csak 3 kell');
  assert.ok(E.Parliament.won(v));
  assert.ok(E.Parliament.roll(v)); assert.strictEqual(v.cigs, 1); assert.strictEqual(v.butts, 1);
  assert.ok(!E.Parliament.roll(v), 'nincs elég csikk');
  assert.ok(E.Parliament.offerCig(v)); assert.strictEqual(v.rolled, 1);
});

test('cél: 1-1 a Jednotánál, 1-2 a Parlamentnél', () => {
  const s1 = game(L1);
  s1.player.x = 178 * T; s1.player.y = 10 * T - 22;
  const events = [];
  for (let i = 0; i < 480 && s1.phase !== 'done'; i++) { E.update(s1, { ...idle(), right: true }, 1 / 120); events.push(...s1.events); }
  assert.strictEqual(s1.phase, 'done');
  assert.ok(events.some(e => e.t === 'goal' && e.at === 'J'));
  const s2 = game(L2);
  assert.ok(s2.player.x > 8 * T && s2.player.x < 12 * T, '1-2 a Jednota mellől indul');
  s2.player.x = 176 * T; s2.player.y = 10 * T - 22;
  const ev2 = [];
  for (let i = 0; i < 480 && s2.phase !== 'done'; i++) { E.update(s2, { ...idle(), right: true }, 1 / 120); ev2.push(...s2.events); }
  assert.ok(ev2.some(e => e.t === 'goal' && e.at === 'P'));
});

function robot(level) {
  // Egyszerű robot: fut jobbra, ugrik fal vagy szakadék előtt. Sérthetetlen, hogy csak a pálya alakját mérje.
  const s = game(level);
  const input = { ...idle(), right: true, run: true };
  let jumpHold = 0, lastX = 0, stuck = 0;
  for (let i = 0; i < 120 * 150 && s.phase !== 'done'; i++) {
    const p = s.player;
    p.boost = 99; p.hang = 0;
    const front = p.x + p.w + 6, feetRow = Math.floor((p.y + p.h - 1) / T);
    const wall = E.isSolid(s, Math.floor(front / T), feetRow) || E.isSolid(s, Math.floor(front / T), feetRow - 1);
    const gap = !E.isSolid(s, Math.floor((p.x + p.w + 14) / T), feetRow + 1) && E.tileAt(s, Math.floor((p.x + p.w + 14) / T), feetRow + 1) !== '-';
    if (p.ground && (wall || gap || stuck > 60)) { input.jumpPressed = true; jumpHold = 0.35; stuck = 0; }
    input.jump = jumpHold > 0; jumpHold -= 1 / 120;
    E.update(s, input, 1 / 120);
    input.jumpPressed = false;
    if (Math.abs(p.x - lastX) < 0.05) stuck++; else stuck = 0;
    lastX = p.x;
  }
  assert.strictEqual(s.phase, 'done', level.id + ': a robot nem ért célba, oszlop=' + Math.round(s.player.x / T));
}
test('az 1-1 végigjátszható', () => robot(L1));
test('az 1-2 végigjátszható', () => robot(L2));

console.log('PASS: ' + passed.join(', ') + '.');
