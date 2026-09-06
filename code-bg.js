// Animated code background (subtle "matrix"/code-rain + rotating code snippets)
// - respects prefers-reduced-motion
// - pauses when page is hidden
// - scales for devicePixelRatio for crisp rendering
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // don't run heavy animations

  // Create canvas if it doesn't exist
  let canvas = document.getElementById('code-bg');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'code-bg';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.4;mix-blend-mode:screen;';
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0;
  let height = 0;
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  // Characters & short code phrases to show
  const glyphs = ('{}()<> =+-*/;:,[]#@%$&|~^!?').split('');
  const codeSnippets = [
    'function init() {',
    'const pi = 3.14;',
    'let i = 0;',
    'console.log("Hello PPH")',
    'return true;',
    'await fetch(url)',
    'for (let x of xs) {',
    'class Prodigy {}',
    'if (ready) start();',
    'export default App;'
  ];

  // Columns for simple "falling characters" effect
  let columns = [];
  let animationId = null;
  let lastTime = 0;
  let snippets = [];

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Setup columns based on font size
    const fontSize = Math.max(12, Math.round(Math.min(width, height) / 80));
    ctx.font = `${fontSize}px monospace`;

    const cols = Math.floor(width / (fontSize * 0.6));
    columns = [];
    for (let i = 0; i < cols; i++) {
      columns.push({
        x: i * (fontSize * 0.6),
        y: Math.random() * height - height,
        speed: (0.6 + Math.random() * 1.4) * (fontSize / 12),
        fontSize
      });
    }
  }

  function spawnSnippet(x, y) {
    const text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    const size = Math.max(12, Math.round(Math.min(width, height) / 50)) + Math.random() * 8;
    snippets.push({
      x, y,
      text,
      size,
      age: 0,
      lifetime: 2500 + Math.random() * 3000,
      angle: (Math.random() * 40 - 20),
      spin: (Math.random() * 40 - 20),
      color: `rgba(180,230,255,${0.9 - Math.random() * 0.5})`
    });
  }

  function draw(timestamp) {
    // Throttle/fps smoothing
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, width, height);

    // Draw falling characters
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];

      const lines = 3;
      for (let s = 0; s < lines; s++) {
        const char = glyphs[(Math.floor(Math.random() * glyphs.length))];
        const alpha = 0.06 + Math.random() * 0.18;
        ctx.fillStyle = `rgba(120,200,255,${alpha})`;
        ctx.fillText(char, col.x, (col.y + s * col.fontSize));
      }

      col.y += col.speed * (dt / 16.67);

      if (Math.random() < 0.002) {
        spawnSnippet(col.x + (Math.random() * 40 - 20), Math.random() * height * 0.7);
      }

      if (col.y > height + 50) {
        col.y = -Math.random() * height;
        col.speed = (0.6 + Math.random() * 1.4) * (col.fontSize / 12);
      }
    }

    // Draw active snippets
    for (let i = snippets.length - 1; i >= 0; i--) {
      const s = snippets[i];
      s.age += dt;
      const progress = s.age / s.lifetime;
      const fade = Math.max(0, 1 - progress);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate((s.angle + progress * s.spin) * Math.PI / 180);
      ctx.globalAlpha = 0.9 * fade;
      ctx.fillStyle = s.color;
      ctx.font = `${s.size}px 'Courier New', monospace`;
      ctx.fillText(s.text, 0, 0);
      ctx.restore();

      if (s.age > s.lifetime) snippets.splice(i, 1);
    }

    animationId = window.requestAnimationFrame(draw);
  }

  // Pause when hidden to reduce CPU
  function handleVisibility() {
    if (document.hidden) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else {
      if (!animationId) {
        lastTime = 0;
        animationId = requestAnimationFrame(draw);
      }
    }
  }

  // Init
  resize();
  window.addEventListener('resize', () => {
    clearTimeout(window.__codeBgResizeTimer);
    window.__codeBgResizeTimer = setTimeout(resize, 120);
  }, { passive: true });

  document.addEventListener('visibilitychange', handleVisibility, false);
  handleVisibility();

  // Start animation
  if (!animationId) animationId = requestAnimationFrame(draw);

  // Expose API
  window.__codeBg = {
    pause: () => {
      if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
      canvas.style.display = 'none';
    },
    resume: () => {
      canvas.style.display = '';
      if (!animationId) animationId = requestAnimationFrame(draw);
    },
    setOpacity: (v) => { canvas.style.opacity = String(v); }
  };
})();