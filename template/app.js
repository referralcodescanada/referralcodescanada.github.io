(() => {
  // Optional analytics (GoatCounter, cookie-free): count code copies and referral-link clicks as events.
  const product = document.body.dataset.product || 'home';
  const track = (name) => {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name + '/' + product, title: name + ' ' + product, event: true }); } catch (e) {}
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[rel~="sponsored"]');
    if (a) track('signup-click');
  });

  // ── Coins ──────────────────────────────────────────────────
  // Nothing moves for visitors who ask for reduced motion (CSS animations are switched off in styles.css).
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate;
  const rand = (a, b) => a + Math.random() * (b - a);

  // Small gold coins thrown up from (x, y) — viewport coordinates — then falling with gravity.
  const burst = (x, y, n, power) => {
    if (still) return;
    for (let i = 0; i < n; i++) {
      const c = document.createElement('span');
      c.className = 'coinlet';
      c.setAttribute('aria-hidden', 'true');
      c.textContent = '$';
      c.style.cssText = `left:${x}px;top:${y}px;--s:${rand(16, 26).toFixed(1)}px`;
      document.body.appendChild(c);
      const a = (rand(-155, -25) * Math.PI) / 180;
      const v = rand(0.55, 1) * power;
      const vx = Math.cos(a) * v;
      const vy = Math.sin(a) * v;
      const T = rand(0.85, 1.25);
      const spin = rand(2, 4) * 360 * (Math.random() < 0.5 ? -1 : 1);
      const tilt = rand(-35, 35);
      const frames = [];
      for (let k = 0; k <= 16; k++) {
        const t = (T * k) / 16;
        frames.push({
          transform: `translate(${(vx * t).toFixed(1)}px,${(vy * t + 800 * t * t).toFixed(1)}px) perspective(200px) rotate(${tilt}deg) rotateY(${((spin * k) / 16).toFixed(1)}deg) scale(${Math.min(1, 0.3 + k / 3).toFixed(2)})`,
          opacity: k > 11 ? (16 - k) / 5 : 1,
        });
      }
      c.animate(frames, { duration: T * 1000 }).onfinish = () => c.remove();
    }
  };
  const spinLogos = () => {
    if (still) return;
    document.querySelectorAll('.logo__coin').forEach((c) =>
      c.animate([{ transform: 'rotateY(0)' }, { transform: 'rotateY(2turn)' }], { duration: 1400, easing: 'cubic-bezier(.2,.7,.2,1)' }),
    );
  };

  // Home page coin: drops in spinning, floats, turns toward the mouse, spins now and then; click/tap tosses it.
  const coin = document.querySelector('[data-coin]');
  if (coin && !still) {
    const q = (s) => coin.querySelector(s);
    const toss = q('.coin__toss');
    const spin = q('.coin__spin');
    const tilt = q('.coin__tilt');
    const shadow = q('.coin__shadow i');
    const sheen = q('.coin__sheen');
    const band = q('.coin__band');
    const glint = q('.coin__glint');
    const img = q('.coin__face--front img');
    let busy = true;
    let visible = true;
    let side = 0; // 0: logo side, 1: back. The coin stays on the side the visitor picked.
    let queued = false;
    let last = 0;
    const turn = (deg) => `rotateX(0deg) rotateY(${deg}deg)`;

    // Light sweeping across the face + a sparkle on the rim (transform-only, so it runs on the GPU).
    let shining = [];
    const shine = () => {
      shining.forEach((a) => a.cancel());
      shining = [
        band.animate([{ transform: 'translateX(-130%)' }, { transform: 'translateX(130%)' }], { duration: 1100, easing: 'ease-in-out' }),
        glint.animate(
          [{ scale: 0, rotate: '0deg' }, { scale: 1, rotate: '90deg', offset: 0.45 }, { scale: 0, rotate: '180deg' }],
          { duration: 900, delay: 650, easing: 'ease-in-out' },
        ),
      ];
    };
    const done = (anim) => {
      anim.onfinish = () => {
        busy = false;
        if (queued) {
          queued = false;
          flip();
        } else shine();
      };
    };

    const intro = () => {
      coin.classList.remove('is-pre');
      const D = 1700;
      coin.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
      toss.animate(
        [
          { transform: 'translateY(-75%) scale(.8)', easing: 'cubic-bezier(.55,0,1,.45)' },
          { transform: 'translateY(0) scale(1)', offset: 0.42, easing: 'cubic-bezier(0,.55,.45,1)' },
          { transform: 'translateY(-7%) scale(1)', offset: 0.58, easing: 'cubic-bezier(.55,0,1,.45)' },
          { transform: 'translateY(0) scale(1)', offset: 0.74 },
          { transform: 'translateY(0) scale(1)' },
        ],
        { duration: D },
      );
      shadow.animate(
        [
          { transform: 'scale(.3)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1, offset: 0.42 },
          { transform: 'scale(.9)', opacity: 0.8, offset: 0.58 },
          { transform: 'scale(1)', opacity: 1, offset: 0.74 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        { duration: D },
      );
      done(
        spin.animate(
          [
            { transform: 'rotateX(0deg) rotateY(-1440deg)' },
            { transform: 'rotateX(0deg) rotateY(-25deg)', offset: 0.62 },
            { transform: 'rotateX(0deg) rotateY(12deg)', offset: 0.8 },
            { transform: 'rotateX(0deg) rotateY(-4deg)', offset: 0.92 },
            { transform: 'rotateX(0deg) rotateY(0deg)' },
          ],
          { duration: D, easing: 'cubic-bezier(.3,.55,.35,1)' },
        ),
      );
    };

    // Click / tap: a quick hop while the coin spins 2½ turns, landing on its other side, where it stays
    // until the next click. A click during another animation is kept and played right after it.
    const OUT = 'cubic-bezier(.5,1,.89,1)'; // rising: decelerates (ease-out quad, like gravity)
    const IN = 'cubic-bezier(.11,0,.5,0)'; // falling: accelerates (ease-in quad)
    const flip = () => {
      if (busy) {
        queued = true;
        return;
      }
      busy = true;
      last = Date.now();
      const from = side * 180;
      const to = from + 900;
      side = 1 - side;
      spin.style.transform = turn(side * 180);
      // Jump about a third of the coin's height, without passing under the sticky header.
      const r = coin.getBoundingClientRect();
      const bar = document.querySelector('.topbar');
      const room = r.top - (bar ? bar.getBoundingClientRect().bottom : 0) - 8;
      const h = Math.round(Math.max(r.height * 0.15, Math.min(r.height * 0.34, room)));
      const y = (px, s = 1) => `translateY(${-px}px) scale(${s})`;
      const D = 760;
      const top = 0.34;
      const land = 0.68;
      toss.animate(
        [
          { transform: y(0), easing: OUT },
          { transform: y(h, 1.06), offset: top, easing: IN },
          { transform: y(0), offset: land, easing: OUT },
          { transform: y(h * 0.1), offset: 0.84, easing: IN },
          { transform: y(0) },
        ],
        { duration: D },
      );
      shadow.animate(
        [
          { transform: 'scale(1)', opacity: 1, easing: OUT },
          { transform: 'scale(.62)', opacity: 0.45, offset: top, easing: IN },
          { transform: 'scale(1)', opacity: 1, offset: land, easing: OUT },
          { transform: 'scale(.96)', opacity: 0.92, offset: 0.84, easing: IN },
          { transform: 'scale(1)', opacity: 1 },
        ],
        { duration: D },
      );
      done(
        spin.animate(
          [
            { transform: turn(from), easing: 'cubic-bezier(.35,.55,.45,1)' },
            { transform: turn(to), offset: land },
            { transform: turn(to) },
          ],
          { duration: D },
        ),
      );
    };
    coin.addEventListener('click', flip);

    // Idle: a slow full turn every 9 s while the coin is on screen, from whichever side is showing;
    // it waits a little after a click so the visitor can read the back.
    setInterval(() => {
      if (busy || !visible || document.hidden || Date.now() - last < 12000) return;
      busy = true;
      const base = side * 180;
      done(spin.animate([{ transform: turn(base) }, { transform: turn(base + 360) }], { duration: 1600, easing: 'cubic-bezier(.65,0,.35,1)' }));
    }, 9000);

    // Mouse: the coin leans toward the pointer and its highlight follows (eased in requestAnimationFrame).
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    const lean = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      tilt.style.transform = `rotateX(${(-cy * 22).toFixed(2)}deg) rotateY(${(cx * 26).toFixed(2)}deg)`;
      sheen.style.setProperty('--px', `${(32 + cx * 36).toFixed(1)}%`);
      sheen.style.setProperty('--py', `${(26 + cy * 36).toFixed(1)}%`);
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(lean) : 0;
    };
    const aim = (x, y) => {
      tx = Math.max(-1, Math.min(1, x));
      ty = Math.max(-1, Math.min(1, y));
      if (!raf) raf = requestAnimationFrame(lean);
    };
    const area = coin.closest('section') || coin;
    area.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = coin.getBoundingClientRect();
      aim((e.clientX - r.left - r.width / 2) / (r.width * 1.5), (e.clientY - r.top - r.height / 2) / (r.height * 1.5));
    });
    area.addEventListener('pointerleave', () => aim(0, 0));

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        coin.classList.toggle('is-paused', !visible);
      }).observe(coin);
    }

    // Wait (briefly) for the logo image so the coin doesn't drop in blank.
    coin.classList.add('is-pre');
    Promise.race([img.decode ? img.decode() : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))])
      .catch(() => {})
      .then(() => setTimeout(intro, 150));
  }

  // Copy-to-clipboard buttons: <button data-copy="CODE" data-copied="Copied!" data-toast="...">
  const toast = document.querySelector('.toast');
  let timer;
  const showToast = (msg) => {
    if (!toast || !msg) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('is-on'), 2000);
  };
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) {}
      ta.remove();
      return ok;
    }
  };
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    if (!(await copy(btn.dataset.copy))) return;
    track('copy-code');
    const r = btn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 12, 700);
    spinLogos();
    const label = btn.querySelector('[data-label]');
    btn.classList.add('is-copied');
    if (label) label.textContent = btn.dataset.copied;
    showToast(btn.dataset.toast);
    setTimeout(() => {
      btn.classList.remove('is-copied');
      if (label) label.textContent = label.dataset.label;
    }, 2000);
  });

  // Sticky mobile bar appears once the hero code box has scrolled out of view.
  const bar = document.querySelector('.stickybar');
  const anchor = document.querySelector('[data-hero-code]');
  const final = document.querySelector('.final');
  if (bar && anchor && 'IntersectionObserver' in window) {
    let pastHero = false;
    let atFinal = false;
    const sync = () => bar.classList.toggle('is-on', pastHero && !atFinal);
    new IntersectionObserver(([en]) => {
      pastHero = !en.isIntersecting && en.boundingClientRect.top < 0;
      sync();
    }).observe(anchor);
    if (final) new IntersectionObserver(([en]) => { atFinal = en.isIntersecting; sync(); }).observe(final);
  }
})();
