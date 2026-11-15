/* Карточка с цитатой: 1080×1350, в палитре сцены. */
(function () {
  'use strict';

  const W = 1080, H = 1350;

  function wrap(ctx, text, maxW) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  async function render({ text, author, title, atmos }) {
    const a = Atmos.list[atmos] || Atmos.list.candle;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    try {
      await Promise.all([
        document.fonts.load('italic 500 60px "Cormorant Garamond"'),
        document.fonts.load('500 30px "Cormorant Garamond"'),
        document.fonts.load('400 26px "Literata"')
      ]);
    } catch (e) { /* шрифты не загрузились — нарисуем запасными */ }

    // фон
    g.fillStyle = a.bg; g.fillRect(0, 0, W, H);
    const gr = g.createRadialGradient(W * a.at[0], H * a.at[1], 0, W * a.at[0], H * a.at[1], Math.max(W, H) * a.size * 0.9);
    gr.addColorStop(0, a.glow); gr.addColorStop(1, a.bg);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(W / 2, H * 0.45, W * 0.3, W / 2, H * 0.45, W * 0.95);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, a.light ? 'rgba(40,40,70,0.14)' : `rgba(0,0,0,${0.35 + a.vig * 0.3})`);
    g.fillStyle = vg; g.fillRect(0, 0, W, H);

    // зерно
    const img = g.getImageData(0, 0, W, H), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    g.putImageData(img, 0, 0);

    // рамка
    g.strokeStyle = a.ink; g.globalAlpha = 0.14; g.lineWidth = 2;
    g.strokeRect(54, 54, W - 108, H - 108);
    g.globalAlpha = 1;

    // кавычка
    g.fillStyle = a.accent;
    g.font = 'italic 500 220px "Cormorant Garamond", serif';
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillText('«', 120, 330);

    // текст цитаты с подбором размера
    let clean = text.replace(/\s+/g, ' ').trim().replace(/^[«"„]+|[»"“]+$/g, '');
    const maxW = W - 260, top = 380, bottom = H - 300;
    let size = 72, lines, lh;
    for (; size >= 34; size -= 2) {
      g.font = `italic 500 ${size}px "Cormorant Garamond", serif`;
      lh = size * 1.28;
      lines = wrap(g, clean, maxW);
      if (lines.length * lh <= bottom - top) break;
    }
    if (lines.length * lh > bottom - top) {
      const max = Math.floor((bottom - top) / lh);
      lines = lines.slice(0, max);
      lines[max - 1] = lines[max - 1].replace(/[\s,.;:—-]*\S*$/, '') + '…';
    }
    g.fillStyle = a.ink;
    const blockH = lines.length * lh;
    let y = top + Math.max(0, (bottom - top - blockH) / 2) + size;
    for (const l of lines) { g.fillText(l, 130, y); y += lh; }

    // подпись
    g.fillStyle = a.accent; g.globalAlpha = 0.8;
    g.fillRect(130, H - 232, 60, 2);
    g.globalAlpha = 1;
    g.fillStyle = a.muted;
    g.font = '400 26px "Literata", serif';
    if ('letterSpacing' in g) g.letterSpacing = '6px';
    g.fillText(author.toUpperCase(), 130, H - 180);
    if ('letterSpacing' in g) g.letterSpacing = '0px';
    g.fillStyle = a.ink;
    g.font = 'italic 500 44px "Cormorant Garamond", serif';
    g.fillText(title, 130, H - 128);

    g.textAlign = 'right';
    g.fillStyle = a.muted;
    g.font = '500 30px "Cormorant Garamond", serif';
    g.fillText('Свеча', W - 130, H - 128);

    return c;
  }

  window.Card = { render };
})();
