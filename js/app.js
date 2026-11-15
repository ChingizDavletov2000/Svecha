(function () {
  'use strict';
  document.documentElement.lang = 'ru'; // переносы по-русски, даже если обёртка страницы не задала язык

  const $ = s => document.querySelector(s);
  const view = $('#view'), bar = $('#bar'), barTitle = $('#barTitle'), progress = $('#progress');
  const backBtn = $('#back'), tocBtn = $('#tocBtn');
  const WORKS = window.WORKS;
  const ROMAN = n => { const m = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let r = ''; for (const [v, s] of m) while (n >= v) { r += s; n -= v; } return r; };

  // ---------- хранилище (может быть недоступно) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('svecha:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('svecha:' + k, JSON.stringify(v)); } catch (e) { /* ничего */ } }
  };
  const getProg = id => (store.get('pos', {})[id]) || null;
  const setProg = (id, p) => { const all = store.get('pos', {}); all[id] = p; store.set('pos', all); };
  const getDone = id => store.get('done', {})[id] || [];
  const markDone = (id, n) => { const all = store.get('done', {}); const s = new Set(all[id] || []); s.add(n); all[id] = [...s]; store.set('done', all); };

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const strip = h => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const rems = h => h.replace(/\(([^()<>]+)\)/g, '<span class="rem">($1)</span>');
  const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };
  const wpm = w => w.kind === 'verse' ? 120 : 170;
  function duration(min) {
    if (min < 60) return `${Math.max(1, Math.round(min))} мин`;
    const h = Math.floor(min / 60), m = Math.round((min % 60) / 10) * 10;
    return m ? `${h} ч ${m} мин` : `${h} ч`;
  }

  // ---------- загрузка ----------
  const cache = new Map();
  // версия выкладки из адреса скрипта: тексты кэшируются надолго и обновляются вместе с сайтом
  const VER = (() => { try { return new URL(document.currentScript.src).searchParams.get('v') || ''; } catch (e) { return ''; } })();
  function load(path) {
    if (!cache.has(path)) {
      cache.set(path, fetch(VER ? `${path}?v=${VER}` : path).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .catch(e => { cache.delete(path); throw e; }));
    }
    return cache.get(path);
  }
  const index = id => load(`data/${id}/index.json`);
  const chapter = (id, n) => load(`data/${id}/${n}.json`);

  function chapterName(w, c) {
    if (w.single) return w.title;
    if (w.id === 'crime') return `${c.part === 'Эпилог' ? 'Эпилог' : 'Часть ' + partNo(c.part)} · Глава ${c.title}`;
    return c.title;
  }
  const PARTS = ['первая', 'вторая', 'третья', 'четвертая', 'пятая', 'шестая'];
  const partNo = p => { const i = PARTS.indexOf(String(p).split(' ')[1]); return i >= 0 ? ROMAN(i + 1) : p; };

  // ---------- рендер блоков ----------
  function renderBlocks(w, blocks, plan, n) {
    // разбиваем на сегменты по «партитуре» атмосфер
    const changes = plan.slice(2);
    let ci = 0;
    // отметки стадий пути героя в этой главе
    const P = window.PATHS && window.PATHS[w.id];
    const marks = P ? Object.entries(P.steps).filter(([, s]) => s.ch === n && s.at).map(([id, s]) => ({ id, at: s.at, done: false })) : [];
    const segs = [{ atmos: plan[0], label: plan[1], html: [] }];
    let castOpen = false;
    const closeCast = () => { if (castOpen) { segs[segs.length - 1].html.push('</dl></div>'); castOpen = false; } };

    blocks.forEach((b, i) => {
      const text = strip([b.p, b.t, b.d, b.v && b.v.join(' ')].filter(Boolean).join(' '));
      if (ci < changes.length && text.indexOf(changes[ci][0]) >= 0) {
        closeCast();
        segs.push({ atmos: changes[ci][1], label: changes[ci][2], html: [] });
        ci++;
      }
      const out = segs[segs.length - 1].html;
      for (const mk of marks) {
        if (!mk.done && text.indexOf(mk.at) >= 0) { out.push(`<i class="stage-mark" data-stage="${mk.id}" aria-hidden="true"></i>`); mk.done = true; }
      }

      if (b.castTitle !== undefined || b.cast || b.castNote !== undefined) {
        if (!castOpen) { out.push('<div class="cast rv"><h3>Действующие лица</h3><dl>'); castOpen = true; }
        if (b.cast) out.push(`<dt>${esc(b.cast[0])}</dt><dd>${b.cast[1] || ''}</dd>`);
        if (b.castNote) out.push(`<dd class="note">${b.castNote}</dd>`);
        return;
      }
      closeCast();
      if (b.epi) { out.push(`<p class="epigraph-in rv">${b.epi}</p>`); return; }
      if (b.d) { out.push(`<p class="dir rv">${b.d}</p>`); return; }
      if (b.sp !== undefined) {
        const rm = b.rm ? ` <span class="rem">${b.rm}</span>` : '';
        const sep = b.rm ? ' ' : '. ';
        out.push(`<p class="line rv"><span class="who">${esc(b.sp)}</span>${rm}${b.t ? sep + rems(b.t) : ''}</p>`);
        return;
      }
      if (b.v) {
        const inset = w.kind !== 'verse' ? ' inset' : '';
        out.push(`<div class="stanza${inset}">` + b.v.map(l => {
          const ind = l.startsWith('>');
          return `<span class="v rv${ind ? ' ind' : ''}">${ind ? l.slice(1) : l}</span>`;
        }).join('') + '</div>');
        return;
      }
      if (b.p !== undefined) {
        if (strip(b.p) === 'Занавес') { out.push('<p class="curtain rv">Занавес</p>'); return; }
        const cls = w.kind === 'drama' ? 'cont rv' : (w.kind === 'verse' ? 'preface rv' : 'rv');
        out.push(`<p class="${cls}">${w.kind === 'drama' ? rems(b.p) : b.p}</p>`);
      }
    });
    closeCast();
    if (ci < changes.length) console.warn('Свеча: не найдена смена атмосферы', w.id, changes.slice(ci).map(c => c[0]));
    marks.filter(m => !m.done).forEach(m => console.warn('Свеча: не найдена стадия пути', w.id, n, m.id, m.at));
    return segs;
  }

  // ---------- общие ----------
  let sceneObs = null, revealObs = null, current = null; // current = {w, n, idx}
  let tocJump = false; // пришли в оглавление из главы — прокрутить к текущей
  tocBtn.addEventListener('click', () => { tocJump = true; });
  function setBar(title, back, toc) {
    barTitle.textContent = title || '';
    backBtn.href = back || '#';
    document.body.classList.toggle('reading', !!back);
    tocBtn.hidden = !toc;
    if (toc) tocBtn.href = toc;
  }

  function observeReveal() {
    if (revealObs) revealObs.disconnect();
    const els = view.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    let batch = 0, raf = 0;
    revealObs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.style.transitionDelay = Math.min(batch++ * 60, 600) + 'ms';
        e.target.classList.add('in');
        revealObs.unobserve(e.target);
      }
      cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { batch = 0; });
    }, { rootMargin: '0px 0px -5% 0px' });
    els.forEach(e => revealObs.observe(e));
  }

  // подпись места при смене атмосферы внутри главы
  const place = $('#place');
  let placeT = null, lastLabel = null;
  function showPlace(label) {
    if (!label || label === lastLabel) return;
    lastLabel = label;
    place.textContent = label;
    place.classList.remove('show'); void place.offsetWidth; place.classList.add('show');
    clearTimeout(placeT); placeT = setTimeout(() => place.classList.remove('show'), 3200);
  }

  function watchScenes(initialLabel, quiet) {
    if (sceneObs) sceneObs.disconnect();
    lastLabel = initialLabel;
    let first = true;
    sceneObs = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) {
        Atmos.set(e.target.dataset.atmos);
        if (!first && !quiet) showPlace(e.target.dataset.label);
      }
      first = false;
    }, { rootMargin: '-50% 0px -50% 0px' });
    view.querySelectorAll('.scene').forEach(s => sceneObs.observe(s));
  }

  function loading() {
    view.innerHTML = '<div class="loading" aria-live="polite"><span class="flame small" aria-hidden="true"></span></div>';
  }
  function failed(retry) {
    view.innerHTML = `<div class="loading"><p>Не получилось загрузить текст.</p><button class="btn" id="retry">Ещё раз</button></div>`;
    $('#retry').onclick = retry;
  }

  // ---------- библиотека ----------
  async function library() {
    current = null;
    document.title = 'Свеча — путь героя';
    setBar('', null, null);
    Atmos.set('candle'); Atmos.follow(true);
    const idx = await Promise.all(WORKS.map(w => index(w.id).catch(() => null)));
    const IX = {}; WORKS.forEach((w, i) => { IX[w.id] = idx[i]; });
    // у автора три и больше коротких вещей — они собираются в отдельный сборник
    const byAuthor = {}; WORKS.forEach(w => { if (w.single || w.kind === 'prose' && IX[w.id] && IX[w.id].words < 8000) (byAuthor[w.author] = byAuthor[w.author] || []).push(w); });
    const collections = Object.entries(byAuthor).filter(([, l]) => l.length >= 3);
    const inColl = new Set(collections.flatMap(([, l]) => l.map(w => w.id)));
    const main = WORKS.filter(w => !inColl.has(w.id));
    const COLL_TITLE = { 3: 'Три рассказа', 4: 'Четыре рассказа', 5: 'Пять рассказов', 6: 'Шесть рассказов', 7: 'Семь рассказов', 8: 'Восемь рассказов' };
    const info = w => {
      const ix = IX[w.id], p = getProg(w.id);
      const n = ix ? ix.chapters.length : 0;
      const atm = [...new Set(Object.values(w.plan).flatMap(pl => [pl[0], ...pl.slice(2).map(c => c[1])]))].filter(a => a !== 'curtain').slice(0, 7);
      const unit = w.kind === 'drama' ? ['действие', 'действия', 'действий'] : w.kind === 'verse' ? ['часть', 'части', 'частей'] : ['глава', 'главы', 'глав'];
      const meta = ix ? [w.single ? (w.genre || 'рассказ') : `${n} ${plural(n, ...unit)}`, duration(ix.words / wpm(w))].join(' · ') : '';
      let cont = '';
      if (p && ix) {
        const c = ix.chapters[p.ch - 1];
        if (c && !(p.ch === n && p.r > 0.97)) cont = `<span class="cont">Продолжить${w.single ? '' : ' · ' + esc(chapterName(w, c))}</span>`;
      }
      const swatches = `<span class="swatches" aria-hidden="true">${atm.map(k => {
        const a = Atmos.list[k];
        return `<i style="background:linear-gradient(90deg,${a.bg},${a.glow} 60%,${a.accent})"></i>`;
      }).join('')}</span>`;
      return { href: `#${w.id}${p && !w.single ? '-' + p.ch : ''}`, meta, cont, swatches };
    };

    view.innerHTML = `
      <section class="library">
        <div class="brand rv">
          <div class="flame" aria-hidden="true"></div>
          <h1>Свеча</h1>
          <p class="lead">Путь героя по Кэмпбеллу — на героях русской классики. Книги здесь целиком, и у каждой сцены свой свет, погода и звук.</p>
        </div>
        <a class="mono-entry rv" href="#monomyth">
          <span class="mono-ring" aria-hidden="true">${Journey.ring({ mode: 'allmini' })}</span>
          <span>
            <span class="author">Джозеф Кэмпбелл</span>
            <span class="title">Тысячеликий герой</span>
            <span class="teaser">Путь героя — карта, по которой здесь читают. И как его проходят одиннадцать героев: от Раскольникова и Гринёва до Акакия Акакиевича и Ионыча.</span>
          </span>
        </a>
        <ol class="shelf">
          ${main.map((w, i) => {
            const b = info(w);
            return `<li class="rv"><a class="book" href="${b.href}" data-id="${w.id}">
              <span class="num">${ROMAN(i + 1)}</span>
              <span>
                <span class="author">${esc(w.author)}</span>
                <span class="title">${esc(w.title)}</span>
                <span class="teaser">${esc(w.teaser)}</span>
                <span class="meta">${b.swatches}<span>${b.meta}</span>${b.cont}</span>
              </span>
            </a></li>`;
          }).join('')}
        </ol>
        ${collections.map(([author, list]) => `
        <section class="collection">
          <header class="coll-head rv">
            <span class="num">${ROMAN(main.length + 1)}</span>
            <span>
              <span class="author">${esc(author)}</span>
              <span class="title">${COLL_TITLE[list.length] || 'Рассказы'}</span>
              <span class="teaser">Короткие истории на один вечер — от «${esc(list[0].title)}» до «${esc(list[list.length - 1].title)}».</span>
            </span>
          </header>
          <ol class="stories">
            ${list.map(w => {
              const b = info(w);
              return `<li class="rv"><a class="story book" href="${b.href}" data-id="${w.id}">
                <span class="s-year">${esc(w.year)}</span>
                <span>
                  <span class="title">${esc(w.title)}</span>
                  <span class="teaser">${esc(w.teaser)}</span>
                  <span class="meta">${b.swatches}<span>${b.meta}</span>${b.cont}</span>
                </span>
              </a></li>`;
            }).join('')}
          </ol>
        </section>`).join('')}
        <p class="lib-foot rv">Полные тексты. Лучше вечером и в наушниках.<br>Общественное достояние, сверено по <a href="https://ilibrary.ru" target="_blank" rel="noopener">ilibrary.ru</a>.</p>
      </section>`;

    let hoverT = null;
    view.querySelectorAll('.book').forEach(el => {
      const w = WORKS.find(x => x.id === el.dataset.id);
      el.addEventListener('mouseenter', () => { clearTimeout(hoverT); hoverT = setTimeout(() => Atmos.set(w.plan[1][0]), 120); });
      el.addEventListener('mouseleave', () => { clearTimeout(hoverT); hoverT = setTimeout(() => Atmos.set('candle'), 200); });
    });
    window.scrollTo(0, 0);
    observeReveal();
  }

  // ---------- путь героя ----------
  function pathCard(w) {
    if (!Journey.has(w.id)) return '';
    const P = window.PATHS[w.id];
    return `<a class="path-card rv" href="#${w.id}-path">
      <span class="pc-ring" aria-hidden="true">${Journey.ring({ id: w.id, mode: 'mini' })}</span>
      <span class="pc-text"><span class="pc-k">Путь героя по Кэмпбеллу</span><span class="pc-h">${esc(P.hero)}</span><span class="pc-v">${esc(P.verdict)}</span></span>
    </a>`;
  }

  let jumpStage = null; // к какой стадии прокрутить после перехода
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-stage-link]');
    if (a) jumpStage = a.dataset.stageLink;
  });
  function doJump() {
    const id = jumpStage; jumpStage = null;
    if (!id) return;
    const el = view.querySelector('#stage-' + id);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }

  let unwire = () => {};
  async function pathPage(w) {
    current = null;
    const P = window.PATHS[w.id];
    document.title = `Путь героя: ${P.hero} · Свеча`;
    setBar(`Путь героя · ${P.hero}`, w.single ? '#' : `#${w.id}`, null);
    Atmos.follow(false); Atmos.set(w.plan[1][0]);
    loading();
    let ix = null;
    try { ix = await index(w.id); } catch (e) { /* подписи глав без оглавления */ }
    if (location.hash !== routeHash) return;
    view.innerHTML = Journey.pathPage(w, ix);
    window.scrollTo(0, 0);
    watchScenes('', true);
    observeReveal();
    unwire(); unwire = Journey.wire(view);
    doJump();
  }

  function monomythPage() {
    current = null;
    document.title = 'Тысячеликий герой · Свеча';
    setBar('Тысячеликий герой', '#', null);
    Atmos.follow(false); Atmos.set('candle');
    view.innerHTML = Journey.monomythPage();
    window.scrollTo(0, 0);
    watchScenes('', true);
    observeReveal();
    unwire(); unwire = Journey.wire(view);
    doJump();
  }

  // стадии пути, которые случились в этой главе
  function stagesHere(w, n) {
    if (!Journey.has(w.id)) return '';
    const P = window.PATHS[w.id];
    const ids = Object.keys(Journey.STAGE).filter(id => P.steps[id] && P.steps[id].ch === n && P.steps[id].at);
    if (!ids.length) return '';
    const seen = new Set(); const uniq = ids.filter(id => !seen.has(id) && seen.add(id));
    return `<div class="chap-stages rv"><span class="cs-k">Путь героя в этой главе</span>${uniq.map(id =>
      `<a href="#${w.id}-path" data-stage-link="${id}"><b>${Journey.STAGE[id].n}</b>${esc(Journey.STAGE[id].t)}</a>`).join('')}</div>`;
  }

  // компас в читалке: кольцо пути заполняется по мере чтения
  const compass = $('#compass'), stageToast = $('#stageToast');
  let compassState = null, toastT = null;
  function setupCompass(w, n) {
    compassState = null;
    if (!Journey.has(w.id)) { compass.hidden = true; return; }
    const P = window.PATHS[w.id];
    const base = new Set(Object.entries(P.steps).filter(([, s]) => s.st !== 'missing' && s.ch < n).map(([id]) => id));
    compassState = { w, base, marks: [...view.querySelectorAll('.stage-mark')], reached: null };
    compass.href = `#${w.id}-path`;
    compass.hidden = false;
    updateCompass(true);
  }
  function updateCompass(initial) {
    if (!compassState) return;
    const { w, base, marks } = compassState;
    const mid = innerHeight * 0.55;
    const reached = new Set(base);
    let newest = null;
    for (const m of marks) if (m.getBoundingClientRect().top < mid) { reached.add(m.dataset.stage); newest = m.dataset.stage; }
    const key = [...reached].sort().join(',');
    if (compassState.reached === key) return;
    const prev = compassState.prevSet || new Set();
    compassState.reached = key; compassState.prevSet = reached;
    compass.innerHTML = Journey.ring({ id: w.id, mode: 'compass', reached }) + `<span class="cp-n">${reached.size}</span>`;
    compass.setAttribute('aria-label', `Путь героя: пройдено стадий — ${reached.size}. Открыть разбор`);
    if (!initial && newest && !prev.has(newest)) {
      const s = Journey.STAGE[newest];
      stageToast.innerHTML = `<span class="st-k">Путь героя · ${s.n}</span><span class="st-t">${esc(s.t)}</span>`;
      stageToast.classList.remove('show'); void stageToast.offsetWidth; stageToast.classList.add('show');
      clearTimeout(toastT); toastT = setTimeout(() => stageToast.classList.remove('show'), 3800);
      compass.classList.remove('pulse'); void compass.offsetWidth; compass.classList.add('pulse');
    }
    compassState.last = newest || [...reached].pop();
  }
  compass.addEventListener('click', () => { if (compassState && compassState.last) jumpStage = compassState.last; });
  window.addEventListener('scroll', () => { if (compassState) updateCompass(false); }, { passive: true });

  // ---------- страница произведения: обложка и оглавление ----------
  async function workPage(w) {
    current = null;
    document.title = `${w.title} — ${w.author.split(' ').pop()} · Свеча`;
    setBar(w.title, '#', null);
    Atmos.follow(false); Atmos.set(w.plan[1][0]);
    loading();
    let ix;
    try { ix = await index(w.id); } catch (e) { return failed(() => workPage(w)); }

    const p = getProg(w.id), done = new Set(getDone(w.id));
    const total = duration(ix.words / wpm(w));
    const startN = p ? p.ch : 1;
    const startLabel = p ? `Продолжить · ${chapterName(w, ix.chapters[p.ch - 1])}` : 'Начать читать';

    let lastPart = null;
    const items = ix.chapters.map(c => {
      let head = '';
      if (c.part && c.part !== lastPart) { head = `<li class="toc-part rv">${esc(c.part)}</li>`; lastPart = c.part; }
      const pl = w.plan[c.n] || [];
      const isCur = p && p.ch === c.n;
      return head + `<li class="rv"><a class="toc-item${isCur ? ' current' : ''}${done.has(c.n) ? ' done' : ''}" href="#${w.id}-${c.n}">
        <span class="toc-n">${w.id === 'crime' ? esc(c.title) : ROMAN(c.n)}</span>
        <span class="toc-t">${w.id === 'crime' ? `<em>${esc(pl[1] || '')}</em>` : `${esc(c.title)} <em>${esc(pl[1] || '')}</em>`}</span>
        <span class="toc-m">${done.has(c.n) ? '<span class="tick" aria-label="прочитано">✓</span>' : ''}${duration(c.words / wpm(w))}</span>
      </a></li>`;
    }).join('');

    view.innerHTML = `
      <article class="reader work-page">
        <header class="work-head short">
          <span class="author rv">${esc(w.author)}</span>
          <h1 class="rv">${esc(w.title)}</h1>
          <span class="sub rv">${w.subtitle ? esc(w.subtitle) + ' · ' : ''}${w.year} · ${total} чтения</span>
          <a class="btn solid start rv" href="#${w.id}-${startN}">${esc(startLabel)}</a>
          ${pathCard(w)}
        </header>
        <nav class="toc" aria-label="Оглавление"><ol>${items}</ol></nav>
      </article>`;
    window.scrollTo(0, 0);
    observeReveal();
    const cur = view.querySelector('.toc-item.current');
    if (cur && tocJump) cur.scrollIntoView({ block: 'center' });
    tocJump = false;
  }

  // ---------- глава ----------
  async function chapterPage(w, n) {
    Atmos.follow(false);
    const plan = w.plan[n] || ['candle', ''];
    Atmos.set(plan[0]);
    loading();
    let ix, ch;
    try { [ix, ch] = await Promise.all([index(w.id), chapter(w.id, n)]); }
    catch (e) { return failed(() => chapterPage(w, n)); }
    if (location.hash !== routeHash) return; // пользователь уже ушёл

    const total = ix.chapters.length;
    const name = chapterName(w, ch);
    current = { w, n, total };
    document.title = `${name === w.title ? w.title : name + ' — ' + w.title} · Свеча`;
    setBar(name, w.single ? '#' : `#${w.id}`, w.single ? null : `#${w.id}`);

    const segs = renderBlocks(w, ch.blocks, plan, n);
    const nextC = n < total ? ix.chapters[n] : null;
    const prevC = n > 1 ? ix.chapters[n - 2] : null;
    const wi = WORKS.indexOf(w), nextW = WORKS[(wi + 1) % WORKS.length];
    const notes = ch.notes ? Object.keys(ch.notes).sort((a, b) => a - b) : [];

    let head;
    if (w.single) {
      head = `<header class="work-head">
          <span class="author rv">${esc(w.author)}</span>
          <h1 class="rv">${esc(w.title)}</h1>
          <span class="sub rv">${w.year}</span>
          <div class="scroll-cue rv" aria-hidden="true">листайте<i></i></div>
        </header>`;
    } else {
      const partLine = w.id === 'crime' ? esc(ch.part) : esc(w.title);
      const big = w.id === 'crime' ? `Глава ${esc(ch.title)}` : esc(ch.title);
      head = `<header class="chap-head">
          <span class="chap-work rv">${n === 1 && w.id === 'crime' ? esc(w.title) + ' · ' : ''}${partLine}</span>
          <h1 class="rv">${big}</h1>
          ${plan[1] ? `<span class="chap-label rv">${esc(plan[1])}</span>` : ''}
          <span class="rule rv"></span>
        </header>`;
    }

    view.innerHTML = `
      <article class="reader ${w.kind}">
        ${head}
        ${segs.map(s => `<section class="scene" data-atmos="${s.atmos}" data-label="${esc(s.label || '')}"><div class="body">${s.html.join('')}</div></section>`).join('')}
        ${notes.length ? `<aside class="notes rv"><h3>Переводы</h3><ol>${notes.map(k => `<li value="${k}">${ch.notes[k]}</li>`).join('')}</ol></aside>` : ''}
        <footer class="chap-end">
          ${stagesHere(w, n)}
          ${nextC ? `
            <div class="orn rv">⁂</div>
            <a class="next-chap rv" href="#${w.id}-${n + 1}">
              <span class="nc-k">Дальше</span>
              <span class="nc-t">${esc(chapterName(w, nextC))}</span>
              <span class="nc-l">${esc((w.plan[n + 1] || [])[1] || '')}</span>
            </a>
            <div class="end-actions rv">
              ${prevC ? `<a class="btn ghost" href="#${w.id}-${n - 1}">← ${esc(chapterName(w, prevC))}</a>` : ''}
              <a class="btn ghost" href="#${w.id}">Оглавление</a>
            </div>` : `
            <div class="orn rv">⁂</div>
            <h2 class="rv">Конец</h2>
            <p class="rv">${esc(w.author)}, «${esc(w.title)}»</p>
            ${pathCard(w)}
            <div class="end-actions rv">
              <a class="btn solid" href="#${nextW.id}">Дальше: <span class="next-title">${esc(nextW.title)}</span></a>
              ${w.single ? '' : `<a class="btn" href="#${w.id}">Оглавление</a>`}
              <a class="btn ghost" href="#">В библиотеку</a>
            </div>`}
        </footer>
      </article>`;

    watchScenes(plan[1]);
    observeReveal();
    setupCompass(w, n);

    // восстановить место
    const p = getProg(w.id);
    window.scrollTo(0, 0);
    if (p && p.ch === n && p.r > 0.02 && p.r < 0.98) {
      const go = () => window.scrollTo(0, p.r * Math.max(0, document.documentElement.scrollHeight - innerHeight));
      requestAnimationFrame(go);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(go));
    } else {
      setProg(w.id, { ch: n, r: 0, t: Date.now() });
    }

    // заранее подгрузить следующую главу
    if (nextC) setTimeout(() => chapter(w.id, n + 1).catch(() => {}), 2500);
    maybeHint();
  }

  // ---------- прокрутка: прогресс, панель ----------
  let lastY = 0, saveT = null;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const r = Math.min(1, y / max);
    progress.style.transform = `scaleX(${current ? r : 0})`;
    barTitle.classList.toggle('show', document.body.classList.contains('reading') && y > innerHeight * 0.55);
    if (y > lastY + 6 && y > 140 && settings.hidden) bar.classList.add('hide');
    else if (y < lastY - 6 || y < 140) bar.classList.remove('hide');
    lastY = y;
    if (current) {
      clearTimeout(saveT);
      const { w, n } = current;
      saveT = setTimeout(() => {
        setProg(w.id, { ch: n, r: +r.toFixed(4), t: Date.now() });
        if (r > 0.92) markDone(w.id, n);
      }, 400);
    }
  }, { passive: true });

  // ---------- маршрутизация ----------
  let routeHash = '';
  function route() {
    routeHash = location.hash;
    hidePill(); hideNote();
    if (sceneObs) sceneObs.disconnect();
    const m = location.hash.match(/^#([a-z]+)(?:-(\d+|path))?$/);
    bar.classList.remove('hide');
    compass.hidden = true; compassState = null; unwire(); unwire = () => {};
    if (!m) return library();
    if (m[1] === 'monomyth') return monomythPage();
    const w = WORKS.find(x => x.id === m[1]);
    if (!w) { location.hash = '#'; return; }
    if (m[2] === 'path') return Journey.has(w.id) ? pathPage(w) : workPage(w);
    if (m[2]) return chapterPage(w, +m[2]);
    if (w.single) return chapterPage(w, 1);
    return workPage(w);
  }
  window.addEventListener('hashchange', route);

  // ---------- звук ----------
  const soundBtn = $('#soundBtn'), hint = $('#hint');
  async function setSound(on) {
    await Sound.enable(on);
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    soundBtn.setAttribute('aria-label', on ? 'Выключить звук' : 'Включить звук');
    hint.hidden = true;
  }
  soundBtn.addEventListener('click', () => setSound(!Sound.enabled));
  $('#hintOn').addEventListener('click', () => setSound(true));
  $('#hintX').addEventListener('click', () => { hint.hidden = true; });
  let hinted = false;
  function maybeHint() {
    if (hinted || Sound.enabled) return;
    hinted = true;
    setTimeout(() => {
      if (Sound.enabled || !current) return;
      hint.hidden = false;
      setTimeout(() => { hint.hidden = true; }, 9000);
    }, 1600);
  }

  // ---------- настройки ----------
  const settings = $('#settings'), setBtn = $('#setBtn'), fxToggle = $('#fxToggle'), vol = $('#vol');
  let fs = store.get('fs', 1);
  const applyFs = () => document.documentElement.style.setProperty('--fs', fs);
  applyFs();
  $('#fsDown').addEventListener('click', () => { fs = Math.max(0.85, +(fs - 0.08).toFixed(2)); applyFs(); store.set('fs', fs); });
  $('#fsUp').addEventListener('click', () => { fs = Math.min(1.4, +(fs + 0.08).toFixed(2)); applyFs(); store.set('fs', fs); });

  const fxOn = store.get('fx', !Atmos.reducedMotion);
  Atmos.setEffects(fxOn); fxToggle.setAttribute('aria-checked', fxOn);
  fxToggle.addEventListener('click', () => {
    const on = fxToggle.getAttribute('aria-checked') !== 'true';
    fxToggle.setAttribute('aria-checked', on); Atmos.setEffects(on); store.set('fx', on);
  });
  const musicToggle = $('#musicToggle');
  const musicOn = store.get('music', true);
  Sound.setMusic(musicOn); musicToggle.setAttribute('aria-checked', musicOn);
  musicToggle.addEventListener('click', () => {
    const on = musicToggle.getAttribute('aria-checked') !== 'true';
    musicToggle.setAttribute('aria-checked', on); Sound.setMusic(on); store.set('music', on);
  });
  vol.value = store.get('vol', 0.7); Sound.setVolume(+vol.value);
  vol.addEventListener('input', () => { Sound.setVolume(+vol.value); store.set('vol', +vol.value); });

  function toggleSettings(open) { settings.hidden = !open; setBtn.setAttribute('aria-expanded', open); }
  setBtn.addEventListener('click', e => { e.stopPropagation(); toggleSettings(settings.hidden); });
  document.addEventListener('click', e => { if (!settings.hidden && !settings.contains(e.target)) toggleSettings(false); });

  // ---------- сноски ----------
  const noteEl = $('#note');
  let noteT = null;
  function hideNote() { noteEl.hidden = true; }
  view.addEventListener('click', e => {
    const s = e.target.closest('sup[data-fn]');
    if (!s) return;
    const li = view.querySelector(`.notes li[value="${s.dataset.fn}"]`);
    if (!li) return;
    noteEl.innerHTML = li.innerHTML;
    noteEl.hidden = false;
    clearTimeout(noteT); noteT = setTimeout(hideNote, 6000);
  });
  noteEl.addEventListener('click', hideNote);

  // ---------- цитаты ----------
  const pill = $('#quoteBtn'), modal = $('#cardModal'), cardImg = $('#cardImg');
  const coarse = matchMedia('(pointer: coarse)').matches;
  let sel = null;
  function hidePill() { pill.hidden = true; sel = null; }
  function checkSelection() {
    const s = window.getSelection();
    if (!s || s.isCollapsed || !current) return hidePill();
    const text = s.toString().trim();
    const node = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement);
    const scene = node && node.closest('.scene');
    if (!scene || text.length < 3) return hidePill();
    sel = { text: text.slice(0, 600), atmos: scene.dataset.atmos };
    const rect = s.getRangeAt(0).getBoundingClientRect();
    pill.hidden = false;
    if (coarse) {
      pill.style.left = '50%'; pill.style.top = ''; pill.style.bottom = 'max(24px, env(safe-area-inset-bottom))';
    } else {
      pill.style.bottom = '';
      pill.style.left = Math.min(innerWidth - 120, Math.max(120, rect.left + rect.width / 2)) + 'px';
      pill.style.top = Math.max(72, rect.top - 52) + 'px';
    }
  }
  let selT = null;
  document.addEventListener('selectionchange', () => { clearTimeout(selT); selT = setTimeout(checkSelection, coarse ? 350 : 120); });
  window.addEventListener('scroll', () => { if (!coarse && !pill.hidden) checkSelection(); }, { passive: true });

  let cardUrl = null;
  pill.addEventListener('mousedown', e => e.preventDefault());
  pill.addEventListener('click', async () => {
    if (!sel || !current) return;
    const w = current.w;
    const data = { text: sel.text.replace(/([а-яёa-z.,!?…»])\d{1,2}(?=\s|$)/gi, '$1'), author: w.author, title: w.title, atmos: sel.atmos };
    hidePill();
    const cv = await Card.render(data);
    if (cardUrl) URL.revokeObjectURL(cardUrl);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    cardUrl = URL.createObjectURL(blob);
    cardImg.src = cardUrl;
    const file = new File([blob], 'svecha-quote.png', { type: 'image/png' });
    const share = $('#cardShare');
    share.hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
    share.onclick = () => navigator.share({ files: [file], title: w.title }).catch(() => {});
    // во встроенной рамке скачивание запрещено — сохраняют саму картинку
    const framed = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
    $('#cardSave').hidden = framed;
    if (framed) share.hidden = true;
    $('#cardHint').hidden = !framed;
    modal.hidden = false;
    window.getSelection().removeAllRanges();
  });
  $('#cardSave').addEventListener('click', () => {
    if (!cardUrl) return;
    const a = document.createElement('a');
    a.href = cardUrl; a.download = 'svecha-quote.png';
    document.body.appendChild(a); a.click(); a.remove();
  });
  const closeModal = () => { modal.hidden = true; };
  $('#cardClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // ---------- клавиатура ----------
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); toggleSettings(false); hidePill(); hideNote(); return; }
    if (!current || e.altKey || e.ctrlKey || e.metaKey || /input|textarea/i.test(e.target.tagName)) return;
    const { w, n, total } = current;
    if (e.key === 'ArrowRight' && n < total) location.hash = `#${w.id}-${n + 1}`;
    if (e.key === 'ArrowLeft' && n > 1) location.hash = `#${w.id}-${n - 1}`;
  });

  route();
})();
