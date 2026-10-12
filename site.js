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

  /* ---------- Contact : les messages partent par e-mail via FormSubmit vers arthur@kelik.fr ---------- */
  const DEVIS_EMAIL = 'arthur@kelik.fr';
  // Identifiant FormSubmit lié à arthur@kelik.fr : l'adresse n'apparaît pas dans le code public (moins de spam)
  const DEVIS_ENDPOINT = 'https://formsubmit.co/ajax/d6546fe14a962d28f95fad04407c39e6';

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
    const setVB = (cx, cy, w) => { const h = w * innerHeight / innerWidth; if (!isFinite(h) || !isFinite(w)) return; svg.setAttribute('viewBox', `${cx - w / 2} ${cy - h / 2} ${w} ${h}`); };
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
    const ok = !reduced && !paused && !document.hidden && !navigator.connection?.saveData && lb.hidden;
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

  /* ---------- Tous les boutons « Nous contacter » mènent au formulaire du bas ---------- */
  document.querySelectorAll('[data-contact]').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    setMenu(false);
    if (!lb.hidden) closeLb();
    $('#demande').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => $('#contact-message')?.focus({ preventScroll: true }), reduced ? 0 : 700);
  }));

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
        const res = await fetch(DEVIS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ _subject: `Message de ${mail} (site Kelik)`, _template: 'basic', _captcha: 'false', _replyto: mail, email: mail, message: texte }) });
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
    const modal = !lb.hidden ? lb : null;
    if (e.key === 'Escape') { if (hd.classList.contains('open')) setMenu(false); else if (modal === lb) closeLb(); return; }
    if (!modal) return;
    if (modal === lb && e.key === 'ArrowRight') stepLb(1);
    if (modal === lb && e.key === 'ArrowLeft') stepLb(-1);
    if (e.key === 'Tab') {
      const f = $$('button, a[href], input:not([type="hidden"]):not(.dv-honey), textarea, video, iframe, [tabindex="-1"]', modal).filter(x => x.offsetParent && !x.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });
})();
