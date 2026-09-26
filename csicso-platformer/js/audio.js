'use strict';
// Egyszerű, szintetizált hangeffektek. Hangfájl nincs, internet nem kell.
(function (CS) {
  let ac = null;
  const A = { enabled: true };

  A.unlock = function () {
    if (!A.enabled) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
    } catch { ac = null; }
  };

  function tone(freq, t0, dur, type = 'square', vol = 0.05, slideTo) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  const seq = (notes, step, type, vol) => { const t = ac.currentTime; notes.forEach((f, i) => tone(f, t + i * step, step * 1.1, type, vol)); };

  const SOUNDS = {
    jump: () => tone(260, ac.currentTime, 0.14, 'square', 0.04, 560),
    coin: () => { const t = ac.currentTime; tone(988, t, 0.06, 'square', 0.035); tone(1319, t + 0.06, 0.14, 'square', 0.035); },
    stomp: () => tone(220, ac.currentTime, 0.12, 'triangle', 0.09, 70),
    kick: () => tone(500, ac.currentTime, 0.1, 'square', 0.04, 1200),
    bump: () => tone(130, ac.currentTime, 0.08, 'triangle', 0.09),
    bin: () => { const t = ac.currentTime; tone(180, t, 0.09, 'sawtooth', 0.04, 90); tone(620, t + 0.03, 0.05, 'triangle', 0.03); },
    sprout: () => seq([392, 523, 659, 784], 0.05, 'triangle', 0.06),
    power: () => seq([523, 659, 784, 1047, 1319], 0.06, 'square', 0.035),
    oneup: () => seq([659, 784, 1319, 1047, 1175, 1568], 0.07, 'square', 0.035),
    hurt: () => tone(420, ac.currentTime, 0.3, 'sawtooth', 0.05, 120),
    die: () => seq([494, 440, 392, 330, 262, 196], 0.11, 'square', 0.04),
    steal: () => tone(900, ac.currentTime, 0.16, 'square', 0.035, 420),
    check: () => seq([784, 1047], 0.08, 'triangle', 0.07),
    hic: () => { const t = ac.currentTime; tone(300, t, 0.07, 'triangle', 0.08, 520); tone(280, t + 0.35, 0.07, 'triangle', 0.08, 500); },
    goal: () => seq([523, 659, 784, 1047, 784, 1047, 1319], 0.1, 'square', 0.04),
    tally: () => tone(1175, ac.currentTime, 0.05, 'square', 0.03),
    butt: () => tone(700, ac.currentTime, 0.05, 'triangle', 0.05),
    puff: () => { const t = ac.currentTime; tone(160, t, 0.35, 'sawtooth', 0.025, 60); tone(90, t, 0.4, 'triangle', 0.05, 50); },
    splash: () => { const t = ac.currentTime; tone(600, t, 0.25, 'sawtooth', 0.03, 120); tone(300, t + 0.05, 0.3, 'triangle', 0.05, 80); },
    cash: () => seq([1319, 1568, 2093], 0.05, 'square', 0.03),
  };

  A.play = function (name) {
    if (!A.enabled || !ac || ac.state !== 'running') return;
    try { SOUNDS[name] && SOUNDS[name](); } catch { /* hang nélkül is megy */ }
  };

  CS.Audio = A;
})(window.CS = window.CS || {});
