/* Атмосферы: палитра, свет, частицы, звук.  */
(function () {
  'use strict';

  // bg — фон, glow — цвет источника света, ink — текст, muted — второстепенный текст, accent — акцент
  // at — где находится источник света (доли экрана), size — радиус света, vig — сила виньетки
  // fx — уровни эффектов 0..1, snd — громкость звуковых слоёв 0..1
  const A = {
    candle: {
      bg: '#0f0c0a', glow: '#5a3a18', ink: '#efe6d6', muted: '#9d907d', accent: '#e0aa5e',
      at: [0.5, 0.18], size: 0.75, vig: 0.55, flicker: 0.35,
      fx: { embers: 0.5, dust: 0.25 }, snd: { hum: 0.25, crackle: 0.35 }
    },
    heat: {
      bg: '#211a10', glow: '#7a5520', ink: '#f1e5c9', muted: '#ab9a7b', accent: '#e4b85a',
      at: [0.82, 0.05], size: 1.05, vig: 0.45, flicker: 0,
      fx: { dust: 1, haze: 0.5 }, snd: { city: 0.75, wind: 0.08 }
    },
    garret: {
      bg: '#1a1a11', glow: '#4f4a22', ink: '#e7e0c3', muted: '#9e987a', accent: '#cbbb68',
      at: [0.15, 0.12], size: 0.7, vig: 0.78, flicker: 0,
      fx: { dust: 0.45 }, snd: { tick: 0.6, hum: 0.18 }
    },
    neva: {
      bg: '#101922', glow: '#3d6080', ink: '#e6edf2', muted: '#91a3b1', accent: '#a3c8e0',
      at: [0.5, 0.0], size: 1.1, vig: 0.4, flicker: 0,
      fx: { mist: 0.55 }, snd: { wind: 0.4, water: 0.55 }
    },
    cellar: {
      bg: '#16120e', glow: '#4a3824', ink: '#e4d8c7', muted: '#938372', accent: '#c48d55',
      at: [0.88, 0.0], size: 0.85, vig: 0.8, flicker: 0,
      fx: { smoke: 0.6, dust: 0.3 }, snd: { hum: 0.3, drip: 0.45, crackle: 0.2 }
    },
    lamp: {
      bg: '#120d09', glow: '#74461a', ink: '#f2dec2', muted: '#9e876b', accent: '#eaa352',
      at: [0.5, 0.3], size: 0.7, vig: 0.85, flicker: 0.55,
      fx: { smoke: 0.4, embers: 0.15 }, snd: { hum: 0.25, crackle: 0.5 }
    },
    song: {
      bg: '#0f0a08', glow: '#6a2a14', ink: '#eed8c3', muted: '#9a8070', accent: '#d76a45',
      at: [0.5, 0.35], size: 0.6, vig: 0.9, flicker: 0.8,
      fx: { smoke: 0.35, embers: 0.2 }, snd: { hum: 0.2, crackle: 0.35 }
    },
    curtain: {
      bg: '#070505', glow: '#1c0e0a', ink: '#cdbcaa', muted: '#6e6158', accent: '#a0503a',
      at: [0.5, 0.5], size: 0.4, vig: 1, flicker: 0,
      fx: {}, snd: {}
    },
    snow: {
      bg: '#141925', glow: '#6e5832', ink: '#ebeff6', muted: '#9aa4ba', accent: '#e8c47c',
      at: [0.22, 0.08], size: 0.8, vig: 0.55, flicker: 0.08,
      fx: { snow: 1 }, snd: { wind: 0.5, hum: 0.12 }
    },
    izba: {
      bg: '#1b130c', glow: '#6a3c18', ink: '#eedcc5', muted: '#a08870', accent: '#de8f4c',
      at: [0.1, 0.85], size: 0.9, vig: 0.75, flicker: 0.4,
      fx: { embers: 0.35, haze: 0.35 }, snd: { crackle: 0.55, hum: 0.2 }
    },
    stable: {
      bg: '#110e0a', glow: '#3e2f1b', ink: '#e9ddc9', muted: '#958673', accent: '#cba56b',
      at: [0.75, 0.2], size: 0.65, vig: 0.85, flicker: 0.18,
      fx: { dust: 0.35 }, snd: { breath: 0.6, hum: 0.1, wind: 0.12 }
    },
    shore: {
      bg: '#131916', glow: '#3e4d42', ink: '#e3e9e3', muted: '#8f9d93', accent: '#abc4aa',
      at: [0.5, 0.0], size: 1.1, vig: 0.55, flicker: 0,
      fx: { mist: 1 }, snd: { water: 0.5, wind: 0.3 }
    },
    whitenight: {
      bg: '#d9dae4', glow: '#f7f1e8', ink: '#23273a', muted: '#5d6378', accent: '#7d5d93',
      at: [0.5, 0.0], size: 1.2, vig: 0.12, flicker: 0, light: true,
      fx: { mist: 0.45 }, snd: { water: 0.35, wind: 0.1 }
    },
    storm: {
      bg: '#0d1115', glow: '#25313c', ink: '#dde4ea', muted: '#7f8d98', accent: '#93b5cb',
      at: [0.5, 0.0], size: 1, vig: 0.7, flicker: 0, thunder: true,
      fx: { rain: 1, mist: 0.3 }, snd: { rain: 0.85, wind: 0.6, water: 0.3 }
    },

    // ---- для полных текстов ----
    tavern: { // распивочная, трактир
      bg: '#1c140c', glow: '#6e4518', ink: '#f0dfc4', muted: '#a38c70', accent: '#e09a4a',
      at: [0.3, 0.22], size: 0.8, vig: 0.72, flicker: 0.25,
      fx: { smoke: 0.55, dust: 0.2 }, snd: { crowd: 0.65, hum: 0.3, crackle: 0.12 }
    },
    dream: { // сон, бред
      bg: '#1a0d0e', glow: '#6a2222', ink: '#f1dcd6', muted: '#a4807c', accent: '#e0705a',
      at: [0.5, 0.4], size: 0.9, vig: 0.88, flicker: 0.1,
      fx: { mist: 0.75 }, snd: { wind: 0.25, heart: 0.35, hum: 0.2 }
    },
    dread: { // убийство, страх
      bg: '#0e0d09', glow: '#4a4318', ink: '#e9e2c6', muted: '#8e886c', accent: '#d6c25a',
      at: [0.5, 0.12], size: 0.55, vig: 0.93, flicker: 0.05,
      fx: { dust: 0.25 }, snd: { heart: 0.65, tick: 0.3, hum: 0.15 }
    },
    fever: { // болезнь, забытьё
      bg: '#151513', glow: '#3f3a2c', ink: '#e5e0d2', muted: '#918b7c', accent: '#c2b48a',
      at: [0.2, 0.1], size: 0.7, vig: 0.86, flicker: 0,
      fx: { mist: 0.35, dust: 0.2 }, snd: { heart: 0.22, hum: 0.2, tick: 0.18 }
    },
    office: { // полицейская контора
      bg: '#1b1a14', glow: '#6a5f3a', ink: '#ece6d2', muted: '#a29b84', accent: '#d2bb72',
      at: [0.82, 0.0], size: 1, vig: 0.55, flicker: 0,
      fx: { dust: 0.85, haze: 0.3 }, snd: { crowd: 0.35, hum: 0.3, tick: 0.2 }
    },
    night: { // вечерний город, фонари
      bg: '#0d1018', glow: '#4a3a22', ink: '#e6e8ee', muted: '#8a90a2', accent: '#e0b46a',
      at: [0.72, 0.1], size: 0.6, vig: 0.72, flicker: 0.1,
      fx: { mist: 0.22 }, snd: { city: 0.4, wind: 0.22, crowd: 0.15 }
    },
    porfiry: { // кабинет следователя
      bg: '#121512', glow: '#3c4a3a', ink: '#e3e8e1', muted: '#8c978b', accent: '#b8c79a',
      at: [0.85, 0.05], size: 0.8, vig: 0.72, flicker: 0,
      fx: { smoke: 0.35 }, snd: { tick: 0.55, hum: 0.25 }
    },
    sonya: { // комната при огарке
      bg: '#0f0b08', glow: '#7a4a18', ink: '#f2e2c8', muted: '#a08a6c', accent: '#f0b35a',
      at: [0.5, 0.42], size: 0.5, vig: 0.93, flicker: 0.5,
      fx: { embers: 0.05 }, snd: { hum: 0.15, crackle: 0.12, wind: 0.08 }
    },
    wake: { // поминки
      bg: '#1a120e', glow: '#5e3a22', ink: '#efdcc8', muted: '#a08672', accent: '#d9925c',
      at: [0.5, 0.2], size: 0.8, vig: 0.7, flicker: 0.2,
      fx: { smoke: 0.3 }, snd: { crowd: 0.7, hum: 0.25 }
    },
    street: { // Сенная на закате
      bg: '#1d1612', glow: '#7a4426', ink: '#f1e2cf', muted: '#a88f7a', accent: '#e88a55',
      at: [0.85, 0.15], size: 1, vig: 0.55, flicker: 0,
      fx: { dust: 0.6, haze: 0.4 }, snd: { city: 0.7, crowd: 0.35 }
    },
    morning: { // серое петербургское утро
      bg: '#1a1c1e', glow: '#5b6066', ink: '#eceeef', muted: '#9aa0a6', accent: '#c8b48a',
      at: [0.2, 0.0], size: 1, vig: 0.5, flicker: 0,
      fx: { dust: 0.35 }, snd: { city: 0.3, hum: 0.15 }
    },
    fogdawn: { // молочный туман
      bg: '#2a2d30', glow: '#8a9096', ink: '#f0f2f3', muted: '#a6acb1', accent: '#c6ccd2',
      at: [0.5, 0.0], size: 1.2, vig: 0.4, flicker: 0,
      fx: { mist: 1 }, snd: { water: 0.3, wind: 0.15 }
    },
    siberia: { // острог, река, холод
      bg: '#151a20', glow: '#44505c', ink: '#e8edf2', muted: '#95a0ab', accent: '#b9cde0',
      at: [0.5, 0.0], size: 1.1, vig: 0.55, flicker: 0,
      fx: { snow: 0.35, mist: 0.3 }, snd: { wind: 0.55 }
    },
    spring: { // весеннее утро у реки — свет
      bg: '#e6e3d8', glow: '#fbf6e6', ink: '#2a2a26', muted: '#67665c', accent: '#8a7a3a',
      at: [0.3, 0.0], size: 1.2, vig: 0.1, flicker: 0, light: true,
      fx: { dust: 0.3, mist: 0.2 }, snd: { water: 0.45, wind: 0.12 }
    },
    cellarEve: { // ночлежка вечером
      bg: '#140f0c', glow: '#5a3a1e', ink: '#e8d8c4', muted: '#968270', accent: '#cf9050',
      at: [0.3, 0.3], size: 0.7, vig: 0.82, flicker: 0.3,
      fx: { smoke: 0.5 }, snd: { hum: 0.3, crackle: 0.25, drip: 0.2 }
    },
    wasteland: { // пустырь, закат
      bg: '#1a1210', glow: '#8a3e22', ink: '#f0dccb', muted: '#a58a7a', accent: '#e8784a',
      at: [0.8, 0.78], size: 1, vig: 0.6, flicker: 0,
      fx: { dust: 0.5, haze: 0.4 }, snd: { wind: 0.4, city: 0.15 }
    },
    aftermath: { // после наводнения
      bg: '#1b1f22', glow: '#4c5660', ink: '#e6eaed', muted: '#8f989f', accent: '#a9bccb',
      at: [0.5, 0.0], size: 1, vig: 0.55, flicker: 0,
      fx: { mist: 0.6 }, snd: { water: 0.5, wind: 0.25 }
    },
    chase: { // медный всадник скачет
      bg: '#080b12', glow: '#2c3b55', ink: '#dfe6f2', muted: '#7d8aa0', accent: '#c9d6ea',
      at: [0.72, 0.12], size: 0.55, vig: 0.9, flicker: 0,
      fx: { mist: 0.25 }, snd: { hooves: 0.9, wind: 0.35, heart: 0.3 }
    },
    buran: { // степной буран: небо смешалось со снегом
      bg: '#161b24', glow: '#4a5468', ink: '#eef1f6', muted: '#9ba4b4', accent: '#c9d4e6',
      at: [0.5, 0.3], size: 1.2, vig: 0.7, flicker: 0,
      fx: { snow: 1, mist: 0.55 }, snd: { wind: 1 }
    },
    steppe: { // Белогорская крепость, степь, Яик
      bg: '#1c1912', glow: '#6b5a32', ink: '#efe6d2', muted: '#a39a82', accent: '#d8b56a',
      at: [0.75, 0.05], size: 1.1, vig: 0.45, flicker: 0,
      fx: { dust: 0.35, haze: 0.3 }, snd: { wind: 0.45 }
    },
    siege: { // приступ, пожар, осада
      bg: '#1a0f0b', glow: '#8a3418', ink: '#f2dccb', muted: '#a7887a', accent: '#ff8a4a',
      at: [0.5, 0.95], size: 1, vig: 0.7, flicker: 0.6,
      fx: { smoke: 0.8, embers: 0.9 }, snd: { crackle: 0.7, wind: 0.3, crowd: 0.35, heart: 0.3 }
    },
    garden: { // старый сад, Царское Село, первое мая
      bg: '#191a12', glow: '#6e6a34', ink: '#f0ecd8', muted: '#a6a28a', accent: '#cdc27a',
      at: [0.3, 0.02], size: 1.1, vig: 0.4, flicker: 0,
      fx: { dust: 0.3, haze: 0.2 }, snd: { wind: 0.15 }
    },
    bonfire: { // костёр на вдовьих огородах
      bg: '#120d0b', glow: '#7a3412', ink: '#f1e0cf', muted: '#9e8a7c', accent: '#f09050',
      at: [0.5, 0.88], size: 0.75, vig: 0.85, flicker: 0.75,
      fx: { embers: 0.85, smoke: 0.3 }, snd: { wind: 0.55, crackle: 0.65 }
    },
    rain: { // обложной дождь
      bg: '#14191a', glow: '#3f5155', ink: '#e6ecec', muted: '#93a0a0', accent: '#9fc2bf',
      at: [0.5, 0.0], size: 1, vig: 0.55, flicker: 0,
      fx: { rain: 0.85, mist: 0.35 }, snd: { rain: 0.8, wind: 0.15 }
    },
    moonvillage: { // лунная ночь, сарай, село
      bg: '#0d1118', glow: '#34425e', ink: '#e3e8f1', muted: '#8a93a6', accent: '#c3cfe6',
      at: [0.72, 0.12], size: 0.8, vig: 0.7, flicker: 0,
      fx: { mist: 0.2 }, snd: { wind: 0.1, hum: 0.08 }
    },
    cemetery: { // кладбище при луне
      bg: '#0b0d10', glow: '#3a4456', ink: '#e6e9ee', muted: '#868d99', accent: '#d7dde8',
      at: [0.65, 0.1], size: 0.9, vig: 0.8, flicker: 0,
      fx: { mist: 0.55 }, snd: { wind: 0.18 }
    },
    frost: { // петербургский мороз
      bg: '#121722', glow: '#4b5a78', ink: '#eaf0f8', muted: '#97a2b8', accent: '#b8c8e8',
      at: [0.6, 0.0], size: 1, vig: 0.5, flicker: 0,
      fx: { snow: 0.35, haze: 0.2 }, snd: { wind: 0.4, city: 0.3 }
    },
    square: { // пустая площадь ночью, огонёк будки
      bg: '#07090d', glow: '#1f2836', ink: '#dde3ec', muted: '#7a8494', accent: '#9eb0c8',
      at: [0.86, 0.42], size: 0.35, vig: 0.95, flicker: 0.2,
      fx: { snow: 0.5, mist: 0.3 }, snd: { wind: 0.8, heart: 0.35 }
    }
  };

  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  for (const k in A) for (const c of ['bg', 'glow', 'ink', 'muted', 'accent']) A[k][c + 'Rgb'] = hex(A[k][c]);

  // дополнительные картины: лучи света из окна, луна, капли на стекле
  const VIS = {
    candle: { rays: 0.15 }, heat: { rays: 0.9 }, garret: { rays: 0.65 }, office: { rays: 0.75 }, morning: { rays: 0.5 },
    street: { rays: 0.6 }, spring: { rays: 0.55 }, cellar: { rays: 0.55 }, cellarEve: { rays: 0.2 }, whitenight: { rays: 0.3 },
    wasteland: { rays: 0.55 }, porfiry: { rays: 0.3 }, neva: { rays: 0.25 },
    night: { moon: 0.75 }, chase: { moon: 1 }, siberia: { moon: 0.45 }, aftermath: { moon: 0.3 }, fogdawn: { glass: 0.25 },
    storm: { glass: 0.9 },
    steppe: { rays: 0.5 }, garden: { rays: 0.55 }, moonvillage: { moon: 0.9 }, cemetery: { moon: 1 },
    rain: { glass: 0.5 }, frost: { rays: 0.35 }
  };
  // пульс: картинка «дышит» в такт сердцу
  const PULSE = { dread: 0.75, dream: 0.5, fever: 0.3, chase: 0.4, siege: 0.45, square: 0.45, cemetery: 0.2 };
  for (const k in VIS) A[k].fx = Object.assign({}, A[k].fx, VIS[k]);
  for (const k in A) A[k].pulse = PULSE[k] || 0;

  const lerp = (a, b, t) => a + (b - a) * t;
  const rgb = (c, a) => a === undefined
    ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
    : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

  const FX_KEYS = ['dust', 'haze', 'mist', 'smoke', 'snow', 'rain', 'embers', 'rays', 'moon', 'glass'];
  const root = document.documentElement;

  // ---------- состояние ----------
  const cur = {
    bg: hex(A.candle.bg), glow: hex(A.candle.glow), ink: hex(A.candle.ink),
    muted: hex(A.candle.muted), accent: hex(A.candle.accent),
    at: A.candle.at.slice(), size: A.candle.size, vig: A.candle.vig, flicker: A.candle.flicker,
    fx: {}
  };
  FX_KEYS.forEach(k => cur.fx[k] = 0);
  let target = A.candle, targetKey = 'candle';
  let effectsOn = true;
  let pointer = null; // мягкое следование света за курсором (только в библиотеке)
  let follow = false;

  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- canvas ----------
  const cv = document.getElementById('fx');
  const ctx = cv.getContext('2d');
  const glowEl = document.getElementById('glow');
  const flashEl = document.getElementById('flash');
  const vigEl = document.getElementById('vig');
  let W = 0, H = 0, DPR = 1;

  function resize() {
    const pw = W, ph = H;
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // на телефоне высота «прыгает», когда прячется адресная строка: частицы не пересеиваем
    if (!pw || W !== pw || Math.abs(H - ph) > ph * 0.25) seedAll();
  }
  // пишем в стили только изменившиеся значения: меньше пересчётов на каждом кадре
  const lastVal = new Map();
  function setVar(el, name, v) {
    const key = el.id + name;
    if (lastVal.get(key) === v) return;
    lastVal.set(key, v);
    if (name === 'opacity') el.style.opacity = v; else el.style.setProperty(name, v);
  }

  // мягкий круглый спрайт
  function sprite(size, inner) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(inner, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    return c;
  }
  const SOFT = sprite(64, 0.35);
  const FOG = sprite(256, 0.2);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const P = { dust: [], haze: [], mist: [], smoke: [], snow: [], rain: [], embers: [], glass: [], rays: [] };

  function seedAll() {
    const area = W * H;
    const n = (div, max) => Math.min(max, Math.round(area / div));
    P.dust = Array.from({ length: n(9000, 150) }, () => newDust(true));
    P.haze = Array.from({ length: 7 }, () => newFog(true, 'haze'));
    P.mist = Array.from({ length: n(90000, 14) + 4 }, () => newFog(true, 'mist'));
    P.smoke = Array.from({ length: n(110000, 10) + 3 }, () => newFog(true, 'smoke'));
    P.snow = Array.from({ length: n(5200, 260) }, () => newSnow(true));
    P.rain = Array.from({ length: n(3200, 420) }, () => newRain(true));
    P.embers = Array.from({ length: n(40000, 28) + 6 }, () => newEmber(true));
    P.glass = Array.from({ length: n(26000, 36) + 6 }, () => newDrop(true));
    P.rays = Array.from({ length: 6 }, (_, i) => ({ off: (i - 2.5) * 0.11 + rnd(-0.03, 0.03), w: rnd(0.05, 0.13), ph: rnd(0, 6.28), sp: rnd(0.08, 0.2), a: rnd(0.5, 1) }));
  }
  // капля на стекле: висит, потом срывается и стекает
  function newDrop(init) {
    return { x: rnd(0, W), y: init ? rnd(0, H) : rnd(-40, H * 0.4), r: rnd(1.5, 5), v: 0, hold: rnd(0.5, 6), trail: [] };
  }

  function newDust(init) {
    return {
      x: rnd(0, W), y: init ? rnd(0, H) : H + 10, r: rnd(0.5, 2.1),
      vx: rnd(-4, 4), vy: rnd(-9, -2), ph: rnd(0, 6.28), sp: rnd(0.4, 1.4), a: rnd(0.25, 0.9)
    };
  }
  function newFog(init, kind) {
    const s = kind === 'haze' ? rnd(0.6, 1.1) : rnd(0.45, 0.95);
    const size = Math.max(W, H) * s;
    return {
      kind, size, a: kind === 'haze' ? rnd(0.04, 0.08) : rnd(0.05, 0.11),
      x: init ? rnd(-size * 0.3, W + size * 0.3) : (kind === 'smoke' ? rnd(0, W) : -size * 0.6),
      y: kind === 'smoke' ? (init ? rnd(0, H) : H + size * 0.4) : rnd(H * 0.15, H * 1.05),
      vx: kind === 'smoke' ? rnd(-6, 6) : rnd(4, 14), vy: kind === 'smoke' ? rnd(-14, -5) : rnd(-1, 1),
      ph: rnd(0, 6.28)
    };
  }
  function newSnow(init) {
    const z = Math.random(); // 0 — далеко, 1 — близко
    return {
      x: rnd(-20, W + 20), y: init ? rnd(-H * 0.1, H) : rnd(-60, -10),
      z, r: lerp(1.1, 5.2, z * z), vy: lerp(22, 70, z), ph: rnd(0, 6.28), sw: rnd(0.3, 1.1),
      a: lerp(0.35, 0.9, z)
    };
  }
  function newRain(init) {
    const z = Math.random();
    return {
      x: rnd(-W * 0.2, W * 1.1), y: init ? rnd(-H, H) : rnd(-H * 0.4, -20),
      z, len: lerp(10, 30, z), v: lerp(800, 1500, z), a: lerp(0.12, 0.38, z)
    };
  }
  function newEmber(init) {
    return {
      x: rnd(W * 0.1, W * 0.9), y: init ? rnd(H * 0.3, H) : H + 5, r: rnd(0.6, 1.8),
      vx: rnd(-8, 8), vy: rnd(-40, -14), life: init ? rnd(0, 1) : 0, max: rnd(4, 9), ph: rnd(0, 6.28)
    };
  }

  // ---------- шум для мерцания ----------
  let fl = 0, flTarget = 0, flTimer = 0;

  // ---------- гроза ----------
  let flash = 0, nextThunder = 6, bolt = null;
  const listeners = [];

  // ---------- пульс и вуаль смены сцены ----------
  let pulseLvl = 0, pulseV = 0, beatT = 0.3, dubDue = -1, veil = 0;
  const veilEl = document.getElementById('veil');

  function makeBolt() {
    const pts = [];
    let x = rnd(W * 0.15, W * 0.85), y = -10;
    const end = rnd(H * 0.45, H * 0.8);
    pts.push([x, y]);
    while (y < end) { x += rnd(-38, 38); y += rnd(18, 46); pts.push([x, y]); }
    const branches = [];
    for (let b = 0; b < 2; b++) {
      const s = pts[2 + (Math.random() * (pts.length - 3) | 0)];
      let bx = s[0], by = s[1]; const br = [[bx, by]], dir = Math.random() < 0.5 ? -1 : 1;
      for (let i = 0; i < 5; i++) { bx += dir * rnd(10, 34); by += rnd(14, 34); br.push([bx, by]); }
      branches.push(br);
    }
    return { pts, branches };
  }

  // ---------- цикл ----------
  let last = performance.now(), t = 0, running = true, settled = false;

  function frame(now) {
    if (!running) return;
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now; t += dt;

    // плавный переход палитры и уровней
    const k = 1 - Math.exp(-dt * 1.4);
    let delta = 0;
    for (const c of ['bg', 'glow', 'ink', 'muted', 'accent']) {
      const tg = target[c + 'Rgb'];
      for (let i = 0; i < 3; i++) {
        const d = tg[i] - cur[c][i];
        cur[c][i] += d * k; delta += Math.abs(d);
      }
    }
    let at = target.at;
    if (follow && pointer) at = [lerp(target.at[0], pointer[0], 0.55), lerp(target.at[1], pointer[1], 0.55)];
    cur.at[0] += (at[0] - cur.at[0]) * k * 1.6; cur.at[1] += (at[1] - cur.at[1]) * k * 1.6;
    cur.size += (target.size - cur.size) * k;
    cur.vig += (target.vig - cur.vig) * k;
    cur.flicker += ((effectsOn && !reduce ? target.flicker : 0) - cur.flicker) * k;
    for (const f of FX_KEYS) {
      const tg = effectsOn && !reduce ? (target.fx[f] || 0) : 0;
      cur.fx[f] += (tg - cur.fx[f]) * k;
      if (Math.abs(tg - cur.fx[f]) < 0.002) cur.fx[f] = tg;
    }

    if (delta > 0.6) {
      root.style.setProperty('--bg', rgb(cur.bg));
      root.style.setProperty('--glow', rgb(cur.glow));
      root.style.setProperty('--ink', rgb(cur.ink));
      root.style.setProperty('--muted', rgb(cur.muted));
      root.style.setProperty('--accent', rgb(cur.accent));
      root.style.setProperty('--ink-soft', rgb(cur.ink, 0.14));
      root.style.setProperty('--accent-soft', rgb(cur.accent, 0.22));
      root.style.setProperty('--panel', rgb(cur.bg, 0.82));
      settled = false;
    } else if (!settled) settled = true;
    setVar(glowEl, '--gx', (cur.at[0] * 100).toFixed(1) + '%');
    setVar(glowEl, '--gy', (cur.at[1] * 100).toFixed(1) + '%');
    setVar(glowEl, '--gs', (cur.size * 100).toFixed(1) + 'vmax');
    // сердце: удар — «тук», через 0.27 с — «тук» потише
    pulseLvl += ((effectsOn && !reduce ? target.pulse : 0) - pulseLvl) * k;
    if (target.pulse > 0) {
      beatT -= dt;
      if (beatT <= 0) {
        beatT = rnd(0.82, 0.9); pulseV = 1; dubDue = 0.27;
        listeners.forEach(fn => fn('beat', 1));
      }
      if (dubDue > 0) { dubDue -= dt; if (dubDue <= 0) { pulseV = Math.max(pulseV, 0.6); listeners.forEach(fn => fn('beat', 0.6)); } }
    }
    pulseV = Math.max(0, pulseV - dt * 5);
    veil = Math.max(0, veil - dt * 1.3);
    setVar(veilEl, 'opacity', (veil * veil * 0.45).toFixed(3));
    setVar(vigEl, '--vig', Math.min(1, cur.vig + pulseV * pulseLvl * 0.22).toFixed(3));

    // мерцание источника света
    flTimer -= dt;
    if (flTimer <= 0) { flTarget = Math.random(); flTimer = rnd(0.05, 0.22); }
    fl += (flTarget - fl) * Math.min(1, dt * 9);
    const flick = 1 - cur.flicker * (0.15 + 0.55 * fl * fl) + cur.flicker * 0.12 * Math.sin(t * 7.3);
    setVar(glowEl, 'opacity', Math.max(0, Math.min(1, flick)).toFixed(3));

    // гроза
    if (target.thunder && effectsOn && !reduce && cur.fx.rain > 0.6) {
      nextThunder -= dt;
      if (nextThunder <= 0) {
        flash = 1; nextThunder = rnd(8, 17);
        const dist = rnd(0.3, 1);
        bolt = dist < 0.7 ? makeBolt() : null;
        listeners.forEach(fn => fn('thunder', dist));
        setTimeout(() => { flash = Math.max(flash, 0.6); }, rnd(90, 160));
      }
    }
    flash = Math.max(0, flash - dt * 2.6);
    setVar(flashEl, 'opacity', (flash * 0.32).toFixed(3));

    draw(dt);
    requestAnimationFrame(frame);
  }

  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    const acc = cur.accent, ink = cur.ink;
    const L = cur.fx;
    const gx = cur.at[0] * W, gy = cur.at[1] * H;

    // луна
    if (L.moon > 0.001) {
      const mx = W * 0.8, my = H * 0.15, r = Math.min(W, H) * 0.035 + 10;
      tint(FOG, [205, 215, 235], 0.22 * L.moon, mx - r * 7, my - r * 7, r * 14, r * 14);
      ctx.globalAlpha = 0.85 * L.moon;
      const g = ctx.createRadialGradient(mx - r * 0.3, my - r * 0.3, r * 0.1, mx, my, r);
      g.addColorStop(0, 'rgb(246,244,232)'); g.addColorStop(1, 'rgb(200,204,214)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, r, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // лучи света из окна / от лампы
    if (L.rays > 0.001) {
      const len = Math.max(W, H) * 1.5;
      const base = Math.atan2(H * 0.65 - gy, W * 0.5 - gx);
      ctx.save();
      ctx.globalCompositeOperation = root.dataset.light === '1' ? 'source-over' : 'screen';
      for (const r of P.rays) {
        const ang = base + r.off + Math.sin(t * r.sp + r.ph) * 0.025;
        const half = r.w * (0.85 + 0.15 * Math.sin(t * r.sp * 1.7 + r.ph));
        const a = 0.075 * L.rays * r.a * (0.7 + 0.3 * Math.sin(t * r.sp * 2.3 + r.ph));
        const x1 = gx + Math.cos(ang - half) * len, y1 = gy + Math.sin(ang - half) * len;
        const x2 = gx + Math.cos(ang + half) * len, y2 = gy + Math.sin(ang + half) * len;
        const g = ctx.createLinearGradient(gx, gy, gx + Math.cos(ang) * len * 0.8, gy + Math.sin(ang) * len * 0.8);
        g.addColorStop(0, rgb(acc, a)); g.addColorStop(0.45, rgb(acc, a * 0.45)); g.addColorStop(1, rgb(acc, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    // туман / марево / дым — большие мягкие пятна
    for (const kind of ['haze', 'mist', 'smoke']) {
      const lvl = L[kind]; if (lvl < 0.01) { if (lvl === 0) continue; }
      const col = kind === 'haze' ? acc : kind === 'smoke' ? [ink[0] * 0.8 + acc[0] * 0.2, ink[1] * 0.8 + acc[1] * 0.2, ink[2] * 0.8 + acc[2] * 0.2] : ink;
      for (let i = 0; i < P[kind].length; i++) {
        const p = P[kind][i];
        p.x += p.vx * dt; p.y += p.vy * dt + Math.sin(t * 0.2 + p.ph) * 2 * dt;
        if (kind === 'smoke') { if (p.y < -p.size * 0.6) P[kind][i] = newFog(false, kind); }
        else if (p.x > W + p.size * 0.6) P[kind][i] = newFog(false, kind);
        const a = p.a * lvl * (kind === 'smoke' ? 0.9 : 1);
        if (a < 0.002) continue;
        tint(FOG, col, a, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.55);
      }
    }

    // пыль в луче света
    if (L.dust > 0.001) {
      const gx = cur.at[0] * W, gy = cur.at[1] * H, R = cur.size * Math.max(W, H);
      for (let i = 0; i < P.dust.length; i++) {
        const p = P.dust[i];
        p.x += (p.vx + Math.sin(t * p.sp + p.ph) * 6) * dt; p.y += p.vy * dt;
        if (p.y < -10 || p.x < -10 || p.x > W + 10) P.dust[i] = newDust(false);
        const d = Math.hypot(p.x - gx, p.y - gy) / R;
        const light = Math.max(0.15, 1 - d);
        const tw = 0.55 + 0.45 * Math.sin(t * p.sp * 2 + p.ph);
        const a = p.a * light * tw * L.dust * 0.95;
        if (a < 0.01) continue;
        tint(SOFT, acc, a, p.x - p.r * 2, p.y - p.r * 2, p.r * 4, p.r * 4);
      }
    }

    // искры / угольки
    if (L.embers > 0.001) {
      for (let i = 0; i < P.embers.length; i++) {
        const p = P.embers[i];
        p.life += dt / p.max;
        p.x += (p.vx + Math.sin(t * 2 + p.ph) * 10) * dt; p.y += p.vy * dt;
        if (p.life >= 1 || p.y < -10) { P.embers[i] = newEmber(false); continue; }
        const a = Math.sin(p.life * Math.PI) * L.embers * (0.6 + 0.4 * Math.sin(t * 9 + p.ph));
        tint(SOFT, [255, Math.min(255, acc[1] + 30), acc[2] * 0.6], a, p.x - p.r * 3, p.y - p.r * 3, p.r * 6, p.r * 6);
      }
    }

    // снег
    if (L.snow > 0.001) {
      const wind = Math.sin(t * 0.13) * 14 + 6;
      for (let i = 0; i < P.snow.length; i++) {
        const p = P.snow[i];
        p.y += p.vy * dt;
        p.x += (wind * (0.4 + p.z) + Math.sin(t * p.sw + p.ph) * 14 * p.z) * dt;
        if (p.y > H + 20) { P.snow[i] = newSnow(false); continue; }
        if (p.x > W + 30) p.x = -20; else if (p.x < -30) p.x = W + 20;
        const a = p.a * L.snow;
        const s = p.r * (p.z > 0.85 ? 5 : 3.2);
        tint(SOFT, [245, 247, 252], a * (p.z > 0.85 ? 0.55 : 1), p.x - s / 2, p.y - s / 2, s, s);
      }
    }

    // дождь
    if (L.rain > 0.001) {
      ctx.lineCap = 'round';
      const slant = 0.22;
      for (let i = 0; i < P.rain.length; i++) {
        const p = P.rain[i];
        p.y += p.v * dt; p.x += p.v * slant * dt;
        if (p.y > H + 30) { P.rain[i] = newRain(false); continue; }
        ctx.strokeStyle = rgb([200, 214, 226], p.a * L.rain);
        ctx.lineWidth = p.z > 0.7 ? 1.3 : 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.len * slant, p.y - p.len);
        ctx.stroke();
      }
    }

    // молния
    if (bolt && flash > 0.25) {
      ctx.save();
      ctx.strokeStyle = `rgba(235,242,255,${Math.min(1, flash)})`;
      ctx.shadowColor = 'rgba(180,205,255,0.9)'; ctx.shadowBlur = 18;
      ctx.lineJoin = 'round';
      const path = (pts, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const q of pts) ctx.lineTo(q[0], q[1]); ctx.stroke(); };
      path(bolt.pts, 2.2); bolt.branches.forEach(b => path(b, 1));
      ctx.restore();
    } else if (flash <= 0.25) bolt = null;

    // капли на стекле: висят, срываются, оставляют след
    if (L.glass > 0.001) {
      for (let i = 0; i < P.glass.length; i++) {
        const d = P.glass[i];
        if (d.hold > 0) d.hold -= dt;
        else {
          d.v = Math.min(220, d.v + dt * rnd(60, 260));
          d.y += d.v * dt; d.x += Math.sin(d.y * 0.05) * 0.3;
          if (Math.random() < 0.02) { d.hold = rnd(0.1, 0.8); d.v = 0; }
          d.trail.push([d.x, d.y]); if (d.trail.length > 26) d.trail.shift();
        }
        if (d.y > H + 20) { P.glass[i] = newDrop(false); continue; }
        if (d.trail.length > 1) {
          ctx.strokeStyle = rgb([210, 222, 235], 0.12 * L.glass); ctx.lineWidth = d.r * 0.6;
          ctx.beginPath(); ctx.moveTo(d.trail[0][0], d.trail[0][1]);
          for (const q of d.trail) ctx.lineTo(q[0], q[1]); ctx.stroke();
        }
        tint(SOFT, [210, 222, 235], 0.35 * L.glass, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2.2);
        tint(SOFT, [255, 255, 255], 0.6 * L.glass, d.x - d.r * 0.45, d.y - d.r * 0.55, d.r * 0.5, d.r * 0.5);
      }
    }
  }

  // рисование белого спрайта нужным цветом: через globalAlpha + кеш тонированных спрайтов
  const tintCache = new Map();
  function tint(img, col, a, x, y, w, h) {
    const key = img.width + ':' + ((col[0] >> 3) << 10 | (col[1] >> 3) << 5 | (col[2] >> 3));
    let c = tintCache.get(key);
    if (!c) {
      c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = rgb(col); g.fillRect(0, 0, c.width, c.height);
      if (tintCache.size > 400) tintCache.clear();
      tintCache.set(key, c);
    }
    ctx.globalAlpha = Math.min(1, a);
    ctx.drawImage(c, x, y, w, h);
    ctx.globalAlpha = 1;
  }

  // ---------- API ----------
  window.Atmos = {
    list: A,
    set(key) {
      if (!A[key] || key === targetKey) return;
      target = A[key]; targetKey = key;
      root.dataset.light = target.light ? '1' : '0';
      if (effectsOn && !reduce && !follow) veil = Math.max(veil, 0.8); // мягкое «моргание» при смене места
      listeners.forEach(fn => fn('atmos', key));
    },
    get key() { return targetKey; },
    setEffects(on) { effectsOn = on; },
    get effects() { return effectsOn; },
    follow(on) { follow = on; if (!on) pointer = null; },
    on(fn) { listeners.push(fn); },
    reducedMotion: reduce
  };

  window.addEventListener('pointermove', e => {
    if (follow) pointer = [e.clientX / W, e.clientY / H];
  }, { passive: true });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else if (!running) { running = true; requestAnimationFrame(t => { last = t; frame(t); }); }
  });

  resize();
  requestAnimationFrame(frame);
})();
