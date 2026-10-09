(() => {
  // Use 4K delivery on desktop, but keep the original responsive assets on
  // phones. This avoids downloading large files before the first paint.
  const fourKExceptions = { 'logo-transparent.png': 'logo-transparent-4k.webp' };
  const responsiveExceptions = {
    'logo-transparent-4k.webp': 'logo-transparent.png',
    'partner-briqfeno-4k-wide.webp': 'partner-briqfeno-clean.webp',
    'partner-major-4k-wide.webp': 'partner-major-clean.webp',
    'partner-complem-4k-wide.webp': 'partner-complem-clean.webp',
    'partner-caramuru-4k-wide.webp': 'partner-caramuru-clean.webp',
    'partner-comigo-4k-wide.webp': 'partner-comigo-clean.webp',
    'partner-agrofava-4k-wide.webp': 'partner-agrofava-clean.webp',
    'partner-locar-4k.webp': 'partner-locar.png',
    'partner-tegma-4k.webp': 'partner-tegma.png',
    'partner-mills-4k.webp': 'partner-mills.png'
  };
  const fourKQuery = window.matchMedia('(min-width: 769px)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  function responsiveSource(source) {
    const match = source.match(/^(.*\/assets\/)([^/?#]+)$/i);
    if (!match) return source;
    const replacement = responsiveExceptions[match[2]] || match[2].replace(/\.4k(?:-wide)?\.(webp|png)$/i, '.$1');
    return `${match[1]}${replacement}`;
  }

  function applyImageDelivery() {
    const use4K = fourKQuery.matches && !connection?.saveData;
    document.querySelectorAll('img[src]').forEach((image) => {
      const source = image.getAttribute('src');
      if (!source || !source.includes('/assets/')) return;

      const original = image.dataset.originalSrc || source;
      image.dataset.originalSrc = original;
      const match = original.match(/^(.*\/assets\/)([^/?#]+\.(?:webp|png))$/i);
      if (!match) return;

      if (!use4K) {
        const responsive = responsiveSource(original);
        if (image.getAttribute('src') !== responsive) image.setAttribute('src', responsive);
        image.removeAttribute('data-delivery');
        return;
      }

      if (/(?:^|[-.])4k(?:-wide)?\./i.test(original)) return;
      const candidate = fourKExceptions[match[2]] || match[2].replace(/\.webp$/i, '.4k.webp');
      image.setAttribute('src', `${match[1]}${candidate}`);
      image.setAttribute('data-delivery', '4k');
    });
  }

  const heroImage = document.querySelector('.page-hero__image');
  if (heroImage) heroImage.setAttribute('fetchpriority', 'high');

  document.querySelectorAll('img[src]').forEach((image) => {
    image.setAttribute('decoding', 'async');
    if (image.closest('.partner-wordmark, .fleet-shot, .service__media')) image.setAttribute('loading', 'lazy');
  });

  applyImageDelivery();
  if (fourKQuery.addEventListener) fourKQuery.addEventListener('change', applyImageDelivery);
  else fourKQuery.addListener(applyImageDelivery);

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
