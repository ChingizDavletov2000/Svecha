/* Генеративный звук: всё синтезируется в браузере, без аудиофайлов.
   Слои шума (город, ветер, вода, дождь, гомон), события (колокола, шаги, стаканы,
   бубенцы, птицы, скрип, часы, треск, капли, сердце, копыта, гром),
   тихая музыка-подложка со своим аккордом на каждую сцену и общая реверберация. */
(function () {
  'use strict';

  // базовая громкость слоёв (умножается на значение из атмосферы)
  const BASE = {
    city: 0.6, hum: 0.5, wind: 0.55, water: 0.6, rain: 0.65, crowd: 0.55, breath: 0.5,
    tick: 0.45, crackle: 0.4, drip: 0.4, heart: 0.95, hooves: 0.7,
    steps: 0.55, bells: 0.55, clink: 0.45, sleigh: 0.5, birds: 0.42, creak: 0.5, snort: 0.5, drops: 0.4
  };

  // дополнительные звуки сцен (к тем, что заданы в atmos.js)
  const EXTRA = {
    candle: { creak: 0.12 },
    heat: { steps: 0.55, bells: 0.3 },
    street: { steps: 0.45, bells: 0.35 },
    night: { steps: 0.35, bells: 0.2 },
    neva: { bells: 0.45 },
    garret: { creak: 0.35 },
    dread: { creak: 0.5 },
    fever: { creak: 0.15 },
    tavern: { clink: 0.55 },
    wake: { clink: 0.4 },
    office: { creak: 0.2, steps: 0.15 },
    porfiry: { creak: 0.25 },
    sonya: { creak: 0.18 },
    lamp: { creak: 0.15 },
    cellar: { creak: 0.2 },
    cellarEve: { creak: 0.2 },
    snow: { sleigh: 0.5 },
    stable: { snort: 0.55 },
    spring: { birds: 0.7 },
    morning: { birds: 0.25 },
    whitenight: { bells: 0.25 },
    shore: { birds: 0.08 },
    storm: { drops: 0.6 },
    fogdawn: { bells: 0.18, drip: 0.2 },
    siberia: { bells: 0.12 },
    wasteland: { birds: 0.12 },
    aftermath: { bells: 0.15, drip: 0.25 },
    buran: { sleigh: 0.3 },
    steppe: { birds: 0.15, bells: 0.08 },
    siege: { bells: 0.4, steps: 0.3 },
    garden: { birds: 0.55 },
    bonfire: { snort: 0.12 },
    rain: { drops: 0.45 },
    moonvillage: { steps: 0.1, creak: 0.08 },
    cemetery: { bells: 0.2 },
    frost: { steps: 0.4, sleigh: 0.25, bells: 0.15 },
    square: { steps: 0.15 }
  };

  // реверберация: доля «зала»
  const REV = {
    cellar: 0.55, cellarEve: 0.5, lamp: 0.4, song: 0.45, curtain: 0.7, tavern: 0.3, garret: 0.14, dread: 0.22,
    sonya: 0.25, office: 0.35, porfiry: 0.3, wake: 0.3, neva: 0.45, shore: 0.5, whitenight: 0.45, storm: 0.35,
    aftermath: 0.45, chase: 0.6, dream: 0.75, fever: 0.4, siberia: 0.5, spring: 0.35, fogdawn: 0.6, heat: 0.25,
    street: 0.3, night: 0.4, morning: 0.3, snow: 0.35, izba: 0.2, stable: 0.2, wasteland: 0.4, candle: 0.4,
    buran: 0.3, steppe: 0.35, siege: 0.4, garden: 0.25, bonfire: 0.2, rain: 0.3, moonvillage: 0.45, cemetery: 0.6, frost: 0.35, square: 0.65
  };

  // музыка-подложка: аккорд (MIDI-ноты) на каждую сцену
  const CHORD = {
    candle: [50, 57, 62, 64, 65], heat: [45, 52, 57, 59, 60], garret: [43, 50, 55, 58], neva: [40, 47, 52, 55, 59],
    cellar: [38, 45, 50, 53], lamp: [41, 48, 53, 56, 60], song: [41, 48, 53, 56], curtain: [],
    snow: [45, 52, 57, 60, 64], izba: [43, 50, 55, 59], stable: [41, 48, 52, 57], shore: [38, 45, 50, 57],
    whitenight: [50, 57, 62, 66, 69], storm: [36, 43, 48, 49], tavern: [45, 52, 57, 60], dream: [44, 50, 55, 56],
    dread: [40, 46, 52], fever: [42, 49, 54, 57], office: [43, 50, 55], night: [40, 47, 52, 55, 62],
    porfiry: [38, 45, 51, 53], sonya: [45, 52, 57, 61, 64], wake: [43, 50, 55, 58, 62], street: [42, 49, 54, 57, 61],
    morning: [47, 54, 59, 62, 66], fogdawn: [44, 51, 56, 59], siberia: [40, 47, 52, 54], spring: [48, 55, 60, 64, 67],
    cellarEve: [38, 45, 50, 53, 57], wasteland: [41, 48, 53, 55, 60], aftermath: [40, 47, 52, 55], chase: [36, 42, 48],
    buran: [38, 45, 50, 52], steppe: [43, 50, 55, 59, 62], siege: [36, 43, 48, 51], garden: [48, 55, 60, 64, 67],
    bonfire: [41, 48, 53, 57, 60], rain: [43, 50, 55, 58], moonvillage: [45, 52, 57, 59, 64], cemetery: [40, 47, 52, 55, 58],
    frost: [47, 54, 59, 62], square: [37, 44, 49]
  };

  let ac = null, master = null, mixBus = null, wet = null, musicBus = null;
  const layers = {};
  let enabled = false, volume = 0.7, musicOn = true;
  let mix = {}, key = 'candle', timer = null;
  let white, pink, brown;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const lerp = (a, b, t) => a + (b - a) * t;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function noiseBuffer(type, seconds) {
    const len = Math.floor(ac.sampleRate * seconds);
    const b = ac.createBuffer(1, len, ac.sampleRate);
    const d = b.getChannelData(0);
    let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else if (type === 'pink') {
        b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
      } else d[i] = w;
    }
    const f = Math.min(2000, len / 4);
    for (let i = 0; i < f; i++) { const k = i / f; d[i] = d[i] * k + d[len - f + i] * (1 - k); }
    return b;
  }
  function impulse(seconds, decay) {
    const len = Math.floor(ac.sampleRate * seconds);
    const b = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      // ранние отражения
      for (let r = 0; r < 6; r++) { const at = Math.floor(ac.sampleRate * rnd(0.008, 0.07)); d[at] += rnd(-0.6, 0.6); }
    }
    return b;
  }

  const filt = (type, f, q) => { const n = ac.createBiquadFilter(); n.type = type; n.frequency.value = f; if (q) n.Q.value = q; return n; };
  const gain = v => { const g = ac.createGain(); g.gain.value = v; return g; };
  const chain = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; };
  function pan(v, dest) {
    if (!ac.createStereoPanner) return dest;
    const p = ac.createStereoPanner(); p.pan.value = v; p.connect(dest); return p;
  }
  function loop(buf) { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, Math.random() * buf.duration); return s; }
  function lfo(freq, depth, param, offset) {
    const o = ac.createOscillator(); o.frequency.value = freq;
    const g = gain(depth); o.connect(g); g.connect(param); o.start();
    if (offset !== undefined) param.value = offset;
    return o;
  }

  function build() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    white = noiseBuffer('white', 4); pink = noiseBuffer('pink', 5); brown = noiseBuffer('brown', 6);

    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.4;
    master = gain(0); comp.connect(master); master.connect(ac.destination);

    mixBus = gain(1);
    const conv = ac.createConvolver(); conv.buffer = impulse(3.6, 2.4);
    wet = gain(0.3);
    mixBus.connect(comp);
    mixBus.connect(wet); wet.connect(conv); conv.connect(comp);

    musicBus = gain(0);
    const musicWet = gain(0.55);
    musicBus.connect(comp); musicBus.connect(musicWet); musicWet.connect(conv);

    const L = name => { const g = gain(0); g.connect(mixBus); layers[name] = g; return g; };

    // гул комнаты
    chain(loop(brown), filt('lowpass', 150), L('hum'));

    // город: низкий гул + далёкий гомон
    const city = L('city');
    chain(loop(brown), filt('lowpass', 320), gain(0.8), city);
    const murmur = gain(0.25);
    chain(loop(pink), filt('bandpass', 650, 0.7), murmur, city);
    lfo(0.09, 0.12, murmur.gain, 0.25);

    // ветер с порывами
    const wf = filt('bandpass', 480, 0.9);
    const wg = gain(0.6);
    layers.gust = gain(1);
    chain(loop(white), wf, wg, layers.gust, L('wind'));
    lfo(0.07, 220, wf.frequency, 480); lfo(0.13, 90, wf.frequency);
    lfo(0.05, 0.3, wg.gain, 0.6);
    layers.windFilter = wf;
    // высокий свист ветра
    const whistle = filt('bandpass', 1400, 8);
    const whg = gain(0.12);
    chain(loop(white), whistle, whg, layers.gust);
    lfo(0.11, 300, whistle.frequency, 1400);

    // вода у гранита
    const wa = gain(0.6), wb = gain(0.4);
    const water = L('water');
    chain(loop(brown), filt('lowpass', 520), wa, water);
    chain(loop(pink), filt('bandpass', 900, 0.6), wb, water);
    lfo(0.17, 0.45, wa.gain, 0.6); lfo(0.11, 0.3, wb.gain, 0.35);

    // дождь
    const rain = L('rain');
    chain(loop(white), filt('highpass', 900), filt('lowpass', 7500), gain(0.45), rain);
    chain(loop(pink), filt('lowpass', 1400), gain(0.7), rain);
    chain(loop(brown), filt('lowpass', 200), gain(0.5), rain);

    // гомон голосов
    const crowd = L('crowd');
    [[420, 0.11], [780, 0.07], [1250, 0.05], [560, 0.19]].forEach(([f, sp], i) => {
      const g = gain(0.3);
      chain(loop(pink), filt('bandpass', f, 2.4), g, crowd);
      lfo(sp + i * 0.03, 0.22, g.gain, 0.3);
    });

    // дыхание лошади
    const bg = gain(0);
    chain(loop(pink), filt('bandpass', 380, 1.1), bg, L('breath'));
    layers.breathEnv = bg;

    ['tick', 'crackle', 'heart', 'hooves', 'steps', 'bells', 'clink', 'sleigh', 'birds', 'creak', 'snort', 'drops'].forEach(L);
    const drip = L('drip');
    const dl = ac.createDelay(1); dl.delayTime.value = 0.23;
    const fb = gain(0.35); dl.connect(fb); fb.connect(dl); dl.connect(drip);
    layers.dripDelay = dl;
    L('thunder').gain.value = 1;
  }

  // ---------- маленькие синтезаторы ----------
  function burst(dest, buf, when, dur, f, type, q, peak, attack) {
    const s = ac.createBufferSource(); s.buffer = buf;
    const fi = filt(type, f, q), g = gain(0);
    s.connect(fi); fi.connect(g); g.connect(dest);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(peak, when + (attack || 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    s.start(when, Math.random() * Math.max(0, buf.duration - dur - 0.1)); s.stop(when + dur + 0.05);
  }
  function tone(dest, when, f, peak, dur, type, attack) {
    const o = ac.createOscillator(), g = gain(0);
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, when);
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(peak, when + (attack || 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(dest); o.start(when); o.stop(when + dur + 0.05);
    return o;
  }
  function thump(dest, when, f, peak, dur) {
    const o = ac.createOscillator(), g = gain(0);
    o.frequency.setValueAtTime(f * 1.6, when); o.frequency.exponentialRampToValueAtTime(f, when + 0.04);
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(peak, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(dest); o.start(when); o.stop(when + dur + 0.05);
  }
  // колокол: негармонические обертоны
  function bell(dest, when, f0, peak, dur) {
    [[1, 1], [2.0, 0.6], [2.42, 0.45], [3.0, 0.3], [4.17, 0.22], [5.43, 0.12], [0.5, 0.5]].forEach(([r, a]) => {
      tone(dest, when + rnd(0, 0.004), f0 * r, peak * a, dur * (r < 1 ? 1.4 : 1 / Math.sqrt(r)), 'sine', 0.003);
    });
  }

  // ---------- музыка-подложка ----------
  let pad = null, nextNote = 2;
  function setChord(notes) {
    if (!ac) return;
    const now = ac.currentTime;
    if (pad) {
      const old = pad;
      old.g.gain.cancelScheduledValues(now);
      old.g.gain.setValueAtTime(old.g.gain.value, now);
      old.g.gain.linearRampToValueAtTime(0, now + 4);
      setTimeout(() => old.oscs.forEach(o => { try { o.stop(); } catch (e) { /* уже остановлен */ } }), 5000);
      pad = null;
    }
    if (!notes || !notes.length) return;
    const g = gain(0), lp = filt('lowpass', 800, 0.6);
    lp.connect(g); g.connect(musicBus);
    lfo(0.045, 280, lp.frequency, 800);
    const oscs = [];
    notes.forEach((m, i) => {
      const f = mtof(m);
      ['triangle', 'sawtooth'].forEach((type, j) => {
        const o = ac.createOscillator(); o.type = type; o.frequency.value = f;
        o.detune.value = (j ? 7 : -7) + rnd(-3, 3);
        const vg = gain((type === 'sawtooth' ? 0.035 : 0.09) / Math.sqrt(notes.length) * (i === 0 ? 1.3 : 1));
        o.connect(vg); vg.connect(lp); o.start(); oscs.push(o);
        lfo(rnd(0.05, 0.12), 0.25 * vg.gain.value, vg.gain);
      });
    });
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(1, now + 5);
    pad = { g, oscs, notes };
  }
  function playNote(now) {
    if (!pad || !pad.notes.length) return;
    const m = pick(pad.notes) + pick([12, 24, 24]);
    const p = pan(rnd(-0.6, 0.6), musicBus);
    const f = mtof(m);
    tone(p, now, f, 0.07, 3.2, 'sine', 0.01);
    tone(p, now, f * 2, 0.018, 1.6, 'sine', 0.01);
    tone(p, now, f * 3.01, 0.008, 0.9, 'sine', 0.01);
    // иногда — вторая нота следом
    if (Math.random() < 0.35) {
      const m2 = pick(pad.notes) + 24, t = now + rnd(0.4, 0.9);
      tone(p, t, mtof(m2), 0.045, 2.6, 'sine', 0.01);
    }
  }

  // ---------- расписание событий ----------
  const T = { tick: 0, clop: 3, drip: 1.5, breath: 0, crackle: 0, bells: 6, steps: 1, walkUntil: 0, pauseUntil: 0,
    clink: 3, sleigh: 2, birds: 1, creak: 5, snort: 4, drops: 0, gust: 5, hoof: 0 };

  function schedule() {
    if (!ac || !enabled) return;
    const now = ac.currentTime, step = 0.1;
    const on = n => (mix[n] || 0) > 0.01;
    const due = (k, a, b) => { T[k] -= step; if (T[k] <= 0) { T[k] = rnd(a, b); return true; } return false; };

    // музыка: редкие ноты
    if (musicOn && pad) { nextNote -= step; if (nextNote <= 0) { playNote(now + 0.05); nextNote = rnd(4, 10); } }

    // порывы ветра
    if (on('wind') && due('gust', 6, 15)) {
      const g = layers.gust.gain, w = now + 0.05, k = rnd(1.4, 2.2);
      g.cancelScheduledValues(w); g.setValueAtTime(g.value, w);
      g.linearRampToValueAtTime(k, w + rnd(1.2, 2.2)); g.linearRampToValueAtTime(1, w + rnd(3.5, 5.5));
    }

    // часы
    if (on('tick')) {
      if (T.tick < now) T.tick = Math.ceil(now);
      while (T.tick < now + 0.3) {
        const odd = Math.round(T.tick) % 2;
        burst(layers.tick, white, T.tick, 0.035, odd ? 3100 : 2500, 'bandpass', 6, 0.9);
        burst(layers.tick, white, T.tick + 0.004, 0.07, 900, 'bandpass', 3, 0.3);
        T.tick += 1;
      }
    }

    // треск печи / фитиля
    if (on('crackle')) {
      T.crackle += step;
      while (T.crackle > 0) {
        const w = now + Math.random() * step, big = Math.random() < 0.12;
        burst(pan(rnd(-0.3, 0.3), layers.crackle), white, w, big ? 0.05 : 0.012, big ? 1500 : rnd(2500, 6000), 'highpass', 0.7, big ? 0.7 : rnd(0.1, 0.45));
        T.crackle -= Math.random() < 0.3 ? rnd(0.02, 0.06) : rnd(0.08, 0.35);
      }
    }

    // капли
    if (on('drip') && due('drip', 2.2, 6.5)) {
      const w = now + 0.05, o = ac.createOscillator(), g = gain(0), f0 = rnd(1100, 1600);
      o.frequency.setValueAtTime(f0, w); o.frequency.exponentialRampToValueAtTime(f0 * 0.45, w + 0.07);
      g.gain.setValueAtTime(0, w); g.gain.linearRampToValueAtTime(0.35, w + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, w + 0.16);
      const p = pan(rnd(-0.7, 0.7), layers.drip);
      o.connect(g); g.connect(p); g.connect(layers.dripDelay); o.start(w); o.stop(w + 0.2);
    }

    // копыта по булыжнику вдалеке
    if (on('city') && due('clop', 7, 15)) {
      const n = 6 + (Math.random() * 8 | 0), gap = rnd(0.22, 0.3), p = pan(rnd(-0.8, 0.8), layers.city);
      for (let i = 0; i < n; i++) {
        const env = Math.sin((i + 1) / (n + 1) * Math.PI);
        const w = now + 0.1 + i * gap + (i % 2 ? gap * 0.35 : 0) + rnd(-0.015, 0.015);
        burst(p, white, w, 0.05, rnd(900, 1300), 'bandpass', 4, 0.22 * env);
      }
      // скрип колёс
      const wh = tone(p, now + 0.1, rnd(180, 240), 0.012, n * gap, 'sawtooth', 0.4);
      wh.frequency.linearRampToValueAtTime(rnd(160, 260), now + n * gap);
    }

    // колокола — далёкий благовест
    if (on('bells') && due('bells', 22, 45)) {
      const f0 = rnd(150, 230), n = 3 + (Math.random() * 4 | 0), gap = rnd(1.6, 2.4), p = pan(rnd(-0.6, 0.6), layers.bells);
      const lp = filt('lowpass', 2200); lp.connect(p);
      for (let i = 0; i < n; i++) bell(lp, now + 0.1 + i * gap, i % 3 === 2 ? f0 * 1.5 : f0, 0.22, rnd(4.5, 6.5));
    }

    // шаги по мостовой: идёт — стоит — идёт
    if (on('steps')) {
      if (now > T.walkUntil && now > T.pauseUntil) {
        if (T.walkUntil && now < T.walkUntil + 0.5) { /* только что закончил */ }
        T.walkUntil = now + rnd(6, 14); T.pauseUntil = T.walkUntil + rnd(4, 10); T.steps = now + 0.1; T.side = 0;
      }
      while (now < T.walkUntil && T.steps < now + 0.3) {
        T.side = 1 - (T.side || 0);
        const p = pan(T.side ? 0.18 : -0.18, layers.steps);
        burst(p, brown, T.steps, 0.09, rnd(140, 220), 'lowpass', 1, 0.9);
        burst(p, white, T.steps + 0.01, 0.06, rnd(700, 1100), 'bandpass', 2.5, 0.25);
        T.steps += rnd(0.5, 0.6);
      }
    }

    // звон стаканов
    if (on('clink') && due('clink', 4, 11)) {
      const n = 1 + (Math.random() * 3 | 0), p = pan(rnd(-0.7, 0.7), layers.clink);
      for (let i = 0; i < n; i++) {
        const w = now + 0.1 + i * rnd(0.08, 0.2), f = rnd(2600, 4200);
        tone(p, w, f, 0.18, 0.45); tone(p, w, f * 2.76, 0.06, 0.25); tone(p, w, f * 1.5, 0.05, 0.3);
      }
    }

    // бубенцы саней
    if (on('sleigh') && due('sleigh', 7, 16)) {
      const n = 10 + (Math.random() * 10 | 0), p = pan(rnd(-0.8, 0.8), layers.sleigh);
      const lp = filt('lowpass', rnd(3500, 6000)); lp.connect(p);
      for (let i = 0; i < n; i++) {
        const env = Math.sin((i + 1) / (n + 1) * Math.PI);
        const w = now + 0.1 + i * 0.19 + rnd(-0.02, 0.02);
        for (let k = 0; k < 3; k++) {
          const f = rnd(3800, 6800);
          tone(lp, w + rnd(0, 0.03), f, 0.05 * env, rnd(0.15, 0.3));
        }
      }
    }

    // птицы
    if (on('birds') && due('birds', 2.5, 8)) {
      const n = 2 + (Math.random() * 5 | 0), p = pan(rnd(-0.9, 0.9), layers.birds), base = rnd(2600, 4200);
      for (let i = 0; i < n; i++) {
        const w = now + 0.1 + i * rnd(0.09, 0.16);
        const o = tone(p, w, base, 0.09, rnd(0.06, 0.12), 'sine', 0.005);
        o.frequency.setValueAtTime(base * rnd(0.8, 1), w);
        o.frequency.exponentialRampToValueAtTime(base * rnd(1.2, 1.7), w + 0.05);
      }
    }

    // скрип половиц / двери
    if (on('creak') && due('creak', 9, 24)) {
      const w = now + 0.1, d = rnd(0.5, 1.2), p = pan(rnd(-0.8, 0.8), layers.creak);
      const o = ac.createOscillator(), bp = filt('bandpass', rnd(500, 900), 6), g = gain(0);
      o.type = 'sawtooth'; o.frequency.setValueAtTime(rnd(70, 110), w);
      o.frequency.linearRampToValueAtTime(rnd(90, 170), w + d * 0.6);
      o.frequency.linearRampToValueAtTime(rnd(60, 120), w + d);
      const am = ac.createOscillator(), amg = gain(0.5); am.frequency.value = rnd(18, 32);
      am.connect(amg); amg.connect(g.gain);
      g.gain.setValueAtTime(0, w); g.gain.linearRampToValueAtTime(0.25, w + 0.08);
      g.gain.linearRampToValueAtTime(0.18, w + d * 0.7); g.gain.linearRampToValueAtTime(0, w + d);
      o.connect(bp); bp.connect(g); g.connect(p);
      o.start(w); am.start(w); o.stop(w + d + 0.05); am.stop(w + d + 0.05);
    }

    // фырканье лошади
    if (on('snort') && due('snort', 8, 16)) {
      const w = now + 0.1, d = rnd(0.35, 0.6);
      const s = ac.createBufferSource(); s.buffer = pink;
      const bp = filt('bandpass', rnd(500, 750), 1.4), g = gain(0);
      const am = ac.createOscillator(), amg = gain(0.6); am.frequency.value = rnd(22, 34);
      am.connect(amg); amg.connect(g.gain);
      g.gain.setValueAtTime(0, w); g.gain.linearRampToValueAtTime(0.9, w + 0.03); g.gain.exponentialRampToValueAtTime(0.001, w + d);
      s.connect(bp); bp.connect(g); g.connect(pan(rnd(-0.3, 0.3), layers.snort));
      s.start(w, rnd(0, 3)); am.start(w); s.stop(w + d + 0.05); am.stop(w + d + 0.05);
    }

    // капли дождя по стеклу
    if (on('drops')) {
      T.drops -= step;
      while (T.drops <= 0) {
        const w = now + Math.random() * step;
        tone(pan(rnd(-0.9, 0.9), layers.drops), w, rnd(2200, 5200), rnd(0.03, 0.09), rnd(0.03, 0.07));
        T.drops += rnd(0.05, 0.4);
      }
    }

    // тяжело-звонкое скаканье
    if (on('hooves')) {
      if (T.hoof < now) T.hoof = now + 0.05;
      while (T.hoof < now + 0.4) {
        [0, 0.11, 0.22].forEach((o, i) => {
          const w = T.hoof + o + rnd(-0.008, 0.008), p = i === 2 ? 1 : 0.7;
          thump(layers.hooves, w, 70, 0.8 * p, 0.12);
          burst(layers.hooves, white, w, 0.07, rnd(1600, 2100), 'bandpass', 9, 0.5 * p);
          tone(layers.hooves, w, rnd(2400, 2700), 0.05 * p, 0.18);
        });
        T.hoof += 0.62;
      }
    }

    // дыхание
    if (on('breath') && due('breath', 4.2, 5.6)) {
      const g = layers.breathEnv.gain, w = now + 0.05;
      g.cancelScheduledValues(w); g.setValueAtTime(0.0001, w);
      g.linearRampToValueAtTime(0.35, w + 1.3); g.linearRampToValueAtTime(0.05, w + 1.9);
      g.linearRampToValueAtTime(0.8, w + 2.2); g.exponentialRampToValueAtTime(0.0001, w + 3.6);
    }
  }

  // сердце бьётся в такт с пульсацией картинки (событие из atmos.js)
  function heartbeat(strength) {
    if (!ac || !enabled || (mix.heart || 0) < 0.01) return;
    const w = ac.currentTime + 0.01;
    thump(layers.heart, w, strength > 0.8 ? 52 : 46, 0.9 * strength, 0.22);
    burst(layers.heart, brown, w, 0.12, 120, 'lowpass', 1, 0.5 * strength);
  }

  function thunder(dist) {
    if (!ac || !enabled) return;
    const w = ac.currentTime + 0.2 + dist * 1.8;
    if (dist < 0.55) burst(layers.thunder, white, w, 0.25, 1800, 'highpass', 0.7, 0.9 * (1 - dist), 0.003); // треск
    for (let i = 0; i < 3; i++) {
      const s = ac.createBufferSource(); s.buffer = brown;
      const f = filt('lowpass', lerp(420, 140, dist) * rnd(0.8, 1.2)), g = gain(0);
      s.connect(f); f.connect(g); g.connect(pan(rnd(-0.6, 0.6), layers.thunder));
      const t = w + i * rnd(0.25, 0.6), peak = lerp(1.7, 0.7, dist) * (i ? 0.6 : 1);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.08 + dist * 0.3);
      g.gain.linearRampToValueAtTime(peak * 0.45, t + 0.9); g.gain.linearRampToValueAtTime(peak * 0.7, t + 1.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5 + dist * 2);
      s.start(t, Math.random()); s.stop(t + 7.5);
    }
  }

  function applyMix(k, fast) {
    key = k;
    const a = Atmos.list[k] || {};
    mix = Object.assign({}, a.snd || {}, EXTRA[k] || {});
    if (!ac) return;
    const now = ac.currentTime;
    for (const name in BASE) layers[name].gain.setTargetAtTime((mix[name] || 0) * BASE[name], now, fast ? 0.3 : 1.4);
    wet.gain.setTargetAtTime(REV[k] !== undefined ? REV[k] : 0.3, now, 1.2);
    // ветер в бурю — ниже и злее
    layers.windFilter.Q.setTargetAtTime(k === 'storm' || k === 'chase' || k === 'buran' ? 0.6 : 0.9, now, 1);
    if (musicOn) setChord(CHORD[k]);
  }

  window.Sound = {
    get enabled() { return enabled; },
    get volume() { return volume; },
    get music() { return musicOn; },
    async enable(on) {
      enabled = on;
      if (on) {
        if (!ac) build();
        if (ac.state === 'suspended') await ac.resume();
        applyMix(Atmos.key, true);
        master.gain.setTargetAtTime(volume, ac.currentTime, 0.6);
        musicBus.gain.setTargetAtTime(musicOn ? 0.5 : 0, ac.currentTime, 0.8);
        T.tick = Math.ceil(ac.currentTime);
        if (!timer) timer = setInterval(schedule, 100);
      } else if (ac) {
        master.gain.setTargetAtTime(0, ac.currentTime, 0.25);
        setTimeout(() => { if (!enabled && ac) { ac.suspend(); clearInterval(timer); timer = null; } }, 1500);
      }
    },
    setVolume(v) { volume = v; if (ac && enabled) master.gain.setTargetAtTime(v, ac.currentTime, 0.1); },
    setMusic(on) {
      musicOn = on;
      if (!ac) return;
      musicBus.gain.setTargetAtTime(on ? 0.5 : 0, ac.currentTime, 0.8);
      if (on) setChord(CHORD[key]); else setChord(null);
    }
  };

  Atmos.on((type, val) => {
    if (type === 'atmos') applyMix(val);
    if (type === 'thunder') thunder(val);
    if (type === 'beat') heartbeat(val);
  });

  document.addEventListener('visibilitychange', () => {
    if (!ac || !enabled) return;
    if (document.hidden) ac.suspend(); else ac.resume();
  });
})();
