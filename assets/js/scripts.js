document.querySelectorAll('h1 .word').forEach(word => {
  const text = word.textContent;
  word.setAttribute('aria-label', text);
  word.textContent = '';

  [...text].forEach(character => {
    const letter = document.createElement('span');
    letter.className = 'letter';
    letter.setAttribute('aria-hidden', 'true');
    letter.textContent = character;
    word.appendChild(letter);
  });
});

const swappedImagePairs = new Set();

document.querySelectorAll('img[data-hover-src], img[data-hover-group], img[data-hover-options], img[data-swap-pair]').forEach(image => {
  const originalSource = image.getAttribute('src');
  const fixedHoverSource = image.dataset.hoverSrc;
  const hoverGroup = image.dataset.hoverGroup;
  const swapPair = image.dataset.swapPair;
  const swapPairImages = swapPair
    ? [...document.querySelectorAll(`img[data-swap-pair="${swapPair}"]`)]
    : [];
  const swapPairSources = swapPairImages.map(pairImage => pairImage.getAttribute('src'));
  const explicitHoverSources = image.dataset.hoverOptions
    ? image.dataset.hoverOptions.split(',').map(source => source.trim()).filter(Boolean)
    : [];
  const randomHoverSources = explicitHoverSources.length > 0
    ? explicitHoverSources
    : hoverGroup
      ? [...document.querySelectorAll(`img[data-hover-group="${hoverGroup}"]`)]
        .map(groupImage => groupImage.getAttribute('src'))
        .filter(source => source && source !== originalSource)
      : [];
  const interactionTarget = image.closest('.artwork-item') || image;

  [fixedHoverSource, ...randomHoverSources].filter(Boolean).forEach(source => {
    const hoverImage = new Image();
    hoverImage.src = source;
  });

  const showHoverImage = () => {
    if (swapPairImages.length === 2) {
      if (swappedImagePairs.has(swapPair)) {
        swapPairImages[0].setAttribute('src', swapPairSources[0]);
        swapPairImages[1].setAttribute('src', swapPairSources[1]);
        swappedImagePairs.delete(swapPair);
        return;
      }

      swapPairImages[0].setAttribute('src', swapPairSources[1]);
      swapPairImages[1].setAttribute('src', swapPairSources[0]);
      swappedImagePairs.add(swapPair);
      return;
    }

    const hoverSource = fixedHoverSource || randomHoverSources[
      Math.floor(Math.random() * randomHoverSources.length)
    ];

    if (!hoverSource) {
      return;
    }

    image.setAttribute('src', hoverSource);
  };

  const showOriginalImage = () => {
    if (swapPairImages.length === 2) {
      return;
    }

    image.setAttribute('src', originalSource);
  };

  interactionTarget.addEventListener('mouseenter', showHoverImage);
  interactionTarget.addEventListener('mouseleave', showOriginalImage);
  interactionTarget.addEventListener('focusin', showHoverImage);
  interactionTarget.addEventListener('focusout', showOriginalImage);
});

document.querySelectorAll('.artwork-gallery').forEach(gallery => {
  const creditLines = [...gallery.querySelectorAll('.artwork-credit-line')];

  const showArtworkCredit = event => {
    const artwork = event.target instanceof Element
      ? event.target.closest('.artwork-item')
      : null;

    if (artwork && gallery.contains(artwork)) {
      creditLines.forEach(line => {
        line.textContent = '';
      });

      const creditLine = gallery.querySelector(
        `.artwork-credit-${artwork.dataset.creditGroup}`
      );

      if (creditLine) {
        creditLine.textContent = artwork.dataset.credit || '';
      }
    }
  };

  const clearArtworkCredit = () => {
    creditLines.forEach(line => {
      line.textContent = '';
    });
  };

  gallery.addEventListener('pointerover', showArtworkCredit);
  gallery.addEventListener('pointerleave', clearArtworkCredit);
  gallery.addEventListener('focusin', showArtworkCredit);
  gallery.addEventListener('focusout', event => {
    if (!gallery.contains(event.relatedTarget)) {
      clearArtworkCredit();
    }
  });
});

const projectTitleSelector = '.project-section > h2, .project-section > h3';
const projectFrameSelector = '.project-section a, .project-section > h2, .project-section > h3';

document.querySelectorAll(projectTitleSelector).forEach(title => {
  if (!title.querySelector('a')) {
    title.tabIndex = 0;
  }
});

function frameProjectFromTarget(target) {
  const frameTarget = target instanceof Element
    ? target.closest(projectFrameSelector)
    : null;
  const project = frameTarget?.closest('.project-section');

  if (!project) {
    return false;
  }

  project.classList.add('is-project-framed');
  return true;
}

document.addEventListener('pointerdown', event => {
  frameProjectFromTarget(event.target);
}, { capture: true });

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }

  if (event.target instanceof Element && event.target.closest('a')) {
    frameProjectFromTarget(event.target);
    return;
  }

  if (frameProjectFromTarget(event.target)) {
    event.preventDefault();
  }
});

document.querySelectorAll('.interactive-title').forEach(title => {
  const words = title.textContent.trim().split(/\s+/);
  const fullTitle = words.join(' ');
  const isAboutTitle = Boolean(title.closest('.about-page'));

  title.setAttribute('aria-label', fullTitle);
  title.textContent = '';

  words.forEach((word, wordIndex) => {
    const wordElement = isAboutTitle && word.toLowerCase() === 'me'
      ? document.createElement('button')
      : document.createElement('span');

    wordElement.className = 'title-word';

    if (wordElement instanceof HTMLButtonElement) {
      wordElement.type = 'button';
      wordElement.classList.add('about-me-trigger');
      wordElement.setAttribute('aria-label', 'Funfacts about me');
      wordElement.setAttribute('aria-controls', 'funfacts-section');
      wordElement.setAttribute('aria-expanded', 'false');
    } else {
      wordElement.setAttribute('aria-hidden', 'true');
    }

    [...word].forEach(character => {
      const letter = document.createElement('span');
      letter.className = 'letter';
      letter.textContent = character;
      wordElement.appendChild(letter);
    });

    title.appendChild(wordElement);
    if (wordIndex < words.length - 1) {
      title.appendChild(document.createTextNode(' '));
    }
  });
});

document.querySelectorAll('.work-group-title').forEach(title => {
  const text = title.textContent.trim();
  title.setAttribute('aria-label', text);
  title.textContent = '';

  [...text].forEach((character, index) => {
    if (/\s/.test(character)) {
      title.appendChild(document.createTextNode(character));
      return;
    }

    const letter = document.createElement('span');

    letter.className = 'work-title-letter';
    letter.setAttribute('aria-hidden', 'true');
    letter.style.setProperty('--letter-index', index);
    letter.style.setProperty('--pixel-x', `${index % 2 === 0 ? -5 : 5}px`);
    letter.textContent = character;
    title.appendChild(letter);
  });
});

function syncSiteContentWidth() {
  let meter = document.querySelector('.site-content-width-meter');

  if (!meter) {
    meter = document.createElement('span');
    meter.className = 'work-group-title site-content-width-meter';
    meter.textContent = 'INSTALLATIONS';
    meter.setAttribute('aria-hidden', 'true');
    Object.assign(meter.style, {
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      display: 'block',
      width: 'fit-content',
      maxWidth: 'none',
      paddingBottom: '0',
      visibility: 'hidden',
      pointerEvents: 'none',
      transform: 'none'
    });
    document.body.appendChild(meter);
  }

  const wordWidth = Math.ceil(meter.getBoundingClientRect().width);

  if (wordWidth > 0) {
    document.documentElement.style.setProperty('--site-content-width', `min(100%, ${wordWidth}px)`);

    document.querySelectorAll('.work-group-title:not(.site-content-width-meter)').forEach(title => {
      const titleWidth = title.scrollWidth;
      const letters = [...title.querySelectorAll('.work-title-letter')];
      const letterGaps = Math.max(1, letters.length - 1);
      const stretchSpacing = titleWidth > 0 && wordWidth > titleWidth
        ? (wordWidth - titleWidth) / letterGaps
        : 0;

      title.style.setProperty('--title-stretch-spacing', `${stretchSpacing.toFixed(2)}px`);
    });
  }
}

syncSiteContentWidth();
window.addEventListener('resize', syncSiteContentWidth);
document.fonts?.ready.then(syncSiteContentWidth);

const reducedTitleMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('.effect-pixel').forEach(title => {
  let cleanupTimer;

  function clearFragments() {
    title.querySelectorAll('.pixel-fragment').forEach(fragment => fragment.remove());
  }

  function createFragments() {
    if (reducedTitleMotion.matches) {
      return;
    }

    clearTimeout(cleanupTimer);
    clearFragments();

    const titleRect = title.getBoundingClientRect();
    const letters = [...title.querySelectorAll('.work-title-letter')];

    letters.forEach((letter, letterIndex) => {
      const rect = letter.getBoundingClientRect();
      const pixelSize = Math.max(5, Math.min(12, rect.height / 7));
      const columns = Math.max(2, Math.round(rect.width / pixelSize));
      const rows = 4;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const fragment = document.createElement('span');
          const centerOffset = column - (columns - 1) / 2;
          const driftX = centerOffset * 20 + (letterIndex - (letters.length - 1) / 2) * 10;
          const driftY = 30 + row * 18 + Math.abs(centerOffset) * 7;
          const rotate = (letterIndex % 2 === 0 ? -1 : 1) * (12 + row * 8 + column * 3);

          fragment.className = 'pixel-fragment';
          fragment.style.left = `${rect.left - titleRect.left + column * pixelSize}px`;
          fragment.style.top = `${rect.top - titleRect.top + row * pixelSize * 1.35}px`;
          fragment.style.width = `${pixelSize}px`;
          fragment.style.height = `${pixelSize}px`;
          fragment.style.setProperty('--pixel-dx', `${driftX}px`);
          fragment.style.setProperty('--pixel-dy', `${driftY}px`);
          fragment.style.setProperty('--pixel-r', `${rotate}deg`);
          title.appendChild(fragment);
        }
      }
    });

    requestAnimationFrame(() => {
      title.classList.add('is-pixelated');
    });
  }

  function resetFragments() {
    title.classList.remove('is-pixelated');
    cleanupTimer = setTimeout(clearFragments, 320);
  }

  title.addEventListener('pointerenter', createFragments);
  title.addEventListener('pointerleave', resetFragments);
  title.addEventListener('focusin', createFragments);
  title.addEventListener('focusout', resetFragments);
});

document.querySelectorAll('.member-credit-line').forEach(creditLine => {
  const portrait = creditLine.closest('.band-portrait');

  if (!portrait) {
    return;
  }

  const bandImage = portrait.querySelector('.band-photo-frame .band-image');
  const originalPhoto = bandImage?.getAttribute('src') || '';
  const originalAlt = bandImage?.getAttribute('alt') || '';

  const resetPhoto = () => {
    if (!bandImage || !originalPhoto) {
      return;
    }

    bandImage.setAttribute('src', originalPhoto);
    bandImage.setAttribute('alt', originalAlt);
  };

  const showCredit = event => {
    const hotspot = event.target instanceof Element
      ? event.target.closest('.member-hotspot')
      : null;

    if (hotspot?.dataset.credit) {
      creditLine.textContent = hotspot.dataset.credit;
    }

    if (!bandImage) {
      return;
    }

    if (hotspot?.dataset.photo) {
      bandImage.setAttribute('src', hotspot.dataset.photo);
      bandImage.setAttribute('alt', hotspot.getAttribute('aria-label') || originalAlt);
    } else {
      resetPhoto();
    }
  };

  const clearCredit = event => {
    if (!event.relatedTarget || !portrait.contains(event.relatedTarget)) {
      creditLine.textContent = '';
      resetPhoto();
    }
  };

  portrait.addEventListener('pointerover', showCredit);
  portrait.addEventListener('focusin', showCredit);
  portrait.addEventListener('pointerleave', clearCredit);
  portrait.addEventListener('focusout', clearCredit);
});

const mainNav = document.querySelector('.main-nav');
const navigationEntry = performance.getEntriesByType?.('navigation')[0];
const isPageReload = navigationEntry
  ? navigationEntry.type === 'reload'
  : performance.navigation?.type === 1;

if (isPageReload) {
  if (window.location.hash) {
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const returnToPageTop = () => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  returnToPageTop();
  window.addEventListener('pageshow', returnToPageTop, { once: true });
}

const aboutNavLink = document.querySelector('.main-nav a[href="about-me.html"]');
const musicNavLink = document.querySelector('.main-nav a[href="bands-live.html"]');

function markAboutReturn() {
  if (!aboutNavLink) {
    return;
  }

  try {
    if (sessionStorage.getItem('returning-from-about') === 'true') {
      aboutNavLink.classList.add('about-returned');
      sessionStorage.removeItem('returning-from-about');
    }
  } catch (error) {
    // The navigation still works if storage is unavailable.
  }
}

if (document.body.classList.contains('about-page')) {
  try {
    sessionStorage.setItem('returning-from-about', 'true');
  } catch (error) {
    // The navigation still works if storage is unavailable.
  }
} else {
  markAboutReturn();
  window.addEventListener('pageshow', markAboutReturn);
}

function markMusicReturn() {
  if (!musicNavLink) {
    return;
  }

  try {
    if (sessionStorage.getItem('returning-from-music') === 'true') {
      musicNavLink.classList.add('music-returned');
      sessionStorage.removeItem('returning-from-music');
    }
  } catch (error) {
    // The navigation still works if storage is unavailable.
  }
}

if (document.body.classList.contains('music-page')) {
  try {
    sessionStorage.setItem('returning-from-music', 'true');
  } catch (error) {
    // The navigation still works if storage is unavailable.
  }
} else {
  markMusicReturn();
  window.addEventListener('pageshow', markMusicReturn);
}

const micToggle = document.querySelector('.mic-toggle');

if (micToggle) {
  const micMeter = document.querySelector('.mic-meter');
  const micWave = document.querySelector('.mic-wave');
  const micWaveContext = micWave.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let audioContext;
  let microphoneStream;
  let microphoneAnimation;
  let microphoneActive = false;
  let displayedLevel = 0;
  let displayedBrightness = 0.2;
  let texturePhase = 0;
  let lastVisualUpdate = 0;
  const recordingHistory = [];

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function calculateBrightness(frequencyData) {
    let magnitudeTotal = 0;
    let weightedFrequency = 0;
    const nyquist = audioContext.sampleRate / 2;

    for (let index = 1; index < frequencyData.length; index++) {
      const magnitude = frequencyData[index];
      const frequency = index / frequencyData.length * nyquist;
      magnitudeTotal += magnitude;
      weightedFrequency += frequency * magnitude;
    }

    if (magnitudeTotal === 0) {
      return 0.15;
    }

    const centroid = weightedFrequency / magnitudeTotal;
    return clamp((centroid - 250) / 3200, 0, 1);
  }

  function calculateSampleTexture(samples) {
    const quarter = Math.floor(samples.length / 4);
    const texture = (
      samples[quarter] -
      samples[quarter * 2] +
      samples[quarter * 3]
    ) * 1.5;

    return clamp(texture, -1, 1);
  }

  function drawWaveSide(direction, center, height, spacing) {
    if (recordingHistory.length === 0) {
      return;
    }

    const points = recordingHistory.map((entry, index) => ({
      x: index * spacing,
      y: center + direction * entry.level * height * 0.43
    }));

    micWaveContext.beginPath();
    micWaveContext.moveTo(points[0].x, points[0].y);

    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const current = points[index];
      const midpointX = (previous.x + current.x) / 2;
      const midpointY = (previous.y + current.y) / 2;
      micWaveContext.quadraticCurveTo(previous.x, previous.y, midpointX, midpointY);
    }

    const finalPoint = points[points.length - 1];
    micWaveContext.lineTo(finalPoint.x, finalPoint.y);
    micWaveContext.stroke();
  }

  function drawRecordingLine() {
    const width = micWave.clientWidth;
    const height = micWave.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const canvasWidth = Math.round(width * pixelRatio);
    const canvasHeight = Math.round(height * pixelRatio);

    if (width === 0 || height === 0) {
      return;
    }

    if (micWave.width !== canvasWidth || micWave.height !== canvasHeight) {
      micWave.width = canvasWidth;
      micWave.height = canvasHeight;
    }

    const spacing = reducedMotion.matches ? 8 : 4;
    const maximumPoints = Math.ceil(width / spacing) + 1;

    while (recordingHistory.length > maximumPoints) {
      recordingHistory.shift();
    }

    micWaveContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    micWaveContext.clearRect(0, 0, width, height);
    micWaveContext.lineWidth = 1.35;
    micWaveContext.lineCap = 'round';
    micWaveContext.lineJoin = 'round';
    micWaveContext.strokeStyle = '#111111';

    const center = height / 2;
    drawWaveSide(-1, center, height, spacing);
    drawWaveSide(1, center, height, spacing);

    if (microphoneActive && recordingHistory.length > 0) {
      const newestIndex = recordingHistory.length - 1;
      const newestLevel = recordingHistory[newestIndex].level;
      const newestX = newestIndex * spacing;
      const upperY = center - newestLevel * height * 0.43;
      const lowerY = center + newestLevel * height * 0.43;

      micWaveContext.beginPath();
      micWaveContext.moveTo(newestX, upperY);
      micWaveContext.lineTo(newestX, lowerY);
      micWaveContext.stroke();
    }
  }

  function updateMicrophone(analyser, samples, frequencyData, timestamp) {
    analyser.getFloatTimeDomainData(samples);
    analyser.getByteFrequencyData(frequencyData);

    let sum = 0;
    for (const sample of samples) {
      sum += sample * sample;
    }

    const rms = Math.sqrt(sum / samples.length);
    const targetLevel = Math.min(1, Math.max(0, rms - 0.005) * 17);
    const targetBrightness = rms > 0.01
      ? calculateBrightness(frequencyData)
      : 0.15;
    const levelResponse = targetLevel > displayedLevel ? 0.13 : 0.04;

    displayedLevel += (targetLevel - displayedLevel) * levelResponse;
    displayedBrightness += (targetBrightness - displayedBrightness) * 0.04;
    micMeter.setAttribute('aria-valuenow', String(Math.round(displayedLevel * 100)));

    const visualInterval = reducedMotion.matches ? 180 : 40;
    if (timestamp - lastVisualUpdate >= visualInterval) {
      const sampleTexture = calculateSampleTexture(samples);
      texturePhase += reducedMotion.matches
        ? 0.06
        : 0.12 + displayedBrightness * 0.16;
      const frequencyTexture = Math.sin(texturePhase) * (
        0.01 + displayedBrightness * 0.02
      );
      const organicTexture = sampleTexture * 0.02;
      const texturedLevel = clamp(
        displayedLevel * (1 + frequencyTexture + organicTexture),
        0,
        1
      );

      recordingHistory.push({ level: texturedLevel });
      drawRecordingLine();
      lastVisualUpdate = timestamp;
    }

    microphoneAnimation = requestAnimationFrame(nextTimestamp => {
      updateMicrophone(analyser, samples, frequencyData, nextTimestamp);
    });
  }

  async function startMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      micToggle.textContent = 'MIC UNAVAILABLE';
      return;
    }

    micToggle.disabled = true;

    try {
      microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error('Web Audio is unavailable');
      }

      audioContext = new AudioContextClass();
      await audioContext.resume();

      const source = audioContext.createMediaStreamSource(microphoneStream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.88;
      const samples = new Float32Array(analyser.fftSize);
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);

      microphoneActive = true;
      lastVisualUpdate = 0;
      micToggle.textContent = 'SOUND OFF';
      microphoneAnimation = requestAnimationFrame(timestamp => {
        updateMicrophone(analyser, samples, frequencyData, timestamp);
      });
    } catch (error) {
      microphoneStream?.getTracks().forEach(track => track.stop());
      microphoneStream = undefined;
      await audioContext?.close().catch(() => {});
      audioContext = undefined;
      microphoneActive = false;
      micToggle.textContent = 'MIC DENIED';
    } finally {
      micToggle.disabled = false;
    }
  }

  async function stopMicrophone() {
    cancelAnimationFrame(microphoneAnimation);
    microphoneStream?.getTracks().forEach(track => track.stop());
    await audioContext?.close().catch(() => {});

    microphoneStream = undefined;
    audioContext = undefined;
    microphoneActive = false;
    displayedLevel = 0;
    micMeter.setAttribute('aria-valuenow', '0');
    micToggle.textContent = 'SOUND ON';
    drawRecordingLine();
  }

  micToggle.addEventListener('click', () => {
    if (microphoneActive) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  });

  window.addEventListener('keydown', event => {
    const target = event.target;
    const isEditable = target instanceof HTMLElement && (
      target.isContentEditable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT'
    );

    if (event.code !== 'Space' || event.repeat || isEditable) {
      return;
    }

    event.preventDefault();
    if (!micToggle.disabled) {
      micToggle.click();
    }
  });

  window.addEventListener('resize', drawRecordingLine);
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(microphoneAnimation);
    microphoneStream?.getTracks().forEach(track => track.stop());
  });
}

const drawingCanvas = document.querySelector('.about-drawing');

const musicCopy = document.querySelector('.music-page .subpage-copy');

if (musicCopy) {
  musicCopy.querySelectorAll('p').forEach(paragraph => {
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      if (!walker.currentNode.parentElement.closest('.album-title, .band-link')) {
        textNodes.push(walker.currentNode);
      }
    }

    textNodes.forEach(textNode => {
      const fragment = document.createDocumentFragment();
      const parts = textNode.textContent.split(/(\s+)/);

      parts.forEach(part => {
        if (!part || /^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }

        const word = document.createElement('span');
        word.className = 'music-word';
        word.textContent = part;
        fragment.appendChild(word);
      });

      textNode.replaceWith(fragment);
    });
  });

  const discoverAlbum = event => {
    if (
      event.target instanceof Element &&
      event.target.matches('.album-title, .band-link')
    ) {
      event.target.classList.add('is-discovered');
    }
  };

  musicCopy.addEventListener('pointerover', discoverAlbum);
  musicCopy.addEventListener('focusin', discoverAlbum);
}

document.querySelectorAll('.press-kit-link').forEach(pressKitLink => {
  pressKitLink.addEventListener('click', () => {
    pressKitLink.classList.add('is-discovered');
  });
});

if (drawingCanvas) {
  const aboutCopyElement = document.querySelector('.about-copy');

  function wrapAboutCopyWords() {
    aboutCopyElement.querySelectorAll('p').forEach(paragraph => {
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
      const textNodes = [];

      while (walker.nextNode()) {
        if (!walker.currentNode.parentElement.closest('.keyword, .future-link, .about-word')) {
          textNodes.push(walker.currentNode);
        }
      }

      textNodes.forEach(textNode => {
        const fragment = document.createDocumentFragment();
        const parts = textNode.textContent.split(/(\s+)/);

        parts.forEach(part => {
          if (!part || /^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
            return;
          }

          const word = document.createElement('span');
          word.className = 'about-word';
          word.textContent = part;
          fragment.appendChild(word);
        });

        textNode.replaceWith(fragment);
      });
    });
  }

  wrapAboutCopyWords();

  document.querySelector('.about-copy').addEventListener('pointerover', event => {
    if (event.target instanceof Element && event.target.matches('.keyword')) {
      event.target.classList.add('is-discovered');
    }

    if (event.target instanceof Element && event.target.matches('.future-link')) {
      event.target.classList.add('is-visited');
    }
  });

  document.querySelector('.about-copy').addEventListener('focusin', event => {
    if (event.target instanceof Element && event.target.matches('.keyword')) {
      event.target.classList.add('is-discovered');
    }

    if (event.target instanceof Element && event.target.matches('.future-link')) {
      event.target.classList.add('is-visited');
    }
  });

  const aboutMeTrigger = document.querySelector('.about-me-trigger');
  const funfactsSection = document.querySelector('.funfacts-section');
  const funfactsSlide = document.querySelector('.funfacts-slide');
  const funfactsNext = document.querySelector('.funfacts-next');
  const allFunfacts = [
    'I like dinosaurs.',
    'As a child, I collected insects and let them live in my bedside table.',
    'My favourite animal is the frog.',
    'My cat is not my cat. She is my daughter.',
    'In kindergarten, I was convinced I would play the trumpet.',
    'I once broke my foot in three places.',
    'I once split a tooth in half with chewing gum.',
    'I can tattoo.',
    'I can spell any word backwards in seconds.',
    'I hate caramel.',
    'I love lava lamps.',
    'I am a night owl.',
    'I live vegetarian, sometimes vegan.',
    'I could live on spaghetti.',
    'I once raised a newborn goat.',
    'If I had not become a musician, I would probably be a vet or a mathematician.',
    'I think I can recreate anything that is explained on YouTube. I never finish watching the video before I start.',
    'I never read instruction manuals.',
    'I have an entire list of ways to destroy glasses and phones.',
    'I talk too much and too fast sometimes.',
    'I talk in my sleep.',
    'Romansh is my first language.',
    'I am allergic to the adhesive on plasters.',
    'I love thrift stores.',
    'I make my own jewellery.',
    'I do not trust people who do not like animals.',
    'I am always stressed and always bored at the same time.'
  ];

  let selectedFunfacts = [];
  let funfactIndex = 0;

  if (aboutMeTrigger && funfactsSection) {
    const chooseFunfacts = () => {
      const shuffledFacts = [...allFunfacts];

      for (let index = shuffledFacts.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledFacts[index], shuffledFacts[randomIndex]] = [shuffledFacts[randomIndex], shuffledFacts[index]];
      }

      return shuffledFacts;
    };

    const renderFunfact = () => {
      if (selectedFunfacts.length === 0) {
        funfactsSlide.textContent = '';

        if (funfactsNext) {
          funfactsNext.hidden = true;
        }

        return;
      }

      funfactsSlide.textContent = selectedFunfacts[funfactIndex];

      if (funfactsNext) {
        funfactsNext.hidden = false;
      }
    };

    const revealFunfacts = () => {
      if (!funfactsSection.hidden) {
        return;
      }

      funfactsSection.hidden = false;
      requestAnimationFrame(() => {
        funfactsSection.classList.add('is-visible');
        window.dispatchEvent(new CustomEvent('aboutcopychange'));
      });
    };

    aboutMeTrigger.addEventListener('click', () => {
      if (selectedFunfacts.length === 0 || funfactsSection.hidden) {
        selectedFunfacts = chooseFunfacts();
        funfactIndex = 0;
      }

      renderFunfact();
      revealFunfacts();
      aboutMeTrigger.classList.add('is-discovered');
      aboutMeTrigger.setAttribute('aria-expanded', 'true');
    });

    funfactsNext?.addEventListener('click', () => {
      if (selectedFunfacts.length === 0) {
        return;
      }

      if (funfactIndex === selectedFunfacts.length - 1) {
        funfactsSection.classList.remove('is-visible');
        aboutMeTrigger.classList.remove('is-discovered');
        aboutMeTrigger.setAttribute('aria-expanded', 'false');

        window.setTimeout(() => {
          funfactsSection.hidden = true;
          selectedFunfacts = [];
          funfactIndex = 0;
          window.dispatchEvent(new CustomEvent('aboutcopychange'));
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }, 220);
        return;
      }

      funfactIndex += 1;
      funfactsSlide.classList.add('is-changing');

      window.setTimeout(() => {
        renderFunfact();
        funfactsSlide.classList.remove('is-changing');
      }, 100);
    });
  }

  const drawingContext = drawingCanvas.getContext('2d');
  const drawingClear = document.querySelector('.drawing-clear');
  const aboutPage = document.querySelector('.about-page');
  const aboutContent = document.querySelector('.subpage');
  const aboutCopy = document.querySelector('.about-copy');
  const strokes = [];

  let activePointer = null;
  let activeStroke = null;
  let pendingStartPoint = null;
  let strokeStarted = false;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let resizeFrame;

  function syncDrawingClear() {
    const hasDrawing = strokes.some(stroke => stroke.length > 1);
    drawingClear.disabled = !hasDrawing;
    drawingClear.hidden = !hasDrawing;
  }

  function configureDrawingContext() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawingContext.lineWidth = 5;
    drawingContext.lineCap = 'round';
    drawingContext.lineJoin = 'round';
    drawingContext.strokeStyle = getComputedStyle(aboutPage)
      .getPropertyValue('--about-accent').trim() || '#ff34b3';
  }

  function renderDrawing() {
    drawingContext.setTransform(1, 0, 0, 1, 0, 0);
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    configureDrawingContext();

    strokes.forEach(stroke => {
      if (stroke.length === 0) {
        return;
      }

      drawingContext.beginPath();
      drawingContext.moveTo(stroke[0].x, stroke[0].y);

      if (stroke.length === 1) {
        drawingContext.lineTo(stroke[0].x + 0.01, stroke[0].y + 0.01);
      } else {
        stroke.slice(1).forEach(point => {
          drawingContext.lineTo(point.x, point.y);
        });
      }

      drawingContext.stroke();
    });
  }

  function resetDrawing() {
    strokes.length = 0;
    activePointer = null;
    activeStroke = null;
    pendingStartPoint = null;
    strokeStarted = false;
    aboutPage.classList.remove('is-drawing');
    drawingContext.setTransform(1, 0, 0, 1, 0, 0);
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    syncDrawingClear();
  }

  function measureFunfactsRect() {
    if (!funfactsSection) {
      return null;
    }

    if (!funfactsSection.hidden) {
      return funfactsSection.getBoundingClientRect();
    }

    const previousVisibility = funfactsSection.style.visibility;
    const previousPointerEvents = funfactsSection.style.pointerEvents;

    funfactsSection.hidden = false;
    funfactsSection.style.visibility = 'hidden';
    funfactsSection.style.pointerEvents = 'none';

    const rect = funfactsSection.getBoundingClientRect();

    funfactsSection.hidden = true;
    funfactsSection.style.visibility = previousVisibility;
    funfactsSection.style.pointerEvents = previousPointerEvents;

    return rect.width && rect.height ? rect : null;
  }

  function createIntroDrawing() {
    resetDrawing();

    const stroke = [];
    const segmentCount = 6 + Math.floor(Math.random() * 4);
    const margin = Math.min(canvasWidth, canvasHeight) * 0.08;
    const copyRect = aboutCopy?.getBoundingClientRect();
    const funfactsRect = measureFunfactsRect();
    const forbiddenAreas = [copyRect, funfactsRect].filter(Boolean).map(rect => ({
      left: rect.left + window.scrollX - 34,
      top: rect.top + window.scrollY - 30,
      right: rect.right + window.scrollX + 34,
      bottom: rect.bottom + window.scrollY + 30
    }));

    function clampPoint(point) {
      return {
        x: Math.min(canvasWidth - margin, Math.max(margin, point.x)),
        y: Math.min(canvasHeight - margin, Math.max(margin, point.y))
      };
    }

    function avoidsText(point) {
      return !forbiddenAreas.some(area => (
        point.x >= area.left &&
        point.x <= area.right &&
        point.y >= area.top &&
        point.y <= area.bottom
      ));
    }

    function segmentAvoidsText(startPoint, endPoint) {
      const sampleCount = 18;

      for (let sample = 1; sample <= sampleCount; sample++) {
        const progress = sample / sampleCount;
        const point = {
          x: startPoint.x + (endPoint.x - startPoint.x) * progress,
          y: startPoint.y + (endPoint.y - startPoint.y) * progress
        };

        if (!avoidsText(point)) {
          return false;
        }
      }

      return true;
    }

    function moveAwayFromText(point) {
      const nextPoint = clampPoint(point);

      if (avoidsText(nextPoint)) {
        return nextPoint;
      }

      const activeArea = forbiddenAreas.find(area => (
        nextPoint.x >= area.left &&
        nextPoint.x <= area.right &&
        nextPoint.y >= area.top &&
        nextPoint.y <= area.bottom
      ));

      if (!activeArea) {
        return nextPoint;
      }

      const exits = [
        { x: activeArea.left - margin * 0.45, y: nextPoint.y },
        { x: activeArea.right + margin * 0.45, y: nextPoint.y },
        { x: nextPoint.x, y: activeArea.top - margin * 0.45 },
        { x: nextPoint.x, y: activeArea.bottom + margin * 0.45 }
      ].map(clampPoint).filter(avoidsText);

      return exits.reduce((closest, candidate) => {
        const closestDistance = Math.hypot(closest.x - nextPoint.x, closest.y - nextPoint.y);
        const candidateDistance = Math.hypot(candidate.x - nextPoint.x, candidate.y - nextPoint.y);
        return candidateDistance < closestDistance ? candidate : closest;
      }, exits[0] || nextPoint);
    }

    function randomPoint() {
      let point = { x: margin, y: margin };

      for (let attempt = 0; attempt < 16; attempt++) {
        point = {
          x: margin + Math.random() * Math.max(1, canvasWidth - margin * 2),
          y: margin + Math.random() * Math.max(1, canvasHeight - margin * 2)
        };

        if (avoidsText(point)) {
          return clampPoint(point);
        }
      }

      return moveAwayFromText(point);
    }

    function sideOfText(point) {
      if (forbiddenAreas.length === 0) {
        return 'free';
      }

      const nearestArea = forbiddenAreas.reduce((nearest, area) => {
        const nearestDx = Math.max(nearest.left - point.x, 0, point.x - nearest.right);
        const nearestDy = Math.max(nearest.top - point.y, 0, point.y - nearest.bottom);
        const areaDx = Math.max(area.left - point.x, 0, point.x - area.right);
        const areaDy = Math.max(area.top - point.y, 0, point.y - area.bottom);
        return Math.hypot(areaDx, areaDy) < Math.hypot(nearestDx, nearestDy)
          ? area
          : nearest;
      }, forbiddenAreas[0]);

      const distances = [
        { side: 'left', value: Math.abs(point.x - nearestArea.left) },
        { side: 'right', value: Math.abs(point.x - nearestArea.right) },
        { side: 'top', value: Math.abs(point.y - nearestArea.top) },
        { side: 'bottom', value: Math.abs(point.y - nearestArea.bottom) }
      ];

      if (point.x < nearestArea.left) {
        return 'left';
      }

      if (point.x > nearestArea.right) {
        return 'right';
      }

      if (point.y < nearestArea.top) {
        return 'top';
      }

      if (point.y > nearestArea.bottom) {
        return 'bottom';
      }

      return distances.sort((a, b) => a.value - b.value)[0].side;
    }

    function randomPointNear(point) {
      const side = sideOfText(point);

      for (let attempt = 0; attempt < 14; attempt++) {
        const candidate = randomPoint();

        if (sideOfText(candidate) === side || Math.random() > 0.48) {
          return candidate;
        }
      }

      return randomPoint();
    }

    let { x, y } = randomPoint();

    stroke.push({ x, y });

    for (let segment = 0; segment < segmentCount; segment++) {
      const segmentType = Math.random();
      const pointsInSegment = 7 + Math.floor(Math.random() * 8);
      const target = randomPointNear({ x, y });
      const targetX = target.x;
      const targetY = target.y;
      const loopRadius = 24 + Math.random() * 58;
      const zigzagSize = 18 + Math.random() * 44;
      const loopTurns = 1 + Math.random() * 1.5;

      for (let index = 1; index <= pointsInSegment; index++) {
        const progress = index / pointsInSegment;
        const baseX = x + (targetX - x) * progress;
        const baseY = y + (targetY - y) * progress;
        let offsetX = 0;
        let offsetY = 0;

        if (segmentType < 0.38) {
          const angle = progress * Math.PI * 2 * loopTurns;
          offsetX = Math.cos(angle) * loopRadius * Math.sin(progress * Math.PI);
          offsetY = Math.sin(angle) * loopRadius * Math.sin(progress * Math.PI);
        } else if (segmentType < 0.72) {
          const zigzag = index % 2 === 0 ? 1 : -1;
          const angle = Math.atan2(targetY - y, targetX - x) + Math.PI / 2;
          offsetX = Math.cos(angle) * zigzagSize * zigzag;
          offsetY = Math.sin(angle) * zigzagSize * zigzag;
        } else {
          offsetX = Math.sin(progress * Math.PI * 3) * zigzagSize;
          offsetY = Math.cos(progress * Math.PI * 2.4) * loopRadius * 0.5;
        }

        let nextPoint = moveAwayFromText({
          x: baseX + offsetX,
          y: baseY + offsetY
        });

        if (!segmentAvoidsText(stroke[stroke.length - 1], nextPoint)) {
          for (let attempt = 0; attempt < 10; attempt++) {
            const alternativePoint = moveAwayFromText(randomPointNear(stroke[stroke.length - 1]));

            if (segmentAvoidsText(stroke[stroke.length - 1], alternativePoint)) {
              nextPoint = alternativePoint;
              break;
            }
          }
        }

        stroke.push(nextPoint);
      }

      ({ x, y } = stroke[stroke.length - 1]);
    }

    strokes.push(stroke);
    renderDrawing();
    syncDrawingClear();
  }

  function resizeDrawingCanvas(options = {}) {
    const shouldScaleStrokes = options.scaleStrokes === true;
    const nextWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const nextHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);

    if (nextWidth === canvasWidth && nextHeight === canvasHeight) {
      return;
    }

    if (shouldScaleStrokes && canvasWidth && canvasHeight) {
      const scaleX = nextWidth / canvasWidth;
      const scaleY = nextHeight / canvasHeight;

      strokes.forEach(stroke => {
        stroke.forEach(point => {
          point.x *= scaleX;
          point.y *= scaleY;
        });
      });
    }

    canvasWidth = nextWidth;
    canvasHeight = nextHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    drawingCanvas.width = Math.round(canvasWidth * pixelRatio);
    drawingCanvas.height = Math.round(canvasHeight * pixelRatio);
    drawingCanvas.style.width = `${canvasWidth}px`;
    drawingCanvas.style.height = `${canvasHeight}px`;
    renderDrawing();
  }

  function scheduleCanvasResize(options = {}) {
    const shouldScaleStrokes = options.scaleStrokes === true;

    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeDrawingCanvas({ scaleStrokes: shouldScaleStrokes });
    });
  }

  function isControl(target) {
    return target instanceof Element && Boolean(target.closest(
      'a, button, input, textarea, select, [contenteditable="true"]'
    ));
  }

  function addDrawingPoint(event) {
    const events = event.getCoalescedEvents?.() || [event];

    events.forEach(pointerEvent => {
      activeStroke.push({ x: pointerEvent.pageX, y: pointerEvent.pageY });
    });

    renderDrawing();
    syncDrawingClear();
  }

  function finishStroke(event) {
    if (event.pointerId !== activePointer) {
      return;
    }

    if (activeStroke && activeStroke.length < 2) {
      strokes.pop();
    }

    activePointer = null;
    activeStroke = null;
    pendingStartPoint = null;
    strokeStarted = false;
    aboutPage.classList.remove('is-drawing');
    syncDrawingClear();
    renderDrawing();
  }

  drawingClear.addEventListener('click', () => {
    resetDrawing();
  });

  document.addEventListener('pointerdown', event => {
    if (activePointer !== null || isControl(event.target)) {
      return;
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    event.preventDefault();
    activePointer = event.pointerId;
    activeStroke = [];
    pendingStartPoint = { x: event.pageX, y: event.pageY };
    strokeStarted = false;
    strokes.push(activeStroke);
  }, { capture: true });

  document.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointer) {
      return;
    }

    if (event.pointerType === 'mouse' && (event.buttons & 1) !== 1) {
      finishStroke(event);
      return;
    }

    event.preventDefault();
    aboutPage.classList.add('is-drawing');

    if (!strokeStarted) {
      activeStroke.push(pendingStartPoint);
      strokeStarted = true;
    }

    addDrawingPoint(event);
  }, { capture: true });

  document.addEventListener('pointerup', finishStroke, { capture: true });
  document.addEventListener('pointercancel', finishStroke, { capture: true });
  window.addEventListener('resize', () => {
    scheduleCanvasResize({ scaleStrokes: true });
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      createIntroDrawing();
    }
  });

  if ('ResizeObserver' in window && aboutContent) {
    new ResizeObserver(scheduleCanvasResize).observe(aboutContent);
  }

  document.fonts?.ready.then(scheduleCanvasResize);
  resizeDrawingCanvas();
  createIntroDrawing();
}
