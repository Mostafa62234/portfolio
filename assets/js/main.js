(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const initNavbar = () => {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.querySelector('.nav-links');

        const onScroll = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    };

    const initScrollReveal = () => {
        if (prefersReducedMotion) return;

        const elements = document.querySelectorAll('.reveal-up');

        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('revealed'));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        elements.forEach(el => observer.observe(el));
    };

    const initHero = () => {
        if (prefersReducedMotion) return;

        const heroContent = document.querySelector('.hero-content');
        const heroBg = document.querySelector('.hero-bg');

        window.addEventListener('mousemove', (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5);
            const y = (e.clientY / innerHeight - 0.5);

            if (heroContent) {
                heroContent.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
                heroContent.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }

            if (heroBg) {
                heroBg.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                heroBg.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
            }
        }, { passive: true });
    };

    const initProjectCards = () => {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('a')) return;
                const id = card.dataset.projectId;
                if (id) {
                    window.location.href = `project.html?id=${id}`;
                }
            });
        });
    };

    const loadPhotosConfig = async () => {
        try {
            const res = await fetch('photos.json');
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    };

    const applyPhotosConfig = (config) => {
        if (!config || !config.projects) return;

        config.projects.forEach(project => {
            const card = document.querySelector(`[data-project-id="${project.id}"]`);
            if (!card) return;

            if (project.images && project.images.length > 0) {
                const imageContainer = card.querySelector('.project-card__image');
                const overlay = imageContainer.querySelector('.project-card__overlay');

                if (project.images.length === 1) {
                    const img = imageContainer.querySelector('img');
                    if (img) {
                        img.src = project.images[0];
                    }
                } else {
                    imageContainer.innerHTML = '';
                    project.images.forEach(src => {
                        const img = document.createElement('img');
                        img.src = src;
                        img.alt = project.id;
                        img.loading = 'lazy';
                        imageContainer.appendChild(img);
                    });
                    imageContainer.classList.add('project-card__image--gallery');
                }

                if (overlay) imageContainer.appendChild(overlay);
            }

            const githubBtn = card.querySelector('[data-action="github"]');
            const downloadBtn = card.querySelector('[data-action="download"]');

            if (githubBtn) {
                if (project.github && project.github.trim() !== '') {
                    githubBtn.href = project.github;
                    githubBtn.style.display = '';
                } else {
                    githubBtn.remove();
                }
            }

            if (downloadBtn) {
                if (project.download && project.download.trim() !== '') {
                    downloadBtn.href = project.download;
                    downloadBtn.style.display = '';
                } else {
                    downloadBtn.remove();
                }
            }
        });
    };

    const initContactForm = () => {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const CONTACT_ENDPOINT = 'https://formsubmit.co/ajax/jeffs9899922@gmail.com';

        const status = document.createElement('p');
        status.className = 'form-status';
        status.hidden = true;
        form.insertAdjacentElement('afterend', status);

        const showStatus = (text, ok) => {
            status.textContent = text;
            status.hidden = false;
            status.classList.toggle('form-status--error', !ok);
            status.classList.toggle('form-status--success', ok);
        };

        const sanitize = (value) => {
            return value.replace(/<[^>]*>/g, '').trim();
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = sanitize(form.querySelector('[name="name"]').value);
            const email = sanitize(form.querySelector('[name="email"]').value);
            const message = sanitize(form.querySelector('[name="message"]').value);

            if (!name || !email || !message) {
                showStatus('Please fill in all fields.', false);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showStatus('Please enter a valid email address.', false);
                return;
            }

            if (message.length > 2000) {
                showStatus('Message is too long. Please keep it under 2000 characters.', false);
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Sending…';
            showStatus('Sending your message…', true);

            try {
                const res = await fetch(CONTACT_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        message,
                        _subject: `Portfolio contact from ${name}`,
                        _template: 'table',
                        _captcha: 'false'
                    })
                });
                const data = await res.json();

                if (res.ok && data && data.success === 'true') {
                    form.reset();
                    showStatus('Message sent! I will get back to you soon.', true);
                } else {
                    showStatus('Something went wrong. Please try again or email me directly.', false);
                }
            } catch (err) {
                showStatus('Network error — please try again.', false);
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    };

    const initTypeEffect = () => {
        if (prefersReducedMotion) return;

        const badge = document.querySelector('.hero-badge');
        if (!badge) return;

        const text = badge.textContent;
        badge.textContent = '';

        let i = 0;
        const typeSpeed = 40;

        const type = () => {
            if (i < text.length) {
                badge.textContent += text.charAt(i);
                i++;
                setTimeout(type, typeSpeed);
            }
        };

        setTimeout(type, 500);
    };

    document.addEventListener('DOMContentLoaded', async () => {
        initNavbar();
        initScrollReveal();
        initHero();
        initContactForm();
        initProjectCards();
        setTimeout(initTypeEffect, 300);

        const config = await loadPhotosConfig();
        if (config) applyPhotosConfig(config);
    });
})();