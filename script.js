/* ─────────────────────────────────────────────
   FARO Foundation — GiveWell-faithful JS
   ─────────────────────────────────────────────
   1. Navbar scroll
   2. Hamburger
   3. Empower tabs with auto-advancing timer bar
   4. Number counter animation
   5. Scroll fade-up
   6. Anchor smooth scroll
   ───────────────────────────────────────────── */

/* ── 1. Navbar scroll ── */
(function () {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

/* ── 2. Hamburger ── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-menu');
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    btn.classList.remove('open');
    menu.classList.remove('open');
  }));
})();

/* ── 3. Empower tabs with animated timer bar ── */
(function () {
  const TAB_DURATION = 4000; // ms per tab
  const tabs    = Array.from(document.querySelectorAll('.empower_link-block'));
  const panels  = Array.from(document.querySelectorAll('.empower_tab-panel'));
  const timers  = Array.from(document.querySelectorAll('.empower_tab_timer.red'));

  if (!tabs.length) return;

  let current = 0;
  let autoTimer = null;

  function activate(index) {
    tabs.forEach((t, i) => {
      t.classList.toggle('w--current', i === index);
      t.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    // Batch panel class changes (no reflow yet), then ONE reflow to restart animation
    panels.forEach((p, i) => {
      p.classList.toggle('hidden', i !== index);
      p.classList.remove('slide-in');
    });
    void panels[index].offsetWidth; // single reflow
    panels[index].classList.add('slide-in');

    // Batch timer resets, then ONE reflow to restart the active bar
    timers.forEach(bar => bar.classList.remove('animating'));
    void timers[index].offsetWidth; // single reflow
    timers[index].classList.add('animating');
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      current = (current + 1) % tabs.length;
      activate(current);
    }, TAB_DURATION);
  }

  // Manual click
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      current = i;
      activate(i);
      startAuto(); // restart timer from this tab
    });
  });

  // Init
  activate(0);
  startAuto();
})();

/* ── 3b. About sticky note follows mouse subtly ── */
(function () {
  if (typeof gsap === 'undefined') return;

  document.querySelectorAll('.empower_card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        x: relX * 12,
        y: relY * 10,
        rotateX: relY * -4,
        rotateY: relX * 5,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.42,
        ease: 'elastic.out(1, 0.65)',
        overwrite: 'auto',
      });
    });
  });
})();

/* ── 4. Number counter animation ── */
(function () {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target   = parseFloat(el.dataset.target) || 0;
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(ease(t) * target) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { runCounter(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
})();

/* ── 5. Scroll fade-up ── */
(function () {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ── 6. Smooth anchor scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) * 16 || 72;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
  });
});

/* ── 7. Vision GSAP pin + expand (mirrors GiveWell exactly) ── */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const contentBottom = document.querySelector('.vision_content-bottom');
  const largeImg      = document.querySelector('.vision_image-wrapper.is-image-large');
  const groupLeft     = document.querySelector('.vision_side--left');
  const groupRight    = document.querySelector('.vision_side--right');
  const overlayText   = document.querySelector('.vision_overlay-text');

  if (!contentBottom || !largeImg) return;

  // Set initial sizes (matching GiveWell exactly)
  gsap.set(largeImg, { width: '36vw', height: '72vh' });

  // Main scrub timeline — pin + expand
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: contentBottom,
      start: 'top top',
      end: 'bottom 60%',
      scrub: 0.5,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    }
  });

  tl.to(largeImg, {
    width: '100vw',
    height: '100vh',
    borderRadius: '0px',
    x: '-32vw',
    ease: 'power2.inOut',
  }, 0)
  .to(groupLeft,  { x: '-32vw', ease: 'power2.inOut' }, 0)
  .to(groupRight, { x:  '32vw', ease: 'power2.inOut' }, 0);

  // Overlay text fades in when centre hits mid-screen
  if (overlayText) {
    gsap.set(overlayText, { opacity: 0 });
    const chars = overlayText.textContent.split('');
    overlayText.innerHTML = chars.map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    const spans = overlayText.querySelectorAll('span');

    gsap.timeline({
      scrollTrigger: {
        trigger: contentBottom,
        start: 'center 48%',
        end: 'bottom bottom',
        toggleActions: 'play none reverse none',
      }
    }).to(overlayText, { opacity: 1, duration: 0.01 })
      .to(spans, {
        opacity: 1,
        duration: 1.5,
        stagger: { each: 1.5 / spans.length, from: 'random' },
        ease: 'power2.out',
      }, 0);

    gsap.set(overlayText, { opacity: 1 });
    gsap.set(spans, { opacity: 0 });
  }

  window.addEventListener('resize', () => ScrollTrigger.refresh());

  // Expose refs so the click handler can drive the same animation
  const spans = overlayText ? overlayText.querySelectorAll('span') : [];
  window._visionRefs = { largeImg, groupLeft, groupRight, overlayText, spans, tl };
})();

/* ── 8. Side photo hover — mirrors centre photo animation ── */
(function () {
  if (typeof gsap === 'undefined') return;

  document.querySelectorAll('.vision_side .vision_image-wrapper').forEach(wrapper => {
    const overlay = wrapper.querySelector('.vision_side-overlay');

    wrapper.addEventListener('mouseenter', () => {
      gsap.to(wrapper, {
        scale: 1.015,
        borderRadius: '14px',
        zIndex: 10,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0.22,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      gsap.to(wrapper, {
        scale: 1,
        borderRadius: '16px',
        zIndex: 1,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    });
  });
})();

/* ── 9. Project photo click — select side photo as the centre scroll image ── */
(function () {
  if (typeof gsap === 'undefined') return;

  const overlay = document.getElementById('vision-expand');
  const centreWrapper = document.querySelector('.vision_image-wrapper.is-image-large');
  const centrePhoto = document.querySelector('.vp-main');
  if (!overlay || !centreWrapper || !centrePhoto) return;

  let isSwapping = false;

  document.querySelectorAll('.vision_side .vision_image-wrapper').forEach(wrapper => {
    wrapper.style.cursor = 'pointer';
    wrapper.addEventListener('click', () => {
      if (isSwapping) return;

      const photo = wrapper.querySelector('.vision_placeholder');
      if (!photo) return;

      const photoStyle = getComputedStyle(photo);
      const centreStyle = getComputedStyle(centrePhoto);
      const sideBg = photoStyle.backgroundImage;
      const centreBg = centreStyle.backgroundImage;
      const sideRect = wrapper.getBoundingClientRect();
      const centreRect = centreWrapper.getBoundingClientRect();

      const centreClone = document.createElement('div');
      centreClone.className = 'vision-swap-clone';
      Object.assign(centreClone.style, {
        position: 'fixed',
        zIndex: '499',
        pointerEvents: 'none',
        backgroundImage: centreBg,
        backgroundPosition: centreStyle.backgroundPosition,
        backgroundSize: centreStyle.backgroundSize,
        backgroundRepeat: 'no-repeat',
      });
      document.body.appendChild(centreClone);

      overlay.style.backgroundImage = sideBg;
      gsap.set(overlay, {
        top: sideRect.top,
        left: sideRect.left,
        width: sideRect.width,
        height: sideRect.height,
        borderRadius: getComputedStyle(wrapper).borderRadius,
        backgroundPosition: photoStyle.backgroundPosition,
        backgroundSize: photoStyle.backgroundSize,
        opacity: 1,
        pointerEvents: 'none',
      });

      gsap.set(centreClone, {
        top: centreRect.top,
        left: centreRect.left,
        width: centreRect.width,
        height: centreRect.height,
        borderRadius: getComputedStyle(centreWrapper).borderRadius,
        opacity: 1,
      });

      isSwapping = true;

      gsap.timeline({
        defaults: { duration: 0.55, ease: 'power2.inOut' },
        onComplete: () => {
          centrePhoto.style.backgroundImage = sideBg;
          photo.style.backgroundImage = centreBg;
          centreClone.remove();
          gsap.set(overlay, {
            opacity: 0,
            clearProps: 'top,left,width,height,borderRadius,backgroundImage,backgroundPosition,backgroundSize',
          });
          isSwapping = false;
        },
      })
        .to(overlay, {
          top: centreRect.top,
          left: centreRect.left,
          width: centreRect.width,
          height: centreRect.height,
          borderRadius: getComputedStyle(centreWrapper).borderRadius,
        }, 0)
        .to(centreClone, {
          top: sideRect.top,
          left: sideRect.left,
          width: sideRect.width,
          height: sideRect.height,
          borderRadius: getComputedStyle(wrapper).borderRadius,
        }, 0);
    });
  });
})();

/* ── Footer form ── */
function handleFooterSubmit(e) {
  e.preventDefault();
  e.target.style.display = 'none';
  document.getElementById('footer-success').style.display = 'block';
}
