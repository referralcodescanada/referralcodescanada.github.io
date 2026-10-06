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
