/* ═══ pwa ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// PWA — Service worker con auto-actualización
// ═════════════════════════════════════════
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').then(reg=>{
      // Buscar versión nueva cada vez que la app vuelve al frente
      document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) reg.update(); });
      reg.addEventListener('updatefound', ()=>{
        const nuevo=reg.installing;
        nuevo&&nuevo.addEventListener('statechange', ()=>{
          if(nuevo.state==='installed' && navigator.serviceWorker.controller){
            showToast('⬆ Hay una versión nueva — cierra y abre la app para aplicarla');
          }
        });
      });
    }).catch(()=>{});
  });
}
