/* Путь героя: круг мономифа и страницы разбора.
   Круг: верх — привычный мир, горизонталь — порог, низ — неведомое.
   Линия героя соединяет стадии в том порядке, в каком они случаются в книге. */
(function () {
  'use strict';

  const M = window.MONOMYTH, PATHS = window.PATHS;
  const STAGE = {}; M.stages.forEach(s => { STAGE[s.id] = s; });
  const ORDER_DEFAULT = M.stages.map(s => s.id);

  // порядок стадий в сюжете (как они идут в книге)
  const ORDER = {
    crime: ['call', 'refusal', 'aid', 'threshold', 'belly', 'trials', 'temptress', 'goddess', 'father', 'refusalReturn', 'rescue', 'apotheosis', 'boon', 'freedom', 'returnThreshold', 'twoWorlds'],
    vsadnik: ['goddess', 'call', 'threshold', 'belly', 'trials', 'father', 'flight', 'returnThreshold'],
    toska: ['call', 'refusal', 'threshold', 'trials', 'goddess', 'father', 'belly', 'returnThreshold', 'rescue', 'aid', 'boon'],
    nadne: ['call', 'belly', 'trials', 'aid', 'refusal', 'temptress', 'goddess', 'threshold', 'father', 'flight', 'boon', 'apotheosis', 'refusalReturn', 'rescue', 'returnThreshold', 'freedom'],
    kapdoch: ['call', 'refusal', 'threshold', 'aid', 'father', 'belly', 'trials', 'goddess', 'temptress', 'apotheosis', 'boon', 'flight', 'refusalReturn', 'rescue', 'returnThreshold', 'twoWorlds', 'freedom'],
    shinel: ['call', 'refusal', 'aid', 'threshold', 'trials', 'belly', 'goddess', 'boon', 'apotheosis', 'temptress', 'flight', 'rescue', 'father', 'returnThreshold', 'twoWorlds', 'freedom'],
    pari: ['call', 'refusal', 'threshold', 'belly', 'trials', 'aid', 'goddess', 'apotheosis', 'twoWorlds', 'refusalReturn', 'temptress', 'boon', 'father', 'flight', 'returnThreshold', 'freedom'],
    student: ['call', 'belly', 'refusal', 'threshold', 'aid', 'trials', 'father', 'goddess', 'apotheosis', 'boon', 'returnThreshold', 'twoWorlds', 'freedom'],
    futlyar: ['belly', 'call', 'aid', 'refusal', 'threshold', 'trials', 'goddess', 'temptress', 'father', 'refusalReturn', 'apotheosis', 'returnThreshold', 'freedom'],
    kryzh: ['call', 'aid', 'belly', 'trials', 'goddess', 'temptress', 'threshold', 'apotheosis', 'father', 'boon', 'refusalReturn', 'rescue', 'returnThreshold', 'twoWorlds', 'freedom'],
    ionych: ['call', 'goddess', 'refusal', 'aid', 'threshold', 'belly', 'temptress', 'trials', 'boon', 'returnThreshold', 'rescue', 'refusalReturn', 'apotheosis', 'freedom']
  };
  // путь обрывается падением в центр круга
  const FALL = { vsadnik: true, nadne: true, futlyar: true, ionych: true };

  // атмосфера стадии, если она отличается от начала главы
  const ATM = {
    crime: { aid: 'street', refusal: 'street', trials: 'office', rescue: 'siberia', refusalReturn: 'siberia', flight: 'siberia', apotheosis: 'spring', boon: 'spring', freedom: 'spring', returnThreshold: 'spring', twoWorlds: 'spring' },
    vsadnik: { father: 'chase', flight: 'chase' },
    toska: { rescue: 'stable', boon: 'stable', aid: 'stable' },
    nadne: { returnThreshold: 'song' },
    kapdoch: { threshold: 'buran', aid: 'buran', father: 'dream', trials: 'steppe', temptress: 'lamp', apotheosis: 'lamp', boon: 'garret', flight: 'snow', rescue: 'garden', returnThreshold: 'candle', twoWorlds: 'candle', freedom: 'candle' },
    shinel: { call: 'frost', refusal: 'garret', aid: 'garret', threshold: 'garret', trials: 'garret', belly: 'candle', goddess: 'candle', boon: 'morning', apotheosis: 'lamp', temptress: 'night', flight: 'square', rescue: 'office', father: 'porfiry', returnThreshold: 'square', twoWorlds: 'square', freedom: 'night' },
    pari: { call: 'lamp', threshold: 'sonya', belly: 'sonya', trials: 'sonya', aid: 'sonya', goddess: 'candle', apotheosis: 'candle', twoWorlds: 'candle', refusalReturn: 'candle', temptress: 'candle', boon: 'candle', father: 'candle', flight: 'morning', returnThreshold: 'morning', rescue: 'morning', freedom: 'morning' },
    student: { threshold: 'bonfire', aid: 'bonfire', trials: 'bonfire', father: 'bonfire', goddess: 'bonfire', temptress: 'bonfire', returnThreshold: 'wasteland', twoWorlds: 'wasteland', freedom: 'wasteland', refusalReturn: 'siberia', flight: 'siberia', rescue: 'siberia' },
    futlyar: { belly: 'garret', call: 'lamp', aid: 'lamp', refusal: 'lamp', threshold: 'lamp', trials: 'garden', goddess: 'garden', temptress: 'lamp', father: 'dread', refusalReturn: 'dread', apotheosis: 'rain', boon: 'rain', flight: 'garret', rescue: 'garret', returnThreshold: 'rain', twoWorlds: 'moonvillage', freedom: 'moonvillage' },
    kryzh: { call: 'lamp', refusal: 'lamp', aid: 'lamp', belly: 'lamp', trials: 'lamp', goddess: 'lamp', temptress: 'lamp', threshold: 'heat', apotheosis: 'heat', father: 'heat', boon: 'candle', refusalReturn: 'heat', flight: 'heat', rescue: 'candle', returnThreshold: 'lamp', twoWorlds: 'lamp', freedom: 'rain' },
    ionych: { goddess: 'lamp', aid: 'garden', threshold: 'cemetery', belly: 'cemetery', temptress: 'cemetery', trials: 'tavern', returnThreshold: 'moonvillage', rescue: 'lamp', refusalReturn: 'night', flight: 'night', twoWorlds: 'tavern' }
  };

  // короткие имена для круга и списков
  const SHORT = {
    crime: 'Раскольников', kapdoch: 'Гринёв', nadne: 'Ночлежка', vsadnik: 'Евгений', shinel: 'Башмачкин',
    toska: 'Иона', pari: 'Узник', student: 'Студент', futlyar: 'Беликов', kryzh: 'Николай Иваныч', ionych: 'Старцев'
  };
  const short = id => SHORT[id] || PATHS[id].hero;
  const STATUS_ORDER = ['passed', 'twisted', 'failed', 'promised', 'missing'];

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const C = 200, R = 148;
  const pos = (deg, r) => { const a = deg * Math.PI / 180; return [C + (r || R) * Math.sin(a), C - (r || R) * Math.cos(a)]; };
  const f = n => n.toFixed(1);

  function stepAtmos(w, id) {
    const s = PATHS[w.id].steps[id];
    return (ATM[w.id] && ATM[w.id][id]) || (w.plan[s.ch] || ['candle'])[0];
  }

  function heroLine(id, opts) {
    const p = PATHS[id]; if (!p) return '';
    const order = (ORDER[id] || ORDER_DEFAULT).filter(k => p.steps[k] && p.steps[k].st !== 'missing');
    const limit = opts.reached ? order.filter(k => opts.reached.has(k)) : order;
    if (limit.length < 1) return '';
    let d = '', dashed = '';
    const pts = limit.map(k => pos(STAGE[k].deg));
    d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const cx = mx + (C - mx) * 0.28, cy = my + (C - my) * 0.28;
      const seg = ` Q${f(cx)},${f(cy)} ${f(b[0])},${f(b[1])}`;
      if (p.steps[limit[i]].st === 'promised') dashed += `M${f(a[0])},${f(a[1])}${seg}`; else d += seg;
    }
    // огонёк — на последней стадии, которая действительно случилась (не «обещана»)
    let li = limit.length - 1;
    while (li > 0 && p.steps[limit[li]].st === 'promised') li--;
    const last = pts[li];
    let fall = '';
    if (FALL[id] && !opts.reached) fall = `<path class="j-fall" d="M${f(last[0])},${f(last[1])} Q${f((last[0] + C) / 2 + 30)},${f((last[1] + C) / 2)} ${C},${C}"/>`;
    const col = opts.color || p.color;
    return `<g class="j-hero${opts.cls ? ' ' + opts.cls : ''}" data-hero="${id}" style="--hc:${col}">
      <path class="j-line" d="${d}" pathLength="1"/>
      ${dashed ? `<path class="j-line promised" d="${dashed}"/>` : ''}
      ${fall}
      ${opts.flame !== false ? `<g class="j-flame" transform="translate(${f(last[0])},${f(last[1])})${opts.big ? ' scale(2.4)' : ''}"><circle r="16" class="j-flame-halo"/><circle r="5.5" class="j-flame-core"/></g>` : ''}
    </g>`;
  }

  // главный рисунок
  function ring(opts) {
    opts = opts || {};
    const id = opts.id, sel = opts.sel && PATHS[opts.sel] ? opts.sel : '';
    const p = (id && PATHS[id]) || (sel && PATHS[sel]);
    const mode = opts.mode || 'full'; // full | mini | compass | all
    const big = mode === 'compass' || mode === 'mini' || mode === 'allmini';
    const showNums = mode === 'full' || mode === 'all';
    const nodes = M.stages.map(s => {
      const [x, y] = pos(s.deg);
      let st = 'neutral';
      if (p) st = p.steps[s.id] ? p.steps[s.id].st : 'missing';
      if (opts.reached && p) st = opts.reached.has(s.id) ? st : 'hidden';
      const active = opts.active === s.id ? ' active' : '';
      const [nx, ny] = pos(s.deg, R + 22);
      const mark = st === 'failed' ? `<path class="j-x" d="M${f(x - 4)},${f(y - 4)} L${f(x + 4)},${f(y + 4)} M${f(x + 4)},${f(y - 4)} L${f(x - 4)},${f(y + 4)}"/>` : '';
      return `<g class="j-node st-${st}${active}" data-stage="${s.id}" tabindex="${mode === 'full' || mode === 'all' ? 0 : -1}" role="${mode === 'full' || mode === 'all' ? 'button' : 'presentation'}" aria-label="${s.n}. ${esc(s.t)}">
        <circle class="j-hit" cx="${f(x)}" cy="${f(y)}" r="16"/>
        <circle class="j-dot" cx="${f(x)}" cy="${f(y)}" r="${big ? (st === 'missing' || st === 'hidden' ? 7 : 15) : (st === 'missing' || st === 'hidden' ? 3 : 6.5)}"/>
        ${mark}
        ${showNums ? `<text class="j-num" x="${f(nx)}" y="${f(ny + 4)}">${s.n}</text>` : ''}
      </g>`;
    }).join('');

    let lines = '';
    if (mode === 'all' || mode === 'allmini') {
      // выбранный герой рисуется последним, поверх остальных
      const keys = Object.keys(PATHS).filter(k => k !== sel).concat(sel ? [sel] : []);
      lines = keys.map(k => heroLine(k, { flame: k === sel, cls: sel ? (k === sel ? 'sel' : 'dim') : '' })).join('');
    }
    else if (p) lines = heroLine(id, { reached: opts.reached, big });

    const center = (mode === 'full' || mode === 'all') ? `
      <text class="j-world top" x="${C}" y="${C - 58}">привычный мир</text>
      <text class="j-world bottom" x="${C}" y="${C + 70}">неведомое</text>
      <text class="j-center-n" x="${C}" y="${C - 14}" id="jCenterN"></text>
      <text class="j-center-t" x="${C}" y="${C + 12}" id="jCenterT"></text>` : '';

    const acts = (mode === 'full' || mode === 'all') ? [['Уход', 55], ['Посвящение', 160], ['Возвращение', 243]].map(([t, d]) => {
      const [x, y] = pos(d, R + 46);
      return `<text class="j-act" x="${f(x)}" y="${f(y)}">${t}</text>`;
    }).join('') : '';

    return `<svg class="j-ring m-${mode}${opts.still ? ' still' : ''}" viewBox="${big ? '16 16 368 368' : '-40 -30 480 460'}" role="img" aria-label="Круг пути героя">
      <circle class="j-orbit" cx="${C}" cy="${C}" r="${R}"/>
      <line class="j-threshold" x1="${C - R - 26}" y1="${C}" x2="${C + R + 26}" y2="${C}"/>
      ${acts}${center}${lines}${nodes}
    </svg>`;
  }

  // ---------- страница пути одного героя ----------
  function chapterLabel(w, n, ix) {
    if (w.single) return w.title;
    const c = ix && ix.chapters[n - 1];
    if (!c) return '';
    if (w.id === 'crime') return `${c.part}, глава ${c.title}`;
    return c.title;
  }

  function pathPage(w, ix) {
    const p = PATHS[w.id];
    const S = M.statuses;
    const counts = {}; Object.values(p.steps).forEach(s => { counts[s.st] = (counts[s.st] || 0) + 1; });
    const legend = ['passed', 'twisted', 'failed', 'promised', 'missing'].filter(k => counts[k]).map(k =>
      `<li class="st-${k}"><i></i>${S[k].t}<b>${counts[k]}</b></li>`).join('');

    const acts = M.acts.map(a => {
      const stages = M.stages.filter(s => s.act === a.id).map(s => {
        const st = p.steps[s.id];
        const quotes = (st.q || []).map(q => `<blockquote class="j-quote rv"><p>${esc(q.t).replace(/ \/ /g, '<br>')}</p><cite><a href="#${w.id}-${q.ch}">${esc(chapterLabel(w, q.ch, ix))} →</a></cite></blockquote>`).join('');
        return `<section class="j-stage scene st-${st.st}" id="stage-${s.id}" data-stage="${s.id}" data-atmos="${stepAtmos(w, s.id)}" data-label="${esc(s.t)}">
          <header class="j-stage-head rv">
            <span class="j-stage-n">${s.n}</span>
            <div>
              <h3>${esc(s.t)}</h3>
              <span class="j-chip st-${st.st}">${S[st.st].t}</span>${st.who ? `<span class="j-who">${esc(st.who)}</span>` : ''}
            </div>
          </header>
          <p class="j-campbell rv"><span>У Кэмпбелла.</span> ${esc(s.essence)} <a href="#monomyth" data-stage-link="${s.id}">Подробнее</a></p>
          <p class="j-lead rv">${esc(st.h)}</p>
          ${st.p.map(t => `<p class="rv">${esc(t)}</p>`).join('')}
          ${quotes}
          ${st.at ? `<a class="j-read rv" href="#${w.id}-${st.ch}">Читать эту сцену · ${esc(chapterLabel(w, st.ch, ix))}</a>` : ''}
        </section>`;
      }).join('');
      return `<div class="j-act-block">
        <header class="j-act-head rv"><span>${a.n}</span><h2>${a.t}</h2><p>${esc(a.p)}</p></header>
        ${stages}
      </div>`;
    }).join('');

    const extra = p.extra ? `<section class="j-extra scene rv" data-atmos="shore" data-label="${esc(p.extra.t)}">
        <h2>${esc(p.extra.t)}</h2>
        ${p.extra.p.map(t => `<p>${esc(t)}</p>`).join('')}
        ${(p.extra.q || []).map(q => `<blockquote class="j-quote"><p>${esc(q.t).replace(/ \/ /g, '<br>')}</p><cite><a href="#${w.id}-${q.ch}">${esc(chapterLabel(w, q.ch, ix))} →</a></cite></blockquote>`).join('')}
      </section>` : '';

    const others = window.WORKS.filter(o => o.id !== w.id && PATHS[o.id]).map(o =>
      `<a class="j-other" href="#${o.id}-path">${ring({ id: o.id, mode: 'mini' })}<span><b>${esc(PATHS[o.id].hero)}</b>${esc(o.title)}</span></a>`).join('');

    return `<article class="journey">
      <header class="j-head scene" data-atmos="${(w.plan[1] || ['candle'])[0]}" data-label="">
        <span class="j-eyebrow rv">Путь героя · по Джозефу Кэмпбеллу</span>
        <h1 class="rv">${esc(p.hero)}</h1>
        <span class="j-work rv">${esc(w.author)}, «${esc(w.title)}»</span>
        <p class="j-verdict rv">${esc(p.verdict)}</p>
      </header>
      <div class="j-grid">
        <aside class="j-aside">
          <div class="j-sticky">
            ${ring({ id: w.id, mode: 'full' })}
            <ul class="j-legend">${legend}</ul>
          </div>
        </aside>
        <div class="j-main">
          <section class="j-intro">${p.summary.map(t => `<p class="rv">${esc(t)}</p>`).join('')}
            <p class="j-howto rv">Круг — это путь из книги Кэмпбелла: сверху привычный мир, горизонталь — порог, снизу неведомое. Линия соединяет стадии в том порядке, в каком они происходят в книге. Нажмите на любую точку.</p>
          </section>
          ${acts}
          ${extra}
          <section class="j-final scene" data-atmos="candle" data-label="Итог">
            <h2 class="rv">Итог</h2>
            <p class="j-verdict rv">${esc(p.verdict)}</p>
            <div class="j-final-actions rv">
              <a class="btn solid" href="#${w.id}${w.single ? '' : '-1'}">Читать «${esc(w.title)}»</a>
              <a class="btn" href="#monomyth">Что такое путь героя</a>
            </div>
            <h3 class="j-others-t rv">Другие герои «Свечи»</h3>
            <div class="j-others rv">${others}</div>
          </section>
        </div>
      </div>
    </article>`;
  }

  // ---------- страница «Тысячеликий герой» ----------
  const ACT_ATM = { departure: 'neva', initiation: 'lamp', return: 'spring' };
  function monomythPage() {
    const works = window.WORKS.filter(o => PATHS[o.id]);
    const heroes = `<div class="j-pick" role="group" aria-label="Чей путь показать на круге">
      <button type="button" class="j-pick-all sel" data-pick="">Все ${works.length} героев</button>
      <div class="j-pick-grid">${works.map(o =>
        `<button type="button" data-pick="${o.id}" style="--hc:${PATHS[o.id].color}" title="${esc(PATHS[o.id].hero)} — «${esc(o.title)}»"><i></i><span>${esc(short(o.id))}</span></button>`).join('')}</div>
      <p class="j-pick-note" aria-live="polite">Нажмите на имя — на круге останется только путь этого героя.</p>
    </div>`;
    // в каждой стадии — герои, разложенные по тому, как они её прошли
    const inSvecha = s => STATUS_ORDER.map(k => {
      const list = works.filter(o => PATHS[o.id].steps[s.id].st === k);
      if (!list.length) return '';
      return `<div class="jis-row st-${k}"><span class="jis-k">${esc(M.statuses[k].t)}</span><span class="jis-v">${list.map(o =>
        `<a href="#${o.id}-path" data-stage-link="${s.id}" data-hero="${o.id}" style="--hc:${PATHS[o.id].color}" title="${esc(PATHS[o.id].hero)} — «${esc(o.title)}»"><i></i>${esc(short(o.id))}</a>`).join('')}</span></div>`;
    }).join('');
    const stagesOf = act => M.stages.filter(s => s.act === act).map(s => `
      <section class="j-stage scene" id="stage-${s.id}" data-stage="${s.id}" data-atmos="${ACT_ATM[act]}" data-label="${esc(s.t)}">
        <header class="j-stage-head rv"><span class="j-stage-n">${s.n}</span><div><h3>${esc(s.t)}</h3><span class="j-essence">${esc(s.essence)}</span></div></header>
        ${s.p.map(t => `<p class="rv">${esc(t)}</p>`).join('')}
        <p class="j-look rv"><span>Как искать в книге:</span> ${esc(s.look)}</p>
        <p class="j-myths rv"><span>Мифы и сказки:</span> ${s.myths.map(esc).join(' · ')}</p>
        <div class="j-in-svecha rv"><span class="jis-title">В «Свече»</span>${inSvecha(s)}</div>
      </section>`).join('');

    return `<article class="journey monomyth">
      <header class="j-head scene" data-atmos="candle" data-label="">
        <span class="j-eyebrow rv">${esc(M.author)} · ${M.year}</span>
        <h1 class="rv">${esc(M.title)}</h1>
        <span class="j-work rv">Карта, по которой «Свеча» читает классику</span>
        <p class="j-verdict rv">${esc(M.formula)}</p>
      </header>
      <div class="j-grid">
        <aside class="j-aside">
          <div class="j-sticky">
            ${ring({ mode: 'all' })}
            ${heroes}
          </div>
        </aside>
        <div class="j-main">
          <section class="j-intro scene" data-atmos="candle" data-label="">${M.thesis.map(t => `<p class="rv">${esc(t)}</p>`).join('')}
            <p class="j-howto rv">Круг мономифа: сверху привычный мир, горизонталь — порог, снизу неведомое. Цветные линии — пути героев «Свечи». Выберите героя под кругом, чтобы увидеть только его путь, или нажмите на точку, чтобы перейти к стадии.</p>
          </section>
          <section class="j-prologue scene" data-atmos="candle" data-label="Пролог">
            <h2 class="j-sec rv">Пролог. Мономиф</h2>
            ${M.prologue.map(s => `<div class="j-pro rv"><h3>${esc(s.t)}</h3>${s.p.map(t => `<p>${esc(t)}</p>`).join('')}</div>`).join('')}
          </section>
          ${M.acts.map(a => `<div class="j-act-block">
            <header class="j-act-head scene rv" data-atmos="${ACT_ATM[a.id]}" data-label="${a.t}"><span>${a.n}</span><h2>${a.t}</h2><em>${a.sub}</em><p>${esc(a.p)}</p></header>
            ${stagesOf(a.id)}
          </div>`).join('')}
          <section class="j-keys scene" data-atmos="candle" data-label="Ключи">
            <h2 class="j-sec rv">Ключи</h2>
            ${M.keys.map(t => `<p class="rv">${esc(t)}</p>`).join('')}
            <ul class="j-statuses rv">${Object.entries(M.statuses).map(([k, v]) => `<li class="st-${k}"><i></i><b>${v.t}</b> — ${esc(v.d)}</li>`).join('')}</ul>
          </section>
          <section class="j-cosmo scene" data-atmos="shore" data-label="Космогонический цикл">
            <h2 class="j-sec rv">Часть вторая. Космогонический цикл</h2>
            <p class="rv">${esc(M.cosmogony.intro)}</p>
            ${M.cosmogony.parts.map(s => `<div class="j-pro rv"><h3>${esc(s.t)}</h3><p>${esc(s.p)}</p></div>`).join('')}
          </section>
          <section class="j-epi scene" data-atmos="candle" data-label="Миф и общество">
            <h2 class="j-sec rv">Эпилог. Миф и общество</h2>
            ${M.epilogue.map(s => `<div class="j-pro rv"><h3>${esc(s.t)}</h3><p>${esc(s.p)}</p></div>`).join('')}
            <p class="j-note rv">Изложение своими словами. Книга Кэмпбелла защищена авторским правом, её текста здесь нет.</p>
          </section>
        </div>
      </div>
    </article>`;
  }

  // интерактив круга: клик по точке — прокрутка к стадии, подсветка текущей
  function wire(root) {
    let svg = root.querySelector('.j-ring.m-full, .j-ring.m-all');
    if (!svg) return () => {};
    let activeId = '';
    const setActive = id => {
      activeId = id;
      svg.querySelectorAll('.j-node').forEach(g => g.classList.toggle('active', g.dataset.stage === id));
      const s = STAGE[id];
      const nN = svg.querySelector('#jCenterN'), nT = svg.querySelector('#jCenterT');
      if (nN) nN.textContent = s ? s.n : '';
      if (nT) nT.textContent = s ? s.t : '';
    };
    const bind = () => {
      svg.querySelectorAll('.j-node').forEach(g => {
        const go = () => { const el = root.querySelector('#stage-' + g.dataset.stage); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        g.addEventListener('click', go);
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        g.addEventListener('mouseenter', () => setActive(g.dataset.stage));
      });
    };
    bind();

    // выбор героя на странице мономифа
    const pick = root.querySelector('.j-pick');
    let sel = '';
    if (pick) {
      const note = pick.querySelector('.j-pick-note');
      const noteAll = note.innerHTML;
      const preview = id => svg.querySelectorAll('.j-hero').forEach(g => {
        g.classList.toggle('dim', !!id && g.dataset.hero !== id);
        g.classList.toggle('peek', !!id && g.dataset.hero === id && id !== sel);
      });
      const describe = id => {
        if (!id) return noteAll;
        const P = PATHS[id], w = window.WORKS.find(o => o.id === id);
        const n = Object.values(P.steps).filter(s => s.st === 'passed').length;
        return `<b style="color:${P.color}">${esc(P.hero)}</b>, «${esc(w.title)}». Пройдено стадий: ${n} из ${M.stages.length}. <a href="#${id}-path">Весь путь →</a>`;
      };
      const choose = id => {
        sel = id;
        const fresh = document.createElement('div');
        fresh.innerHTML = ring({ mode: 'all', sel, still: true });
        const next = fresh.firstElementChild;
        svg.replaceWith(next); svg = next;
        bind(); setActive(activeId);
        pick.querySelectorAll('[data-pick]').forEach(b => {
          b.classList.toggle('sel', b.dataset.pick === sel);
          b.setAttribute('aria-pressed', b.dataset.pick === sel ? 'true' : 'false');
        });
        root.classList.toggle('has-sel', !!sel);
        root.querySelectorAll('.jis-v a').forEach(a => a.classList.toggle('sel', a.dataset.hero === sel));
        note.innerHTML = describe(sel);
      };
      pick.querySelectorAll('[data-pick]').forEach(b => {
        b.addEventListener('click', () => choose(b.dataset.pick && b.dataset.pick === sel ? '' : b.dataset.pick));
        if (b.dataset.pick) {
          b.addEventListener('mouseenter', () => preview(b.dataset.pick));
          b.addEventListener('focus', () => preview(b.dataset.pick));
          b.addEventListener('mouseleave', () => preview(sel));
          b.addEventListener('blur', () => preview(sel));
        }
      });
    }

    const obs = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.dataset.stage);
    }, { rootMargin: '-45% 0px -50% 0px' });
    root.querySelectorAll('.j-stage[data-stage]').forEach(s => obs.observe(s));
    return () => { obs.disconnect(); root.classList.remove('has-sel'); };
  }

  window.Journey = { ring, pathPage, monomythPage, wire, STAGE, ORDER, has: id => !!PATHS[id] };
})();
