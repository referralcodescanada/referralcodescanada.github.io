// Animation of the 3D coin (Coin.astro). Transform-only animations, so they run on the GPU.
//   - drops in spinning when the page opens (once the logo image is decoded)
//   - floats (CSS), and makes a slow full turn every 9 s while it is on screen
//   - leans toward the mouse; its highlight follows
//   - click / tap: quick hop + 2½ turns, landing on its other side, where it stays until the next click
// Nothing moves for visitors who ask for reduced motion.
import { reducedMotion } from '../../../lib/effects/coin-burst.ts';

const started = new WeakSet<HTMLElement>();
const OUT = 'cubic-bezier(.5,1,.89,1)'; // rising: decelerates (ease-out quad, like gravity)
const IN = 'cubic-bezier(.11,0,.5,0)'; // falling: accelerates (ease-in quad)
const turn = (deg: number) => `rotateX(0deg) rotateY(${deg}deg)`;

export function initCoin(coin: HTMLElement) {
  if (started.has(coin) || reducedMotion()) return;
  started.add(coin);
  const q = <T extends Element = HTMLElement>(s: string) => coin.querySelector(s) as T;
  const toss = q('.coin__toss');
  const spin = q('.coin__spin');
  const tilt = q('.coin__tilt');
  const shadow = q('.coin__shadow i');
  const sheen = q('.coin__sheen');
  const band = q('.coin__band');
  const glint = q('.coin__glint');
  const img = q<HTMLImageElement>('.coin__face--front img');
  let busy = true; // an animation is running (clicks are queued)
  let queued = false;
  let visible = true;
  let side = 0; // 0: logo, 1: back
  let last = 0; // time of the last click

  // Light sweeping across the face + a sparkle on the rim.
  let shining: Animation[] = [];
  const shine = () => {
    shining.forEach((a) => a.cancel());
    shining = [
      band.animate([{ transform: 'translateX(-130%)' }, { transform: 'translateX(130%)' }], { duration: 1100, easing: 'ease-in-out' }),
      glint.animate([{ scale: 0, rotate: '0deg' }, { scale: 1, rotate: '90deg', offset: 0.45 }, { scale: 0, rotate: '180deg' }], {
        duration: 900,
        delay: 650,
        easing: 'ease-in-out',
      }),
    ];
  };
  const done = (anim: Animation) => {
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
          { transform: turn(-1440) },
          { transform: turn(-25), offset: 0.62 },
          { transform: turn(12), offset: 0.8 },
          { transform: turn(-4), offset: 0.92 },
          { transform: turn(0) },
        ],
        { duration: D, easing: 'cubic-bezier(.3,.55,.35,1)' },
      ),
    );
  };

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
    const y = (px: number, s = 1) => `translateY(${-px}px) scale(${s})`;
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
    done(spin.animate([{ transform: turn(from), easing: 'cubic-bezier(.35,.55,.45,1)' }, { transform: turn(to), offset: land }, { transform: turn(to) }], { duration: D }));
  };
  coin.addEventListener('click', flip);

  // Idle: a slow full turn every 9 s while on screen, from whichever side is showing;
  // it waits after a click so the visitor can read the back.
  setInterval(() => {
    if (busy || !visible || document.hidden || Date.now() - last < 12000) return;
    busy = true;
    const base = side * 180;
    done(spin.animate([{ transform: turn(base) }, { transform: turn(base + 360) }], { duration: 1600, easing: 'cubic-bezier(.65,0,.35,1)' }));
  }, 9000);

  // Mouse: lean toward the pointer, eased in requestAnimationFrame.
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
  const aim = (x: number, yy: number) => {
    tx = Math.max(-1, Math.min(1, x));
    ty = Math.max(-1, Math.min(1, yy));
    if (!raf) raf = requestAnimationFrame(lean);
  };
  const area = coin.closest('section') || coin;
  area.addEventListener('pointermove', (e) => {
    if ((e as PointerEvent).pointerType !== 'mouse') return;
    const r = coin.getBoundingClientRect();
    const { clientX, clientY } = e as PointerEvent;
    aim((clientX - r.left - r.width / 2) / (r.width * 1.5), (clientY - r.top - r.height / 2) / (r.height * 1.5));
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
