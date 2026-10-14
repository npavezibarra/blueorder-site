import { renderFlow } from './blueorder-flow-markup.js';

let instanceCount = 0;

class BlueOrderFlow extends HTMLElement {
  connectedCallback() {
    if (this.cleanup) return;
    const requestedId = this.getAttribute('flow-id');
    const id = requestedId && /^[a-zA-Z][\w-]*$/.test(requestedId) ? requestedId : `bo-instance-${++instanceCount}`;
    if (!this.querySelector('.bo-flow')) this.innerHTML = renderFlow(id);
    const root = this.querySelector('.bo-flow');
    const steps = [...root.querySelectorAll('[data-reveal]')];
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const abort = new AbortController();
    let observer;
    const sync = () => {
      observer?.disconnect();
      const animate = !media.matches && !this.hasAttribute('static') && typeof IntersectionObserver !== 'undefined';
      root.toggleAttribute('data-motion', animate);
      if (!animate) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      }, { threshold: .08, rootMargin: '0px 0px -56px 0px' });
      steps.filter(step => !step.classList.contains('is-visible')).forEach(step => observer.observe(step));
    };
    media.addEventListener('change', sync, { signal: abort.signal });
    const attributes = new MutationObserver(sync);
    attributes.observe(this, { attributes: true, attributeFilter: ['static'] });
    sync();
    this.cleanup = () => { observer?.disconnect(); attributes.disconnect(); abort.abort(); root.removeAttribute('data-motion'); };
  }

  disconnectedCallback() { this.cleanup?.(); this.cleanup = null; }
}

if (!customElements.get('blueorder-flow')) customElements.define('blueorder-flow', BlueOrderFlow);
