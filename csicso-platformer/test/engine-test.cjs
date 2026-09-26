'use strict';
// Futtatás: node test/engine-test.cjs
// A játéklogikát böngésző nélkül ellenőrzi: pályaformátum, fizika, kukák és naptár,
// rekeszek, sérülés és palackszóródás, ellenfelek, ellenőrzőpont, cél, és hogy a pálya végigjátszható.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ctx = { window: {}, Math, console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['levels.js', 'engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f });
const { Engine: E, LEVELS } = ctx.CS;
const T = E.T;
const idle = () => ({ left: false, right: false, run: false, jump: false, jumpPressed: false });
const step = (s, input, seconds) => { for (let i = 0; i < seconds * 120; i++) { E.update(s, input, 1 / 120); input.jumpPressed = false; } };
const passed = [];
const test = (name, fn) => { fn(); passed.push(name); };

test('pályaformátum', () => {
  for (const L of LEVELS) {
    assert.strictEqual(L.rows.length, E.ROWS, L.id + ': 12 sor kell');
    const w = L.rows[0].length;
    L.rows.forEach((r, i) => assert.strictEqual(r.length, w, L.id + ': a(z) ' + i + '. sor hossza eltér'));
    const all = L.rows.join('');
    assert.strictEqual(all.split('P').length - 1, 1, 'pontosan egy P');
    assert.strictEqual(all.split('J').length - 1, 1, 'pontosan egy J');
    assert.strictEqual(all.split('T').length - 1, L.signs.length, 'minden táblának van szövege');
    assert.ok(/^[.#=\-?$SLUknozbmCTPJB]+$/.test(all), 'ismeretlen jel a pályán');
  }
});

const level = LEVELS[0];

test('gravitáció és talaj', () => {
  const s = E.createGame(level, { day: 0 });
  step(s, idle(), 1);
  assert.ok(s.player.ground, 'áll a földön');
  assert.strictEqual(s.player.y + s.player.h, 10 * T);
});

test('mozgás, ugrás, fal', () => {
  const s = E.createGame(level, { day: 0 });
  step(s, idle(), 0.5);
  const x0 = s.player.x;
  step(s, { ...idle(), right: true }, 0.5);
  assert.ok(s.player.x > x0 + 20, 'jobbra halad');
  const i = { ...idle(), jump: true, jumpPressed: true };
  E.update(s, i, 1 / 120);
  assert.ok(s.player.vy < -300, 'elugrik');
  // alacsony fal (27. oszlop) megállít
  const s2 = E.createGame(level, { day: 0 });
  s2.player.x = 25 * T; s2.player.y = 10 * T - 22;
  step(s2, { ...idle(), right: true }, 1.5);
  assert.ok(s2.player.x + s2.player.w <= 27 * T + 0.01, 'a fal megállít');
});

function stompBinAt(day, c) {
  const s = E.createGame(level, { day });
  const bin = s.bins[E.key(c, 9)];
  s.player.x = c * T + 3; s.player.y = 9 * T - 60; s.player.vy = 50;
  step(s, idle(), 0.6);
  return { s, bin };
}

test('kék kuka a naptár szerint', () => {
  const mon = stompBinAt(0, 23);
  assert.ok(mon.bin.used, 'kinyílt');
  const n = mon.s.loose.length + mon.s.bottles;
  assert.strictEqual(n, 2, 'hétfőn 2 palack');
  const thu = stompBinAt(3, 23);
  assert.strictEqual(thu.s.loose.length + thu.s.bottles, 4, 'csütörtökön 4 palack');
  const fri = stompBinAt(4, 23);
  assert.strictEqual(fri.s.loose.length + fri.s.bottles, 0, 'pénteken üres');
});

test('BIO-kuka: kedden erjedt gyümölcs, szerdán üres', () => {
  const tue = stompBinAt(1, 56);
  assert.ok(tue.s.items.some(i => i.type === 'fruit') || tue.s.player.tipsy > 0, 'kedden gyümölcs');
  const wed = stompBinAt(2, 56);
  assert.strictEqual(wed.s.loose.length + wed.s.bottles, 0);
});

test('sárgazsák csak szombaton', () => {
  assert.strictEqual(E.createGame(level, { day: 5 }).items.filter(i => i.type === 'sack').length, 3);
  assert.strictEqual(E.createGame(level, { day: 0 }).items.filter(i => i.type === 'sack').length, 0);
});

test('rekesz alulról', () => {
  const s = E.createGame(level, { day: 0 });
  s.player.x = 17 * T + 3; s.player.y = 10 * T - 22;
  step(s, idle(), 0.2);
  E.update(s, { ...idle(), jump: true, jumpPressed: true }, 1 / 120);
  step(s, { ...idle(), jump: true }, 0.6);
  assert.strictEqual(s.bottles, 1);
  assert.ok(s.blocks[E.key(17, 6)].used);
});

test('szatyor, sérülés és palackszóródás', () => {
  const s = E.createGame(level, { day: 0 });
  s.player.bag = true; s.bottles = 6;
  const boar = s.enemies.find(e => e.kind === 'boar');
  s.player.x = boar.x - 12; s.player.y = 10 * T - 22; boar.active = true;
  step(s, { ...idle(), right: true }, 0.5);
  assert.strictEqual(s.player.bag, false, 'elszakadt a szatyor');
  assert.strictEqual(s.bottles + s.loose.length, 6, 'a palackok szétszóródtak, nem tűntek el');
  assert.ok(s.loose.length > 0);
  step(s, idle(), 5);
  assert.strictEqual(s.loose.length, 0, 'a szétszórt palackok eltűnnek');
  assert.strictEqual(s.phase, 'play');
});

test('szatyor nélkül életvesztés és újraéledés', () => {
  const s = E.createGame(level, { day: 0, lives: 2 });
  s.player.x = 41 * T + 4; s.player.y = 10 * T - 22;
  step(s, idle(), 1);
  assert.strictEqual(s.phase, 'dying', 'csatornába esett');
  step(s, idle(), 2);
  assert.strictEqual(s.lives, 1);
  assert.strictEqual(s.phase, 'play');
  s.player.x = 41 * T + 4; s.player.y = 10 * T - 22;
  step(s, idle(), 3);
  assert.strictEqual(s.phase, 'gameover');
});

test('vaddisznó rátaposva', () => {
  const s = E.createGame(level, { day: 0 });
  const boar = s.enemies.find(e => e.kind === 'boar');
  boar.active = true;
  s.player.x = boar.x + 4; s.player.y = boar.y - 40; s.player.vy = 100;
  step(s, idle(), 0.3);
  assert.strictEqual(boar.alive, false);
  assert.strictEqual(s.phase, 'play');
});

test('szarka palackot lop', () => {
  const s = E.createGame(level, { day: 0 });
  s.bottles = 3;
  const m = s.enemies.find(e => e.kind === 'magpie');
  m.active = true;
  s.player.x = m.x; s.player.y = m.y + 2; s.player.vy = -10;
  step(s, idle(), 1 / 60);
  assert.strictEqual(s.bottles, 2);
  assert.strictEqual(m.mode, 'flee');
});

test('Gyanús lötty, utána józanodás', () => {
  const s = E.createGame(level, { day: 0 });
  s.items.push({ type: 'lotty', x: s.player.x, y: s.player.y, w: 8, h: 11, vx: 0, vy: 0, emerge: 0 });
  step(s, idle(), 0.1);
  assert.ok(s.player.boost > 19);
  step(s, idle(), 20);
  assert.ok(s.player.boost === 0 && s.player.hang > 0, 'lassulás jön');
});

test('kút ellenőrzőpont', () => {
  const s = E.createGame(level, { day: 0 });
  s.player.x = 81 * T; s.player.y = 10 * T - 22;
  step(s, idle(), 0.2);
  assert.ok(s.checkpoint.x > 81 * T);
});

test('cél és beváltás', () => {
  const s = E.createGame(level, { day: 0 });
  s.bottles = 12;
  s.player.x = 178 * T; s.player.y = 10 * T - 22;
  step(s, { ...idle(), right: true }, 4);
  assert.strictEqual(s.phase, 'done');
  const t = E.tally(s);
  assert.deepStrictEqual({ ...t }, { csucso: 2, left: 2 });
});

test('a pálya végigjátszható', () => {
  // Egyszerű robot: fut jobbra, ugrik fal vagy szakadék előtt. Sérthetetlen, hogy csak a pálya alakját mérje.
  const s = E.createGame(level, { day: 0, lives: 99 });
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
  assert.strictEqual(s.phase, 'done', 'a robot nem ért célba, x=' + Math.round(s.player.x / T));
});

console.log('PASS: ' + passed.join(', ') + '.');
