(() => {
  const layer = document.querySelector('[data-site-transition]');
  const video = layer?.querySelector('video');
  if (!layer || !video) return;

  const pendingNavigationKey = 'barbosa-page-transition-pending';
  const loopCount = Math.max(1, Number.parseInt(layer.dataset.loopCount || '2', 10));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let transitionInProgress = false;

  const setVisible = (visible) => {
    layer.classList.toggle('is-visible', visible);
    document.body.classList.toggle('site-transition-active', visible);
    layer.setAttribute('aria-hidden', String(!visible));
  };

  const getPendingNavigation = () => {
    try {
      return window.sessionStorage.getItem(pendingNavigationKey) === '1';
    } catch {
      return false;
    }
  };

  const clearPendingNavigation = () => {
    try {
      window.sessionStorage.removeItem(pendingNavigationKey);
    } catch {
      // Storage can be unavailable in strict privacy modes; the transition still works.
    }
  };

  const markPendingNavigation = () => {
    try {
      window.sessionStorage.setItem(pendingNavigationKey, '1');
    } catch {
      // Navigation remains functional even if session storage is unavailable.
    }
  };

  const finishIntro = () => {
    video.pause();
    setVisible(false);
  };

  const playForRequestedLoops = (onComplete) => {
    let completedLoops = 0;
    let finished = false;

    const complete = () => {
      if (finished) return;
      finished = true;
      video.removeEventListener('ended', onEnded);
      onComplete();
    };

    const onEnded = () => {
      completedLoops += 1;
      if (completedLoops >= loopCount) {
        complete();
        return;
      }

      video.currentTime = 0;
      const playback = video.play();
      if (playback && typeof playback.catch === 'function') playback.catch(complete);
    };

    video.addEventListener('ended', onEnded);
    video.currentTime = 0;
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') playback.catch(complete);
  };

  const startIntro = () => {
    if (getPendingNavigation() || reducedMotion) {
      clearPendingNavigation();
      finishIntro();
      return;
    }

    setVisible(true);
    playForRequestedLoops(finishIntro);
  };

  const isModifiedClick = (event) => event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

  document.addEventListener('click', (event) => {
    if (isModifiedClick(event) || transitionInProgress) return;

    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    const destination = new URL(link.href, window.location.href);
    const sameDocument = destination.origin === window.location.origin
      && destination.pathname === window.location.pathname
      && destination.search === window.location.search;

    if (destination.origin !== window.location.origin || sameDocument) return;

    event.preventDefault();
    transitionInProgress = true;
    markPendingNavigation();
    setVisible(true);
    playForRequestedLoops(() => window.location.assign(destination.href));
  });

  startIntro();
})();
