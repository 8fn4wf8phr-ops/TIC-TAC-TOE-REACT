// Lightweight, dependency-free confetti burst drawn on a temporary canvas.

export function fireConfetti() {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const colors = ['#c1652f', '#3b6e5e', '#e08148', '#f2a06a', '#6fbfa2'];
    const pieces = Array.from({ length: 140 }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: window.innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 9,
      vy: -(Math.random() * 8 + 4),
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 14,
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
    }));

    const gravity = 0.28;
    const drag = 0.995;
    let frame = 0;
    const maxFrames = 130;
    let rafId = null;

    function tick() {
      frame += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.vy += gravity;
        p.vx *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (frame < maxFrames) {
        rafId = requestAnimationFrame(tick);
      } else {
        canvas.remove();
        window.removeEventListener('resize', resize);
      }
    }

    window.addEventListener('resize', resize);
    rafId = requestAnimationFrame(tick);

    // Safety cleanup in case the tab is backgrounded and rAF stalls.
    setTimeout(() => {
      if (canvas.isConnected) canvas.remove();
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    }, 4000);
  } catch {
    /* confetti is decorative — fail silently */
  }
}
