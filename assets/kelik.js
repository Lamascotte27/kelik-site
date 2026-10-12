/* ==========================================================
   KELIK — éléments graphiques partagés
   Logo vectorisé · Glyphes (les « emojis » Kelik) · Curseur viseur · Confettis
   ========================================================== */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Logo (tracé depuis LOGO_seul.png) ---------- */
  const LOGO = {
    viewBox: '209.7 415.4 1584.6 484.6',
    frame: 'M212.55 418.25H1791.45V897.85H212.55Z',
    letters: {
      k1: 'M359.4 531.4H437.7V627.3L520.2 531.4H623.5L531.5 626.7L627.3 784.6H532.2L477.6 678.8L437.7 725.3V784.6H359.4Z',
      e: 'M692 531.4H905.1V593.1H692Z M692 625.1H905.1V686.9H769.7V722.3H905.1V784.6H692Z',
      l: 'M969.7 531.4H1047.4V702.4L969.7 765.9Z M1065.1 722.3H1169.7V784.6H988.9Z',
      i: 'M1234.3 531.4H1312V592.6H1234.3Z M1234.3 625.7H1312V784.6H1234.3Z',
      k2: 'M1376 531.4H1454.3V627.3L1536.8 531.4H1640.1L1548.1 626.7L1643.9 784.6H1548.8L1494.2 678.8L1454.3 725.3V784.6H1376Z'
    }
  };

  let uid = 0;
  const logo = ({ outline = ['k1'], title = 'Kelik', cls = '' } = {}) => {
    const id = `kl${++uid}`;
    const letters = Object.entries(LOGO.letters).map(([k, d]) =>
      `<g class="lt${outline.includes(k) ? ' o' : ''}" data-l="${k}">` +
      `<clipPath id="${id}-${k}"><path d="${d}"/></clipPath>` +
      `<path class="lf" d="${d}"/><path class="ls" d="${d}" clip-path="url(#${id}-${k})"/>` +
      `<path class="lh" d="${d}"/></g>`).join('');
    return `<svg class="klogo ${cls}" viewBox="${LOGO.viewBox}" role="img" aria-label="${title}"><path class="lframe" d="${LOGO.frame}"/>${letters}</svg>`;
  };

  /* ---------- Glyphes : grille 48 × 48, langage du logo (angles coupés, cadre, contour/plein) ----------
     a: true  → partie « accent » (couleur via --ga)                                              */
  const FRAME = 'M3 3H45V45H3ZM7 7V41H41V7Z';
  const GLYPHS = {
    kiff:    { name: 'Le Kiff',       p: [{ d: FRAME }, { d: 'M13 14H20V21H13ZM28 14H35V21H28Z' }, { d: 'M12 27H36L30.5 35H17.5Z', a: 1 }] },
    clin:    { name: 'Le Clin d’œil', p: [{ d: FRAME }, { d: 'M12 18H21V21.5H12ZM28 14H35V21H28Z' }, { d: 'M12 27H36L30.5 35H17.5Z', a: 1 }] },
    wow:     { name: 'Le Wow',        p: [{ d: FRAME }, { d: 'M13 13H20V20H13ZM28 13H35V20H28Z' }, { d: 'M19 25H29V37H19ZM22.5 28.5V33.5H25.5V28.5Z', a: 1 }] },
    rec:     { name: 'Le REC',        p: [{ d: 'M4 4H17V8H8V17H4ZM44 4V17H40V8H31V4ZM4 44V31H8V40H17V44ZM44 44H31V40H40V31H44Z' }, { d: 'M16.5 24a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0 -15 0Z', a: 1 }] },
    cam:     { name: 'La Caméra',     p: [{ d: 'M10 13H34V37H4V19ZM11 20H21V30H11Z' }, { d: 'M36.5 21L45 15.5V34.5L36.5 29Z' }, { d: 'M25 17H30V22H25Z', a: 1 }] },
    clap:    { name: 'Le Clap',       p: [{ d: 'M4 7H44V15H4ZM11 7H16L12 15H7ZM21 7H26L22 15H17ZM31 7H36L32 15H27Z', t: 'rotate(-9 4 15)' }, { d: 'M4 19H44V43H4Z' }, { d: 'M9 26H23V29H9Z', a: 1 }] },
    frisson: { name: 'Le Frisson',    p: [{ d: 'M29 2L9 27H22L17 46L39 19H26L32 2Z' }] },
    energie: { name: 'L’Énergie',     p: [{ d: 'M5 44V27L12 22V44ZM15.5 44V13L22.5 8V44ZM26 44V21L33 16V44Z' }, { d: 'M36.5 44V31L43.5 26V44Z', a: 1 }] },
    drop:    { name: 'Le Drop',       p: [{ d: 'M19.5 3H28.5V26H39L24 45L9 26H19.5Z' }] },
    spark:   { name: 'L’Étincelle',   p: [{ d: 'M22 4L27 19L42 24L27 29L22 44L17 29L2 24L17 19Z' }, { d: 'M39 3L40.8 7.2L45 9L40.8 10.8L39 15L37.2 10.8L33 9L37.2 7.2Z', a: 1 }] },
    feu:     { name: 'Le Feu',        p: [{ d: 'M22 2L34 16L36.5 10.5L42 21V34L32 46H16L6 34V20L14 10L16.5 20ZM24 25L30 33.5L27 42H21L18 33.5Z' }] },
    coeur:   { name: 'Le Cœur',       p: [{ d: 'M24 44L4 23V11L11 4H18L24 10L30 4H37L44 11V23ZM10 11.5H16.5L10 18Z' }] },
    vinyle:  { name: 'Le Vinyle',     p: [{ d: 'M3 24a21 21 0 1 0 42 0a21 21 0 1 0 -42 0ZM16 24a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z' }, { d: 'M19.5 24a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0Z', a: 1 }] },
    oeil:    { name: 'L’Œil',         p: [{ d: 'M2 24L14 11H34L46 24L34 37H14ZM9.5 24L17 16H31L38.5 24L31 32H17Z' }, { d: 'M22 18.5H29.5V29.5H18.5V22Z', a: 1 }] },
    reel:    { name: 'Le Réel',       p: [{ d: 'M13 2H35V46H13ZM16.5 6V42H31.5V6Z' }, { d: 'M20.5 17L30 24L20.5 31Z', a: 1 }] },
    pin:     { name: 'Le Spot',       p: [{ d: 'M24 46L9 28V10L15 4H33L39 10V28ZM19 13H29V23H19Z' }] },
    k:       { name: 'Le K',          p: [{ d: 'M4 5.1H15.7V19.4L28 5.1H43.4L29.7 19.3L44 42.9H29.8L21.7 27.1L15.7 34V42.9H4Z' }] }
  };

  const glyphPaths = (g, { color = 'currentColor', accent } = {}) => g.p.map(x =>
    `<path fill-rule="evenodd"${x.t ? ` transform="${x.t}"` : ''} fill="${x.a && accent ? accent : color}" d="${x.d}"/>`).join('');

  const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${
    Object.entries(GLYPHS).map(([k, g]) => `<symbol id="g-${k}" viewBox="0 0 48 48">${g.p.map(x =>
      `<path fill-rule="evenodd"${x.a ? ' style="fill:var(--ga,currentColor)"' : ''}${x.t ? ` transform="${x.t}"` : ''} d="${x.d}"/>`).join('')}</symbol>`).join('')
  }</defs></svg>`;
  document.body.insertAdjacentHTML('afterbegin', sprite);

  /* Fichier SVG autonome d'un glyphe (pour téléchargement) */
  const glyphFile = (key, { color = '#0A0910', accent, contour = false } = {}) => {
    const g = GLYPHS[key];
    const inner = contour
      ? g.p.map(x => `<path fill-rule="evenodd" fill="none" stroke="${x.a && accent ? accent : color}" stroke-width="2.2" stroke-linejoin="miter"${x.t ? ` transform="${x.t}"` : ''} d="${x.d}"/>`).join('')
      : glyphPaths(g, { color, accent });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="480" height="480">${inner}</svg>`;
  };

  /* ---------- Confettis de glyphes ---------- */
  const COLORS = ['#D4FFD8', '#F3ECFF', '#FF5A36', '#FFFFFF', '#B7A6FF'];
  const FUN = ['kiff', 'clin', 'wow', 'frisson', 'spark', 'coeur', 'feu', 'energie', 'k', 'vinyle'];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const burst = (x, y, n = 16) => {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('class', 'confetto');
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = `<use href="#g-${pick(FUN)}"/>`;
      const size = 18 + Math.random() * 22;
      Object.assign(s.style, { left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px`, color: pick(COLORS) });
      s.style.setProperty('--ga', pick(COLORS));
      document.body.append(s);
      const ang = -Math.PI / 2 + (Math.random() - .5) * 2.6;
      const v = 140 + Math.random() * 260;
      const dx = Math.cos(ang) * v, dy = Math.sin(ang) * v;
      const rot = (Math.random() - .5) * 720;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(.2)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * .7}px), calc(-50% + ${dy * .7}px)) rotate(${rot * .5}deg) scale(1)`, opacity: 1, offset: .35 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 320}px)) rotate(${rot}deg) scale(.8)`, opacity: 0 }
      ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(.2,.65,.35,1)' }).onfinish = () => s.remove();
    }
  };

  /* ---------- Curseur viseur ---------- */
  const initCursor = () => {
    if (!matchMedia('(pointer: fine)').matches || reduced || document.documentElement.dataset.cursor === 'off') return;
    const c = document.createElement('div');
    c.className = 'cursor';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span class="cursor-box"></span><span class="cursor-label"></span>';
    document.body.append(c);
    document.documentElement.classList.add('has-cursor');
    const label = c.querySelector('.cursor-label');
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    let raf = 0;
    const loop = () => {
      x += (tx - x) * .24; y += (ty - y) * .24;
      c.style.transform = `translate3d(${x}px,${y}px,0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .2 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; c.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    document.addEventListener('pointerleave', () => c.classList.remove('on'));
    addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor],a,button,label,input,textarea,select');
      let mode = '', txt = '';
      if (t) {
        mode = t.dataset.cursor || (t.matches('input,textarea,select') ? 'text' : 'link');
        txt = t.dataset.cursorLabel || '';
      }
      c.dataset.mode = mode;
      label.textContent = txt;
    });
    addEventListener('pointerdown', () => c.classList.add('down'));
    addEventListener('pointerup', () => c.classList.remove('down'));
  };

  /* ---------- Logos interactifs ---------- */
  const mountLogos = () => {
    document.querySelectorAll('[data-klogo]').forEach(el => {
      el.innerHTML = logo({ outline: (el.dataset.outline || 'k1').split(','), title: el.dataset.title || 'Kelik' });
      if (el.hasAttribute('data-interactive')) {
        el.querySelectorAll('.lt').forEach(lt => {
          lt.addEventListener('pointerenter', () => lt.classList.toggle('o'));
          lt.addEventListener('click', e => burst(e.clientX, e.clientY, 10));
        });
      }
    });
  };

  const ready = () => { mountLogos(); initCursor(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();

  window.Kelik = { LOGO, GLYPHS, logo, burst, glyphFile, reduced };
})();
