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

  // Android-first quick actions: keep the two highest-value contacts within
  // thumb reach without replacing the full desktop footer information.
  const mobileActionsQuery = window.matchMedia('(max-width: 768px)');
  const installMobileActions = () => {
    const existing = document.querySelector('.mobile-action-bar');
    if (!mobileActionsQuery.matches) {
      existing?.remove();
      document.body.classList.remove('has-mobile-action-bar');
      return;
    }
    if (existing) return;

    const isRoot = location.pathname === '/' || location.pathname.endsWith('/index.html');
    const isContact = location.pathname.includes('/contato');
    const quoteHref = isContact ? '#conteudo' : (isRoot ? 'contato/' : '../contato/');
    const bar = document.createElement('nav');
    bar.className = 'mobile-action-bar';
    bar.setAttribute('aria-label', 'Ações rápidas');
    bar.innerHTML = `
      <a class="mobile-action-bar__quote" href="${quoteHref}">
        <span aria-hidden="true">↗</span><strong>Solicitar cotação</strong>
      </a>
      <a class="mobile-action-bar__whatsapp" href="https://wa.me/5564981306666" target="_blank" rel="noopener">
        <span aria-hidden="true">✆</span><strong>WhatsApp</strong>
      </a>`;
    document.body.appendChild(bar);
    document.body.classList.add('has-mobile-action-bar');
  };

  installMobileActions();
  const handleMobileActionChange = () => installMobileActions();
  if (mobileActionsQuery.addEventListener) mobileActionsQuery.addEventListener('change', handleMobileActionChange);
  else mobileActionsQuery.addListener(handleMobileActionChange);

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
