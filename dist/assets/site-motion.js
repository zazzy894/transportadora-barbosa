(() => {
  // Upgrade every local raster image to its 4K delivery variant when available.
  // The source photos remain unchanged; this keeps the layout stable while
  // serving the higher-resolution assets on every route.
  const fourKExceptions = { 'logo-transparent.png': 'logo-transparent-4k.webp' };
  document.querySelectorAll('img[src]').forEach((image) => {
    const source = image.getAttribute('src');
    if (!source || !source.includes('/assets/') || /(?:^|[-.])4k(?:-wide)?\./i.test(source)) return;
    const match = source.match(/^(.*\/assets\/)([^/?#]+\.(?:webp|png))$/i);
    if (!match) return;
    const candidate = fourKExceptions[match[2]] || match[2].replace(/\.webp$/i, '.4k.webp');
    image.setAttribute('src', `${match[1]}${candidate}`);
    image.setAttribute('data-delivery', '4k');
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('[data-reveal]');

  document.querySelectorAll('[data-guide-control]').forEach((control) => {
    const guide = document.getElementById(control.getAttribute('aria-controls'));
    if (!guide) return;

    control.addEventListener('click', () => {
      const direction = control.dataset.guideControl === 'previous' ? -1 : 1;
      guide.scrollBy({
        left: direction * Math.round(guide.clientWidth * .82),
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: .16, rootMargin: '0px 0px -28px' });

  targets.forEach((element) => observer.observe(element));
})();
