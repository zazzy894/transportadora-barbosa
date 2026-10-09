(() => {
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
