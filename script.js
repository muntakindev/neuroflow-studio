/* ============================================================
   NeuroFlow AI — script.js
   Interactive behavior, animations, and UI logic
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  // ── 1. Custom cursor ─────────────────────────────────────────
  const cursorDot  = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top  = mouseY + "px";
  });

  // Smooth trailing ring
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top  = ringY + "px";
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Scale ring on interactive elements
  document.querySelectorAll("a, button, .feature-card, .solution-card, .pricing-card").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursorRing.style.width  = "52px";
      cursorRing.style.height = "52px";
      cursorRing.style.borderColor = "rgba(124, 58, 237, 0.5)";
    });
    el.addEventListener("mouseleave", () => {
      cursorRing.style.width  = "32px";
      cursorRing.style.height = "32px";
      cursorRing.style.borderColor = "rgba(34, 211, 238, 0.4)";
    });
  });


  // ── 2. Navbar scroll effect ───────────────────────────────────
  const navbar = document.getElementById("navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });


  // ── 3. Mobile hamburger menu ──────────────────────────────────
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("mobile-open");
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("mobile-open");
    });
  });


  // ── 4. Hero particles ────────────────────────────────────────
  const particleContainer = document.getElementById("particles");
  const particleCount = 28;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement("div");
    p.classList.add("particle");

    const x   = Math.random() * 100;
    const y   = Math.random() * 100;
    const tx  = (Math.random() - 0.5) * 140;
    const ty  = -(Math.random() * 160 + 60);
    const dur = (Math.random() * 6 + 6).toFixed(1);
    const del = (Math.random() * 8).toFixed(1);
    const size = Math.random() > 0.7 ? "3px" : "2px";

    p.style.cssText = `
      left: ${x}%;
      top:  ${y}%;
      width: ${size};
      height: ${size};
      --tx: ${tx}px;
      --ty: ${ty}px;
      --dur: ${dur}s;
      --delay: ${del}s;
    `;

    particleContainer.appendChild(p);
  }


  // ── 5. Background canvas (subtle animated mesh) ───────────────
  const canvas = document.getElementById("bgCanvas");
  const ctx    = canvas.getContext("2d");

  let width, height;

  function resizeCanvas() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Mesh grid points that shift slightly over time
  const cols = 10;
  const rows = 8;
  const points = [];
  let tick = 0;

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      points.push({
        baseX: (c / cols) * window.innerWidth,
        baseY: (r / rows) * window.innerHeight,
        offsetX: Math.random() * Math.PI * 2,
        offsetY: Math.random() * Math.PI * 2,
        speed:  Math.random() * 0.3 + 0.1,
      });
    }
  }

  function getPoint(r, c) {
    const i = r * (cols + 1) + c;
    const p = points[i];
    return {
      x: p.baseX + Math.sin(tick * p.speed + p.offsetX) * 18,
      y: p.baseY + Math.sin(tick * p.speed * 0.8 + p.offsetY) * 14,
    };
  }

  function drawMesh() {
    ctx.clearRect(0, 0, width, height);
    tick += 0.005;

    ctx.strokeStyle = "rgba(124, 58, 237, 0.06)";
    ctx.lineWidth   = 1;

    // Horizontal lines
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const pt = getPoint(r, c);
        c === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    // Vertical lines
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        const pt = getPoint(r, c);
        r === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    requestAnimationFrame(drawMesh);
  }
  drawMesh();


  // ── 6. Scroll reveal (IntersectionObserver) ───────────────────
  const revealItems = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));


  // ── 7. Animated counter (hero stats) ─────────────────────────
  const counters = document.querySelectorAll(".stat-num");

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const rawText = el.innerText;

      // Parse numeric value from strings like "500+", "99.9%", "4.2×"
      const suffix = rawText.replace(/[\d.]/g, "");
      const target = parseFloat(rawText);
      const isDecimal = rawText.includes(".");
      const duration = 1400;
      const start = performance.now();

      function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        const current  = target * ease;

        el.innerText = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;

        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => counterObserver.observe(el));


  // ── 8. Tilt effect for solution cards ────────────────────────
  const tiltCards = document.querySelectorAll(".tilt-card");

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect   = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top  + rect.height / 2;
      const rotateX = ((e.clientY - centerY) / rect.height) * -10;
      const rotateY = ((e.clientX - centerX) / rect.width)  *  10;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateZ(0)";
    });
  });


  // ── 9. Testimonial slider ─────────────────────────────────────
  const track    = document.getElementById("testimonialTrack");
  const dotsWrap = document.getElementById("sliderDots");
  const prevBtn  = document.getElementById("prevBtn");
  const nextBtn  = document.getElementById("nextBtn");

  const cards = track ? track.querySelectorAll(".testi-card") : [];
  let currentSlide = 0;
  let slidesVisible = getSlidesVisible();
  let autoPlayTimer;

  function getSlidesVisible() {
    if (window.innerWidth < 680)  return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function totalSlides() {
    return Math.max(0, cards.length - slidesVisible);
  }

  // Build dots
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    for (let i = 0; i <= totalSlides(); i++) {
      const dot = document.createElement("div");
      dot.classList.add("slider-dot");
      if (i === currentSlide) dot.classList.add("active");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll(".slider-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide);
    });
  }

  function goTo(index) {
    currentSlide = Math.max(0, Math.min(index, totalSlides()));
    const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 0;
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    updateDots();
  }

  if (prevBtn) prevBtn.addEventListener("click", () => { goTo(currentSlide - 1); resetAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { goTo(currentSlide + 1); resetAutoPlay(); });

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      const next = currentSlide >= totalSlides() ? 0 : currentSlide + 1;
      goTo(next);
    }, 5000);
  }

  buildDots();
  resetAutoPlay();

  window.addEventListener("resize", () => {
    slidesVisible = getSlidesVisible();
    buildDots();
    goTo(Math.min(currentSlide, totalSlides()));
  });


  // ── 10. FAQ accordion ─────────────────────────────────────────
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer   = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Close all
      faqItems.forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });

      // Open this one if it was closed
      if (!isOpen) {
        item.classList.add("open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });


  // ── 11. Pricing toggle (monthly / yearly) ────────────────────
  const billingToggle = document.getElementById("billingToggle");
  const monthlyLabel  = document.getElementById("monthlyLabel");
  const yearlyLabel   = document.getElementById("yearlyLabel");
  const priceNums     = document.querySelectorAll(".price-num");

  let isYearly = false;

  if (billingToggle) {
    billingToggle.addEventListener("click", () => {
      isYearly = !isYearly;
      billingToggle.classList.toggle("on", isYearly);
      monthlyLabel.classList.toggle("active", !isYearly);
      yearlyLabel.classList.toggle("active", isYearly);

      priceNums.forEach((el) => {
        const target = isYearly
          ? parseInt(el.dataset.yearly)
          : parseInt(el.dataset.monthly);

        if (isNaN(target)) return;

        // Animate the number flip
        const current = parseInt(el.innerText);
        const steps   = 20;
        const step    = (target - current) / steps;
        let s = 0;

        const interval = setInterval(() => {
          s++;
          el.innerText = Math.round(current + step * s);
          if (s >= steps) {
            el.innerText = target;
            clearInterval(interval);
          }
        }, 16);
      });
    });
  }


  // ── 12. Dashboard chart bar animation ────────────────────────
  // Animate bar heights in hero dashboard on load
  const heroBars = document.querySelectorAll(".bar");

  heroBars.forEach((bar, i) => {
    bar.style.height = "0";
    setTimeout(() => {
      bar.style.transition = "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      bar.style.height = bar.style.getPropertyValue("--h") || "60%";
    }, 800 + i * 80);
  });


  // ── 13. Smooth active nav link on scroll ──────────────────────
  const sections  = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  function highlightNav() {
    let current = "";
    sections.forEach((section) => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.id;
      }
    });

    navAnchors.forEach((a) => {
      a.style.color = "";
      const href = a.getAttribute("href").replace("#", "");
      if (href === current) {
        a.style.color = "var(--white)";
      }
    });
  }

  window.addEventListener("scroll", highlightNav, { passive: true });


  // ── 14. Newsletter form micro-interaction ─────────────────────
  const newsletterBtn = document.querySelector(".newsletter-btn");
  const newsletterInput = document.querySelector(".newsletter-input");

  if (newsletterBtn && newsletterInput) {
    newsletterBtn.addEventListener("click", () => {
      const email = newsletterInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailRegex.test(email)) {
        newsletterInput.style.borderColor = "rgba(239, 68, 68, 0.5)";
        newsletterInput.focus();
        setTimeout(() => {
          newsletterInput.style.borderColor = "";
        }, 1800);
        return;
      }

      const original = newsletterBtn.innerText;
      newsletterBtn.innerText = "✓ Subscribed!";
      newsletterBtn.style.background = "linear-gradient(135deg, #059669, #047857)";
      newsletterInput.value = "";

      setTimeout(() => {
        newsletterBtn.innerText = original;
        newsletterBtn.style.background = "";
      }, 3000);
    });
  }


  // ── 15. Parallax on scroll for hero orbs ─────────────────────
  const heroOrbs = document.querySelectorAll(".orb");

  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    heroOrbs.forEach((orb, i) => {
      const speed = (i + 1) * 0.12;
      orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }, { passive: true });


  // ── 16. CTA button hover pulse effect ────────────────────────
  document.querySelectorAll(".glow-btn").forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      btn.style.animation = "none";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.animation = "";
    });
  });

});