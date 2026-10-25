(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year
  const y = document.getElementById("y");
  if (y) y.textContent = String(new Date().getFullYear());

  // Sticky nav border
  const header = document.querySelector(".site-header");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // Card glow follow
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Reveal + slide-in on scroll
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal, .slide-card").forEach((el) => io.observe(el));

    // Pin items activate as they enter
    const pinIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.querySelectorAll(".pin-item").forEach((p) => p.classList.remove("active"));
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.55, rootMargin: "-20% 0px -35% 0px" }
    );
    document.querySelectorAll(".pin-item").forEach((el) => pinIo.observe(el));
  } else {
    document.querySelectorAll(".reveal, .slide-card").forEach((el) => el.classList.add("in"));
    const firstPin = document.querySelector(".pin-item");
    if (firstPin) firstPin.classList.add("active");
  }

  // Hero canvas — abstract AI core
  const canvas = document.getElementById("core-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let raf = 0;
  let t = 0;

  const nodes = [];
  const NODE_COUNT = 42;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initNodes() {
    nodes.length = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = (i / NODE_COUNT) * Math.PI * 2;
      const ring = 0.28 + (i % 3) * 0.12;
      nodes.push({
        baseAngle: angle,
        ring,
        speed: 0.15 + (i % 5) * 0.04,
        size: 1.5 + (i % 4) * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(now) {
    t = now * 0.001;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.42;

    // Soft outer glow
    const g0 = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.15);
    g0.addColorStop(0, "rgba(56,189,248,0.18)");
    g0.addColorStop(0.45, "rgba(99,102,241,0.08)");
    g0.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g0;
    ctx.fillRect(0, 0, w, h);

    // Core
    const pulse = 1 + Math.sin(t * 1.2) * 0.04;
    const coreR = R * 0.18 * pulse;
    const g1 = ctx.createRadialGradient(cx - coreR * 0.3, cy - coreR * 0.3, 0, cx, cy, coreR * 1.6);
    g1.addColorStop(0, "#e0f2fe");
    g1.addColorStop(0.35, "#38bdf8");
    g1.addColorStop(0.7, "#6366f1");
    g1.addColorStop(1, "rgba(3,7,18,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = g1;
    ctx.fill();

    // Orbit rings
    ctx.strokeStyle = "rgba(56,189,248,0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, R * (0.45 + i * 0.18), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Nodes + links
    const positions = nodes.map((n) => {
      const a = n.baseAngle + t * n.speed;
      const wobble = Math.sin(t * 1.5 + n.phase) * 0.03;
      const r = R * (n.ring + wobble);
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, size: n.size };
    });

    ctx.lineWidth = 1;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < R * 0.28) {
          const alpha = 1 - dist / (R * 0.28);
          ctx.strokeStyle = `rgba(56,189,248,${0.22 * alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    positions.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "#7dd3fc";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Scanning arc
    const sweep = t * 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.72, sweep, sweep + 0.9);
    ctx.strokeStyle = "rgba(34,211,238,0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (!reduceMotion) raf = requestAnimationFrame(draw);
  }

  resize();
  initNodes();
  if (reduceMotion) {
    draw(0);
  } else {
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener(
    "resize",
    () => {
      resize();
      if (reduceMotion) draw(0);
    },
    { passive: true }
  );

  // Mailto contact form helper
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (form.querySelector('[name="name"]') || {}).value || "";
      const biz = (form.querySelector('[name="business"]') || {}).value || "";
      const msg = (form.querySelector('[name="message"]') || {}).value || "";
      const subject = encodeURIComponent(`Nexora enquiry — ${name || "Website"}`);
      const body = encodeURIComponent(
        `Name: ${name}\nBusiness: ${biz}\n\n${msg}\n\n— sent from nexora website`
      );
      window.location.href = `mailto:shivam123tmf@gmail.com?subject=${subject}&body=${body}`;
    });
  }
})();
