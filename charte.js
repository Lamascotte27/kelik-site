(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const { GLYPHS, glyphFile, burst } = window.Kelik;
  const keys = Object.keys(GLYPHS);
  const TILE = ['#D4FFD8', '#F3ECFF', '#B7A6FF', '#FF5A36'];
  document.documentElement.classList.add('ready');
  $('#year').textContent = new Date().getFullYear();

  // Couverture : tous les glyphes en stickers
  $('#cover-glyphs').innerHTML = keys.slice(0, 16).map((k, i) =>
    `<span style="background:${TILE[i % 4]};--r:${(i % 2 ? 1 : -1) * (4 + (i * 7) % 9)}deg;--d:${-(i * .37).toFixed(2)}s"><svg class="glyph"><use href="#g-${k}"/></svg></span>`).join('');

  // Démo stickers
  $('#d-stick').innerHTML = ['kiff', 'frisson', 'coeur', 'rec'].map((k, i) =>
    `<span style="background:${TILE[i]};--r:${[-10, 8, -4, 12][i]}deg"><svg class="glyph"><use href="#g-${k}"/></svg></span>`).join('');

  // Couleurs : copier le code
  $$('.sw').forEach(sw => sw.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(sw.dataset.hex); } catch { /* presse-papier indisponible */ }
    sw.classList.add('copied');
    setTimeout(() => sw.classList.remove('copied'), 1200);
  }));

  // Glyphes
  const state = { style: 'plein', color: '#D4FFD8', accent: true };
  const grid = $('#g-grid');
  const render = () => {
    grid.className = `g-grid ${state.style === 'sticker' ? 'sticker' : ''}`;
    grid.style.setProperty('--gc', state.color);
    grid.innerHTML = keys.map((k, i) => `
      <button class="gt" type="button" data-k="${k}" style="--r:${(i % 2 ? 1 : -1) * (4 + (i * 5) % 8)}deg${state.accent ? ';--ga:#FF5A36' : ''}" aria-label="Télécharger ${GLYPHS[k].name} en SVG">
        <span class="gw"><svg class="glyph${state.style === 'contour' ? ' contour' : ''}"><use href="#g-${k}"/></svg></span>
        <b>${GLYPHS[k].name}</b><code>g-${k}</code>
      </button>`).join('');
  };
  render();

  $$('.seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    $$('button', seg).forEach(x => x.setAttribute('aria-pressed', x === b));
    state[seg.dataset.opt] = b.dataset.v;
    render();
  }));
  $('#g-accent').addEventListener('change', e => { state.accent = e.target.checked; render(); });

  const download = (name, svg) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const fileFor = k => {
    const opts = { color: state.color, accent: state.accent ? '#FF5A36' : undefined, contour: state.style === 'contour' };
    if (state.style !== 'sticker') return glyphFile(k, opts);
    const inner = glyphFile(k, { color: '#0A0910', accent: opts.accent }).replace(/^<svg[^>]*>|<\/svg>$/g, '');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="640" height="640"><path fill="${state.color}" d="M0 0H64V52L52 64H0Z"/><g transform="translate(8 8)">${inner}</g></svg>`;
  };
  grid.addEventListener('click', e => {
    const b = e.target.closest('.gt');
    if (!b) return;
    download(`kelik-${b.dataset.k}-${state.style}.svg`, fileFor(b.dataset.k));
    const r = b.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 8);
  });
  $('#g-sheet').addEventListener('click', () => {
    const cols = 6, cell = 64;
    const cells = keys.map((k, i) => {
      const inner = fileFor(k).replace(/^<svg[^>]*>|<\/svg>$/g, '');
      const vb = state.style === 'sticker' ? 64 : 48;
      return `<g transform="translate(${(i % cols) * cell + (state.style === 'sticker' ? 0 : 8)} ${Math.floor(i / cols) * cell + (state.style === 'sticker' ? 0 : 8)}) scale(${state.style === 'sticker' ? .875 : 1})"><svg width="${vb}" height="${vb}" viewBox="0 0 ${vb} ${vb}">${inner}</svg></g>`;
    }).join('');
    const rows = Math.ceil(keys.length / cols);
    download('kelik-glyphes.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols * cell} ${rows * cell}" width="${cols * cell * 4}" height="${rows * cell * 4}"><rect width="100%" height="100%" fill="#0A0910"/>${cells}</svg>`);
  });
})();
