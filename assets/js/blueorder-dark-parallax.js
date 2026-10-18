const page = document.querySelector('.bo-dark-page');
const atmosphere = page?.querySelector('.bo-dark-page-atmosphere');

if (atmosphere) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 760px)');
  let frame = 0;

  const canAnimate = () => !reducedMotion.matches && !mobile.matches;

  const render = () => {
    frame = 0;
    const offset = canAnimate() ? Math.round(window.scrollY * -0.055) : 0;
    atmosphere.style.setProperty('--bo-parallax-y', `${offset}px`);
  };

  const requestRender = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  const stop = () => {
    window.removeEventListener('scroll', requestRender);
    window.removeEventListener('resize', requestRender);
    reducedMotion.removeEventListener('change', requestRender);
    mobile.removeEventListener('change', requestRender);
    if (frame) window.cancelAnimationFrame(frame);
  };

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  reducedMotion.addEventListener('change', requestRender);
  mobile.addEventListener('change', requestRender);
  window.addEventListener('pagehide', stop, { once: true });
  render();
}
