(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1100px)');
  const controllers = new Map();
  function initHeader(header) {
    if (controllers.has(header)) return;
    const controller = new AbortController(), signal = controller.signal;
    controllers.set(header, controller);
    const wrapper = header.closest('.shopify-section') || header;
    wrapper.classList.add('ref-header-section');
    const shade = header.querySelector('[data-nav-shade]');
    const mobile = header.querySelector('[data-mobile-navigation]');
    const panel = mobile?.querySelector('.ref-mobile-panel');
    const nativeSearch = header.querySelector('details-modal.header__search');
    const search = nativeSearch?.querySelector('details') || header.querySelector('[data-header-search]');
    function closeSearch(focus = false) { if (!search?.open) return; if (nativeSearch) nativeSearch.close(focus); else search.open = false; }
    let lastFocus = null, frame = 0;
    function closeMega() {
      header.querySelectorAll('.ref-nav-item.is-open').forEach(item => {
        item.classList.remove('is-open'); item.querySelector('[data-nav-trigger]')?.setAttribute('aria-expanded','false');
        const content=item.querySelector('[data-nav-panel]');if(content)content.inert=true;
      });
      if(shade)shade.hidden=true;
    }
    function openMega(item) {
      if (!desktop.matches) return;
      if (item.classList.contains('is-open')) return;
      closeMega();closeSearch();
      item.classList.add('is-open');item.querySelector('[data-nav-trigger]')?.setAttribute('aria-expanded','true');
      const content=item.querySelector('[data-nav-panel]');if(content)content.inert=false;
      if(shade)shade.hidden=false;
    }
    function closeMobile() { if(mobile)mobile.open=false; syncMobile(); }
    function syncMobile() {
      const open=!!mobile?.open;
      document.documentElement.classList.toggle('ref-menu-open',open);
      if(open){closeMega();closeSearch();lastFocus=mobile.querySelector('summary');panel?.focus({preventScroll:true});}
      else if(lastFocus){lastFocus.focus({preventScroll:true});lastFocus=null;}
    }
    function updateScroll(){frame=0;wrapper.classList.toggle('is-scrolled',window.scrollY>40);}
    window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateScroll);},{passive:true,signal});updateScroll();
    header.querySelectorAll('.ref-nav-item').forEach(item=>{
      const trigger=item.querySelector('[data-nav-trigger]');if(!trigger)return;
      item.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')openMega(item);},{signal});
      trigger.addEventListener('focus',()=>openMega(item),{signal});
      trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();openMega(item);item.querySelector('[data-nav-panel] a')?.focus();}},{signal});
    });
    header.querySelectorAll('.ref-desktop-navigation .ref-nav-link:not([data-nav-trigger])').forEach(link=>{link.addEventListener('pointerenter',closeMega,{signal});link.addEventListener('focus',closeMega,{signal});});
    header.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')closeMega();},{signal});
    header.addEventListener('focusout',()=>queueMicrotask(()=>{if(!header.contains(document.activeElement))closeMega();}),{signal});
    shade?.addEventListener('pointerenter',closeMega,{signal});shade?.addEventListener('click',closeMega,{signal});
    mobile?.addEventListener('toggle',syncMobile,{signal});
    mobile?.querySelectorAll('[data-mobile-close]').forEach(button=>button.addEventListener('click',closeMobile,{signal}));
    mobile?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMobile,{signal}));
    mobile?.querySelectorAll('.ref-mobile-group').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)mobile.querySelectorAll('.ref-mobile-group[open]').forEach(other=>{if(other!==detail)other.open=false;});},{signal}));
    search?.addEventListener('toggle',()=>{if(search.open){closeMega();requestAnimationFrame(()=>search.querySelector('input')?.focus());}},{signal});
    document.addEventListener('click',event=>{if(search?.open&&!search.contains(event.target))closeSearch();},{signal});
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        if(mobile?.open){event.preventDefault();closeMobile();return;}
        if(search?.open){closeSearch(true);search.querySelector('summary')?.focus();return;}
        const active=header.querySelector('.ref-nav-item.is-open>[data-nav-trigger]');if(active){closeMega();active.focus();closeMega();}
      }
      if(event.key==='Tab'&&mobile?.open&&panel){
        const nodes=[...panel.querySelectorAll('a[href],button,summary,input,select,textarea,[tabindex="0"]')].filter(n=>n.getClientRects().length&&!n.disabled);
        const first=nodes[0],last=nodes[nodes.length-1];if(!first)return;
        if(event.shiftKey&&(document.activeElement===first||document.activeElement===panel)){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===panel)){event.preventDefault();first.focus();}
      }
    },{signal});
    desktop.addEventListener('change',()=>{closeMega();if(desktop.matches)closeMobile();},{signal});
    document.addEventListener('cart:updated',event=>header.querySelectorAll('[data-cart-count]').forEach(count=>{count.hidden=Number(event.detail.itemCount)===0;}),{signal});
    signal.addEventListener('abort',()=>{cancelAnimationFrame(frame);document.documentElement.classList.remove('ref-menu-open');});
  }
  function initAnnouncement(element) {
    if(controllers.has(element))return;
    const controller=new AbortController(),signal=controller.signal;controllers.set(element,controller);
    const items=[...element.querySelectorAll('[data-announcement-item]')];let current=0,timer;
    function start(){clearInterval(timer);element.classList.remove('is-rotating');const stopped=items.length<2||desktop.matches||reduced.matches||document.body.dataset.motion==='false'||document.hidden;if(stopped)current=0;items.forEach((n,i)=>n.classList.toggle('is-active',i===current));if(stopped)return;element.classList.add('is-rotating');timer=setInterval(()=>{current=(current+1)%items.length;items.forEach((n,i)=>n.classList.toggle('is-active',i===current));},3500);}
    desktop.addEventListener('change',start,{signal});reduced.addEventListener('change',start,{signal});document.addEventListener('visibilitychange',start,{signal});signal.addEventListener('abort',()=>clearInterval(timer));start();
  }
  function init(root=document){root.querySelectorAll('[data-header]').forEach(initHeader);root.querySelectorAll('[data-announcement]').forEach(initAnnouncement);}
  document.addEventListener('shopify:section:load',event=>init(event.target));
  document.addEventListener('shopify:section:unload',event=>controllers.forEach((controller,el)=>{if(event.target.contains(el)){controller.abort();controllers.delete(el);}}));
  init();
})();
