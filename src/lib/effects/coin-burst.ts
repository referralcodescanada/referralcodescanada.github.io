// Small gold coins thrown up from a point, then falling with gravity (copying a code, for example).
// Styles: .coinlet in src/components/ui/CopyButton.astro. Does nothing when the visitor asks for reduced motion.

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** (x, y) in viewport coordinates; n coins; power ≈ launch speed in px/s. */
export function coinBurst(x: number, y: number, n = 12, power = 700) {
  if (reducedMotion()) return;
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
    const frames: Keyframe[] = [];
    for (let k = 0; k <= 16; k++) {
      const t = (T * k) / 16;
      frames.push({
        transform: `translate(${(vx * t).toFixed(1)}px,${(vy * t + 800 * t * t).toFixed(1)}px) perspective(200px) rotate(${tilt}deg) rotateY(${((spin * k) / 16).toFixed(1)}deg) scale(${Math.min(1, 0.3 + k / 3).toFixed(2)})`,
        opacity: k > 11 ? (16 - k) / 5 : 1,
      });
    }
    c.animate(frames, { duration: T * 1000 }).onfinish = () => c.remove();
  }
}
