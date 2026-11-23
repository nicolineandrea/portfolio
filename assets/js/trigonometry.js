(() => {
  const phaseInput = document.querySelector('#trig-phase');
  const diagram = document.querySelector('.trig-circle');
  if (!phaseInput || !diagram) return;
  const msInput = document.querySelector('#trig-ms');
  const hzInput = document.querySelector('#trig-hz');
  const play = document.querySelector('#trig-play');
  let phase = Number(phaseInput.value);
  let frequency = Number(hzInput.value);
  let running = false;
  let frame = 0;
  let previous = 0;
  const wave = document.querySelector('.trig-wave');
  const wavePath = fn => Array.from({ length: 361 }, (_, degree) =>
    `${degree ? 'L' : 'M'}${20 + degree * 0.9},${62 - 42 * fn(degree * Math.PI / 180)}`
  ).join(' ');
  wave.querySelector('.trig-sine-wave').setAttribute('d', wavePath(Math.sin));
  wave.querySelector('.trig-cosine-wave').setAttribute('d', wavePath(Math.cos));
  const update = () => {
    const degrees = phase * 360;
    const angle = (phase % 1) * Math.PI * 2;
    const x = Math.cos(angle);
    const y = -Math.sin(angle);
    const cycleAngle = ((degrees % 360) + 360) % 360;
    const waveX = 20 + (cycleAngle === 0 && degrees > 0 ? 360 : cycleAngle) * 0.9;
    wave.querySelector('.trig-wave-cursor').setAttribute('d', `M${waveX} 16V108`);
    const sinePoint = wave.querySelector('.trig-wave-sine-point');
    sinePoint.setAttribute('cx', waveX);
    sinePoint.setAttribute('cy', 62 + 42 * y);
    const cosinePoint = wave.querySelector('.trig-wave-cosine-point');
    cosinePoint.setAttribute('cx', waveX);
    cosinePoint.setAttribute('cy', 62 - 42 * x);
    diagram.querySelector('.trig-radius').setAttribute('d', `M0 0L${x} ${y}`);
    diagram.querySelector('.trig-cosine').setAttribute('d', `M0 0H${x}`);
    diagram.querySelector('.trig-sine').setAttribute('d', `M${x} 0V${y}`);
    const point = diagram.querySelector('.trig-point');
    point.setAttribute('cx', x);
    point.setAttribute('cy', y);
    // Two arcs also represent a complete 360-degree turn correctly.
    const half = (cycleAngle === 0 && degrees !== 0 ? Math.PI * 2 : cycleAngle * Math.PI / 180) / 2;
    diagram.querySelector('.trig-angle-arc').setAttribute('d', degrees === 0 ? '' :
      `M0.25 0A0.25 0.25 0 0 0 ${0.25 * Math.cos(half)} ${-0.25 * Math.sin(half)}A0.25 0.25 0 0 0 ${0.25 * x} ${0.25 * y}`);
    const format = value => (Math.abs(value) < 0.005 ? 0 : value).toFixed(2);
    document.querySelector('#trig-values').textContent = `${format(degrees)}° · sin ${format(-y)} · cos ${format(x)}`;
    diagram.setAttribute('aria-label', `Angle ${format(degrees)} degrees; sine ${format(-y)}; cosine ${format(x)}`);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(frame);
    play.textContent = 'PLAY';
    play.setAttribute('aria-pressed', 'false');
  };
  phaseInput.addEventListener('input', () => {
    if (phaseInput.value === '' || !phaseInput.validity.valid) return;
    pause();
    phase = Number(phaseInput.value);
    update();
  });
  hzInput.addEventListener('input', () => {
    if (!hzInput.validity.valid || !(Number(hzInput.value) > 0)) return;
    frequency = Number(hzInput.value);
    msInput.value = String(Number((1000 / frequency).toPrecision(8)));
  });
  msInput.addEventListener('input', () => {
    if (!msInput.validity.valid || !(Number(msInput.value) > 0)) return;
    frequency = 1000 / Number(msInput.value);
    hzInput.value = String(Number(frequency.toPrecision(8)));
  });
  const tick = now => {
    if (!running) return;
    phase += (now - previous) / 1000 * frequency;
    previous = now;
    phaseInput.value = String(Number(phase.toFixed(4)));
    update();
    frame = requestAnimationFrame(tick);
  };
  play.addEventListener('click', () => {
    if (running) { pause(); return; }
    running = true;
    previous = performance.now();
    play.textContent = 'PAUSE';
    play.setAttribute('aria-pressed', 'true');
    frame = requestAnimationFrame(tick);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('pagehide', pause);
  update();
})();
