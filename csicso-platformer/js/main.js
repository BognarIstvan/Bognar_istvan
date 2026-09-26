'use strict';
// Indítás, képernyőméret, érintő- és billentyűvezérlés, menük, játékhurok.
(function (CS) {
  const $ = id => document.getElementById(id);
  const E = CS.Engine;
  const STEP = 1 / 120;
  const VH = CS.Backgrounds.VH;
  const SAVE = 'csicso-platformer-v1';
  const S = CS.buildSprites();

  const screen = $('screen'), sctx = screen.getContext('2d');
  const gameCanvas = document.createElement('canvas'), gctx = gameCanvas.getContext('2d');
  let viewW = 320;
  let state = null, levelCanvas = null, bg = null, levelIndex = 0;
  let mode = 'title';
  let run = { lives: 3, bottles: 0 };
  const store = load();

  // ---------- mentés (csak a nap és a hang) ----------
  function load() {
    try { return Object.assign({ day: 0, sound: true }, JSON.parse(localStorage.getItem(SAVE)) || {}); }
    catch { return { day: 0, sound: true }; }
  }
  function save() { try { localStorage.setItem(SAVE, JSON.stringify(store)); } catch { /* privát mód */ } }

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
  const kb = { left: false, right: false, run: false, jump: false };
  const tp = { left: false, right: false, jump: false };
  let runToggle = false;
  const input = { left: false, right: false, run: false, jump: false, jumpPressed: false };
  function syncInput() {
    const wasJump = input.jump;
    input.left = kb.left || tp.left;
    input.right = kb.right || tp.right;
    input.run = kb.run || runToggle;
    input.jump = kb.jump || tp.jump;
    if (input.jump && !wasJump) input.jumpPressed = true;
  }
  const KEYS = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyK: 'jump',
    ShiftLeft: 'run', ShiftRight: 'run', KeyJ: 'run', KeyX: 'run',
  };
  addEventListener('keydown', e => {
    CS.Audio.unlock();
    if (e.code === 'Escape' || e.code === 'KeyP') { if (mode === 'play') pause(); else if (mode === 'pause') resume(); return; }
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
    tp.left = keys.has('left'); tp.right = keys.has('right'); tp.jump = keys.has('jump');
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
  const icon = (img, scale) => { const c = document.createElement('canvas'); c.width = img.width * scale; c.height = img.height * scale; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0, c.width, c.height); return c.toDataURL(); };
  $('icoLife').src = $('tLifeIco').src = icon(S.csucso, 4);
  $('icoBottle').src = $('tBottleIco').src = icon(S.bottle, 4);
  let hudCache = '';
  function updateHUD() {
    if (!state) return;
    const key = state.lives + '|' + state.bottles + '|' + state.day;
    if (key !== hudCache) {
      hudCache = key;
      $('lives').textContent = state.lives;
      $('bottles').textContent = state.bottles;
      $('dayChip').textContent = E.DAYS[state.day];
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
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // ---------- képernyők ----------
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => { s.hidden = s.id !== id; });
    const inGame = id === null || id === 'pause';
    $('hud').hidden = !state || id === 'title';
    pad.hidden = !(touch && (id === null));
    if (!inGame) { fingers.clear(); refreshPad(); }
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

  function startLevel() {
    const level = CS.LEVELS[levelIndex];
    state = E.createGame(level, { day: store.day, lives: run.lives, bottles: run.bottles, viewW });
    levelCanvas = CS.Render.prepareLevel(state, S);
    bg = CS.Backgrounds.create(level.id);
    hudCache = '';
    $('introNo').textContent = level.id;
    $('introName').textContent = level.name;
    $('introDay').textContent = E.DAYS[store.day];
    $('introNote').textContent = E.DAY_NOTES[store.day];
    $('introLives').textContent = 'Csucsó (élet): ' + run.lives + ' · Palack: ' + run.bottles;
    mode = 'intro';
    show('intro');
    draw();
  }
  function play() { mode = 'play'; show(null); last = performance.now(); acc = 0; }
  function pause() { mode = 'pause'; show('pause'); }
  function resume() { play(); }
  function toTitle() { mode = 'title'; state = null; show('title'); }
  function newRun() { run = { lives: 3, bottles: 0 }; }

  $('startBtn').onclick = () => { CS.Audio.unlock(); newRun(); startLevel(); };
  $('goBtn').onclick = () => { CS.Audio.unlock(); play(); };
  $('pauseBtn').onclick = () => { if (mode === 'play') pause(); };
  $('resumeBtn').onclick = resume;
  $('restartBtn').onclick = () => startLevel();
  $('menuBtn').onclick = toTitle;
  $('overMenuBtn').onclick = toTitle;
  $('tallyMenuBtn').onclick = toTitle;
  $('againBtn').onclick = () => { setDay(store.day + 1); newRun(); startLevel(); };
  $('nextBtn').onclick = () => { setDay(store.day + 1); startLevel(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'play') pause(); });

  function gameOver() { mode = 'over'; show('over'); }

  function showTally() {
    mode = 'tally';
    show('tally');
    const res = E.tally(state);
    let bottles = state.bottles, lives = state.lives, steps = res.csucso;
    $('tBottles').textContent = bottles;
    $('tLives').textContent = lives;
    $('nextBtn').hidden = $('tallyMenuBtn').hidden = true;
    $('tallyNote').textContent = steps ? 'Minden 5 palackért egy csucsó.' : 'Nincs meg az 5 palack egy csucsóhoz. Legközelebb több kukát nézz meg!';
    const tick = () => {
      if (steps > 0) {
        steps--; bottles -= 5; lives++;
        $('tBottles').textContent = bottles; $('tLives').textContent = lives;
        CS.Audio.play('oneup');
        setTimeout(tick, 450);
      } else {
        run = { lives, bottles };
        $('nextBtn').hidden = $('tallyMenuBtn').hidden = false;
      }
    };
    setTimeout(tick, 600);
  }

  // ---------- hurok ----------
  let last = performance.now(), acc = 0;
  function handleEvents() {
    for (const ev of state.events) {
      if (ev.t === 'sfx') CS.Audio.play(ev.n);
      else if (ev.t === 'toast') toast(ev.text);
      else if (ev.t === 'goal') setTimeout(showTally, 1000);
      else if (ev.t === 'gameover') setTimeout(gameOver, 500);
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
        handleEvents();
        acc -= STEP;
      }
    }
    if (state) { draw(); updateHUD(); }
    requestAnimationFrame(frame);
  }

  setDay(store.day);
  setSound(store.sound);
  layout();
  show('title');
  requestAnimationFrame(frame);
  // tesztekhez
  CS.debug = { get state() { return state; }, input, startLevel, play, get mode() { return mode; } };
})(window.CS = window.CS || {});
