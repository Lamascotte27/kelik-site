(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const pad = n => String(n).padStart(2, '0');
  const tc = f => `${pad(Math.floor(f / 90000) % 24)}:${pad(Math.floor(f / 1500) % 60)}:${pad(Math.floor(f / 25) % 60)}:${pad(f % 25)}`;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const store = { get: k => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* navigation privée */ } } };

  /* =========================================================
     RÉGLAGES DU DEVIS — grille tarifaire 2026 (montants HT, jamais affichés au visiteur)
     Le visiteur décrit son événement ; le forfait le plus adapté est choisi ici, en interne.
     Les demandes partent par e-mail via FormSubmit : au tout premier envoi depuis un site
     donné, FormSubmit envoie un e-mail d'activation à cette adresse (un clic, une seule fois).
     ========================================================= */
  const DEVIS_EMAIL = 'arthur@kelik.fr';
  const DEVIS_ENDPOINT = `https://formsubmit.co/ajax/${DEVIS_EMAIL}`;
  const TARIFS = {
    forfaits: {
      essentiel: { nom: 'Essentiel', prix: 1100, jours: 1, verticaux: 0, inclus: [], filmLong: false, detail: '1 journée · 1 film de 90 à 300 s · 1 retouche · 10 jours ouvrés' },
      signature: { nom: 'Signature', prix: 1900, jours: 2, verticaux: 2, inclus: ['soustitres'], filmLong: true, detail: '2 journées · repérage · 1 film de 2 à 8 min + 2 formats verticaux · sous-titres · 2 retouches · 3 semaines' },
      surmesure: { nom: 'Sur-mesure', prix: 2900, jours: 3, verticaux: 2, inclus: ['soustitres', 'motion', 'voixoff'], filmLong: true, des: true, detail: '3 journées et + · film principal + déclinaisons · motion design, voix off · 3 retouches' }
    },
    jour: 800, demi: 450, vertical: 150,
    options: {
      drone: { nom: 'Captation par drone', prix: 350 },
      multicam: { nom: 'Deuxième caméra (multicam)', prix: 250 },
      soustitres: { nom: 'Sous-titrage incrusté (FR)', prix: 120, note: 'film principal' },
      anglais: { nom: 'Version anglaise sous-titrée', prix: 180, note: 'film principal' },
      motion: { nom: 'Habillage motion design sur charte', prix: 400, des: true },
      voixoff: { nom: 'Voix off professionnelle', prix: 300, des: true },
      rushs: { nom: 'Livraison des rushs bruts', prix: 200 }
    }
  };
  const eur = n => `${n.toLocaleString('fr-FR')} €`;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Logo de l'en-tête : il se dessine, comme dans kelik-logo.mp4 ----------
     Même minutage que la vidéo : le cadre se trace depuis deux coins, les lettres en contour de gauche à droite,
     puis E L i K se remplissent d'un balayage en biais (le premier K reste en contour), un léger halo, et ça tient. */
  const makeLogo = svg => {
    if (!svg) return () => {};
    const lines = $$('.hdl-line', svg), frame = $$('.hdl-frame', svg);
    const letters = ['k1', 'e', 'l', 'i', 'k2'].map(l => $$(`[data-l="${l}"] .hdl-line`, svg));
    const sweep = $('.hdl-sweep-shape', svg), glow = $('.hdl-glow', svg);
    const inOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, out = t => 1 - (1 - t) * (1 - t);
    const seg = (t, start, dur, e) => e(clamp((t - start) / dur));
    const dash = (ps, k) => ps.forEach(p => { p.style.strokeDashoffset = 1000 * (1 - k); });
    const render = t => {
      svg.style.transform = `scale(${.94 + .06 * out(clamp(t / 3))})`;
      dash(frame, seg(t, .05, .9, inOut));
      letters.forEach((ps, n) => dash(ps, seg(t, .3 + n * .08, .75, inOut)));
      if (t >= 1.06) letters[0].forEach(p => { p.style.strokeDasharray = 'none'; });
      const s = seg(t, 1.1, .65, inOut);
      sweep.setAttribute('points', `300,500 ${682 + 1240 * s},500 ${410 + 1240 * s},815 300,815`);
      glow?.setAttribute('opacity', t < 1.6 ? 0 : t < 1.88 ? .5 * out((t - 1.6) / .28) : .5 * (1 - inOut(clamp((t - 1.9) / .8))));
    };
    const prepare = () => { lines.forEach(p => { p.style.strokeDasharray = '1000 1000'; }); render(0); };
    const finish = () => { lines.forEach(p => { p.style.strokeDasharray = 'none'; p.style.strokeDashoffset = 0; }); svg.style.transform = ''; };
    let running = false;
    if (!reduced) prepare();
    return () => {
      if (reduced || running) return;
      running = true; prepare();
      const t0 = performance.now();
      const tick = now => {
        const t = (now - t0) / 1000;
        render(Math.min(t, 3));
        if (t < 3) requestAnimationFrame(tick); else { running = false; finish(); }
      };
      requestAnimationFrame(tick);
    };
  };
  const playLogo = makeLogo($('#hdl'));
  const hoverOk = () => matchMedia('(hover: hover)').matches;
  // On le joue quand l'en-tête apparaît (après l'intro), puis à nouveau au survol
  if (html.classList.contains('ready')) playLogo();
  else { const mo = new MutationObserver(() => { if (html.classList.contains('ready')) { mo.disconnect(); playLogo(); } }); mo.observe(html, { attributes: true, attributeFilter: ['class'] }); }
  $('.hd-logo')?.addEventListener('mouseenter', () => { if (hoverOk()) playLogo(); });
  // Bas de page : la même animation, quand le logo arrive à l'écran, puis au survol
  const playFoot = makeLogo($('#ftl'));
  if ($('#ftl')) {
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); playFoot(); } }, { threshold: .6 }).observe($('#ftl'));
    $('.ft-logo').addEventListener('mouseenter', () => { if (hoverOk()) playFoot(); });
  }

  /* ---------- Intro : on plonge à travers le K ---------- */
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
    const fitW = () => 1584.6 / (innerWidth < 700 ? .84 : .56);
    const setVB = (cx, cy, w) => { const h = w * innerHeight / innerWidth; svg.setAttribute('viewBox', `${cx - w / 2} ${cy - h / 2} ${w} ${h}`); };
    setVB(...LOGO_C, fitW());
    requestAnimationFrame(() => intro.classList.add('play'));
    let zooming = false;
    const zoom = (dur = 950) => {
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
    const timers = [setTimeout(() => intro.classList.add('open'), 1050), setTimeout(() => zoom(), 1400)];
    const skip = () => { timers.forEach(clearTimeout); zoom(450); };
    $('#intro-skip').addEventListener('click', skip);
    addEventListener('wheel', skip, { once: true, passive: true });
    addEventListener('keydown', skip, { once: true });
    addEventListener('touchstart', skip, { once: true, passive: true });
  };
  if (!intro || reduced || store.get('kelik-intro') || scrollY > 80) finishIntro(); else runIntro();

  /* ---------- En-tête ---------- */
  const hd = $('#hd'), burger = $('#burger');
  const setMenu = open => {
    hd.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!hd.classList.contains('open')));
  $$('#hd-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Hero : vidéo, pause, mot qui change ---------- */
  const heroVideo = $('#hero-video');
  let paused = false, heroOn = true;
  try { paused = localStorage.getItem('kelik-motion') === 'off'; } catch { /* stockage indisponible */ }
  const syncVideo = () => {
    const ok = !reduced && !paused && heroOn && !document.hidden && !navigator.connection?.saveData;
    if (ok) heroVideo.play().catch(() => {}); else heroVideo.pause();
  };
  const motionBtns = $$('[data-motion]');
  let syncReels = () => {};
  const setPaused = v => {
    paused = v;
    html.classList.toggle('paused', v);
    motionBtns.forEach(b => { b.setAttribute('aria-pressed', v); $('.motion-txt', b).textContent = v ? 'Lecture' : 'Pause'; });
    try { localStorage.setItem('kelik-motion', v ? 'off' : 'on'); } catch { /* stockage indisponible */ }
    syncVideo(); syncReels();
  };
  motionBtns.forEach(b => b.addEventListener('click', () => setPaused(!paused)));
  new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; syncVideo(); }).observe($('#top'));
  document.addEventListener('visibilitychange', () => { syncVideo(); syncReels(); });
  setPaused(paused);

  const WORDS = ['soirées', 'festivals', 'séminaires', 'matchs', 'lancements'];
  // Le mot change en coupes nettes, lettre par lettre, comme les lettres du logo dans l'intro
  const rot = $('#rot'), rotW = $('.rot-w', rot);
  const setWord = w => { const t = [...`${w}.`]; rotW.innerHTML = t.map((c, i) => `<span class="rot-l" style="--i:${i}">${c}</span>`).join(''); rot.style.setProperty('--n', t.length); };
  let wi = 0;
  setWord(WORDS[0]);
  if (!reduced) setInterval(() => {
    if (document.hidden || paused || !heroOn || !html.classList.contains('ready')) return;
    rot.classList.remove('in'); rot.classList.add('out');
    setTimeout(() => {
      wi = (wi + 1) % WORDS.length;
      setWord(WORDS[wi]);
      rot.classList.replace('out', 'in');
    }, (WORDS[wi].length + 1) * 30 + 120);
  }, 3400);

  /* ---------- Apparitions ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* ---------- Lecteur ---------- */
  const lb = $('#lb'), lbMedia = $('#lb-media'), lbLink = $('#lb-link');
  const items = $$('.film:not(.ext)'); // les reels « ext » s'ouvrent sur Instagram
  let lbI = 0, lastFocus = null;
  const renderLb = () => {
    const el = items[lbI], d = el.dataset, img = $('img', el) || { src: $('video', el)?.poster, alt: '' };
    lbMedia.classList.toggle('wide', el.hasAttribute('data-wide') || !!d.youtube);
    $('#lb-title').textContent = d.title;
    $('#lb-meta').textContent = d.meta;
    $('#lb-count').textContent = `${pad(lbI + 1)} / ${pad(items.length)}`;
    $('#lb-note').textContent = '';
    if (d.youtube) {
      lbMedia.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${d.youtube}?autoplay=1&rel=0&playsinline=1" title="${d.title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      lbLink.href = `https://youtu.be/${d.youtube}`; lbLink.textContent = 'Voir sur YouTube';
      return;
    }
    lbLink.href = d.reel || 'https://www.instagram.com/arthur_msct/'; lbLink.textContent = 'Voir sur Instagram';
    if (d.video) lbMedia.innerHTML = `<video src="${d.video}" poster="${d.poster || img.src}" controls playsinline autoplay preload="auto"></video>`;
    else if (d.reel) lbMedia.innerHTML = `<iframe src="${d.reel.replace(/\/?$/, '/')}embed" title="${d.title}" allowfullscreen></iframe>`;
    else { lbMedia.innerHTML = `<img src="${img.src}" alt="${img.alt}">`; $('#lb-note').textContent = 'La vidéo complète est sur notre Instagram.'; }
  };
  const openLb = i => {
    if (i < 0) return;
    lbI = i; lastFocus = document.activeElement;
    renderLb();
    lb.hidden = false; html.classList.add('lb-open'); syncReels();
    $('.lb-close', lb).focus();
  };
  const closeLb = () => { lb.hidden = true; html.classList.remove('lb-open'); lbMedia.innerHTML = ''; lastFocus?.focus(); syncReels(); };
  const stepLb = d => { lbI = (lbI + d + items.length) % items.length; renderLb(); };
  items.forEach((el, i) => el.addEventListener('click', e => { e.preventDefault(); openLb(i); }));
  $$('[data-open-film]').forEach(b => b.addEventListener('click', () => openLb(items.indexOf($(b.dataset.openFilm)))));
  $$('[data-lb-close]', lb).forEach(b => b.addEventListener('click', closeLb));
  $('.lb-prev', lb).addEventListener('click', () => stepLb(-1));
  $('.lb-next', lb).addEventListener('click', () => stepLb(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

  /* ---------- Formats courts : le mur d'extraits muets, lus seulement quand ils sont à l'écran ---------- */
  const reelVids = $$('#wall video'), seen = new Set();
  syncReels = () => {
    const ok = !reduced && !paused && !document.hidden && !navigator.connection?.saveData && lb.hidden && dv.hidden;
    reelVids.forEach(v => {
      if (ok && seen.has(v)) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); }
      else v.pause();
    });
  };
  const reelIo = new IntersectionObserver(es => { es.forEach(e => { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); syncReels(); }, { threshold: .2 });
  reelVids.forEach(v => reelIo.observe(v));

  /* ---------- Ce qu'on filme : on passe au numéro suivant en scrollant, sans figer la page (rien n'est cliquable) ---------- */
  const idxScroll = $('#idx-scroll'), idxImg = $('#idx-img'), idxCount = $('#idx-count'), rows = $$('.idx-row');
  rows.forEach(r => { const i = new Image(); i.src = r.dataset.img; });
  rows[0].classList.add('on');
  const setRow = r => {
    if (r.classList.contains('on')) return;
    rows.forEach(x => x.classList.toggle('on', x === r));
    idxCount.textContent = `${pad(rows.indexOf(r) + 1)} / ${pad(rows.length)}`;
    idxImg.classList.add('swap');
    idxImg.src = r.dataset.img;
    requestAnimationFrame(() => requestAnimationFrame(() => idxImg.classList.remove('swap')));
  };
  const onIdx = () => {
    if (reduced) return;
    // La ligne active est la dernière à avoir passé le repère (60 % de la hauteur de l'écran)
    const y = innerHeight * .6;
    let i = 0;
    rows.forEach((r, k) => { if (r.getBoundingClientRect().top <= y) i = k; });
    setRow(rows[i]);
    rows.forEach((x, k) => x.classList.toggle('done', k < i));
  };

  /* ---------- Le studio : les infos arrivent en séquence quand la scène entre à l'écran (sans figer la page) ---------- */
  const duoScene = $('#duo-scene');
  const DUO = [0, 250, 550, 850, 1500];
  if (reduced) DUO.forEach((_, k) => duoScene.classList.add(`d${k}`));
  else new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    DUO.forEach((t, k) => setTimeout(() => duoScene.classList.add(`d${k}`), t));
  }, { threshold: .3 }).observe(duoScene);

  /* ---------- Méthode : la tête de lecture suit le scroll ---------- */
  const method = $('#methode'), nleBody = $('#nle-body'), playhead = $('#playhead'), nleTc = $('#nle-tc');
  const clips = $$('.clip.step'), steps = $$('.mstep');
  const ZONES = [0, .23, .52, .79, 1];
  (() => {
    let s = 7, d = '';
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 160; i++) { const h = 10 + Math.pow(rnd(), 1.4) * 80 * (.55 + .45 * Math.sin(i / 9)); d += `M${i * 5} ${50 - h / 2}h3v${h}h-3Z`; }
    const w = $('#wave'); w.setAttribute('viewBox', '0 0 800 100'); w.innerHTML = `<path d="${d}"/>`;
  })();
  const onMethod = () => {
    const r = method.getBoundingClientRect();
    const p = reduced ? 1 : clamp(-r.top / (method.offsetHeight - innerHeight || 1));
    const e = clamp((p - .04) / .9);
    playhead.style.transform = `translateX(${e * (nleBody.clientWidth - 76)}px)`;
    nleTc.textContent = tc(Math.round(e * 60 * 25));
    const i = e >= 1 ? 3 : Math.max(0, ZONES.findIndex((z, k) => e >= z && e < ZONES[k + 1]));
    const local = clamp((e - ZONES[i]) / (ZONES[i + 1] - ZONES[i]));
    steps.forEach((c, k) => {
      c.classList.toggle('active', !reduced && k === i);
      c.classList.toggle('done', k < i);
      c.style.setProperty('--cp', k < i ? 1 : k === i ? local.toFixed(3) : 0);
    });
    clips.forEach((c, k) => { c.classList.toggle('active', k === i); c.classList.toggle('done', k < i); });
  };

  /* ---------- Bouton mobile collant ---------- */
  const mCta = $('#m-cta');
  let pastHero = false, atCta = false;
  const syncCta = () => mCta.classList.toggle('show', pastHero && !atCta);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; syncCta(); }).observe($('.hero .actions'));
  new IntersectionObserver(([e]) => { atCta = e.isIntersecting; syncCta(); }).observe($('#demande'));

  /* ---------- Boucle de scroll ---------- */
  let ticking = false;
  const frame = () => { ticking = false; hd.classList.toggle('scrolled', scrollY > 30); onIdx(); onMethod(); };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(frame));
  frame();

  /* =========================================================
     QUESTIONNAIRE « FAIRE MA DEMANDE »
     ========================================================= */
  const dv = $('#dv'), form = $('#dv-form'), dvNav = $('#dv-nav');
  const dvSteps = $$('.dv-step', dv), back = $('#dv-back'), next = $('#dv-next');
  const fallback = $('#dv-fallback');
  const LAST = 6;
  let cur = 1, dvFocus = null;
  const stepEl = n => dvSteps.find(s => +s.dataset.step === n);

  const showStep = n => {
    cur = n;
    dvSteps.forEach(s => { s.hidden = +s.dataset.step !== n; });
    const done = n > LAST;
    dvNav.hidden = done; dvNav.style.display = done ? 'none' : '';
    $('#dv-step-label').textContent = done ? 'Terminé' : `Étape ${n} sur ${LAST}`;
    $('#dv-bar').style.transform = `scaleX(${Math.min(1, n / LAST)})`;
    back.disabled = n === 1;
    next.textContent = n === LAST ? 'Envoyer ma demande' : 'Continuer';
    form.scrollTop = 0;
    const h = $('h2', stepEl(n));
    h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
  };
  const openDv = () => {
    closeLbSilently();
    dvFocus = document.activeElement;
    setMenu(false);
    dv.hidden = false; html.classList.add('dv-open'); syncReels();
    showStep(cur > LAST ? 1 : cur);
  };
  const closeDv = () => { dv.hidden = true; html.classList.remove('dv-open'); dvFocus?.focus?.(); syncReels(); };
  const closeLbSilently = () => { if (!lb.hidden) { lb.hidden = true; html.classList.remove('lb-open'); lbMedia.innerHTML = ''; } };
  $$('[data-open-devis]').forEach(b => b.addEventListener('click', () => openDv()));
  $('#dv-close').addEventListener('click', closeDv);
  const resetDv = () => {
    form.reset();
    $$('input[type="hidden"]', form).forEach(i => { i.value = i.dataset.default; $(`#o-${i.name}`).textContent = i.dataset.default; });
    fallback.hidden = true; cur = 1;
    updatePrice();
  };
  $('#dv-finish').addEventListener('click', () => { resetDv(); closeDv(); });

  let updatePrice = () => {}; // remplacé plus bas, en mode test uniquement

  // Compteurs (+ / −)
  const LIMITS = { jours: [1, 10], verticaux: [0, 30] };
  const bump = (name, d) => {
    const input = form.elements[name];
    const v = clamp(+input.value + d, ...LIMITS[name]);
    input.value = v; $(`#o-${name}`).textContent = v;
    updatePrice();
  };
  $$('[data-inc]', form).forEach(b => b.addEventListener('click', () => bump(b.dataset.inc, 1)));
  $$('[data-dec]', form).forEach(b => b.addEventListener('click', () => bump(b.dataset.dec, -1)));

  // Validation par étape
  const setErr = (step, msg) => { const el = $('.dv-err', stepEl(step)); if (el) el.textContent = msg || ''; };
  const validate = n => {
    setErr(n, '');
    const el = form.elements;
    if (n === 1) {
      if (!el.type.value) { setErr(1, 'Choisissez le type d’événement pour continuer.'); return false; }
      el.ville.setAttribute('aria-invalid', !el.ville.value.trim());
      if (!el.ville.value.trim()) { setErr(1, 'Indiquez la ville de l’événement.'); el.ville.focus(); return false; }
    }
    if (n === 2 && !el.presence.value) { setErr(2, 'Indiquez combien de temps on doit être présents chaque jour.'); return false; }
    if (n === 4 && !el.film.value) { setErr(4, 'Choisissez le film principal, ou « Je ne sais pas ».'); return false; }
    if (n === LAST) {
      const nom = el.nom, email = el.email;
      nom.setAttribute('aria-invalid', !nom.value.trim());
      email.setAttribute('aria-invalid', !email.checkValidity() || !email.value.trim());
      if (!nom.value.trim()) { setErr(LAST, 'Indiquez votre nom.'); nom.focus(); return false; }
      if (!email.value.trim() || !email.checkValidity()) { setErr(LAST, 'Indiquez un e-mail valide pour recevoir votre devis (ex. vous@exemple.fr).'); email.focus(); return false; }
    }
    return true;
  };

  // Lecture des réponses
  const PRESENCE = { demi: [.5, 'une demi-journée (jusqu’à 4 h)'], jour: [1, 'une journée (jusqu’à 8 h)'], long: [1.5, 'journée et soirée (plus de 8 h)'] };
  const FILMS = { teaser: 'Teaser de moins d’1 min', court: 'Aftermovie de 1 à 2 min', complet: 'Film complet de 3 à 5 min', long: 'Film long de 5 à 8 min', conseil: 'Durée à conseiller' };
  const checkedLabels = prefix => $$(`input[type="checkbox"][name^="${prefix}"]:checked`, form).map(i => i.nextElementSibling.textContent.trim());
  const readForm = () => {
    const f = Object.fromEntries(new FormData(form).entries());
    for (const i of $$('input[type="checkbox"]', form)) f[i.name] = i.checked;
    f.jours = +f.jours || 1; f.verticaux = +f.verticaux || 0;
    f.unites = f.jours * (PRESENCE[f.presence]?.[0] ?? 1);
    f.integral = checkedLabels('int_'); f.diffusion = checkedLabels('dif_');
    f.dateFr = f.date ? new Date(f.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'non précisée';
    f.dans = f.date ? Math.ceil((new Date(f.date) - Date.now()) / 864e5) : null;
    return f;
  };

  // Calcul du devis (interne : jamais affiché sur le site).
  // On chiffre la demande sur chacun des trois forfaits de la grille, puis on retient le moins cher.
  const chiffrer = (f, cle) => {
    const fo = TARIFS.forfaits[cle], O = TARIFS.options;
    if (f.film === 'long' && !fo.filmLong) return null; // Essentiel : film de 90 à 300 s
    const lignes = [[`Forfait ${fo.nom}`, fo.prix, fo.detail]];
    let des = !!fo.des;
    const plus = (k, n = 1) => { const o = O[k]; lignes.push([o.nom + (o.des ? ' (dès)' : ''), o.prix * n, o.note]); if (o.des) des = true; };
    const extra = Math.max(0, f.unites - fo.jours);
    if (Math.floor(extra)) lignes.push([`Journée de tournage supplémentaire × ${Math.floor(extra)}`, TARIFS.jour * Math.floor(extra)]);
    if (extra % 1) lignes.push(['Demi-journée de tournage supplémentaire × 1', TARIFS.demi]);
    if (f.drone === 'oui') plus('drone');
    if (f.integral.length || f.interviews === 'posees') plus('multicam');
    if (f.soustitres !== 'aucun' && !fo.inclus.includes('soustitres')) plus('soustitres');
    if (f.soustitres === 'fr-en') plus('anglais');
    if (f.habillage === 'anime' && !fo.inclus.includes('motion')) plus('motion');
    if (f.voixoff && !fo.inclus.includes('voixoff')) plus('voixoff');
    if (f.rushs) plus('rushs');
    const vert = Math.max(0, f.verticaux - fo.verticaux);
    if (vert) lignes.push([`Format vertical supplémentaire (9:16) × ${vert}`, TARIFS.vertical * vert, fo.verticaux ? `${fo.verticaux} déjà compris dans le forfait` : '']);
    return { cle, nom: fo.nom, lignes, des, total: lignes.reduce((s, l) => s + l[1], 0) };
  };
  const buildQuote = f => {
    const tous = Object.keys(TARIFS.forfaits).map(k => chiffrer(f, k)).filter(Boolean);
    const q = tous.reduce((m, x) => (x.total < m.total ? x : m));
    const v = [];
    const ville = (f.ville || '').toLowerCase();
    if (!ville) v.push('Ville non précisée → déplacement à vérifier');
    else if (!/arras|lille|paris/.test(ville)) v.push(`Déplacement (${f.ville}) : non compris. Grille : 0,60 €/km au-delà de 50 km d’Arras`);
    else if (/paris/.test(ville)) v.push('Paris : déplacement non compté. Grille : 0,60 €/km au-delà de 50 km d’Arras, à décider');
    if (f.dans !== null && f.dans < 0) v.push('La date indiquée est déjà passée → à confirmer');
    else if (f.dans !== null && f.dans <= 14) v.push(`Événement dans ${f.dans} jour(s) → répondre en priorité`);
    if (!f.date) v.push('Date non précisée');
    if (f.unites < 1) v.push('Une demi-journée seulement : chiffré sur le forfait Essentiel (1 journée), geste possible');
    if (f.presence === 'long') v.push(`Journée et soirée : comptée 1 journée + 1 demi-journée par jour (soit ${String(f.unites).replace('.', ',')} journées)`);
    if (f.lieux !== '1 lieu') v.push(`${f.lieux} de tournage → vérifier les temps de trajet entre les lieux`);
    if (f.integral.length) v.push(`Captation en entier demandée (${f.integral.join(', ')}) : caméra fixe comptée ; le montage d’un film intégral est hors grille → à chiffrer`);
    if (f.interviews === 'posees') v.push('Interviews posées : deuxième caméra comptée, prévoir micro et lumière');
    if (f.drone === 'avoir') v.push(`Drone à confirmer selon le lieu : + ${eur(TARIFS.options.drone.prix)} s’il est retenu (non compté)`);
    if (f.drone === 'oui') v.push('Drone : vérifier la zone de vol et la météo');
    if (f.film === 'conseil') v.push('Durée du film principal à conseiller');
    if (f.film === 'teaser') v.push('Teaser de moins d’1 min : plus court que le film du forfait (90 s minimum), à ajuster');
    if (f.soustitres !== 'aucun' && f.verticaux) v.push(`Sous-titres comptés pour le film principal seulement ; la grille est « par film livré » (${f.verticaux} vidéo(s) verticale(s) en plus)`);
    if (f.dif_pub) v.push('Diffusion en publicité payante ou télévision : non comprise, droits d’usage à définir au devis');
    if (f.delai === '72 h' || f.delai === 'le lendemain') v.push(`Livraison ${f.delai === '72 h' ? 'sous 72 h' : 'dès le lendemain'} : hors grille (10 jours ouvrés à 3 semaines) → faisabilité et majoration à décider`);
    if (f.delai === '10 jours' && q.cle !== 'essentiel') v.push(`Livraison sous 10 jours demandée, le forfait ${q.nom} annonce un délai plus long`);
    if (f.musique === 'titre') v.push('Musique précise demandée : licence commerciale non comprise');
    if (f.suivi) v.push('Plan de publication demandé : hors grille → à chiffrer');
    if (q.cle === 'surmesure') v.push('Sur-mesure : 2 900 € est un point de départ, à affiner selon le périmètre');
    return { ...q, tous, aVerifier: v, comparatif: tous.map(x => `${x.nom} ${eur(x.total)}${x.cle === q.cle ? ' (retenu)' : ''}`).join(' · ') };
  };

  /* ---------- Mode test, pour Arthur & Adrien : le prix se calcule en direct à côté du formulaire ----------
     Activé seulement par ?devis=test dans l'adresse (?devis=off pour le couper). Jamais affiché aux visiteurs. */
  let modeTest = false;
  try {
    const t = new URLSearchParams(location.search).get('devis');
    if (t) sessionStorage.setItem('kelik-devis', t);
    modeTest = (t || sessionStorage.getItem('kelik-devis')) === 'test';
  } catch { /* stockage indisponible */ }
  if (modeTest) {
    const panel = document.createElement('aside');
    panel.className = 'dvp'; panel.setAttribute('aria-label', 'Devis en direct (mode test)');
    panel.innerHTML = `<button class="dvp-head" type="button" aria-expanded="false"><span class="dvp-tag">Mode test · invisible pour vos clients</span><span class="dvp-total"><small id="dvp-des"></small><b id="dvp-num">0</b><i>€ HT</i><em class="dvp-delta" id="dvp-delta"></em></span></button>
      <div class="dvp-body"><p class="dvp-plan">Forfait retenu <b id="dvp-plan"></b></p><ul class="dvp-lines" id="dvp-lines"></ul><p class="dvp-acompte">Acompte 50 % <b id="dvp-acompte"></b></p>
      <p class="dvp-h">Comparatif des forfaits</p><ul class="dvp-cmp" id="dvp-cmp"></ul><p class="dvp-h">À vérifier</p><ul class="dvp-check" id="dvp-check"></ul></div>`;
    dvNav.before(panel); dv.classList.add('test');
    const head = $('.dvp-head', panel), num = $('#dvp-num'), delta = $('#dvp-delta'), plan = $('#dvp-plan');
    head.addEventListener('click', () => head.setAttribute('aria-expanded', panel.classList.toggle('open')));
    const esc = s => String(s).replace(/</g, '&lt;');
    const flash = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
    let shown = 0, target = null, raf = 0, avant = new Map(), planAvant = '', signature = '';
    const compte = to => {
      cancelAnimationFrame(raf);
      const from = shown, t0 = performance.now();
      const tick = t => {
        const k = reduced ? 1 : Math.min(1, (t - t0) / 500);
        shown = Math.round(from + (to - from) * ease(k));
        num.textContent = shown.toLocaleString('fr-FR');
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    updatePrice = () => {
      const q = buildQuote(readForm());
      const sig = JSON.stringify([q.lignes, q.aVerifier, q.cle]);
      if (sig === signature) return; // rien n'a bougé : on ne rejoue pas les animations
      signature = sig;
      $('#dvp-des').textContent = q.des ? 'à partir de' : '';
      if (target !== null && q.total !== target) {
        const d = q.total - target;
        delta.textContent = `${d > 0 ? '+' : '−'} ${eur(Math.abs(d))}`;
        delta.dataset.sens = d > 0 ? 'plus' : 'moins';
        flash(delta, 'go');
      }
      if (q.total !== target) compte(q.total);
      target = q.total;
      plan.textContent = q.nom;
      if (planAvant && planAvant !== q.nom) flash(plan, 'chg');
      planAvant = q.nom;
      const cle = l => l.replace(/ × \d+$/, '');
      $('#dvp-lines').innerHTML = q.lignes.map(([l, p, n]) => {
        const k = cle(l), etat = !avant.size ? '' : !avant.has(k) ? 'new' : avant.get(k) !== p ? 'chg' : '';
        return `<li class="${etat}"><span>${esc(l)}${n ? `<small>${esc(n)}</small>` : ''}</span><b>${eur(p)}</b></li>`;
      }).join('');
      avant = new Map(q.lignes.map(([l, p]) => [cle(l), p]));
      $('#dvp-acompte').textContent = eur(Math.round(q.total / 2));
      $('#dvp-cmp').innerHTML = Object.entries(TARIFS.forfaits).map(([k, fo]) => {
        const x = q.tous.find(t => t.cle === k);
        return `<li class="${k === q.cle ? 'on' : ''}"><span>${fo.nom}</span><b>${x ? eur(x.total) : 'non adapté'}</b></li>`;
      }).join('');
      $('#dvp-check').innerHTML = q.aVerifier.length ? q.aVerifier.map(a => `<li>${esc(a)}</li>`).join('') : '<li>Rien à signaler</li>';
    };
    form.addEventListener('input', updatePrice);
    updatePrice();
    try { if (new URLSearchParams(location.search).get('devis') === 'test') addEventListener('load', () => setTimeout(() => openDv(), 400)); } catch { /* rien */ }
  }

  // Envoi : un essai, puis un second si le réseau a flanché
  const post = async payload => {
    const res = await fetch(DEVIS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || String(out.success) === 'false') throw Object.assign(new Error(out.message || `HTTP ${res.status}`), { definitif: res.ok });
  };

  const send = async () => {
    const f = readForm();
    const q = buildQuote(f);
    const montant = `${q.des ? 'à partir de ' : ''}${eur(q.total)} HT`;
    const horaires = f.debut || f.fin ? ` · de ${f.debut || '?'} à ${f.fin || '?'}` : '';
    const tournage = `${f.jours} jour(s) · ${PRESENCE[f.presence][1]}${horaires} · ${f.lieux}`;
    const capter = [f.integral.length ? `À filmer en entier : ${f.integral.join(', ')}` : 'Meilleurs moments uniquement', { non: 'Pas d’interview', chaud: 'Réactions à chaud', posees: 'Interviews posées' }[f.interviews], { non: 'Pas de drone', oui: 'Drone : oui', avoir: 'Drone : à voir selon le lieu' }[f.drone]].join(' · ');
    const films = `${FILMS[f.film]}${f.verticaux ? ` + ${f.verticaux} vidéo(s) verticale(s)` : ''}`;
    const finitions = [{ aucun: 'Sans sous-titres', fr: 'Sous-titres français', 'fr-en': 'Sous-titres français et anglais' }[f.soustitres], f.habillage === 'anime' ? 'Habillage animé aux couleurs du client' : 'Habillage simple', f.musique === 'titre' ? 'Musique : un titre précis' : 'Musique choisie par Kelik', f.voixoff && 'Voix off', f.rushs && 'Images brutes', f.suivi && 'Plan de publication'].filter(Boolean).join(' · ');

    // Une ligne du tableau par information : l'e-mail reste lisible quel que soit le webmail
    const payload = { _subject: `Devis estimé ${montant} — ${f.type} — ${f.nom}`, _template: 'table', _captcha: 'false' };
    payload['DEVIS ESTIMÉ'] = `${montant} — forfait ${q.nom}`;
    payload['Acompte à prévoir (50 %)'] = eur(Math.round(q.total / 2));
    q.lignes.forEach(([l, p, n], i) => { payload[`Calcul ${i + 1} · ${l}`] = `${eur(p)}${n ? ` — ${n}` : ''}`; });
    payload['Comparatif des forfaits'] = q.comparatif;
    q.aVerifier.forEach((a, i) => { payload[`À vérifier ${i + 1}`] = a; });
    Object.assign(payload, {
      Client: `${f.nom}${f.structure ? ` — ${f.structure}` : ''}`,
      email: f.email,
      Téléphone: f.tel || 'non renseigné',
      'À recontacter': f.recontact,
      Événement: `${f.type}${f.evenement ? ` — ${f.evenement}` : ''}`,
      Date: f.dateFr,
      Lieu: `${f.ville}${f.lieu ? ` — ${f.lieu}` : ''}${f.cadre ? ` · ${f.cadre}` : ''}`,
      Public: f.public ? `${f.public} personnes` : 'non précisé',
      Tournage: tournage,
      'À capter': capter,
      Films: films,
      Diffusion: f.diffusion.length ? f.diffusion.join(', ') : 'non précisée',
      'Livraison souhaitée': f.delai ? (f.delai.startsWith('le') ? f.delai : `sous ${f.delai}`) : 'non précisée',
      Finitions: finitions,
      'Budget annoncé': f.budget || 'non précisé',
      'Connu par': f.source || 'non précisé',
      'Message du client': f.message || '—'
    });

    const recap = [['Événement', `${f.type} · ${f.ville}${f.date ? ` · ${new Date(f.date).toLocaleDateString('fr-FR')}` : ''}`], ['Tournage', tournage], ['Films', films], ['Finitions', finitions]];
    const done = () => {
      $('#dv-recap').innerHTML = recap.map(([a, b]) => `<li><span>${a}</span>${b.replace(/</g, '&lt;')}</li>`).join('');
      showStep(LAST + 1);
    };
    if (f._honey) return done(); // robot : on ne transmet rien

    fallback.hidden = true;
    next.setAttribute('aria-busy', 'true'); next.disabled = true; next.textContent = 'Envoi…';
    try {
      try { await post(payload); }
      catch (e) { if (e.definitif) throw e; await new Promise(r => setTimeout(r, 1500)); await post(payload); }
      done();
    } catch (e) {
      console.warn('[Kelik] Envoi de la demande impossible :', e.message);
      // Secours : e-mail déjà rédigé, sans aucun montant (il passerait sous les yeux du client)
      const body = ['Bonjour Kelik,', '', ...recap.map(([a, b]) => `${a} : ${b}`), `À capter : ${capter}`, `Diffusion : ${payload.Diffusion}`, `Livraison souhaitée : ${payload['Livraison souhaitée']}`, '', f.message || '', '', `— ${f.nom}${f.structure ? `, ${f.structure}` : ''}${f.tel ? ` · ${f.tel}` : ''}`].join('\n');
      const mailto = `mailto:${DEVIS_EMAIL}?subject=${encodeURIComponent(`Demande de devis — ${f.type}`)}&body=${encodeURIComponent(body)}`;
      fallback.innerHTML = `<p>Vos réponses sont prêtes. Il reste à les envoyer depuis votre messagerie : tout est déjà rédigé.</p><a class="btn" href="${mailto}">Envoyer par e-mail</a>`;
      fallback.hidden = false; fallback.scrollIntoView({ block: 'nearest' });
    } finally {
      next.removeAttribute('aria-busy'); next.disabled = false;
      if (cur === LAST) next.textContent = 'Envoyer ma demande';
    }
  };

  next.addEventListener('click', () => {
    if (!validate(cur)) return;
    if (cur < LAST) showStep(cur + 1); else send();
  });
  back.addEventListener('click', () => { if (cur > 1) showStep(cur - 1); });
  form.addEventListener('submit', e => { e.preventDefault(); next.click(); });
  form.addEventListener('change', () => setErr(cur, ''));
  form.addEventListener('input', e => {
    if (e.target.getAttribute?.('aria-invalid') === 'true' && e.target.value.trim() && e.target.checkValidity()) { e.target.setAttribute('aria-invalid', 'false'); setErr(cur, ''); }
  });

  /* ---------- Nous contacter : message + e-mail, envoyés à arthur@kelik.fr ---------- */
  const contact = $('#contact');
  if (contact) {
    const cMsg = $('#contact-msg'), cBtn = $('#contact-envoyer'), cTexte = $('#contact-message'), cMail = $('#contact-email');
    const dire = (txt, cls = '') => { cMsg.className = 'contact-msg ' + cls; cMsg.innerHTML = txt; };
    [cTexte, cMail].forEach(el => el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true' && el.value.trim() && el.checkValidity()) el.setAttribute('aria-invalid', 'false'); }));
    contact.addEventListener('submit', async e => {
      e.preventDefault();
      const texte = cTexte.value.trim(), mail = cMail.value.trim();
      cTexte.setAttribute('aria-invalid', !texte); cMail.setAttribute('aria-invalid', !mail || !cMail.checkValidity());
      if (!texte) { dire('Écrivez quelques mots sur votre projet.', 'err'); cTexte.focus(); return; }
      if (!mail || !cMail.checkValidity()) { dire('Indiquez un e-mail valide pour qu’on puisse vous répondre.', 'err'); cMail.focus(); return; }
      if (contact.elements._honey.value) { contact.reset(); dire('Merci, votre message est bien parti. On vous répond sous 24 h.', 'ok'); return; }
      cBtn.setAttribute('aria-busy', 'true'); cBtn.textContent = 'Envoi…'; dire('');
      try {
        const res = await fetch(DEVIS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ _subject: `Message depuis le site — ${mail}`, _template: 'table', _captcha: 'false', email: mail, Message: texte }) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) === 'false') throw new Error(out.message || res.status);
        contact.reset(); dire('Merci, votre message est bien parti. On vous répond sous 24 h.', 'ok');
      } catch (err) {
        console.warn('[Kelik] Envoi du message impossible :', err.message);
        const mailto = `mailto:${DEVIS_EMAIL}?subject=${encodeURIComponent('Message depuis le site')}&body=${encodeURIComponent(texte + '\n\n— ' + mail)}`;
        dire(`Le message n’a pas pu partir d’ici. <a href="${mailto}">Envoyez-le par e-mail</a>, il est déjà rédigé.`);
      } finally { cBtn.removeAttribute('aria-busy'); cBtn.textContent = 'Envoyer'; }
    });
  }

  /* ---------- Clavier : Échap, flèches, piège de focus ---------- */
  addEventListener('keydown', e => {
    const modal = !dv.hidden ? dv : !lb.hidden ? lb : null;
    if (e.key === 'Escape') { if (hd.classList.contains('open')) setMenu(false); else if (modal === dv) closeDv(); else if (modal === lb) closeLb(); return; }
    if (!modal) return;
    if (modal === lb && e.key === 'ArrowRight') stepLb(1);
    if (modal === lb && e.key === 'ArrowLeft') stepLb(-1);
    if (modal === dv && e.key === 'Enter' && e.target.matches('input:not([type="checkbox"]):not([type="radio"])')) { e.preventDefault(); next.click(); }
    if (e.key === 'Tab') {
      const f = $$('button, a[href], input:not([type="hidden"]):not(.dv-honey), textarea, video, iframe, [tabindex="-1"]', modal).filter(x => x.offsetParent && !x.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });
})();
