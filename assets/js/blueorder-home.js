document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('navbar');

    // Adjust header shadow on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Intersection Observer to detect section backgrounds
    const sections = document.querySelectorAll('section[data-theme]');

    const observerOptions = {
        root: null,
        // Trigger when a section hits the top 10% of the viewport (where the navbar is)
        rootMargin: '-10% 0px -90% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const theme = entry.target.getAttribute('data-theme');
                if (theme === 'light') {
                    nav.classList.remove('theme-dark');
                    nav.classList.add('theme-light');
                } else {
                    nav.classList.remove('theme-light');
                    nav.classList.add('theme-dark');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});

// Procedural Animation Script for Moving Network Nodes with Mouse Magnetism
window.addEventListener('load', () => {
    function createNetwork(svgElement, groupElement, gradId, motionPreference) {
        let width = svgElement.clientWidth;
        let height = svgElement.clientHeight;

        let mouse = { x: -1000, y: -1000, active: false };
        // The nearest section parent handles mouse events
        const section = svgElement.closest('section');

        if (section) {
            section.addEventListener('mousemove', (e) => {
                const rect = svgElement.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
                mouse.active = true;
            });

            section.addEventListener('mouseleave', () => {
                mouse.active = false;
                mouse.x = -1000;
                mouse.y = -1000;
            });
        }

        let nodes = [];
        function initNodes() {
            groupElement.innerHTML = '';
            nodes = [];
            width = svgElement.clientWidth;
            height = svgElement.clientHeight;

            const nodeCount = Math.floor((width * height) / 25000);
            for (let i = 0; i < Math.max(15, Math.min(nodeCount, 45)); i++) {
                nodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: (Math.random() * 2 + 1.5) * 0.85,
                    element: null
                });
            }

            nodes.forEach(node => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('r', node.radius);
                circle.setAttribute('fill', '#a5b4fc');
                circle.setAttribute('opacity', '0.6');
                groupElement.appendChild(circle);
                node.element = circle;
            });
        }

        initNodes();
        window.addEventListener('resize', initNodes);

        function animateNetwork() {
            const lines = groupElement.querySelectorAll('line');
            lines.forEach(l => l.remove());

            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;

                if (mouse.active) {
                    const dxMouse = mouse.x - node.x;
                    const dyMouse = mouse.y - node.y;
                    const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                    const magneticRadius = 180;

                    if (distMouse < magneticRadius && distMouse > 5) {
                        const force = (1 - (distMouse / magneticRadius)) * 0.03;
                        node.x += dxMouse * force;
                        node.y += dyMouse * force;
                    }
                }

                if(node.element) {
                    node.element.setAttribute('cx', node.x);
                    node.element.setAttribute('cy', node.y);
                }
            });

            const maxDistance = 220;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDistance) {
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', nodes[i].x);
                        line.setAttribute('y1', nodes[i].y);
                        line.setAttribute('x2', nodes[j].x);
                        line.setAttribute('y2', nodes[j].y);
                        line.setAttribute('stroke', `url(#${gradId})`);
                        const opacity = (1 - (dist / maxDistance)) * 0.55;
                        line.setAttribute('stroke-opacity', opacity);
                        line.setAttribute('stroke-width', '1.25');
                        groupElement.insertBefore(line, groupElement.firstChild);
                    }
                }
            }
            if (!motionPreference.matches) {
                requestAnimationFrame(animateNetwork);
            }
        }
        if (motionPreference.matches) {
            animateNetwork();
        } else {
            requestAnimationFrame(animateNetwork);
        }
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Initialize every network layer dynamically.
    const svgs = document.querySelectorAll('.network-svg');
    svgs.forEach((svg) => {
        const group = svg.querySelector('.network-group');
        const gradId = svg.querySelector('linearGradient').id;
        createNetwork(svg, group, gradId, reducedMotion);
    });
});
