/* ===== Room Full of Nerds — shared behaviour + scroll motion ===== */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile menu ---- */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const toggle = nav.querySelector('.nav-toggle');
    const setMenu = (open) => {
      nav.classList.toggle('is-open', open);
      if (toggle) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? 'Close' : 'Menu';
      }
    };
    if (toggle) toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    nav.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  /* Idle wink: blink the logo on its own at a random 3–20s cadence */
  if (!reduceMotion) {
    const lens = document.querySelector('.site-nav .logo .lens-l');
    if (lens) {
      const next = () => 3000 + Math.random() * 17000;
      const blink = () => {
        lens.classList.add('blink');
        setTimeout(() => lens.classList.remove('blink'), 650);
        setTimeout(blink, next());
      };
      setTimeout(blink, next());
    }
  }

  /* ---- Scroll progress bar ---- */
  const progress = document.querySelector('.scroll-progress');
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];

  const onScrollFrame = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    /* nav hairline */
    if (nav) nav.classList.toggle('is-scrolled', scrollTop > 10);
    /* progress */
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.min(scrollTop / h, 1) : 0;
      progress.style.transform = `scaleX(${pct})`;
    }
    /* parallax: move each element against the scroll by its speed */
    if (!reduceMotion) {
      for (const el of parallaxEls) {
        const speed = parseFloat(el.dataset.parallax) || 0;
        const rect = el.getBoundingClientRect();
        const centre = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translate3d(0, ${(-centre * speed).toFixed(1)}px, 0)`;
      }
    }
  };

  let ticking = false;
  const requestFrame = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScrollFrame(); ticking = false; });
  };
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame, { passive: true });
  onScrollFrame();

  /* ---- Flourishing reveals ---- */
  const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((el) => io.observe(el));
  }

  /* ---- Testimonial carousel (present only on some pages) ---- */
  const track = document.querySelector('.carousel-track');
  if (track) {
    const slides = track.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.carousel-dots button');
    let current = 0;
    const mark = (i) => {
      current = i;
      dots.forEach((dot, n) => dot.setAttribute('aria-current', String(n === i)));
    };
    const go = (i) => {
      const n = (i + slides.length) % slides.length;
      track.scrollTo({ left: n * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
      mark(n);
    };
    document.querySelectorAll('.carousel-btn').forEach((btn) =>
      btn.addEventListener('click', () => go(current + Number(btn.dataset.dir))));
    dots.forEach((dot, n) => dot.addEventListener('click', () => go(n)));
    let settle;
    track.addEventListener('scroll', () => {
      clearTimeout(settle);
      settle = setTimeout(() => mark(Math.round(track.scrollLeft / track.clientWidth)), 100);
    }, { passive: true });
  }
})();

/* Photorealistic turntables — page scroll AND strip scroll scrub each device's spin. */
(() => {
 const strip=document.querySelector('.device-strip'); if(!strip)return;
 const vids=[...strip.querySelectorAll('video')]; if(!vids.length)return;
 vids.forEach(v=>{ v.muted=true; v.pause(); try{v.load();}catch(e){} });
 const clamp=x=>x<0?0:x>1?1:x;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let ticking=false;
 const scrub=()=>{
  ticking=false;
  const vh=innerHeight||document.documentElement.clientHeight||1;
  const r=strip.getBoundingClientRect();
  const vprog=clamp((vh - r.top)/(vh + r.height));           // vertical: section travels through viewport
  const maxx=strip.scrollWidth-strip.clientWidth;
  const hprog=maxx>0?clamp(strip.scrollLeft/maxx):0;          // horizontal: strip scroll
  const p=clamp(vprog + hprog);
  for(const v of vids){ const d=v.duration; if(isFinite(d)&&d>0){ const t=Math.min(p*d,d-0.01); if(Math.abs(v.currentTime-t)>0.02){ try{v.currentTime=t;}catch(e){} } } }
 };
 const req=()=>{ if(!ticking){ticking=true; requestAnimationFrame(scrub);} };
 if(!reduced){
  addEventListener('scroll',req,{passive:true});
  strip.addEventListener('scroll',req,{passive:true});
  addEventListener('resize',req,{passive:true});
  req();
 }
 const by=()=>Math.max(Math.round(strip.clientWidth*0.7),180);
 const prev=document.querySelector('.ds-prev'), next=document.querySelector('.ds-next');
 if(prev) prev.addEventListener('click',()=>strip.scrollBy({left:-by(),behavior:'smooth'}));
 if(next) next.addEventListener('click',()=>strip.scrollBy({left:by(),behavior:'smooth'}));
})();
