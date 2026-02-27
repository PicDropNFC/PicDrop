(function () {
  const config = window.PICDROP_PRODUCT_CONFIG;
  if (!config) {
    console.error("Missing PICDROP_PRODUCT_CONFIG in config.js");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const previewTheme = params.get("theme");
  const activeTheme = previewTheme || config.themeId || "theme-01";

  document.documentElement.setAttribute("data-theme", activeTheme);

  const themeLink = document.createElement("link");
  themeLink.rel = "stylesheet";
  themeLink.href = `../assets/themes/${activeTheme}/theme.css`;
  themeLink.id = "themeStylesheet";
  document.head.appendChild(themeLink);

  const title = document.getElementById("pageTitle");
  const subtitle = document.getElementById("subtitleText");
  const details = document.getElementById("eventDetails");
  const badge = document.getElementById("eventBadge");
  const viewBtn = document.getElementById("viewBtn");
  const uploadBtn = document.getElementById("uploadBtn");

  title.textContent = config.productDisplayName || "Product 1";
  title.dataset.text = title.textContent;

  subtitle.textContent = "View Event moments together.";

  const detailRows = [config.coupleName, config.eventName, config.date].filter(Boolean);
  details.innerHTML = detailRows.map((item) => `<div>• ${item}</div>`).join("");

  if (config.eventName) {
    badge.textContent = config.eventName;
  }

  viewBtn.href = config.dropboxViewUrl || "#";
  uploadBtn.href = config.dropboxUploadUrl || "#";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const card = document.querySelector(".card");
  const canvas = document.getElementById("auroraCanvas");
  const orbsRoot = document.getElementById("floatingOrbs");
  const trailRoot = document.getElementById("cursorTrail");
  const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));

  const densityOptions = {
    max: { ribbons: 9, stars: 60, orbCount: 12, trailStep: 16 },
    balanced: { ribbons: 6, stars: 36, orbCount: 8, trailStep: 25 },
    calm: { ribbons: 3, stars: 18, orbCount: 5, trailStep: 50 }
  };

  let activeDensity = "max";

  function applyDensity(mode) {
    activeDensity = mode in densityOptions ? mode : "balanced";
    modeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.density === activeDensity);
    });
    mountOrbs(densityOptions[activeDensity].orbCount);
    setupAurora();
  }

  function mountOrbs(count) {
    if (!orbsRoot || prefersReducedMotion) return;

    orbsRoot.innerHTML = "";
    for (let i = 0; i < count; i += 1) {
      const orb = document.createElement("div");
      orb.className = "orb";
      orb.style.left = `${Math.random() * 100}%`;
      orb.style.top = `${Math.random() * 100}%`;
      orb.style.background = `radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.9), hsl(${
        Math.random() * 360
      }deg 95% 70% / 0.48), transparent 70%)`;
      orbsRoot.appendChild(orb);
    }
  }

  function setupAurora() {
    if (!canvas || prefersReducedMotion) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const scale = window.devicePixelRatio || 1;
    let time = 0;
    let rafId = 0;

    function sizeCanvas() {
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    }

    // Debounced resize so we don’t hammer reflows on mobile
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        sizeCanvas();
      }, 120);
    };

    sizeCanvas();
    window.removeEventListener("resize", canvas.__PICDROP_RESIZE__);
    canvas.__PICDROP_RESIZE__ = onResize;
    window.addEventListener("resize", onResize);

    const render = () => {
      const { ribbons, stars } = densityOptions[activeDensity];
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < ribbons; i += 1) {
        const hue = (time * 18 + i * 40) % 360;
        const y = window.innerHeight * (0.1 + i / (ribbons + 1));
        const amplitude = 20 + i * 6;

        context.beginPath();
        context.moveTo(0, y);
        for (let x = 0; x <= window.innerWidth; x += 24) {
          const wave = Math.sin((x + time * 120 + i * 40) * 0.005) * amplitude;
          context.lineTo(x, y + wave);
        }
        context.strokeStyle = `hsla(${hue}, 90%, 70%, 0.12)`;
        context.lineWidth = 22 - i * 1.8;
        context.shadowBlur = 24;
        context.shadowColor = `hsla(${hue}, 90%, 65%, 0.22)`;
        context.stroke();
      }

      for (let i = 0; i < stars; i += 1) {
        const x = (i * 97 + time * 46) % (window.innerWidth + 80) - 40;
        const y = (Math.sin(i * 9.2 + time * 1.4) * 0.5 + 0.5) * window.innerHeight;
        const radius = (Math.sin(time * 2 + i) + 1.4) * 1.4;
        context.beginPath();
        context.fillStyle = `hsla(${(i * 17 + time * 30) % 360}, 100%, 82%, 0.6)`;
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      time += 0.008;
      rafId = window.requestAnimationFrame(render);
    };

    if (window.__PICDROP_AURORA_RAF__) {
      window.cancelAnimationFrame(window.__PICDROP_AURORA_RAF__);
    }
    render();
    window.__PICDROP_AURORA_RAF__ = rafId;
  }

  function setupEntranceAnimations() {
    const nodes = Array.from(document.querySelectorAll("[data-animate]"));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach((node, index) => {
      node.style.transitionDelay = `${index * 70}ms`;
      observer.observe(node);
    });
  }

  function setupTilt() {
    if (!card || prefersReducedMotion) return;

    // Disable tilt on coarse pointers (most phones)
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return;

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 8;
      const rotateY = (x - 0.5) * 9;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
    });
  }

  function setupCursorTrail() {
    if (!trailRoot || prefersReducedMotion) return;

    let lastPoint = 0;
    window.addEventListener("pointermove", (event) => {
      const now = performance.now();
      if (now - lastPoint < densityOptions[activeDensity].trailStep) {
        return;
      }
      lastPoint = now;

      const dot = document.createElement("span");
      dot.className = "trail-dot";
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      dot.style.setProperty("--scale", String(0.8 + Math.random() * 1.2));
      trailRoot.appendChild(dot);

      window.setTimeout(() => {
        dot.remove();
      }, 700);
    });
  }

  function addTapRipple(el) {
    // lightweight ripple for touch feedback
    el.addEventListener("pointerdown", (e) => {
      // only for primary pointer
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.style.position = "absolute";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = "12px";
      ripple.style.height = "12px";
      ripple.style.borderRadius = "999px";
      ripple.style.transform = "translate(-50%, -50%) scale(1)";
      ripple.style.background = "radial-gradient(circle, rgba(255,255,255,.55), transparent 70%)";
      ripple.style.pointerEvents = "none";
      ripple.style.opacity = "0.9";
      ripple.style.filter = "blur(0px)";
      ripple.style.transition = "transform 520ms ease, opacity 520ms ease";
      el.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = "translate(-50%, -50%) scale(18)";
        ripple.style.opacity = "0";
      });

      window.setTimeout(() => ripple.remove(), 560);
    });
  }

  // Button behavior (your existing click delay + loading) + ripple
  [viewBtn, uploadBtn].forEach((button) => {
    addTapRipple(button);

    button.addEventListener("click", (event) => {
      event.preventDefault();
      const href = button.href;
      if (!href || href.endsWith("#")) {
        return;
      }

      button.classList.remove("is-loading");
      void button.offsetWidth;
      button.classList.add("is-loading");

      const eventName = button.getAttribute("data-analytics");
      window.PicDropAnalytics?.emit(eventName, {
        productDisplayName: config.productDisplayName,
        themeId: activeTheme
      });

      window.setTimeout(() => {
        window.open(href, "_blank", "noopener,noreferrer");
        button.classList.remove("is-loading");
      }, 900);
    });
  });

  if (previewTheme) {
    window.__PICDROP_DEBUG__ = true;
    window.PicDropAnalytics?.emit("theme_preview_active", { previewTheme });
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyDensity(button.dataset.density || "balanced");
    });
  });

  setupEntranceAnimations();
  setupTilt();
  setupCursorTrail();
  applyDensity(prefersReducedMotion ? "calm" : "max");
})();
