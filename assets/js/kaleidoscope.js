(() => {
  const canvas = document.querySelector('.kaleidoscope-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  const clear = canvas.closest('.drawing-playground').querySelector('.drawing-clear');
  const strokes = [];
  let active = null;
  let pointer = null;
  let width = 1;
  let height = 1;
  const render = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 2;
    context.strokeStyle = getComputedStyle(canvas).getPropertyValue('--page-accent').trim() || '#9673b5';
    const scale = Math.min(width, height);
    for (let sector = 0; sector < 6; sector++) {
      for (const mirror of [-1, 1]) {
        context.save();
        context.translate(width / 2, height / 2);
        context.rotate(sector * Math.PI / 3);
        context.scale(1, mirror);
        strokes.forEach(stroke => {
          context.beginPath();
          stroke.forEach((point, index) => {
            if (index === 0) context.moveTo(point.x * scale, point.y * scale);
            else context.lineTo(point.x * scale, point.y * scale);
          });
          if (stroke.length === 1) context.lineTo(stroke[0].x * scale + 0.01, stroke[0].y * scale);
          context.stroke();
        });
        context.restore();
      }
    }
  };
  const addPoint = event => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width, rect.height);
    active.push({ x: (event.clientX - rect.left - rect.width / 2) / scale, y: (event.clientY - rect.top - rect.height / 2) / scale });
    render();
  };
  canvas.addEventListener('pointerdown', event => {
    if (pointer !== null || event.button !== 0) return;
    pointer = event.pointerId;
    active = [];
    strokes.push(active);
    canvas.setPointerCapture(pointer);
    clear.hidden = false;
    clear.disabled = false;
    addPoint(event);
  });
  canvas.addEventListener('pointermove', event => {
    if (event.pointerId === pointer && active) addPoint(event);
  });
  const stop = () => { pointer = null; active = null; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
  canvas.addEventListener('lostpointercapture', stop);
  clear.addEventListener('click', () => {
    stop();
    strokes.length = 0;
    clear.hidden = true;
    clear.disabled = true;
    render();
  });
  new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    render();
  }).observe(canvas);
})();
