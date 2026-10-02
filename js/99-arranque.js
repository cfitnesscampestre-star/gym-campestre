/* ═══ Ajustes finales de arranque (usan funciones de varios módulos) ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// las secciones que se abren en el área de contenido pasan a la vista de detalle en celular
['abrirConocimiento','abrirResumen','abrirEntrenadores','abrirLugares'].forEach(n=>{
  const f=window[n]; if(typeof f!=='function') return;
  window[n]=function(){ const r=f.apply(this,arguments); staffVista('detalle'); return r; };
});
