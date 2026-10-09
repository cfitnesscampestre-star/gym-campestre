/* ═══ BOTONES ACCESIBLES CON TECLADO ═══
   Muchas opciones, casillas y botones se dibujan como <div>/<span> con onclick.
   Este módulo los vuelve usables con teclado y lector de pantalla sin tocar su diseño:
   - role="button" + tabindex="0" (se puede llegar con Tab)
   - Enter o Espacio los activa, igual que un clic
   - aria-pressed en opciones seleccionables (.opt / .chk y similares)
   - Escape cierra el modal abierto que se cierra tocando el fondo
   Funciona también con lo que se dibuja después (MutationObserver). */
(function(){
  const NATIVOS = 'button,a,input,select,textarea,label,summary';
  const SELECCIONABLE = /(^|\s)(opt|chk|chip-sel|filo-chip|m-alt)(\s|$)/;
  const ACTIVO = /(^|\s)(sel|ck|ac|on|fav|ok)(\s|$)/;

  function esFondoModal(el){
    const oc = el.getAttribute('onclick') || '';
    return oc.indexOf('event.target===this') !== -1;
  }
  function preparar(el){
    if(el.matches(NATIVOS) || esFondoModal(el)) return;
    if(el.parentElement && el.parentElement.closest(NATIVOS)) return;
    if(!el.hasAttribute('role')) el.setAttribute('role','button');
    if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
    marcarEstado(el);
  }
  function marcarEstado(el){
    const c = el.getAttribute('class') || '';
    if(!SELECCIONABLE.test(c) || el.getAttribute('role') !== 'button') return;
    const v = ACTIVO.test(c.replace(/(^|\s)(chk|opt)(\s|$)/g,' ')) ? 'true' : 'false';
    if(el.getAttribute('aria-pressed') !== v) el.setAttribute('aria-pressed', v);
  }
  function revisar(raiz){
    if(raiz.nodeType !== 1) return;
    if(raiz.hasAttribute('onclick')) preparar(raiz);
    raiz.querySelectorAll('[onclick]').forEach(preparar);
  }

  document.addEventListener('keydown', function(e){
    const t = e.target;
    if(e.key === 'Escape'){
      const abiertos = document.querySelectorAll('.modal.open');
      const m = abiertos[abiertos.length-1];
      if(m && esFondoModal(m)){ m.click(); e.preventDefault(); }
      return;
    }
    if(e.key !== 'Enter' && e.key !== ' ') return;
    if(!t || t.nodeType !== 1 || t.matches(NATIVOS)) return;
    if(t.getAttribute('role') !== 'button' || !t.hasAttribute('onclick')) return;
    e.preventDefault();
    t.click();
  });

  function iniciar(){
    revisar(document.body);
    new MutationObserver(function(cambios){
      cambios.forEach(function(c){
        if(c.type === 'attributes') marcarEstado(c.target);
        else c.addedNodes.forEach(revisar);
      });
    }).observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
