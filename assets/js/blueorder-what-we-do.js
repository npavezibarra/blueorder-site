const page = document.querySelector('.bo-what-page');
const nav = document.querySelector('.bo-what-nav');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

if (page && nav) {
  const syncNav = () => nav.dataset.scrolled = String(window.scrollY > 40);
  window.addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  const themeObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) nav.dataset.tone = entry.target.dataset.theme || 'light';
    }
  }, { rootMargin: '-12% 0px -82% 0px', threshold: 0 });

  document.querySelectorAll('[data-theme]').forEach(section => themeObserver.observe(section));

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (!motionPreference.matches && 'IntersectionObserver' in window) {
    page.classList.add('bo-motion');
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { threshold: .12, rootMargin: '0px 0px -48px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  const svg = document.querySelector('.bo-what-network-svg');
  const lineGroup = svg?.querySelector('.bo-network-lines');
  const nodeGroup = svg?.querySelector('.bo-network-nodes');

  if (svg && lineGroup && nodeGroup) {
    let width = 0;
    let height = 0;
    let nodes = [];
    let frame = 0;
    const mouse = { x: -1000, y: -1000, active: false };

    const build = () => {
      width = svg.clientWidth;
      height = svg.clientHeight;
      lineGroup.replaceChildren();
      nodeGroup.replaceChildren();
      const count = Math.max(15, Math.min(Math.floor((width * height) / 26000), 42));
      nodes = Array.from({ length: count }, () => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const node = {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - .5) * .36,
          vy: (Math.random() - .5) * .36,
          radius: Math.random() * 1.7 + 1.3,
          circle
        };
        circle.setAttribute('r', node.radius);
        circle.setAttribute('fill', '#a5b4fc');
        circle.setAttribute('opacity', '.58');
        nodeGroup.append(circle);
        return node;
      });
    };

    const draw = () => {
      lineGroup.replaceChildren();
      for (const node of nodes) {
        if (!motionPreference.matches) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
          if (mouse.active) {
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 180 && distance > 5) {
              const force = (1 - distance / 180) * .025;
              node.x += dx * force;
              node.y += dy * force;
            }
          }
        }
        node.circle.setAttribute('cx', node.x);
        node.circle.setAttribute('cy', node.y);
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const distance = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (distance >= 220) continue;
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', nodes[i].x);
          line.setAttribute('y1', nodes[i].y);
          line.setAttribute('x2', nodes[j].x);
          line.setAttribute('y2', nodes[j].y);
          line.setAttribute('stroke', 'url(#boWhatHeroLines)');
          line.setAttribute('stroke-opacity', (1 - distance / 220) * .5);
          line.setAttribute('stroke-width', '1.2');
          lineGroup.append(line);
        }
      }

      if (!motionPreference.matches) frame = window.requestAnimationFrame(draw);
    };

    const restart = () => {
      if (frame) window.cancelAnimationFrame(frame);
      build();
      draw();
    };

    svg.closest('.bo-what-hero')?.addEventListener('mousemove', event => {
      const bounds = svg.getBoundingClientRect();
      mouse.x = event.clientX - bounds.left;
      mouse.y = event.clientY - bounds.top;
      mouse.active = true;
    });
    svg.closest('.bo-what-hero')?.addEventListener('mouseleave', () => { mouse.active = false; });
    window.addEventListener('resize', restart, { passive: true });
    motionPreference.addEventListener('change', restart);
    window.addEventListener('pagehide', () => {
      if (frame) window.cancelAnimationFrame(frame);
      themeObserver.disconnect();
    }, { once: true });
    restart();
  }
}
