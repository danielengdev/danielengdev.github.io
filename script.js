"use strict";

(() => {
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // Ações nos cards (favoritar / abrir link)
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      const iconBtn = target.closest?.(".icon-btn");
      if (iconBtn) {
        const action = iconBtn.getAttribute("data-action");
        if (action === "bookmark") {
          const pressed = iconBtn.getAttribute("aria-pressed") === "true";
          iconBtn.setAttribute("aria-pressed", String(!pressed));
          const icon = iconBtn.querySelector(".material-icons");
          if (icon) icon.textContent = pressed ? "bookmark_border" : "bookmark";
        }
        if (action === "more") {
          const card = iconBtn.closest?.(".post-card");
          const title = card?.querySelector?.(".post-title")?.textContent?.trim() || "Conteúdo";
          console.log(`Mais ações: ${title}`);
        }
        e.preventDefault();
        return;
      }

      const card = target.closest?.(".post-card");
      if (card && card instanceof HTMLElement) {
        const url = card.getAttribute("data-url");
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    { passive: false }
  );

  // Parallax leve para os gradientes (via CSS variables)
  if (!reducedMotion) {
    let raf = 0;
    window.addEventListener(
      "mousemove",
      (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        if (raf) return;
        raf = window.requestAnimationFrame(() => {
          document.documentElement.style.setProperty("--mx", `${x}px`);
          document.documentElement.style.setProperty("--my", `${y}px`);
          raf = 0;
        });
      },
      { passive: true }
    );
  }

  // Antigravity particles (canvas) – discreto e leve
  if (!reducedMotion) {
    const canvas = document.createElement("canvas");
    canvas.id = "ag-canvas";
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    document.body.prepend(canvas);

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = 0;
    let h = 0;

    const resize = () => {
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const rand = (min, max) => min + Math.random() * (max - min);

    const palette = [
      [102, 243, 255], // cyan
      [255, 79, 216], // magenta
      [139, 92, 246], // violet
      [234, 240, 255], // white-ish
    ];

    const count = Math.max(36, Math.min(90, Math.floor((w * h) / 22000)));
    const particles = Array.from({ length: count }, () => {
      const [r, g, b] = palette[Math.floor(Math.random() * palette.length)];
      return {
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.08, 0.08),
        vy: rand(-0.32, -0.08), // “antigravity”: sobe devagar
        radius: rand(0.8, 2.2),
        alpha: rand(0.12, 0.42),
        r,
        g,
        b,
      };
    });

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(33, now - last);
      last = now;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // wrap-around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 6);
        grd.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`);
        grd.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  }

  console.log("Antigravity theme carregado");
})();

