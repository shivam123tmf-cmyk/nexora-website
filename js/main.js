import { scrollState, markReady } from './scene.js';

const yearEl = document.getElementById('y');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const chapters = [...document.querySelectorAll('.chapter')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Fake-smooth loader while modules/fonts settle */
let loadPct = 0;
const loadTimer = setInterval(() => {
  loadPct = Math.min(loadPct + (loadPct < 70 ? 8 : 3), 92);
  if (loaderFill) loaderFill.style.width = `${loadPct}%`;
}, 80);

window.addEventListener('load', () => {
  clearInterval(loadTimer);
  if (loaderFill) loaderFill.style.width = '100%';
  setTimeout(() => {
    loader?.classList.add('is-done');
    markReady();
    document.body.classList.add('is-ready');
  }, 280);
});

/* Lenis smooth scroll */
let lenis = null;
if (!reduceMotion && window.Lenis) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.1,
  });
  lenis.on('scroll', () => ScrollTrigger.update());
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

gsap.registerPlugin(ScrollTrigger);

const stage = document.getElementById('stage');

function setActiveChapter(index) {
  chapters.forEach((el, i) => {
    el.classList.toggle('is-active', i === index || (index === 0 && i === 0));
  });
  scrollState.chapter = index;
}

/* Drive 3D look from stage scroll */
if (stage) {
  ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      scrollState.progress = self.progress;
      const idx = Math.min(
        chapters.length - 1,
        Math.floor(self.progress * chapters.length)
      );
      setActiveChapter(idx);
    },
  });
}

/* Chapter enter animations */
chapters.forEach((ch, i) => {
  if (i === 0) {
    ch.classList.add('is-active');
    return;
  }
  ScrollTrigger.create({
    trigger: ch,
    start: 'top 65%',
    end: 'bottom 35%',
    onEnter: () => setActiveChapter(i),
    onEnterBack: () => setActiveChapter(i),
  });
});

/* Soft fade-in for talk card */
const talkInner = document.querySelector('.talk-inner');
if (talkInner) {
  gsap.from(talkInner, {
    scrollTrigger: {
      trigger: '#talk',
      start: 'top 75%',
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  });
}

/* Anchor links via Lenis */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    else target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* Safety: hide loader even if load event already fired */
if (document.readyState === 'complete') {
  clearInterval(loadTimer);
  if (loaderFill) loaderFill.style.width = '100%';
  loader?.classList.add('is-done');
  markReady();
}
