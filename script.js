/* ============================================
   SOZOU — Main Script
   GSAP + Lenis + Canvas + Custom Cursor
   ============================================ */

(function () {
    'use strict';

    // ─── Preloader ────────────────────────────────────
    const preloader = document.getElementById('preloader');
    const counter = document.getElementById('preloaderCounter');
    let count = 0;

    const counterInterval = setInterval(() => {
        count += Math.floor(Math.random() * 8) + 2;
        if (count >= 100) {
            count = 100;
            clearInterval(counterInterval);
            setTimeout(() => {
                preloader.classList.add('loaded');
                document.body.style.overflow = '';
                initAll();
            }, 400);
        }
        counter.textContent = count;
    }, 40);

    document.body.style.overflow = 'hidden';

    // ─── Init Everything ──────────────────────────────
    function initAll() {
        initLenis();
        initCursor();
        initHeroCanvas();
        initGSAP();
        initNav();
        initMobileMenu();
        initContactForm();
        initCountUp();
    }

    // ─── Lenis Smooth Scroll ──────────────────────────
    let lenis;

    function initLenis() {
        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // Anchor link smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    lenis.scrollTo(target, { offset: -80 });
                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mobileMenu');
                    const navToggle = document.getElementById('navToggle');
                    if (mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                    }
                }
            });
        });
    }

    // ─── Custom Cursor ────────────────────────────────
    function initCursor() {
        const cursor = document.getElementById('cursor');
        if (!cursor || window.innerWidth <= 768) return;

        const dot = cursor.querySelector('.cursor-dot');
        const ring = cursor.querySelector('.cursor-ring');
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateCursor() {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;

            dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
            ring.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        // Hover states
        document.querySelectorAll('[data-cursor]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                const type = el.getAttribute('data-cursor');
                cursor.className = 'cursor';
                if (type === 'sm') cursor.classList.add('cursor-hover');
                else if (type === 'lg') cursor.classList.add('cursor-lg');
                else if (type === 'view') cursor.classList.add('cursor-view');
            });
            el.addEventListener('mouseleave', () => {
                cursor.className = 'cursor';
            });
        });
    }

    // ─── Hero Canvas (Fluid Gradient) ─────────────────
    function initHeroCanvas() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width, height;
        let time = 0;
        let mouseXNorm = 0.5, mouseYNorm = 0.5;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio, 2);
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        }

        resize();
        window.addEventListener('resize', resize);

        document.addEventListener('mousemove', (e) => {
            mouseXNorm = e.clientX / window.innerWidth;
            mouseYNorm = e.clientY / window.innerHeight;
        });

        const blobs = [
            { x: 0.3, y: 0.3, r: 0.35, color: [200, 162, 255], speed: 0.0008, phase: 0 },
            { x: 0.7, y: 0.6, r: 0.3, color: [126, 184, 255], speed: 0.0012, phase: 2 },
            { x: 0.5, y: 0.8, r: 0.25, color: [180, 140, 255], speed: 0.001, phase: 4 },
        ];

        function draw() {
            time++;
            ctx.clearRect(0, 0, width, height);

            // Dark background
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, width, height);

            blobs.forEach(blob => {
                const cx = (blob.x + Math.sin(time * blob.speed + blob.phase) * 0.08 + (mouseXNorm - 0.5) * 0.05) * width;
                const cy = (blob.y + Math.cos(time * blob.speed * 1.3 + blob.phase) * 0.06 + (mouseYNorm - 0.5) * 0.05) * height;
                const r = blob.r * Math.min(width, height);

                const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
                gradient.addColorStop(0, `rgba(${blob.color.join(',')}, 0.12)`);
                gradient.addColorStop(0.5, `rgba(${blob.color.join(',')}, 0.04)`);
                gradient.addColorStop(1, `rgba(${blob.color.join(',')}, 0)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            });

            // Subtle noise grain overlay
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 16) {
                const noise = (Math.random() - 0.5) * 8;
                data[i] += noise;
                data[i + 1] += noise;
                data[i + 2] += noise;
            }
            ctx.putImageData(imageData, 0, 0);

            requestAnimationFrame(draw);
        }

        draw();
    }

    // ─── GSAP Animations ──────────────────────────────
    function initGSAP() {
        gsap.registerPlugin(ScrollTrigger);

        // Hero entrance
        const heroTl = gsap.timeline({ delay: 2.6 });

        heroTl.to('.hero-eyebrow', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'expo.out',
        });

        heroTl.to('.title-word', {
            y: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: 'expo.out',
        }, '-=0.6');

        heroTl.to('.hero-bottom', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'expo.out',
        }, '-=0.6');

        // Nav fade in
        gsap.from('.nav', {
            opacity: 0,
            y: -20,
            duration: 1,
            delay: 3,
            ease: 'expo.out',
        });

        // Marquee parallax speed
        gsap.to('.marquee-track', {
            x: '-=100',
            ease: 'none',
            scrollTrigger: {
                trigger: '.marquee-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
            }
        });

        // Work items reveal
        gsap.utils.toArray('.work-item').forEach((item, i) => {
            gsap.from(item, {
                opacity: 0,
                y: 80,
                duration: 1,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                delay: (i % 2) * 0.15,
            });
        });

        // Section headers reveal
        gsap.utils.toArray('.section-header').forEach(header => {
            const label = header.querySelector('.section-label');
            const words = header.querySelectorAll('.title-word');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: header,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                }
            });

            if (label) {
                tl.from(label, {
                    opacity: 0,
                    x: -20,
                    duration: 0.8,
                    ease: 'expo.out',
                });
            }

            if (words.length) {
                tl.to(words, {
                    y: 0,
                    duration: 1,
                    stagger: 0.08,
                    ease: 'expo.out',
                }, '-=0.4');
            }
        });

        // Capability items
        gsap.utils.toArray('.capability-item').forEach((item, i) => {
            gsap.from(item, {
                opacity: 0,
                x: -40,
                duration: 0.8,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                delay: i * 0.1,
            });
        });

        // Story section
        const storyTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.story',
                start: 'top 70%',
                toggleActions: 'play none none none',
            }
        });

        storyTl.from('.story-orb', {
            scale: 0.3,
            opacity: 0,
            duration: 1.2,
            ease: 'expo.out',
        });

        storyTl.from('.stat-item', {
            opacity: 0,
            y: 30,
            stagger: 0.15,
            duration: 0.8,
            ease: 'expo.out',
        }, '-=0.6');

        storyTl.from('.story-content > *', {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.8,
            ease: 'expo.out',
        }, '-=0.6');

        // Testimonial cards
        gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
            gsap.from(card, {
                opacity: 0,
                y: 60,
                duration: 0.8,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                delay: i * 0.12,
            });
        });

        // Contact section
        const contactTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.contact',
                start: 'top 70%',
                toggleActions: 'play none none none',
            }
        });

        contactTl.from('.contact-left > *', {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.8,
            ease: 'expo.out',
        });

        contactTl.from('.form-group', {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.8,
            ease: 'expo.out',
        }, '-=0.4');

        contactTl.from('.btn-submit', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'expo.out',
        }, '-=0.2');

        // Footer
        gsap.from('.footer-top', {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 90%',
                toggleActions: 'play none none none',
            }
        });

        // Parallax on work images
        gsap.utils.toArray('.work-item-img img').forEach(img => {
            gsap.fromTo(img, 
                { y: '-5%' },
                {
                    y: '5%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: img.closest('.work-item'),
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1,
                    }
                }
            );
        });
    }

    // ─── Navigation ───────────────────────────────────
    function initNav() {
        const nav = document.getElementById('nav');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            if (currentScroll > lastScroll && currentScroll > 400) {
                nav.classList.add('hidden');
            } else {
                nav.classList.remove('hidden');
            }

            lastScroll = currentScroll;
        });
    }

    // ─── Mobile Menu ──────────────────────────────────
    function initMobileMenu() {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('mobileMenu');

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');

            if (menu.classList.contains('active')) {
                lenis && lenis.stop();
            } else {
                lenis && lenis.start();
            }
        });

        // Close menu on link click
        menu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                menu.classList.remove('active');
                lenis && lenis.start();
            });
        });
    }

    // ─── Contact Form ─────────────────────────────────
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.btn-submit span');
            const originalText = btn.textContent;
            btn.textContent = 'Message Sent ✓';
            btn.closest('.btn-submit').style.background = 'var(--accent)';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.closest('.btn-submit').style.background = '';
                form.reset();
            }, 2500);
        });
    }

    // ─── Count Up Animation ───────────────────────────
    function initCountUp() {
        const statNums = document.querySelectorAll('.stat-num[data-count]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-count'));
                    const duration = 2000;
                    const start = performance.now();

                    function update(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out quart
                        const eased = 1 - Math.pow(1 - progress, 4);
                        el.textContent = Math.floor(eased * target);

                        if (progress < 1) {
                            requestAnimationFrame(update);
                        } else {
                            el.textContent = target;
                        }
                    }

                    requestAnimationFrame(update);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statNums.forEach(num => observer.observe(num));
    }

})();
