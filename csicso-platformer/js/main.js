'use strict';
// Indítás, képernyőméret, érintő- és billentyűvezérlés, menük, Jednota-bolt, Parlament, játékhurok.
(function (CS) {
  const $ = id => document.getElementById(id);
  const E = CS.Engine;
  const STEP = 1 / 120;
  const VH = CS.Backgrounds.VH;
  const SAVE = 'csicso-platformer-v2';
  const S = CS.buildSprites();

  const screen = $('screen'), sctx = screen.getContext('2d');
  const gameCanvas = document.createElement('canvas'), gctx = gameCanvas.getContext('2d');
  let viewW = 320;
  let state = null, levelCanvas = null, bg = null;
  let mode = 'title';
  // A futó játék: nap, melyik pálya jön, és a szatyor tartalma. Minden pálya végén mentjük.
  let run = null;
  let levelStartInv = null;
  const store = load();

  // ---------- mentés ----------
  function load() {
    try { return Object.assign({ day: 0, sound: true, run: null }, JSON.parse(localStorage.getItem(SAVE)) || {}); }
    catch { return { day: 0, sound: true, run: null }; }
  }
  function save() { try { localStorage.setItem(SAVE, JSON.stringify(store)); } catch { /* privát mód */ } }
  function saveRun() { store.run = run ? JSON.parse(JSON.stringify(run)) : null; save(); }

  // ---------- képernyőméret ----------
  const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  function layout() {
    const vw = innerWidth, vh = innerHeight;
    const portrait = vh > vw;
    document.body.classList.toggle('portrait', portrait);
    let gw = vw, gh = vh;
    if (portrait) gh = Math.min(Math.round(vw * 0.8), Math.round(vh * 0.58));
    viewW = Math.max(240, Math.min(520, Math.round(VH * gw / gh)));
    const cssW = Math.min(gw, Math.round(gh * viewW / VH));
    gh = Math.round(cssW * VH / viewW);
    document.documentElement.style.setProperty('--game-h', gh + 'px');
    $('stage').style.height = gh + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    screen.style.width = cssW + 'px';
    screen.style.height = gh + 'px';
    screen.style.left = Math.round((gw - cssW) / 2) + 'px';
    screen.style.top = '0px';
    screen.width = Math.round(cssW * dpr);
    screen.height = Math.round(gh * dpr);
    gameCanvas.width = viewW;
    gameCanvas.height = VH;
    if (state) { state.viewW = viewW; state.camX = Math.max(0, Math.min(state.width - viewW, state.camX)); }
    draw();
  }
  addEventListener('resize', layout);
  addEventListener('orientationchange', () => setTimeout(layout, 200));

  // ---------- bemenet ----------
  const kb = { left: false, right: false, run: false, jump: false, smoke: false };
  const tp = { left: false, right: false, jump: false, smoke: false };
  let runToggle = false;
  const input = { left: false, right: false, run: false, jump: false, jumpPressed: false, smoke: false, smokePressed: false };
  function syncInput() {
    const wasJump = input.jump, wasSmoke = input.smoke;
    input.left = kb.left || tp.left;
    input.right = kb.right || tp.right;
    input.run = kb.run || runToggle;
    input.jump = kb.jump || tp.jump;
    input.smoke = kb.smoke || tp.smoke;
    if (input.jump && !wasJump) input.jumpPressed = true;
    if (input.smoke && !wasSmoke) input.smokePressed = true;
  }
  const KEYS = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyK: 'jump',
    ShiftLeft: 'run', ShiftRight: 'run', KeyJ: 'run', KeyX: 'run',
    KeyF: 'smoke', KeyE: 'smoke', KeyL: 'smoke',
  };
  addEventListener('keydown', e => {
    CS.Audio.unlock();
    if (e.code === 'Escape' || e.code === 'KeyP') { if (mode === 'play') pause(); else if (mode === 'pause') play(); return; }
    if (mode !== 'play') {
      if (e.code === 'Enter' || e.code === 'Space') {
        const scr = document.querySelector('.screen:not([hidden])');
        const btn = scr && scr.querySelector('button.primary:not([hidden])');
        if (btn && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); btn.click(); }
      }
      return;
    }
    const k = KEYS[e.code];
    if (!k) return;
    e.preventDefault();
    kb[k] = true;
    syncInput();
  });
  addEventListener('keyup', e => { const k = KEYS[e.code]; if (k) { kb[k] = false; syncInput(); } });
  addEventListener('blur', () => { Object.keys(kb).forEach(k => kb[k] = false); syncInput(); });

  // Érintés: minden ujjat külön követünk, így az ujj átcsúszhat egyik gombról a másikra.
  const pad = $('pad');
  const fingers = new Map();
  function padKey(x, y) {
    const el = document.elementFromPoint(x, y);
    const b = el && el.closest && el.closest('#pad [data-k]');
    return b ? b.dataset.k : null;
  }
  function refreshPad() {
    const keys = new Set(fingers.values());
    for (const k of ['left', 'right', 'jump', 'smoke']) tp[k] = keys.has(k);
    pad.querySelectorAll('[data-k]').forEach(b => b.classList.toggle('on', keys.has(b.dataset.k)));
    syncInput();
  }
  pad.addEventListener('pointerdown', e => {
    e.preventDefault();
    CS.Audio.unlock();
    try { pad.setPointerCapture(e.pointerId); } catch { /* régi böngésző */ }
    const k = padKey(e.clientX, e.clientY);
    if (k === 'run') { runToggle = !runToggle; $('runBtn').classList.toggle('toggled', runToggle); syncInput(); }
    fingers.set(e.pointerId, k === 'run' ? null : k);
    refreshPad();
  });
  pad.addEventListener('pointermove', e => {
    if (!fingers.has(e.pointerId)) return;
    const k = padKey(e.clientX, e.clientY);
    const nk = k === 'run' ? null : k;
    if (fingers.get(e.pointerId) !== nk) { fingers.set(e.pointerId, nk); refreshPad(); }
  });
  const lift = e => { fingers.delete(e.pointerId); refreshPad(); };
  pad.addEventListener('pointerup', lift);
  pad.addEventListener('pointercancel', lift);
  pad.addEventListener('lostpointercapture', lift);
  pad.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());

  // ---------- HUD ----------
  const money = c => (c / 100).toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const icon = (img, scale) => { const c = document.createElement('canvas'); c.width = img.width * scale; c.height = img.height * scale; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0, c.width, c.height); return c.toDataURL(); };
  $('icoBottle').src = icon(S.bottle, 4);
  $('icoButt').src = icon(S.butt, 4);
  $('icoPaper').src = icon(S.paper, 4);
  $('icoCig').src = icon(S.cig, 4);
  $('icoWine').src = icon(S.csucso, 4);
  let hudCache = '';
  function updateHUD() {
    if (!state) return;
    const v = state.inv;
    const key = [v.bottles, v.capacity, v.cash, v.butts, v.paper, v.cigs, v.wine, v.delivered, Math.round(v.energy), state.day].join('|');
    if (key !== hudCache) {
      hudCache = key;
      $('bottles').textContent = v.bottles + '/' + v.capacity;
      $('cash').textContent = money(v.cash);
      $('butts').textContent = v.butts;
      $('paper').textContent = v.paper;
      $('cigs').textContent = v.cigs;
      $('wine').textContent = v.wine;
      $('goalLine').textContent = 'Parlament: ' + v.delivered + '/' + E.GOAL_WINE + ' csucsó';
      $('energyBar').style.width = Math.max(0, v.energy) + '%';
      $('energyBar').classList.toggle('low', v.energy <= 30);
      $('dayChip').textContent = E.DAYS[state.day];
      $('smokeBtn').classList.toggle('empty', v.cigs <= 0);
    }
    const tip = mode === 'play' ? state.sign : null;
    if ((tip || '') !== $('tip').textContent || !!tip === $('tip').hidden) { $('tip').textContent = tip || ''; $('tip').hidden = !tip; }
  }
  let toastTimer = 0;
  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  // ---------- képernyők ----------
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => { s.hidden = s.id !== id; });
    $('hud').hidden = !state || id === 'title';
    pad.hidden = !(touch && id === null);
    if (id !== null) { fingers.clear(); refreshPad(); }
  }
  function setDay(d) {
    store.day = (d % 7 + 7) % 7;
    save();
    $('dayName').textContent = E.DAYS[store.day];
    $('dayNote').textContent = E.DAY_NOTES[store.day];
  }
  $('dayPrev').onclick = () => setDay(store.day - 1);
  $('dayNext').onclick = () => setDay(store.day + 1);
  function setSound(on) { store.sound = on; CS.Audio.enabled = on; $('soundBtn').textContent = 'Hang: ' + (on ? 'be' : 'ki'); save(); }
  $('soundBtn').onclick = () => { setSound(!store.sound); CS.Audio.unlock(); };
  const fsOk = document.fullscreenEnabled || document.webkitFullscreenEnabled;
  $('fsBtn').hidden = !fsOk;
  $('fsBtn').onclick = async () => {
    try {
      const el = document.documentElement;
      await (el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen());
      await screen.orientation?.lock?.('landscape');
    } catch { /* nem minden telefon engedi */ }
  };

  function refreshTitle() {
    const has = !!store.run;
    $('continueBtn').hidden = !has;
    $('startBtn').classList.toggle('primary', !has);
    $('startBtn').textContent = 'Új játék';
    confirmNew = false;
    if (has) $('continueBtn').textContent = 'Folytatás · ' + CS.LEVELS[store.run.level].id + ' · ' + money(store.run.inv.cash);
  }
  let confirmNew = false;
  $('startBtn').onclick = () => {
    CS.Audio.unlock();
    if (store.run && !confirmNew) { confirmNew = true; $('startBtn').textContent = 'Biztos? A mentés elvész. Érintsd meg újra.'; return; }
    run = { level: 0, inv: E.newInventory() };
    startLevel();
  };
  $('continueBtn').onclick = () => { CS.Audio.unlock(); run = JSON.parse(JSON.stringify(store.run)); startLevel(); };

  function startLevel() {
    const level = CS.LEVELS[run.level];
    run.inv.energy = run.inv.energy > 0 ? run.inv.energy : 100;
    levelStartInv = JSON.parse(JSON.stringify(run.inv));
    saveRun();
    state = E.createGame(level, { day: store.day, inv: run.inv, viewW });
    levelCanvas = CS.Render.prepareLevel(state, S);
    bg = CS.Backgrounds.create(level.id);
    hudCache = '';
    $('introNo').textContent = level.id;
    $('introName').textContent = level.name;
    $('introDay').textContent = E.DAYS[store.day];
    $('introNote').textContent = E.DAY_NOTES[store.day];
    const v = run.inv;
    $('introInv').textContent = level.goal === 'P'
      ? 'Csucsó a szatyorban: ' + v.wine + ' · Parlament: ' + v.delivered + '/' + E.GOAL_WINE
      : 'Pénz: ' + money(v.cash) + ' · Szatyor: ' + v.capacity + ' palack · A Parlamentnek ' + E.GOAL_WINE + ' csucsó kell';
    mode = 'intro';
    show('intro');
    draw();
  }
  function play() { mode = 'play'; show(null); last = performance.now(); acc = 0; }
  function pause() { mode = 'pause'; show('pause'); }
  function toTitle() { mode = 'title'; state = null; refreshTitle(); show('title'); }

  $('goBtn').onclick = () => { CS.Audio.unlock(); play(); };
  $('pauseBtn').onclick = () => { if (mode === 'play') pause(); };
  $('resumeBtn').onclick = play;
  $('restartBtn').onclick = () => { run.inv = JSON.parse(JSON.stringify(levelStartInv)); startLevel(); };
  $('menuBtn').onclick = toTitle;
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'play') pause(); });

  function action(label, price, enabled, fn) {
    const b = document.createElement('button');
    b.innerHTML = label + (price ? ' <small>' + price + '</small>' : '');
    b.disabled = !enabled;
    b.onclick = fn;
    return b;
  }

  // Jednota: visszaváltás és vásárlás, az eredeti Ork szimulátor árai szerint.
  function showShop() {
    mode = 'shop';
    show('shop');
    const v = run.inv, P = E.PRICES;
    $('shopCash').textContent = money(v.cash);
    $('shopStock').innerHTML = `<span>${v.bottles} palack</span><span>${v.wine} csucsó</span><span>${v.paper} cigipapír</span><span>${v.butts} csikk</span>`;
    const box = $('shopActions');
    box.replaceChildren(
      action('Palackok visszaváltása', '+' + money(v.bottles * P.bottle), v.bottles > 0, () => { const n = E.Shop.redeem(v); CS.Audio.play('cash'); toast(n + ' palack beváltva: ' + money(n * P.bottle)); showShop(); }),
      action('Egy üveg CSUCSÓ', money(P.wine), v.cash >= P.wine, () => { E.Shop.buyWine(v); CS.Audio.play('oneup'); toast('Egy csucsó a szatyorban. A Parlament vár!'); showShop(); }),
      action('Cigipapír', money(P.paper), v.cash >= P.paper, () => { E.Shop.buyPaper(v); CS.Audio.play('coin'); showShop(); }),
      action(v.capacity > 12 ? 'Nagy szatyor megvéve ✓' : 'Nagy szatyor · 20 férőhely', v.capacity > 12 ? '' : money(P.bigBag), v.cash >= P.bigBag && v.capacity <= 12, () => { E.Shop.buyBigBag(v); CS.Audio.play('power'); toast('Nagy szatyor: most 20 palack fér bele.'); showShop(); }),
    );
    saveRun();
  }
  $('shopDone').onclick = () => { run.level = 1; startLevel(); };

  // Parlament: csucsó leadása, sodrás, pihenés.
  function showParliament() {
    mode = 'parliament';
    show('parliament');
    const v = run.inv, need = E.GOAL_WINE;
    $('parlText').innerHTML = `„Napirend előtt: ki hozta az ellátmányt?” Az esti üléshez <strong>${need} csucsó</strong> kell. Eddig <strong>${v.delivered}</strong> érkezett meg.`;
    $('parlBar').style.width = Math.min(100, v.delivered / need * 100) + '%';
    $('parlStock').innerHTML = `<span>${v.wine} csucsó</span><span>${v.butts} csikk</span><span>${v.paper} papír</span><span>${v.cigs} sodrás</span><span>${money(v.cash)}</span>`;
    const give = Math.min(v.wine, need - v.delivered);
    $('parlActions').replaceChildren(
      action('Csucsó leadása az ülésre', give + ' üveg', give > 0, () => { E.Parliament.deliver(v); CS.Audio.play('goal'); toast(E.Parliament.won(v) ? 'Megvan mind a három!' : 'A Parlament elégedett. Még ' + (need - v.delivered) + ' csucsó kell.'); showParliament(); }),
      action('Parlamenti sodrás', '5 csikk + 1 papír', v.butts >= 5 && v.paper >= 1, () => { E.Parliament.roll(v); CS.Audio.play('puff'); toast('Kész a sodrás. Elszívhatod füstnek, vagy leadhatod az ülésre.'); showParliament(); }),
      action('Sodrás az ülésre', v.rolled ? 'eddig ' + v.rolled : '', v.cigs >= 1, () => { E.Parliament.offerCig(v); CS.Audio.play('check'); toast('A Parlament megköszönte a sodrást.'); showParliament(); }),
      action('Rövid üldögélés', '+ erőnlét', v.energy < 100, () => { E.Parliament.rest(v); toast('Jegyzőkönyv: a pihenő eredményes volt.'); showParliament(); }),
    );
    saveRun();
  }
  $('parlDone').onclick = () => {
    const v = run.inv;
    run.level = 0;
    setDay(store.day + 1);
    v.energy = 100;
    if (E.Parliament.won(v)) {
      v.delivered = 0;
      saveRun();
      mode = 'win'; show('win');
      $('winText').textContent = 'Megérkezett a három csucsó, az esti ülés határozatképes.' + (v.rolled ? ' A sodrásokért külön köszönet jár.' : '');
    } else {
      saveRun();
      mode = 'nextday'; show('nextday');
      $('nextText').textContent = 'Az üléshez még ' + (E.GOAL_WINE - v.delivered) + ' csucsó hiányzik. Holnap (' + E.DAYS[store.day] + ') új műszak, a Parlamenttől a Jednotáig és vissza.';
    }
  };
  $('winNext').onclick = startLevel;
  $('nextGo').onclick = startLevel;
  $('winMenu').onclick = toTitle;
  $('nextMenu').onclick = toTitle;

  // ---------- hurok ----------
  let last = performance.now(), acc = 0;
  function handleEvents() {
    for (const ev of state.events) {
      if (ev.t === 'sfx') CS.Audio.play(ev.n);
      else if (ev.t === 'toast') toast(ev.text);
      else if (ev.t === 'goal') setTimeout(ev.at === 'P' ? showParliament : showShop, 900);
    }
  }
  function draw() {
    if (!state || !bg) return;
    CS.Backgrounds.draw(bg, sctx, state.camX, state.time, screen.width, screen.height);
    CS.Render.drawGame(gctx, state, S, levelCanvas, viewW, VH);
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(gameCanvas, 0, 0, viewW, VH, 0, 0, screen.width, screen.height);
    CS.Backgrounds.drawFront(bg, sctx, state.camX, screen.width, screen.height);
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (mode === 'play' && state) {
      acc += dt;
      while (acc >= STEP) {
        E.update(state, input, STEP);
        input.jumpPressed = false;
        input.smokePressed = false;
        handleEvents();
        acc -= STEP;
      }
    }
    if (state) { draw(); updateHUD(); }
    requestAnimationFrame(frame);
  }

  setDay(store.day);
  setSound(store.sound);
  refreshTitle();
  layout();
  show('title');
  requestAnimationFrame(frame);
  // tesztekhez
  CS.debug = { get state() { return state; }, get run() { return run; }, input, startLevel, play, get mode() { return mode; } };
})(window.CS = window.CS || {});
