// Optional cookie-free analytics (GoatCounter, see src/config/site.ts): counts an event for the product
// of the page (<body data-product="…">). Does nothing when GoatCounter isn't configured.
declare global {
  interface Window {
    goatcounter?: { count?: (o: { path: string; title: string; event: boolean }) => void };
  }
}

export function track(name: string) {
  const product = document.body.dataset.product || 'home';
  try {
    window.goatcounter?.count?.({ path: `${name}/${product}`, title: `${name} ${product}`, event: true });
  } catch {
    // analytics must never break the page
  }
}
