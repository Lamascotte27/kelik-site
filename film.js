(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const pad = n => String(n).padStart(2, '0');
  const tc = f => `${pad(Math.floor(f / 90000) % 24)}:${pad(Math.floor(f / 1500) % 60)}:${pad(Math.floor(f / 25) % 60)}:${pad(f % 25)}`;
  const store = { get: k => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* navigation privée */ } } };
  const burstAt = (el, n) => { const r = el.getBoundingClientRect(); Kelik.burst(r.left + r.width / 2, r.top + r.height / 2, n); };

  $('#year').textContent = new Date().getFullYear();

  /* =========================================================
     INTRO — le logo se monte, puis on plonge à travers le K creux
     ========================================================= */
  const intro = $('#intro');
  let introDone = false;
  const finishIntro = () => {
    if (introDone) return;
    introDone = true;
    html.classList.remove('intro-on');
    html.classList.add('ready');
    intro?.remove();
    store.set('kelik-intro', '1');
  };
  const runIntro = () => {
    html.classList.add('intro-on');
    const svg = $('#intro-svg');
    const LOGO_C = [1002, 657.6], K_C = [398.5, 658];
    const fitW = () => 1584.6 / (innerWidth < 700 ? .84 : .6);
    const setVB = (cx, cy, w) => { const h = w * innerHeight / innerWidth; svg.setAttribute('viewBox', `${cx - w / 2} ${cy - h / 2} ${w} ${h}`); };
    setVB(...LOGO_C, fitW());
    requestAnimationFrame(() => intro.classList.add('play'));
    const pct = $('#intro-pct');
    const t0 = performance.now();
    const count = () => {
      const p = Math.min(1, (performance.now() - t0) / 1250);
      pct.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`;
      if (p < 1 && !introDone) requestAnimationFrame(count);
    };
    count();
    let zooming = false;
    const zoom = (dur = 1150) => {
      if (zooming) return;
      zooming = true;
      intro.classList.add('open', 'zoom');
      html.classList.add('ready');
      const W0 = fitW(), W1 = 56, z0 = performance.now();
      const step = () => {
        const t = Math.min(1, (performance.now() - z0) / dur), e = ease(t), c = Math.min(1, e * 1.7);
        setVB(LOGO_C[0] + (K_C[0] - LOGO_C[0]) * c, LOGO_C[1] + (K_C[1] - LOGO_C[1]) * c, W0 * Math.pow(W1 / W0, e));
        if (t < 1) requestAnimationFrame(step); else finishIntro();
      };
      requestAnimationFrame(step);
    };
    const timers = [setTimeout(() => intro.classList.add('open'), 1300), setTimeout(() => zoom(), 1750)];
    const skip = () => { timers.forEach(clearTimeout); zoom(500); };
    $('#intro-skip').addEventListener('click', skip);
    addEventListener('wheel', skip, { once: true, passive: true });
    addEventListener('keydown', skip, { once: true });
    addEventListener('touchstart', skip, { once: true, passive: true });
  };
  if (!intro || reduced || store.get('kelik-intro') || scrollY > 80) finishIntro(); else runIntro();

  /* =========================================================
     Montages (Arthur : coupes rapides / Adrien : fondus lents)
     ========================================================= */
  const REELS = ['catho', 'nils', 'hockey', 'laplagne', 'b2b', 'danse'].map(n => `assets/img/reel-${n}.webp`);
  const montage = box => {
    const fast = box.dataset.montage === 'fast';
    const imgs = (fast ? REELS : [...REELS].reverse()).map(src => {
      const i = new Image(); i.src = src; i.alt = ''; i.decoding = 'async'; box.append(i); return i;
    });
    let k = 0, timer = null;
    imgs[0].classList.add('on');
    const cut = () => { imgs[k].classList.remove('on'); k = (k + 1) % imgs.length; void imgs[k].offsetWidth; imgs[k].classList.add('on'); };
    return {
      play() { if (!timer && !reduced) timer = setInterval(cut, fast ? 200 : 2600); },
      stop() { clearInterval(timer); timer = null; }
    };
  };

  /* =========================================================
     SCÈNE 01 — L'émotion
     ========================================================= */
  const emMedia = $('#em-media'), emShade = $('#em-shade'), emCorners = $('#em-corners');
  const emImgs = $$('img', emMedia), emWords = $$('.em-w'), emL1 = $('#em-l1'), emL2 = $('#em-l2');
  let emImg = 0, emP = 0;
  const setEmImg = i => { if (i === emImg) return; emImgs[emImg].classList.remove('on'); emImg = i; emImgs[i].classList.add('on'); };
  setInterval(() => { if (!reduced && emP > .46 && emP < 1 && !document.hidden) setEmImg((emImg + 1) % emImgs.length); }, 1300);
  const emTc = $('#em-tc'); const emT0 = performance.now();
  const updEmotion = p => {
    emP = p;
    const W = innerWidth, H = innerHeight;
    const wi = p < .42 ? Math.min(3, Math.floor(p / .105)) : -1;
    emWords.forEach((w, i) => { w.classList.toggle('on', i === wi); w.classList.toggle('off', wi > i || (wi === -1 && p >= .42)); });
    if (wi >= 0) setEmImg(wi);
    const e = ease(seg(p, .44, .72));
    const h0 = H * (W < 700 ? .5 : .58), w0 = h0 * 9 / 16;
    const h = h0 + (H - h0) * e, w = w0 + (W - w0) * e;
    const t = (H - h) / 2, l = (W - w) / 2;
    const clip = `inset(${t}px ${l}px ${t}px ${l}px)`;
    emMedia.style.clipPath = clip;
    emShade.style.clipPath = clip;
    emShade.style.opacity = (.1 + .55 * e).toFixed(3);
    emMedia.style.setProperty('--zoom', (1.25 - .25 * e).toFixed(3));
    emCorners.style.transform = `translate(${l}px,${t}px)`;
    emCorners.style.width = `${w}px`;
    emCorners.style.height = `${h}px`;
    emCorners.style.opacity = 1 - seg(p, .64, .7);
    emL1.classList.toggle('on', p >= .6 && p < .8);
    emL2.classList.toggle('on', p >= .8);
    emTc.textContent = tc(Math.floor((performance.now() - emT0) / 40));
  };

  /* =========================================================
     SCÈNE 02 — Le casting
     ========================================================= */
  const castA = $('#cast-a'), castB = $('#cast-b'), castTa = $('#cast-ta'), castTb = $('#cast-tb');
  const castBars = $('#cast-bars'), castSplit = $('#cast-split');
  const castPin = $('#casting .pin');
  castPin.insertAdjacentHTML('beforeend', '<svg class="cast-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="110" y1="0" x2="110" y2="100"/></svg>');
  const edge = $('.cast-edge line', castPin);
  const castEngines = $$('#casting .montage').map(montage);
  new IntersectionObserver(([e]) => castEngines.forEach(m => e.isIntersecting ? m.play() : m.stop())).observe($('#casting'));
  const updCast = p => {
    const w = ease(seg(p, .24, .46)), s = ease(seg(p, .64, .84));
    const x = s > 0 ? -14 + 64 * s : 110 - 124 * w;
    const slant = innerWidth < 700 ? 10 : 6;
    castB.style.clipPath = `polygon(${x + slant}% 0, 110% 0, 110% 100%, ${x - slant}% 100%)`;
    edge.setAttribute('x1', x + slant); edge.setAttribute('x2', x - slant);
    edge.style.opacity = x > 1 && x < 99 ? 1 : 0;
    castBars.style.setProperty('--bw', Math.max(w, s).toFixed(3));
    castTa.style.opacity = 1 - seg(p, .18, .26);
    castTb.style.opacity = seg(p, .42, .5) * (1 - seg(p, .6, .66));
    const so = seg(p, .84, .94);
    castSplit.style.opacity = so;
    castSplit.classList.toggle('live', so > .5);
  };

  /* =========================================================
     SCÈNE 03 — Les images (la pellicule glisse)
     ========================================================= */
  const strip = $('#strip'), plBar = $('#pl-bar'), plCount = $('#pl-count');
  const nFrames = $$('.frame:not(.frame-more)', strip).length;
  const updFilms = p => {
    const e = seg(p, .04, .96);
    const gutter = parseFloat(getComputedStyle(strip).marginLeft) || 0;
    const dist = Math.max(0, strip.scrollWidth + gutter * 2 - innerWidth);
    strip.style.transform = `translate3d(${-e * dist}px,0,0)`;
    plBar.style.transform = `scaleX(${e})`;
    plCount.textContent = `${pad(Math.min(nFrames, 1 + Math.round(e * (nFrames - 1))))} / ${pad(nFrames)}`;
  };

  /* =========================================================
     SCÈNE 04 — La méthode (la tête de lecture avance)
     ========================================================= */
  const nleBody = $('#nle-body'), playhead = $('#playhead'), nleTc = $('#nle-tc');
  const clips = $$('.clip.step'), msteps = $$('.mstep');
  (() => {
    let s = 7, d = '';
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 160; i++) {
      const h = 10 + Math.pow(rnd(), 1.4) * 80 * (.55 + .45 * Math.sin(i / 9));
      d += `M${i * 5} ${50 - h / 2}h3v${h}h-3Z`;
    }
    const wave = $('#wave');
    wave.setAttribute('viewBox', '0 0 800 100');
    wave.innerHTML = `<path d="${d}"/>`;
  })();
  let lastStep = -1;
  const updMethod = p => {
    const e = seg(p, .06, .94);
    const laneW = nleBody.clientWidth - 60 - 16;
    playhead.style.transform = `translateX(${e * laneW}px)`;
    nleTc.textContent = tc(Math.round(e * 60 * 25));
    const i = Math.min(3, Math.floor(e * 4));
    if (i !== lastStep) {
      lastStep = i;
      clips.forEach(c => c.classList.toggle('active', +c.dataset.i === i));
      msteps.forEach(c => c.classList.toggle('on', +c.dataset.i === i));
    }
  };

  /* =========================================================
     SCÈNE 05 — Générique de fin
     ========================================================= */
  const roll = $('#roll'), fin = $('#fin'), finSmall = $('#fin-small');
  const updCredits = p => {
    const H = innerHeight;
    const e = seg(p, 0, .8);
    const y = H * .95 - (roll.offsetHeight + H * 1.05) * e;
    roll.style.transform = `translate(-50%, ${y}px)`;
    fin.style.opacity = seg(p, .8, .9);
    finSmall.classList.toggle('on', p > .92);
  };

  /* =========================================================
     Moteur de scènes + timeline de navigation
     ========================================================= */
  const UPD = { emotion: updEmotion, cast: updCast, films: updFilms, method: updMethod, credits: updCredits };
  const scenes = $$('[data-scene]');
  const sceneP = el => {
    const len = el.offsetHeight - innerHeight;
    return len > 0 ? clamp(-el.getBoundingClientRect().top / len) : 0;
  };

  const COLORS = ['#F3ECFF', '#D4FFD8', '#B7A6FF', '#FF5A36', '#D4FFD8', '#B7A6FF', '#F3ECFF'];
  const tlClips = $('#tl-clips'), tlHead = $('#tl-head'), tlTc = $('#tl-tc'), tlNow = $('#tl-now'), tlState = $('#tl-state');
  const buildTimeline = () => {
    tlClips.innerHTML = scenes.map((el, i) =>
      `<button class="tl-clip" type="button" style="--w:${el.offsetHeight};--c:${COLORS[i % COLORS.length]}" data-i="${i}" aria-label="Aller à : ${el.dataset.title}"><svg class="glyph"><use href="#g-${el.dataset.glyph}"/></svg><span>${pad(i)} ${el.dataset.title}</span></button>`).join('');
  };
  buildTimeline();
  tlClips.addEventListener('click', e => {
    const b = e.target.closest('.tl-clip');
    if (!b) return;
    const el = scenes[+b.dataset.i];
    scrollTo({ top: el.offsetTop + (el.classList.contains('scene') ? innerHeight * .02 : 0), behavior: reduced ? 'auto' : 'smooth' });
  });
  let activeClip = -1, stateTimer;
  const updTimeline = () => {
    const y = scrollY, maxY = document.documentElement.scrollHeight - innerHeight;
    let i = scenes.length - 1;
    for (let k = 0; k < scenes.length; k++) if (y < scenes[k].offsetTop + scenes[k].offsetHeight - 1) { i = k; break; }
    const el = scenes[i];
    const end = i === scenes.length - 1 ? maxY : el.offsetTop + el.offsetHeight;
    const local = clamp((y - el.offsetTop) / Math.max(1, end - el.offsetTop));
    const btn = tlClips.children[i];
    if (btn) tlHead.style.transform = `translateX(${btn.offsetLeft + btn.offsetWidth * local}px)`;
    if (i !== activeClip) {
      activeClip = i;
      [...tlClips.children].forEach((c, k) => c.classList.toggle('on', k === i));
      tlNow.textContent = `${pad(i)} · ${el.dataset.title}`;
    }
    tlTc.textContent = tc(Math.round((maxY > 0 ? y / maxY : 0) * 150 * 25));
    tlState.textContent = '▶';
    clearTimeout(stateTimer);
    stateTimer = setTimeout(() => { tlState.textContent = '❚❚'; }, 220);
  };

  const nav = $('#nav');
  let ticking = false;
  const frame = () => {
    ticking = false;
    nav.classList.toggle('scrolled', scrollY > 30);
    for (const el of scenes) {
      const fn = UPD[el.dataset.scene];
      if (!fn) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom > -innerHeight * .2 && r.top < innerHeight * 1.2) fn(sceneP(el));
    }
    updTimeline();
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', request, { passive: true });
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { buildTimeline(); activeClip = -1; request(); }, 120); });
  addEventListener('load', () => { buildTimeline(); activeClip = -1; request(); });
  document.fonts?.ready.then(request);
  // Timecode HUD de la scène 01 : rafraîchi en continu tant qu'elle est visible
  const tickEm = () => { if (emP > 0 && emP < 1) emTc.textContent = tc(Math.floor((performance.now() - emT0) / 40)); requestAnimationFrame(tickEm); };
  if (!reduced) tickEm();
  frame();

  /* =========================================================
     Révélations (post-générique)
     ========================================================= */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* =========================================================
     Scène post-générique — le brief
     ========================================================= */
  const form = $('#brief'), briefTo = $('#brief-to');
  const recipients = { arthur: ['arthur@kelik.fr'], adrien: ['adrien@kelik.fr'], both: ['arthur@kelik.fr', 'adrien@kelik.fr'] };
  const labels = { arthur: 'à Arthur', adrien: 'à Adrien', both: 'à Arthur & Adrien' };
  const styleNames = { arthur: 'Dynamique & immersif (Arthur)', adrien: 'Posé & cinématographique (Adrien)', both: 'Les deux styles' };
  form.addEventListener('change', e => {
    briefTo.textContent = labels[form.elements.style.value];
    if (e.target.matches('input[type="radio"]')) burstAt(e.target.nextElementSibling, 5);
  });
  $$('[data-pick]').forEach(a => a.addEventListener('click', () => {
    const r = form.querySelector(`input[name="style"][value="${a.dataset.pick}"]`);
    if (r) { r.checked = true; briefTo.textContent = labels[a.dataset.pick]; }
    burstAt(a, 10);
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const style = f.get('style');
    const date = f.get('date') ? new Date(f.get('date')).toLocaleDateString('fr-FR') : '';
    const subject = `Brief Kelik — ${f.get('type')}${date ? ` — ${date}` : ''}`;
    const body = [
      'Bonjour Kelik,', '',
      `Type d’événement : ${f.get('type')}`,
      `Réal souhaité : ${styleNames[style]}`,
      date ? `Date : ${date}` : null,
      '', f.get('message') || '[Décrivez votre projet ici]', '',
      f.get('nom') ? `— ${f.get('nom')}` : ''
    ].filter(l => l !== null).join('\n');
    burstAt(form.querySelector('button[type="submit"]'), 28);
    setTimeout(() => {
      location.href = `mailto:${recipients[style].join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, reduced ? 0 : 450);
  });
})();
