(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motionEnabled = () => !reduced.matches && document.body.dataset.motion !== 'false';
  const sliders = new Map();
  function initSlider(slider) {
    if (sliders.has(slider)) return;
    const abort = new AbortController(), signal = abort.signal;
    const slides = [...slider.querySelectorAll('[data-slide]')], dots = [...slider.querySelectorAll('[data-slide-to]')];
    if (!slides.length) return;
    let current=0,elapsed=0,last=performance.now(),frame=0,explicitPause=false,hovered=false,focused=false;
    const timers=new Set();
    const interval=Number(slider.dataset.interval)||6500;
    const pauseButton=slider.querySelector('[data-slide-pause]');
    const paused=()=>explicitPause||hovered||focused||document.hidden||!motionEnabled()||slider.dataset.autoplay!=='true';
    function updatePause(){if(pauseButton){pauseButton.textContent=explicitPause?'Play slideshow':'Pause slideshow';pauseButton.setAttribute('aria-pressed',String(explicitPause));}slider.classList.toggle('is-paused',paused());}
    function show(index,initial=false) {
      const next=(index+slides.length)%slides.length,old=slides[current];
      if(!initial&&next===current){elapsed=0;return;}
      old.classList.remove('is-active','is-entering');
      if(!initial){old.classList.add('is-leaving');const t=setTimeout(()=>{old.classList.remove('is-leaving');timers.delete(t);},1150);timers.add(t);}
      current=next;const incoming=slides[current];
      incoming.classList.remove('is-leaving');incoming.classList.add('is-active');
      if(motionEnabled()){incoming.classList.add('is-entering');void incoming.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!signal.aborted)incoming.classList.remove('is-entering');}));}
      slides.forEach((slide,i)=>{slide.setAttribute('aria-hidden',String(i!==current));slide.inert=i!==current;});
      dots.forEach((dot,i)=>{dot.classList.toggle('is-active',i===current);dot.classList.toggle('is-done',i<current);if(i===current)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
      const number=slider.querySelector('[data-slide-number]');if(number)number.textContent=String(current+1).padStart(2,'0');
      elapsed=0;slider.style.setProperty('--slide-progress',motionEnabled()&&slider.dataset.autoplay==='true'?'0':'1');
    }
    function tick(time){const delta=time-last;last=time;if(!paused()&&slides.length>1){elapsed+=delta;if(elapsed>=interval)show(current+1);slider.style.setProperty('--slide-progress',String(Math.min(elapsed/interval,1)));}frame=requestAnimationFrame(tick);}
    slider.querySelector('[data-slide-prev]')?.addEventListener('click',()=>show(current-1),{signal});
    slider.querySelector('[data-slide-next]')?.addEventListener('click',()=>show(current+1),{signal});
    dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.slideTo)),{signal}));
    pauseButton?.addEventListener('click',()=>{explicitPause=!explicitPause;if(!explicitPause){focused=false;hovered=false;last=performance.now();}updatePause();},{signal});
    slider.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;updatePause();}},{signal});
    slider.addEventListener('pointerleave',()=>{hovered=false;last=performance.now();updatePause();},{signal});
    slider.addEventListener('focusin',()=>{focused=true;updatePause();},{signal});
    slider.addEventListener('focusout',()=>queueMicrotask(()=>{focused=slider.contains(document.activeElement);last=performance.now();updatePause();}),{signal});
    document.addEventListener('visibilitychange',()=>{last=performance.now();updatePause();},{signal});
    reduced.addEventListener('change',()=>{last=performance.now();updatePause();if(reduced.matches){slides.forEach(s=>s.classList.remove('is-entering','is-leaving'));slider.style.setProperty('--slide-progress','1');}},{signal});
    slider.addEventListener('shopify:block:select',event=>{const selected=event.target.closest('[data-slide]');const i=slides.indexOf(selected);if(i>=0){explicitPause=true;show(i);updatePause();}},{signal});
    signal.addEventListener('abort',()=>{cancelAnimationFrame(frame);timers.forEach(clearTimeout);});
    sliders.set(slider,abort);show(0,true);updatePause();frame=requestAnimationFrame(tick);
  }
  const revealSelector='.section-heading,.sports-grid > *, .featured-grid > *, .look-products > *, .process-step,.faq-item,.quote-banner .wrap > *, .footer-top > *, .footer-bottom,.trust-strip > *, .image-text-media,.image-text-copy,.look-image,.reel,.product-layout > *, .catalog-heading,.nn-club-card';
  const tagged=new Set();
  const observer='IntersectionObserver' in window ? new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}}),{threshold:.1,rootMargin:'0px 0px -5% 0px'}):null;
  function reveal(root=document){root.querySelectorAll(revealSelector+',.steps-grid').forEach(el=>{if(tagged.has(el))return;tagged.add(el);if(motionEnabled()&&observer){if(!el.matches('.steps-grid'))el.classList.add('motion-reveal');const i=[...el.parentNode.children].indexOf(el);el.style.setProperty('--reveal-delay',Math.min(i,5)*.08+'s');observer.observe(el);}else el.classList.add('is-revealed');});}
  const progress=document.createElement('div');progress.className='motion-progress';progress.setAttribute('aria-hidden','true');progress.innerHTML='<span></span>';document.body.append(progress);
  let scrollFrame=0;
  function scrollEffect(){scrollFrame=0;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);progress.style.setProperty('--scroll-progress',String(scrollY/max));tagged.forEach(el=>{if(el.isConnected&&!el.classList.contains('is-revealed')&&el.getBoundingClientRect().top<innerHeight){el.classList.add('is-revealed');observer?.unobserve(el);}});}
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(scrollEffect);},{passive:true});
  let activeCard=null,activeButton=null;
  function resetCard(){if(activeCard){activeCard.style.setProperty('--rx','0deg');activeCard.style.setProperty('--ry','0deg');activeCard=null;}}
  function resetButton(){if(activeButton){activeButton.style.transform='';activeButton=null;}}
  document.addEventListener('pointermove',event=>{
    if(!motionEnabled()||!finePointer.matches||event.pointerType!=='mouse')return;
    const card=event.target.closest('.product-card')?.querySelector('.product-card__media');if(card!==activeCard)resetCard();
    if(card){activeCard=card;const rect=card.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;card.style.setProperty('--rx',(-y*8).toFixed(2)+'deg');card.style.setProperty('--ry',(x*10).toFixed(2)+'deg');}
    let button=event.target.closest('.btn:not([disabled])');if(button?.closest('.cart-drawer,.ref-mobile-panel'))button=null;if(button!==activeButton)resetButton();
    if(button){activeButton=button;const rect=button.getBoundingClientRect(),dx=(event.clientX-rect.left-rect.width/2)*.18,dy=(event.clientY-rect.top-rect.height/2)*.3;button.style.transform=`translate(${Math.max(-8,Math.min(8,dx)).toFixed(1)}px,${Math.max(-6,Math.min(6,dy)).toFixed(1)}px)`;}
  },{passive:true});
  document.addEventListener('pointerleave',()=>{resetCard();resetButton();});
  reduced.addEventListener('change',()=>{if(reduced.matches){tagged.forEach(el=>el.classList.add('is-revealed'));resetCard();resetButton();}});
  document.addEventListener('cart:updated',()=>{if(!motionEnabled())return;document.querySelectorAll('[data-cart-count]').forEach(count=>{count.classList.remove('is-bumping');void count.offsetWidth;count.classList.add('is-bumping');});});
  function init(root=document){root.querySelectorAll('[data-slideshow]').forEach(initSlider);reveal(root);scrollEffect();}
  document.addEventListener('shopify:section:load',event=>init(event.target));
  document.addEventListener('product:variant-changed',event=>{const section=event.detail.section;reveal(section);scrollEffect();});
  document.addEventListener('shopify:section:unload',event=>{sliders.forEach((abort,slider)=>{if(event.target.contains(slider)){abort.abort();sliders.delete(slider);}});tagged.forEach(el=>{if(event.target.contains(el)){observer?.unobserve(el);tagged.delete(el);}});});
  init();
})();
