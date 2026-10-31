(() => {
  const slider = document.querySelector('#koch-stage');
  const snowflake = document.querySelector('.koch-snowflake');
  if (!slider || !snowflake) return;

  const draw = (stage, progress = 1) => {
    let points = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
    for (let iteration = 0; iteration < stage; iteration++) {
      const next = [];
      const growth = iteration === stage - 1 ? progress : 1;
      points.forEach((start, index) => {
        if (index === points.length - 1) return;
        const end = points[index + 1];
        const dx = (end.x - start.x) / 3;
        const dy = (end.y - start.y) / 3;
        const first = { x: start.x + dx, y: start.y + dy };
        next.push(start, first, {
          x: first.x + dx / 2 + dy * Math.sqrt(3) / 2 * growth,
          y: first.y + dy / 2 - dx * Math.sqrt(3) / 2 * growth
        }, { x: start.x + 2 * dx, y: start.y + 2 * dy });
      });
      next.push(points[points.length - 1]);
      points = next;
    }
    snowflake.querySelector('path').setAttribute('d', points.map((point, index) =>
      `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`
    ).join(' '));
    snowflake.setAttribute('aria-label', `Koch curve with ${stage} recursions`);
    document.querySelector('#koch-stage-value').textContent = `Recursions: ${stage} / ${slider.value}`;
  };
  let frame = 0;
  const build = () => {
    cancelAnimationFrame(frame);
    const target = Number(slider.value);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || target === 0) {
      draw(target);
      return;
    }
    draw(0);
    const start = performance.now();
    const animate = now => {
      const elapsed = now - start;
      const recursion = Math.floor(Math.max(0, elapsed - 500) / 900) + 1;
      if (recursion > target) {
        draw(target);
        return;
      }
      if (elapsed >= 500) {
        const progress = Math.min(1, ((elapsed - 500) % 900) / 700);
        draw(recursion, progress * progress * (3 - 2 * progress));
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
  };
  slider.addEventListener('input', build);
  document.querySelector('#koch-rebuild').addEventListener('click', build);
  draw(0);
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      build();
      observer.disconnect();
    }
  }, { threshold: 0.35 });
  observer.observe(snowflake);
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame));
})();
