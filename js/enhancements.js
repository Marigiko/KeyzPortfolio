/* ==========================================================================
   KEYZ PORTFOLIO v2.0 — ADVANCED INTERACTION ENGINE
   Mario "Keyz" Aquino | Senior Full-Stack / Backend Developer

   FEATURES:
   ├─ HTMX 2.0 Integration (dynamic loading, error handling, progress)
   ├─ View Transition API (smooth section/card transitions)
   ├─ Mouse-Following 3D Tilt (requestAnimationFrame smoothed)
   ├─ Intersection Observer (scroll reveals, stagger support)
   ├─ Parallax Controller (depth layers, mouse + scroll reactive)
   ├─ Particle Network Canvas (connected node animation)
   ├─ Section Tracker (active nav highlighting)
   └─ Dynamic Project Loading (HTMX-powered modals/details)

   TECH: Vanilla JS (ES2022+), zero dependencies, ~60KB uncompressed
   ========================================================================== */

(() => {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════════
     CONFIGURATION
     ══════════════════════════════════════════════════════════════════════════ */
  const CONFIG = {
    tilt: {
      maxRotation: 12,           // Max tilt angle in degrees
      scale: 1.03,               // Hover scale factor
      perspective: 1200,         // 3D perspective depth
      smoothing: 0.08,           // Lerp factor (lower = smoother)
      glareIntensity: 0.15,      // Glare overlay opacity
    },
    parallax: {
      depthLayers: 5,            // Number of parallax depth planes
      mouseStrength: 30,         // Max mouse parallax offset (px)
      scrollStrength: 60,        // Max scroll parallax offset (px)
      smoothing: 0.06,           // Lerp factor for parallax
    },
    particles: {
      maxCount: 120,             // Particle count cap
      connectionDistance: 150,   // Max line distance between particles
      mouseInfluence: 100,       // Mouse attraction radius
      speed: 0.4,                // Base particle velocity
      colors: ['#00d4ff', '#a855f7', '#00fff7', '#ff006e'],
    },
    reveal: {
      threshold: 0.15,           // Intersection threshold
      rootMargin: '0px 0px -60px 0px',
      staggerDelay: 80,          // ms between staggered children
    },
    htmx: {
      progressBar: true,         // Show loading progress bar
      swapDelay: 50,             // Delay before swap for animation
      settleDelay: 300,          // Delay for settle animation
    },
    viewTransition: {
      enabled: true,             // Enable View Transition API
      duration: 500,             // Transition duration (ms)
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     FEATURE DETECTION
     ══════════════════════════════════════════════════════════════════════════ */
  const SUPPORTS = {
    viewTransitions: 'startViewTransition' in document,
    scrollDrivenAnimations: CSS.supports('animation-timeline: view()'),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    webgl: !!document.createElement('canvas').getContext('webgl'),
    pointerEvents: 'PointerEvent' in window,
    resizeObserver: 'ResizeObserver' in window,
  };

  /* ══════════════════════════════════════════════════════════════════════════
     UTILITY FUNCTIONS
     ══════════════════════════════════════════════════════════════════════════ */
  const Utils = {
    // Linear interpolation
    lerp: (start, end, factor) => start + (end - start) * factor,

    // Clamp value between min and max
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),

    // Throttle function execution
    throttle: (fn, delay) => {
      let last = 0;
      return (...args) => {
        const now = Date.now();
        if (now - last >= delay) {
          last = now;
          fn(...args);
        }
      };
    },

    // Debounce function execution
    debounce: (fn, delay) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    },

    // Map value from one range to another
    mapRange: (value, inMin, inMax, outMin, outMax) =>
      ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin,

    // Random float between min and max
    random: (min, max) => Math.random() * (max - min) + min,

    // Get element's viewport position
    isInViewport: (el, threshold = 0) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= window.innerHeight * (1 - threshold) &&
        rect.bottom >= window.innerHeight * threshold
      );
    },

    // Prefers reduced motion check
    respectsReducedMotion: () => SUPPORTS.reducedMotion,
  };

  /* ══════════════════════════════════════════════════════════════════════════
     1. HTMX 2.0 INTEGRATION ENGINE
     ══════════════════════════════════════════════════════════════════════════ */
  const HTMXEngine = {
    progressBar: null,
    activeRequests: 0,

    init() {
      this.createProgressBar();
      this.setupEventListeners();
      this.setupInterceptors();
    },

    createProgressBar() {
      if (!CONFIG.htmx.progressBar) return;
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'htmx-progress-bar';
      this.progressBar.setAttribute('aria-hidden', 'true');
      Object.assign(this.progressBar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        height: '3px',
        background: 'linear-gradient(90deg, #00d4ff, #a855f7, #ff006e)',
        transformOrigin: 'left',
        transform: 'scaleX(0)',
        opacity: '0',
        zIndex: '9999',
        transition: 'transform 0.2s ease, opacity 0.3s ease',
        pointerEvents: 'none',
      });
      document.body.appendChild(this.progressBar);
    },

    setupEventListeners() {
      // Request started
      document.addEventListener('htmx:beforeRequest', (evt) => {
        this.activeRequests++;
        this.showProgressBar();
        this.markLoading(evt.target);
      });

      // Request completed
      document.addEventListener('htmx:afterRequest', (evt) => {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        if (this.activeRequests === 0) this.hideProgressBar();
        this.unmarkLoading(evt.target);
        this.handleResponse(evt);
      });

      // Progress events (for upload/download)
      document.addEventListener('htmx:progress', (evt) => {
        if (evt.detail.loaded && evt.detail.total && this.progressBar) {
          const progress = evt.detail.loaded / evt.detail.total;
          this.progressBar.style.transform = `scaleX(${progress})`;
        }
      });

      // Response error
      document.addEventListener('htmx:responseError', (evt) => {
        this.handleError(evt.target, 'Failed to load content', evt.detail);
      });

      // Network error
      document.addEventListener('htmx:sendError', (evt) => {
        this.handleError(evt.target, 'Network error. Check connection.', evt.detail);
      });

      // Validation error
      document.addEventListener('htmx:validationFailed', (evt) => {
        this.handleError(evt.target, 'Validation failed. Check inputs.', evt.detail);
      });

      // After swap — reinitialize components
      document.addEventListener('htmx:afterSwap', (evt) => {
        this.reinitializeContent(evt.target);
      });

      // Before swap — add exit animation
      document.addEventListener('htmx:beforeSwap', (evt) => {
        evt.detail.target.classList.add('htmx-swapping');
      });
    },

    setupInterceptors() {
      // HTMX response interceptor for custom handling
      document.addEventListener('htmx:beforeOnLoad', (evt) => {
        const xhr = evt.detail.xhr;

        // Handle specific status codes
        if (xhr.status === 429) {
          this.showToast('Too many requests. Please wait.', 'warning');
          evt.preventDefault();
        }

        // Inject CSRF token if present
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        if (csrfToken) {
          xhr.setRequestHeader('X-CSRF-Token', csrfToken);
        }
      });
    },

    markLoading(target) {
      target.classList.add('htmx-request');
      target.setAttribute('aria-busy', 'true');

      // Show indicator if exists
      const indicatorId = target.getAttribute('hx-indicator');
      if (indicatorId) {
        const indicator = document.querySelector(indicatorId);
        if (indicator) indicator.classList.add('is-visible');
      }
    },

    unmarkLoading(target) {
      target.classList.remove('htmx-request');
      target.removeAttribute('aria-busy');

      const indicatorId = target.getAttribute('hx-indicator');
      if (indicatorId) {
        const indicator = document.querySelector(indicatorId);
        if (indicator) indicator.classList.remove('is-visible');
      }
    },

    showProgressBar() {
      if (!this.progressBar) return;
      this.progressBar.style.opacity = '1';
      this.progressBar.style.transform = 'scaleX(0.1)';
    },

    hideProgressBar() {
      if (!this.progressBar) return;
      this.progressBar.style.transform = 'scaleX(1)';
      setTimeout(() => {
        this.progressBar.style.opacity = '0';
        setTimeout(() => {
          this.progressBar.style.transform = 'scaleX(0)';
        }, 300);
      }, 200);
    },

    handleResponse(evt) {
      const { xhr, target } = evt;
      if (!xhr || !target) return;

      // Handle success responses with custom data attributes
      if (xhr.status >= 200 && xhr.status < 300) {
        const showSuccess = target.getAttribute('htmx-show-success');
        if (showSuccess) {
          this.showToast(showSuccess, 'success');
        }
      }
    },

    handleError(target, message, detail) {
      console.error('[HTMX]', message, detail);

      // Create error element if doesn't exist
      let errorEl = target.querySelector('.htmx-error-message');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'htmx-error-message';
        errorEl.setAttribute('role', 'alert');
        Object.assign(errorEl.style, {
          padding: '0.75rem 1rem',
          background: 'rgba(255, 0, 110, 0.1)',
          border: '1px solid rgba(255, 0, 110, 0.3)',
          borderRadius: '0.5rem',
          color: '#ff006e',
          fontSize: '0.875rem',
          marginTop: '0.5rem',
          opacity: '0',
          transform: 'translateY(-5px)',
          transition: 'all 0.3s ease',
        });
        target.appendChild(errorEl);
      }

      errorEl.textContent = message;
      errorEl.style.opacity = '1';
      errorEl.style.transform = 'translateY(0)';

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        errorEl.style.opacity = '0';
        errorEl.style.transform = 'translateY(-5px)';
        setTimeout(() => errorEl.remove(), 300);
      }, 5000);
    },

    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');

      const colors = {
        success: { bg: 'rgba(57, 255, 20, 0.1)', border: 'rgba(57, 255, 20, 0.3)', text: '#39ff14' },
        warning: { bg: 'rgba(255, 193, 7, 0.1)', border: 'rgba(255, 193, 7, 0.3)', text: '#ffc107' },
        error: { bg: 'rgba(255, 0, 110, 0.1)', border: 'rgba(255, 0, 110, 0.3)', text: '#ff006e' },
        info: { bg: 'rgba(0, 212, 255, 0.1)', border: 'rgba(0, 212, 255, 0.3)', text: '#00d4ff' },
      };

      const style = colors[type] || colors.info;
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '0.75rem 1.5rem',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '0.75rem',
        color: style.text,
        fontSize: '0.875rem',
        fontWeight: '500',
        backdropFilter: 'blur(12px)',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'none',
      });
      toast.textContent = message;

      document.body.appendChild(toast);

      // Animate in
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });

      // Auto-dismiss
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 400);
      }, 3000);
    },

    reinitializeContent(container) {
      // Re-setup tilt on new cards
      container.querySelectorAll('[data-tilt], .card-3d, .project-card').forEach(card => {
        if (!card.dataset.tiltInitialized) {
          CardTilt.setup(card);
        }
      });

      // Re-observe scroll reveals
      container.querySelectorAll('.scroll-reveal, .reveal').forEach(el => {
        if (!el.dataset.revealObserved) {
          ScrollReveal.observe(el);
        }
      });

      // Trigger view transition for major changes
      if (container.dataset.viewTransition !== undefined && SUPPORTS.viewTransitions) {
        document.startViewTransition?.(() => {});
      }
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     2. VIEW TRANSITION API CONTROLLER
     ══════════════════════════════════════════════════════════════════════════ */
  const ViewTransitions = {
    currentSection: null,
    isTransitioning: false,

    init() {
      if (!SUPPORTS.viewTransitions || !CONFIG.viewTransition.enabled) return;

      this.setupSectionTransitions();
      this.setupNavigationTransitions();
      this.setupCardTransitions();
    },

    setupSectionTransitions() {
      // Track current section for transition direction
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.currentSection = entry.target.id;
            }
          });
        },
        { threshold: 0.5 }
      );

      document.querySelectorAll('section[id]').forEach((section) => {
        observer.observe(section);
      });
    },

    setupNavigationTransitions() {
      document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href === '#') return;

          const target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();
          this.smoothScrollTo(target);
        });
      });
    },

    setupCardTransitions() {
      // Setup view transition names for project cards
      document.querySelectorAll('.project-card, .timeline__card').forEach((card, i) => {
        card.style.viewTransitionName = `card-${i}`;
        card.style.contain = 'layout style';
      });
    },

    smoothScrollTo(target) {
      if (SUPPORTS.viewTransitions && !SUPPORTS.reducedMotion) {
        document.startViewTransition(() => {
          target.scrollIntoView({ behavior: 'instant' });
          this.updateActiveNav(target.id);
        });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
        this.updateActiveNav(target.id);
      }
    },

    updateActiveNav(sectionId) {
      document.querySelectorAll('[data-nav-link]').forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.toggle('is-active', href === `#${sectionId}`);
        link.setAttribute('aria-current', href === `#${sectionId}` ? 'true' : 'false');
      });
    },

    async transition(callback) {
      if (SUPPORTS.viewTransitions && !this.isTransitioning) {
        this.isTransitioning = true;
        try {
          await document.startViewTransition(callback).finished;
        } finally {
          this.isTransitioning = false;
        }
      } else {
        callback();
      }
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     3. MOUSE-FOLLOWING 3D TILT ENGINE (requestAnimationFrame Smoothed)
     ══════════════════════════════════════════════════════════════════════════ */
  const CardTilt = {
    cards: new Map(),
    rafId: null,

    init() {
      const targets = document.querySelectorAll(
        '[data-tilt], .card-3d, .project-card, .timeline__card, .skill-category, .about__highlight, .contact__item'
      );

      targets.forEach((card) => {
        if (!card.dataset.tiltInitialized) {
          this.setup(card);
        }
      });

      // Use MutationObserver to catch dynamically added cards
      this.setupDynamicObserver();
    },

    setup(card) {
      card.dataset.tiltInitialized = 'true';

      // Create tilt state for this card
      const state = {
        targetRotateX: 0,
        targetRotateY: 0,
        currentRotateX: 0,
        currentRotateY: 0,
        targetGlareX: 50,
        targetGlareY: 50,
        currentGlareX: 50,
        currentGlareY: 50,
        targetScale: 1,
        currentScale: 1,
        isHovering: false,
      };

      this.cards.set(card, state);

      // Create glare overlay if doesn't exist
      let glare = card.querySelector('.tilt-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'tilt-glare';
        glare.setAttribute('aria-hidden', 'true');
        Object.assign(glare.style, {
          position: 'absolute',
          inset: '0',
          borderRadius: 'inherit',
          background: `radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.15) 0%, transparent 60%)`,
          opacity: '0',
          pointerEvents: 'none',
          zIndex: '2',
          transition: 'opacity 0.3s ease',
        });
        // Ensure card has position for absolute glare
        if (getComputedStyle(card).position === 'static') {
          card.style.position = 'relative';
        }
        card.appendChild(glare);
      }
      state.glare = glare;

      // Event listeners
      const handleEnter = () => {
        state.isHovering = true;
        state.targetScale = CONFIG.tilt.scale;
        glare.style.opacity = '1';
        this.startAnimation();
      };

      const handleLeave = () => {
        state.isHovering = false;
        state.targetRotateX = 0;
        state.targetRotateY = 0;
        state.targetGlareX = 50;
        state.targetGlareY = 50;
        state.targetScale = 1;
        glare.style.opacity = '0';
      };

      const handleMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (clamped to maxRotation)
        state.targetRotateY = Utils.clamp(
          ((x - centerX) / centerX) * CONFIG.tilt.maxRotation,
          -CONFIG.tilt.maxRotation,
          CONFIG.tilt.maxRotation
        );
        state.targetRotateX = Utils.clamp(
          -((y - centerY) / centerY) * CONFIG.tilt.maxRotation,
          -CONFIG.tilt.maxRotation,
          CONFIG.tilt.maxRotation
        );

        // Calculate glare position
        state.targetGlareX = (x / rect.width) * 100;
        state.targetGlareY = (y / rect.height) * 100;
      };

      card.addEventListener('mouseenter', handleEnter);
      card.addEventListener('mouseleave', handleLeave);
      card.addEventListener('mousemove', handleMove);

      // Touch support
      card.addEventListener('touchstart', handleEnter, { passive: true });
      card.addEventListener('touchend', handleLeave, { passive: true });
      card.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        handleMove({ clientX: touch.clientX, clientY: touch.clientY });
      }, { passive: true });
    },

    startAnimation() {
      if (this.rafId) return;

      const animate = () => {
        let needsUpdate = false;

        this.cards.forEach((state) => {
          const { smoothing } = CONFIG.tilt;

          // Smooth interpolation for all values
          state.currentRotateX = Utils.lerp(state.currentRotateX, state.targetRotateX, smoothing);
          state.currentRotateY = Utils.lerp(state.currentRotateY, state.targetRotateY, smoothing);
          state.currentGlareX = Utils.lerp(state.currentGlareX, state.targetGlareX, smoothing);
          state.currentGlareY = Utils.lerp(state.currentGlareY, state.targetGlareY, smoothing);
          state.currentScale = Utils.lerp(state.currentScale, state.targetScale, smoothing);

          // Check if still needs animation
          const threshold = 0.01;
          if (
            Math.abs(state.currentRotateX - state.targetRotateX) > threshold ||
            Math.abs(state.currentRotateY - state.targetRotateY) > threshold ||
            Math.abs(state.currentScale - state.targetScale) > threshold ||
            state.isHovering
          ) {
            needsUpdate = true;
          }
        });

        if (needsUpdate) {
          this.applyTransforms();
          this.rafId = requestAnimationFrame(animate);
        } else {
          this.rafId = null;
          this.applyTransforms(); // Final frame
        }
      };

      this.rafId = requestAnimationFrame(animate);
    },

    applyTransforms() {
      this.cards.forEach((state, card) => {
        const { perspective } = CONFIG.tilt;
        card.style.transform = `
          perspective(${perspective}px)
          rotateX(${state.currentRotateX.toFixed(2)}deg)
          rotateY(${state.currentRotateY.toFixed(2)}deg)
          scale3d(${state.currentScale.toFixed(3)}, ${state.currentScale.toFixed(3)}, ${state.currentScale.toFixed(3)})
        `;

        if (state.glare) {
          state.glare.style.background = `radial-gradient(circle at ${state.currentGlareX.toFixed(1)}% ${state.currentGlareY.toFixed(1)}%, rgba(0, 212, 255, ${CONFIG.tilt.glareIntensity}) 0%, transparent 60%)`;
        }
      });
    },

    setupDynamicObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Check if the added node itself is a tilt target
              if (node.matches?.('[data-tilt], .card-3d, .project-card, .timeline__card')) {
                this.setup(node);
              }
              // Check children
              node.querySelectorAll?.('[data-tilt], .card-3d, .project-card, .timeline__card').forEach((card) => {
                if (!card.dataset.tiltInitialized) this.setup(card);
              });
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     4. INTERSECTION OBSERVER — SCROLL REVEALS
     ══════════════════════════════════════════════════════════════════════════ */
  const ScrollReveal = {
    observer: null,
    staggerObserver: null,

    init() {
      if (SUPPORTS.scrollDrivenAnimations) {
        // CSS handles animations; JS just adds helper classes
        this.setupCSSRevealSupport();
      } else {
        this.setupIntersectionObserver();
      }

      this.setupStaggerObserver();
    },

    setupCSSRevealSupport() {
      // Add class for progressive enhancement
      document.querySelectorAll('.scroll-reveal, .reveal').forEach((el) => {
        el.dataset.cssAnimated = 'true';
      });

      // Still observe for adding visible class (useful for other JS)
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              this.triggerChildAnimations(entry.target);
            }
          });
        },
        {
          threshold: CONFIG.reveal.threshold,
          rootMargin: CONFIG.reveal.rootMargin,
        }
      );

      document.querySelectorAll('.scroll-reveal, .reveal').forEach((el) => {
        observer.observe(el);
      });
    },

    setupIntersectionObserver() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.revealElement(entry.target);
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: CONFIG.reveal.threshold,
          rootMargin: CONFIG.reveal.rootMargin,
        }
      );

      const targets = document.querySelectorAll(
        '.scroll-reveal, .reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
      );

      targets.forEach((el) => {
        if (!el.dataset.revealObserved) {
          // Set initial hidden state
          el.style.opacity = '0';
          el.style.transform = this.getInitialTransform(el);
          el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          this.observer.observe(el);
          el.dataset.revealObserved = 'true';
        }
      });
    },

    getInitialTransform(el) {
      if (el.classList.contains('scroll-reveal-left')) return 'translateX(-60px)';
      if (el.classList.contains('scroll-reveal-right')) return 'translateX(60px)';
      if (el.classList.contains('scroll-reveal-scale')) return 'scale(0.8)';
      return 'translateY(50px)';
    },

    revealElement(el) {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.classList.add('is-visible');
      });

      // Trigger child stagger animations
      this.triggerChildAnimations(el);
    },

    setupStaggerObserver() {
      this.staggerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animateStaggerChildren(entry.target);
              this.staggerObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      document.querySelectorAll('.stagger-children, .skills__grid, .projects__grid').forEach((el) => {
        if (!el.dataset.staggerObserved) {
          this.staggerObserver.observe(el);
          el.dataset.staggerObserved = 'true';
        }
      });
    },

    animateStaggerChildren(container) {
      const children = container.children;
      Array.from(children).forEach((child, i) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(30px)';
        child.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * CONFIG.reveal.staggerDelay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * CONFIG.reveal.staggerDelay}ms`;

        requestAnimationFrame(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        });
      });
    },

    triggerChildAnimations(container) {
      // Animate skill bars if present
      container.querySelectorAll('.skill-level-bar, .skill-bar-fill').forEach((bar) => {
        const level = bar.dataset.level || bar.getAttribute('data-level') || '80';
        setTimeout(() => {
          bar.style.width = `${level}%`;
        }, 300);
      });

      // Animate counters if present
      container.querySelectorAll('[data-counter]').forEach((counter) => {
        this.animateCounter(counter);
      });
    },

    animateCounter(el) {
      const target = parseInt(el.dataset.counter, 10) || 0;
      const duration = 1500;
      const start = performance.now();

      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    },

    observe(el) {
      if (this.observer && !el.dataset.revealObserved) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        this.observer.observe(el);
        el.dataset.revealObserved = 'true';
      }
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     5. PARALLAX CONTROLLER (Depth Layers + Mouse + Scroll)
     ══════════════════════════════════════════════════════════════════════════ */
  const ParallaxController = {
    layers: [],
    mouse: { x: 0.5, y: 0.5 },
    scroll: { y: 0, direction: 0 },
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    rafId: null,

    init() {
      if (SUPPORTS.reducedMotion) return;

      this.setupLayers();
      this.setupMouseTracking();
      this.setupScrollTracking();
      this.startAnimation();
    },

    setupLayers() {
      // Register depth layers
      document.querySelectorAll('[data-parallax-depth], .depth-layer, .parallax-layer').forEach((el) => {
        const depth = parseFloat(el.dataset.parallaxDepth) || 0;
        this.layers.push({ el, depth });
      });

      // Auto-register hero floating shapes
      document.querySelectorAll('.hero__floating-shapes, .hero__shape').forEach((el, i) => {
        const depth = (i + 1) * 0.3;
        this.layers.push({ el, depth, isHero: true });
      });

      // Register background orbs with depth
      document.querySelectorAll('.bg-gradient-orb').forEach((el, i) => {
        const depth = (i + 1) * 0.15;
        this.layers.push({ el, depth, isOrb: true });
      });
    },

    setupMouseTracking() {
      const updateMouse = (e) => {
        this.mouse.x = e.clientX / window.innerWidth;
        this.mouse.y = e.clientY / window.innerHeight;
        this.targetX = (this.mouse.x - 0.5) * 2; // -1 to 1
        this.targetY = (this.mouse.y - 0.5) * 2; // -1 to 1
      };

      if (SUPPORTS.pointerEvents) {
        document.addEventListener('pointermove', Utils.throttle(updateMouse, 16));
      } else {
        document.addEventListener('mousemove', Utils.throttle(updateMouse, 16));
      }

      // Reset on mouse leave
      document.addEventListener('mouseleave', () => {
        this.targetX = 0;
        this.targetY = 0;
      });
    },

    setupScrollTracking() {
      let lastScrollY = window.scrollY;

      window.addEventListener(
        'scroll',
        Utils.throttle(() => {
          const currentScrollY = window.scrollY;
          this.scroll.direction = currentScrollY > lastScrollY ? 1 : -1;
          this.scroll.y = currentScrollY;
          lastScrollY = currentScrollY;
        }, 16),
        { passive: true }
      );
    },

    startAnimation() {
      const animate = () => {
        // Smooth interpolation
        this.currentX = Utils.lerp(this.currentX, this.targetX, CONFIG.parallax.smoothing);
        this.currentY = Utils.lerp(this.currentY, this.targetY, CONFIG.parallax.smoothing);

        this.applyParallax();
        this.rafId = requestAnimationFrame(animate);
      };

      this.rafId = requestAnimationFrame(animate);
    },

    applyParallax() {
      const { mouseStrength, scrollStrength } = CONFIG.parallax;

      this.layers.forEach(({ el, depth, isHero, isOrb }) => {
        const mouseOffsetX = this.currentX * mouseStrength * depth;
        const mouseOffsetY = this.currentY * mouseStrength * depth;
        const scrollOffsetY = this.scroll.y * depth * 0.1;

        if (isOrb) {
          // Background orbs respond slowly to mouse
          el.style.transform = `translate(${mouseOffsetX * 0.5}px, ${mouseOffsetY * 0.5}px)`;
        } else if (isHero) {
          // Hero elements have more dramatic parallax
          el.style.transform = `translate3d(${mouseOffsetX * 1.5}px, ${mouseOffsetY * 1.5}px, ${depth * 50}px)`;
        } else {
          // Standard depth layers
          el.style.transform = `translate3d(${mouseOffsetX}px, ${mouseOffsetY + scrollOffsetY}px, 0)`;
        }
      });

      // Apply subtle parallax to hero content
      const heroContent = document.querySelector('.hero__content');
      if (heroContent) {
        const heroOffset = this.scroll.y * 0.3;
        heroContent.style.transform = `translateY(${heroOffset}px)`;
        heroContent.style.opacity = Math.max(0, 1 - this.scroll.y / 700);
      }
    },

    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     6. PARTICLE NETWORK CANVAS ANIMATION
     ══════════════════════════════════════════════════════════════════════════ */
  const ParticleNetwork = {
    canvas: null,
    ctx: null,
    particles: [],
    mouse: { x: -1000, y: -1000 },
    width: 0,
    height: 0,
    rafId: null,
    isActive: true,

    init() {
      if (SUPPORTS.reducedMotion) return;

      this.createCanvas();
      this.createParticles();
      this.setupEvents();
      this.animate();
    },

    createCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'particle-network';
      this.canvas.setAttribute('aria-hidden', 'true');
      Object.assign(this.canvas.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '-2',
        pointerEvents: 'none',
        opacity: '0.6',
      });
      document.body.prepend(this.canvas);
      this.ctx = this.canvas.getContext('2d');

      this.resize();
    },

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.scale(dpr, dpr);
    },

    createParticles() {
      this.particles = [];
      const area = this.width * this.height;
      const count = Math.min(
        CONFIG.particles.maxCount,
        Math.floor(area / 12000)
      );

      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle());
      }
    },

    createParticle() {
      const colors = CONFIG.particles.colors;
      return {
        x: Utils.random(0, this.width),
        y: Utils.random(0, this.height),
        vx: Utils.random(-CONFIG.particles.speed, CONFIG.particles.speed),
        vy: Utils.random(-CONFIG.particles.speed, CONFIG.particles.speed),
        size: Utils.random(1.5, 3.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Utils.random(0.3, 0.8),
      };
    },

    setupEvents() {
      // Pause animation when tab is hidden
      document.addEventListener('visibilitychange', () => {
        this.isActive = !document.hidden;
        if (this.isActive) this.animate();
      });

      // Mouse interaction
      const updateMouse = (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      };

      if (SUPPORTS.pointerEvents) {
        document.addEventListener('pointermove', Utils.throttle(updateMouse, 50));
      } else {
        document.addEventListener('mousemove', Utils.throttle(updateMouse, 50));
      }

      document.addEventListener('mouseleave', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
      });

      // Resize handling
      window.addEventListener('resize', Utils.debounce(() => {
        this.resize();
        this.createParticles();
      }, 250));
    },

    animate() {
      if (!this.isActive) return;

      this.ctx.clearRect(0, 0, this.width, this.height);

      const { connectionDistance, mouseInfluence, colors } = CONFIG.particles;

      // Update and draw particles
      this.particles.forEach((p, i) => {
        // Mouse attraction
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseInfluence) {
          const force = (mouseInfluence - dist) / mouseInfluence;
          p.vx += (dx / dist) * force * 0.02;
          p.vy += (dy / dist) * force * 0.02;
        }

        // Apply velocity with damping
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Boundary wrap
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fill();

        // Draw connections
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < connectionDistance) {
            const alpha = (1 - dist2 / connectionDistance) * 0.3;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = p.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.lineWidth = 0.8;
            this.ctx.stroke();
          }
        }

        // Draw connection to mouse
        if (dist < mouseInfluence * 1.5) {
          const alpha = (1 - dist / (mouseInfluence * 1.5)) * 0.4;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = colors[0];
          this.ctx.globalAlpha = alpha;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });

      this.ctx.globalAlpha = 1;
      this.rafId = requestAnimationFrame(() => this.animate());
    },

    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.canvas?.remove();
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     7. SECTION TRACKER — ACTIVE NAV HIGHLIGHTING
     ══════════════════════════════════════════════════════════════════════════ */
  const SectionTracker = {
    observer: null,
    sections: [],
    navLinks: [],
    currentActive: null,

    init() {
      this.sections = Array.from(document.querySelectorAll('section[id]'));
      this.navLinks = Array.from(document.querySelectorAll('[data-nav-link], .nav__link'));

      if (!this.sections.length || !this.navLinks.length) return;

      this.setupObserver();
      this.setupScrollIndicator();
    },

    setupObserver() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.setActiveSection(entry.target.id);
            }
          });
        },
        {
          rootMargin: '-20% 0px -70% 0px',
          threshold: 0,
        }
      );

      this.sections.forEach((section) => this.observer.observe(section));
    },

    setActiveSection(sectionId) {
      if (this.currentActive === sectionId) return;
      this.currentActive = sectionId;

      // Update nav links
      this.navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        const isActive = href === `#${sectionId}`;

        link.classList.toggle('is-active', isActive);
        link.classList.toggle('active', isActive);
        link.setAttribute('aria-current', isActive ? 'true' : 'false');

        // Update indicator position if it exists
        if (isActive) {
          this.updateNavIndicator(link);
        }
      });

      // Dispatch custom event
      document.dispatchEvent(
        new CustomEvent('sectionChange', {
          detail: { sectionId, section: document.getElementById(sectionId) },
        })
      );
    },

    updateNavIndicator(activeLink) {
      let indicator = document.querySelector('.nav-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'nav-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        Object.assign(indicator.style, {
          position: 'absolute',
          bottom: '0',
          height: '2px',
          background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
          borderRadius: '1px',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        });
        activeLink.parentElement.style.position = 'relative';
        activeLink.parentElement.appendChild(indicator);
      }

      const linkRect = activeLink.getBoundingClientRect();
      const parentRect = activeLink.parentElement.getBoundingClientRect();
      indicator.style.width = `${linkRect.width}px`;
      indicator.style.left = `${linkRect.left - parentRect.left}px`;
    },

    setupScrollIndicator() {
      // Create scroll progress bar
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress-bar';
      progressBar.setAttribute('aria-hidden', 'true');
      Object.assign(progressBar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        height: '2px',
        background: 'linear-gradient(90deg, #00d4ff, #a855f7, #ff006e)',
        zIndex: '9998',
        transformOrigin: 'left',
        transform: 'scaleX(0)',
        pointerEvents: 'none',
      });
      document.body.appendChild(progressBar);

      // Update on scroll
      window.addEventListener(
        'scroll',
        Utils.throttle(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
          progressBar.style.transform = `scaleX(${progress})`;
        }, 16),
        { passive: true }
      );
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     8. DYNAMIC PROJECT LOADING (HTMX-POWERED)
     ══════════════════════════════════════════════════════════════════════════ */
  const ProjectLoader = {
    modal: null,

    init() {
      this.createModal();
      this.setupEventListeners();
    },

    createModal() {
      this.modal = document.createElement('div');
      this.modal.id = 'project-modal';
      this.modal.setAttribute('role', 'dialog');
      this.modal.setAttribute('aria-modal', 'true');
      this.modal.setAttribute('aria-labelledby', 'modal-title');
      Object.assign(this.modal.style, {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999',
        opacity: '0',
        visibility: 'hidden',
        transition: 'opacity 0.3s ease, visibility 0.3s ease',
      });

      this.modal.innerHTML = `
        <div class="modal-backdrop" style="
          position: absolute; inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
        "></div>
        <div class="modal-content" style="
          position: relative;
          max-width: 700px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          background: rgba(15, 15, 25, 0.95);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 212, 255, 0.1);
        ">
          <button class="modal-close" aria-label="Close modal" style="
            position: absolute; top: 1rem; right: 1rem;
            width: 40px; height: 40px;
            display: flex; align-items: center; justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            color: #fff;
            font-size: 1.25rem;
            cursor: pointer;
            transition: all 0.2s ease;
          ">&times;</button>
          <div id="modal-body">
            <div class="modal-loading" style="text-align: center; padding: 3rem;">
              <div class="loading-spinner" style="
                display: inline-block;
                width: 40px; height: 40px;
                border: 3px solid rgba(0, 212, 255, 0.2);
                border-top-color: #00d4ff;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              "></div>
              <p style="margin-top: 1rem; color: rgba(255, 255, 255, 0.5);">Loading project...</p>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(this.modal);

      // Close events
      this.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.close());
      this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());

      // Keyboard close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) this.close();
      });
    },

    setupEventListeners() {
      // Delegate clicks for project links
      document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-project-link], .project-card__link');
        if (link) {
          e.preventDefault();
          const projectId = link.dataset.project || link.dataset.projectLink;
          this.open(projectId);
        }
      });

      // Handle HTMX-loaded project details
      document.addEventListener('htmx:afterSwap', (evt) => {
        if (evt.target.id === 'project-detail') {
          this.showProjectDetail(evt.target.innerHTML);
        }
      });
    },

    open(projectId) {
      this.modal.style.opacity = '1';
      this.modal.style.visibility = 'visible';
      document.body.style.overflow = 'hidden';

      // Simulate loading project data (in production, this would be HTMX)
      const modalBody = this.modal.querySelector('#modal-body');
      modalBody.innerHTML = `
        <div class="modal-loading" style="text-align: center; padding: 3rem;">
          <div class="loading-spinner" style="
            display: inline-block;
            width: 40px; height: 40px;
            border: 3px solid rgba(0, 212, 255, 0.2);
            border-top-color: #00d4ff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          "></div>
          <p style="margin-top: 1rem; color: rgba(255, 255, 255, 0.5);">Loading project...</p>
        </div>
      `;

      // Simulate fetch (would be HTMX in production)
      setTimeout(() => {
        const projectData = this.getProjectData(projectId);
        if (projectData) {
          this.renderProject(projectData);
        }
      }, 500);
    },

    close() {
      this.modal.style.opacity = '0';
      this.modal.style.visibility = 'hidden';
      document.body.style.overflow = '';
    },

    isOpen() {
      return this.modal.style.visibility === 'visible';
    },

    getProjectData(projectId) {
      // Project data lookup (in production, this comes from the server)
      const projects = {
        scraper: {
          title: 'Legal Scraping Engine',
          tagline: 'AI-powered pipeline for automated legal document acquisition',
          description: 'A sophisticated web scraping platform that combines traditional scraping techniques with AI-powered content extraction.',
          details: [
            'Multi-layered scraping architecture with automatic retry and fallback',
            'AI-powered content classification using local LLMs',
            'Real-time monitoring dashboard with health alerts',
            'Distributed processing handling thousands of documents/hour',
          ],
          tech: ['Python', 'Playwright', 'Ollama', 'LangChain', 'PostgreSQL', 'Redis'],
          github: '#',
          live: '#',
        },
        'sales-ai': {
          title: 'AI Sales Assistant',
          tagline: 'Intelligent sales matching platform powered by LLMs',
          description: 'Led the development of a comprehensive sales matching platform that uses AI to connect businesses with ideal prospects.',
          details: [
            'Microservices architecture on AWS EKS handling 10K+ concurrent users',
            'Real-time matching engine processing leads with sub-100ms latency',
            'Optimized CI/CD reducing deployment time from 45min to 22min',
            'Event-driven architecture using WebSockets for live updates',
          ],
          tech: ['Node.js', 'NestJS', 'TypeScript', 'AWS', 'Kubernetes', 'PostgreSQL'],
          github: '#',
          live: '#',
        },
        analytics: {
          title: 'Real-Time Analytics',
          tagline: 'Kafka-powered event streaming dashboard',
          description: 'Real-time analytics dashboard processing millions of events with sub-second latency using Kafka streams.',
          details: [
            'Kafka consumer groups for parallel event processing',
            'WebSocket-based live data visualization',
            'Custom aggregation pipelines for real-time metrics',
          ],
          tech: ['React', 'Node.js', 'Kafka', 'Redis', 'D3.js'],
          github: '#',
          live: '#',
        },
        cicd: {
          title: 'K8s Deploy Pipeline',
          tagline: 'Automated deployment reducing CI/CD time by 50%',
          description: 'Zero-downtime deployment pipeline with automated rollback capabilities.',
          details: [
            'GitOps-based deployment with ArgoCD',
            'Automated canary releases with metrics analysis',
            'Infrastructure as Code with Terraform',
          ],
          tech: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'AWS'],
          github: '#',
          live: '#',
        },
        ecommerce: {
          title: 'E-Commerce Platform',
          tagline: 'Full-stack Next.js commerce solution',
          description: 'High-performance e-commerce platform optimized for Core Web Vitals.',
          details: [
            'Server-side rendering for optimal SEO',
            'Edge functions for personalized experiences',
            '45% API latency reduction through query optimization',
          ],
          tech: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL', 'Redis'],
          github: '#',
          live: '#',
        },
        'code-review': {
          title: 'AI Code Review Bot',
          tagline: 'Automated code review using LLMs',
          description: 'Intelligent code review system that detects bugs, security issues, and suggests improvements.',
          details: [
            'Custom LLM prompts for contextual code analysis',
            'GitHub Actions integration for automated PR reviews',
            'Security vulnerability detection with CWE mapping',
          ],
          tech: ['Python', 'LangChain', 'GitHub API', 'Docker', 'OpenAI'],
          github: '#',
          live: '#',
        },
      };

      return projects[projectId] || null;
    },

    renderProject(project) {
      const modalBody = this.modal.querySelector('#modal-body');
      modalBody.innerHTML = `
        <h2 id="modal-title" style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">
          ${project.title}
        </h2>
        <p style="color: #00d4ff; font-size: 1rem; margin-bottom: 1.5rem;">
          ${project.tagline}
        </p>
        <p style="color: rgba(255, 255, 255, 0.7); line-height: 1.7; margin-bottom: 1.5rem;">
          ${project.description}
        </p>
        <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; color: rgba(255, 255, 255, 0.9);">
          Key Features
        </h3>
        <ul style="list-style: none; margin-bottom: 1.5rem;">
          ${project.details.map((d) => `
            <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: rgba(255, 255, 255, 0.7);">
              <span style="position: absolute; left: 0; color: #00d4ff;">▹</span>
              ${d}
            </li>
          `).join('')}
        </ul>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
          ${project.tech.map((t) => `
            <span style="
              padding: 0.35rem 0.75rem;
              background: rgba(0, 212, 255, 0.1);
              border: 1px solid rgba(0, 212, 255, 0.2);
              border-radius: 9999px;
              font-size: 0.8rem;
              color: #00d4ff;
            ">${t}</span>
          `).join('')}
        </div>
        <div style="display: flex; gap: 1rem;">
          ${project.github !== '#' ? `
            <a href="${project.github}" target="_blank" rel="noopener noreferrer" style="
              padding: 0.6rem 1.2rem;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 0.5rem;
              color: #fff;
              font-size: 0.9rem;
              transition: all 0.2s ease;
            ">View Code</a>
          ` : ''}
          ${project.live !== '#' ? `
            <a href="${project.live}" target="_blank" rel="noopener noreferrer" style="
              padding: 0.6rem 1.2rem;
              background: linear-gradient(135deg, #00d4ff, #a855f7);
              border-radius: 0.5rem;
              color: #fff;
              font-weight: 600;
              font-size: 0.9rem;
              transition: all 0.2s ease;
            ">Live Demo</a>
          ` : ''}
        </div>
      `;
    },

    showProjectDetail(html) {
      const modalBody = this.modal.querySelector('#modal-body');
      modalBody.innerHTML = html;
      this.modal.style.opacity = '1';
      this.modal.style.visibility = 'visible';
      document.body.style.overflow = 'hidden';
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     9. NAVIGATION SCROLL EFFECTS
     ══════════════════════════════════════════════════════════════════════════ */
  const NavigationEffects = {
    nav: null,
    lastScrollY: 0,

    init() {
      this.nav = document.querySelector('.nav');
      if (!this.nav) return;

      this.setupScrollBehavior();
      this.setupMobileMenu();
    },

    setupScrollBehavior() {
      let ticking = false;

      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              const scrollY = window.scrollY;

              // Add scrolled class for background
              this.nav.classList.toggle('nav--scrolled', scrollY > 50);

              // Hide/show nav on scroll direction
              if (scrollY > this.lastScrollY && scrollY > 300) {
                this.nav.style.transform = 'translateY(-100%)';
              } else {
                this.nav.style.transform = 'translateY(0)';
              }

              this.lastScrollY = scrollY;
              ticking = false;
            });
            ticking = true;
          }
        },
        { passive: true }
      );

      // Ensure nav transition is set
      this.nav.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease';
    },

    setupMobileMenu() {
      const toggle = document.querySelector('.nav-toggle');
      const links = document.querySelector('.nav__links');

      if (!toggle || !links) return;

      toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen);

        if (isOpen) {
          links.style.display = 'flex';
          links.style.flexDirection = 'column';
          links.style.position = 'absolute';
          links.style.top = '100%';
          links.style.left = '0';
          links.style.right = '0';
          links.style.padding = '1rem';
          links.style.background = 'rgba(10, 10, 15, 0.95)';
          links.style.backdropFilter = 'blur(20px)';
          links.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
        } else {
          links.style.display = '';
        }
      });
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     10. PERFORMANCE MONITOR
     ══════════════════════════════════════════════════════════════════════════ */
  const PerformanceMonitor = {
    init() {
      // Log Core Web Vitals if available
      if ('PerformanceObserver' in window) {
        try {
          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('[Perf] LCP:', Math.round(lastEntry.startTime), 'ms');
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          // First Input Delay
          const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
              console.log('[Perf] FID:', Math.round(entry.processingStart - entry.startTime), 'ms');
            });
          });
          fidObserver.observe({ type: 'first-input', buffered: true });

          // Cumulative Layout Shift
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            console.log('[Perf] CLS:', clsValue.toFixed(4));
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
          // PerformanceObserver not fully supported
        }
      }

      // Log when page is fully loaded
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            console.log('[Perf] Page Load:', Math.round(perfData.loadEventEnd - perfData.startTime), 'ms');
          }
        }, 0);
      });
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     INITIALIZATION
     ══════════════════════════════════════════════════════════════════════════ */
  function init() {
    // Core interaction engines
    HTMXEngine.init();
    ViewTransitions.init();
    CardTilt.init();
    ScrollReveal.init();
    ParallaxController.init();
    ParticleNetwork.init();
    SectionTracker.init();
    ProjectLoader.init();
    NavigationEffects.init();

    // Performance monitoring (dev only)
    if (location.hostname === 'localhost' || location.hostname.includes('dev')) {
      PerformanceMonitor.init();
    }

    // Expose API for external use
    window.KeyzPortfolio = {
      HTMXEngine,
      ViewTransitions,
      CardTilt,
      ScrollReveal,
      ParallaxController,
      ParticleNetwork,
      SectionTracker,
      ProjectLoader,
      NavigationEffects,
      CONFIG,
      SUPPORTS,
      Utils,
    };

    console.log(
      '%c⚡ Keyz Portfolio v2.0 %c— Advanced Interaction Engine Ready',
      'color: #00d4ff; font-weight: bold;',
      'color: rgba(255, 255, 255, 0.6);'
    );
    console.log('%cFeatures: HTMX • View Transitions • 3D Tilt • Parallax • Particles', 'color: rgba(255, 255, 255, 0.4); font-size: 0.85em;');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
