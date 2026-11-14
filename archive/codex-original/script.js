'use strict';

// All image filenames are retained. Display copies live in assets/;
// original-images/ contains the supplied, unmodified photographs and artwork.
const gallery = [
  {file:'2409_AANIM_Gaskessel_sRGB_010 (1).JPG',alt:'AANIM performing under white stage lights at Gaskessel',caption:'AANIM / Live at Gaskessel'},
  {file:'aanim-band-blue.jpg',alt:'The five AANIM members against a bright blue background',caption:'AANIM / The band'},
  {file:'contemplation-artwork-01.jpg',alt:'Contemplation artwork in green and lavender',caption:'Contemplation / Artwork — Anna Frey'},
  {file:'remedy-artwork-01.jpg',alt:'Remedy artwork in pink, yellow and dark green',caption:'Remedy / Artwork — Anna Frey'},
  {file:'fuormas-neras-artwork-blue.jpg',alt:'Fuormas Neras artwork, blue version',caption:'Fuormas Neras / Artwork — Nicoline and Nuria'},
  {file:'aanim-band-live.jpg',alt:'AANIM photographed from above on a tiled floor',caption:'AANIM / The band'},
  {file:'2409_AANIM_Gaskessel_sRGB_025.JPG',alt:'The five AANIM members taking a bow in warm stage light',caption:'AANIM / Live at Gaskessel'},
  {file:'_K5A0097-2.jpg',alt:'A group reflected in mirrors beside a turquoise mural',caption:''},
  {file:'IMG_20231009_140214_972.jpg',alt:'Kim.a performing at a keyboard with a live drummer',caption:'Kim.a / On stage'},
  {file:'_K5A0436-Bearbeitet-2.jpg',alt:'Black-and-white photograph of figures reflected in glass',caption:''},
  {file:'aanim-live-gaskessel.jpg',alt:'AANIM on stage in deep blue light',caption:'AANIM / Live at Gaskessel'},
  {file:'contemplation-artwork-02.jpg',alt:'Contemplation artwork in purple and green',caption:'Contemplation / Artwork — Anna Frey'},
  {file:'remedy-artwork-02.jpg',alt:'Remedy artwork in purple and blue',caption:'Remedy / Artwork — Anna Frey'},
  {file:'fuormas-neras-artwork-lavender.jpg',alt:'Fuormas Neras artwork, lavender version',caption:'Fuormas Neras / Artwork — Nicoline and Nuria'},
  {file:'fuormas-neras-artwork-purple.jpg',alt:'Fuormas Neras artwork, purple version',caption:'Fuormas Neras / Artwork — Nicoline and Nuria'},
  {file:'fuormas-neras-artwork-black-white.jpg',alt:'Fuormas Neras artwork, black and white version',caption:'Fuormas Neras / Artwork — Nicoline and Nuria'}
];

const assetPath = (folder, file) => folder + '/' + encodeURIComponent(file);
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
  menuButton.querySelector('span').textContent = '+';
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  menuButton.querySelector('span').textContent = open ? '−' : '+';
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 541px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const viewer = document.querySelector('.image-viewer');
const viewerImage = document.querySelector('#viewer-image');
const viewerCaption = document.querySelector('#viewer-caption');
const viewerCount = document.querySelector('#viewer-count');
const viewerOriginal = document.querySelector('#viewer-original');
let currentImage = 0;
let galleryTrigger = null;

function renderImage(index) {
  currentImage = (index + gallery.length) % gallery.length;
  const item = gallery[currentImage];
  viewerImage.src = assetPath('assets', item.file);
  viewerImage.alt = item.alt;
  viewerCaption.textContent = item.caption;
  viewerCount.textContent = (currentImage + 1) + ' / ' + gallery.length;
  viewerOriginal.href = assetPath('original-images', item.file);
}
function openGallery(index, trigger) {
  if (typeof viewer.showModal !== 'function') {
    window.open(assetPath('original-images', gallery[index].file), '_blank', 'noopener');
    return;
  }
  galleryTrigger = trigger;
  renderImage(index);
  viewer.showModal();
  document.body.classList.add('viewer-open');
}
document.querySelectorAll('[data-gallery]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openGallery(Number(link.dataset.gallery), link);
  });
});
document.querySelectorAll('[data-open-gallery]').forEach(button => {
  button.addEventListener('click', () => openGallery(Number(button.dataset.openGallery), button));
});
document.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
document.querySelector('.viewer-prev').addEventListener('click', () => renderImage(currentImage - 1));
document.querySelector('.viewer-next').addEventListener('click', () => renderImage(currentImage + 1));
viewer.addEventListener('close', () => {
  document.body.classList.remove('viewer-open');
  if (galleryTrigger) galleryTrigger.focus({preventScroll:true});
});
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    renderImage(currentImage + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
let touchStart = null;
viewerImage.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].screenX; }, {passive:true});
viewerImage.addEventListener('touchend', event => {
  if (touchStart === null) return;
  const delta = event.changedTouches[0].screenX - touchStart;
  if (Math.abs(delta) > 55) renderImage(currentImage + (delta < 0 ? 1 : -1));
  touchStart = null;
}, {passive:true});

const variantIndices = {blue:4, lavender:13, purple:14, 'black-white':15};
document.querySelectorAll('[data-variant]').forEach(button => {
  button.addEventListener('click', () => {
    const index = variantIndices[button.dataset.variant];
    const item = gallery[index];
    document.querySelector('#fuormas-image').src = assetPath('assets', item.file);
    document.querySelector('#fuormas-image').alt = item.alt;
    const link = document.querySelector('#fuormas-image-link');
    link.href = assetPath('original-images', item.file);
    link.dataset.gallery = String(index);
    document.querySelectorAll('[data-variant]').forEach(swatch => {
      const selected = swatch === button;
      swatch.classList.toggle('is-selected', selected);
      swatch.setAttribute('aria-pressed', String(selected));
    });
  });
});

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      document.querySelector('dialog[open]') || !['ArrowLeft', 'ArrowRight', 'p', 'P'].includes(event.key)) return;
  event.preventDefault();
  parent.postMessage({ type:'bands-navigation', key:event.key }, '*');
});
