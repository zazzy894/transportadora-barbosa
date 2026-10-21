(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-logo-animation]').forEach((video) => {
    const fallback = video.nextElementSibling;
    const showFallback = () => {
      video.pause();
      video.hidden = true;
      if (fallback instanceof HTMLImageElement) fallback.hidden = false;
    };

    video.addEventListener('error', showFallback, { once: true });
    video.addEventListener('ended', () => video.pause(), { once: true });

    if (prefersReducedMotion) {
      showFallback();
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') playback.catch(showFallback);
  });
})();
