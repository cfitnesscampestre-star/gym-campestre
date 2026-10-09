/* ═══ seleccion entrenador ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// SELECCIÓN DE ENTRENADOR EN EL REGISTRO DEL SOCIO
// ═════════════════════════════════════════
window._trainerReturnFn = null;
window._trainerPrevScreen = 'qq11';
function qNextToTrainer(returnFn, prevScreenId){
  window._trainerReturnFn = returnFn;
  window._trainerPrevScreen = prevScreenId||'qq11';
  renderTrainerPicker();
  mostrarSub('qqT');
}
function qTrainerBack(){ mostrarSub(window._trainerPrevScreen); }
function renderTrainerPicker(){
  const cont=document.getElementById('trainer-picker-list'); if(!cont) return;
  let list = listaEntrenadoresParaElegir();
  cont.innerHTML='';
  if(!list.length){
    cont.innerHTML='<div style="padding:20px;text-align:center;color:var(--mu);font-size:var(--fs-xs);font-family:var(--fb)">Por ahora el sistema asignará tu entrenador automáticamente.</div>';
    document.getElementById('qbT').disabled=false;
    return;
  }
  list.forEach(t=>{
    const sel = qAnswers.entrenadorId===t.id;
    const tieneFilo = t.filosofia && t.filosofia.tagline;
    const div=document.createElement('div');
    div.style.cssText='display:flex;gap:12px;align-items:center;padding:14px;border:1px solid '+(sel?'var(--v)':'var(--b)')+';border-radius:12px;margin-bottom:10px;cursor:pointer;background:'+(sel?'var(--gl2)':'var(--gl)');
    div.innerHTML=`
      <div style="flex:1;min-width:0">
        <div style="font-family:var(--fd);font-size:var(--fs-xl)">${esc(t.nombre)}</div>
        <div style="font-size:var(--fs-xs);${tieneFilo?'color:var(--v);font-style:italic':'color:var(--mu)'};margin:2px 0 6px;line-height:1.35">${tieneFilo?'"'+esc(t.filosofia.tagline)+'"':'Aún sin filosofía propia — seguirá el enfoque general del club'}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${(t.especialidades||[]).map(s=>`<span style="font-size:var(--fs-2xs);text-transform:uppercase;letter-spacing:.03em;background:var(--in-bg2);border:1px solid var(--b);color:var(--mu);padding:2px 7px;border-radius:20px">${esc(s)}</span>`).join('')}</div>
      </div>
      <div style="flex:0 0 auto;${tieneFilo?'':'opacity:.3'}">${svgRadarFilosofia(t.filosofia,58)}</div>`;
    div.onclick=()=>{ qAnswers.entrenadorId=t.id; qAnswers.entrenadorNombre=t.nombre; renderTrainerPicker(); document.getElementById('qbT').disabled=false; };
    cont.appendChild(div);
  });
}
function qConfirmTrainerAndGenerate(){
  if(window._trainerReturnFn) window._trainerReturnFn();
}

window.showToast=function showToast(msg){
  const t=document.getElementById('toast'); t.textContent=msg; t.style.display='block';
  clearTimeout(window._toastT);
  window._toastT=setTimeout(()=>t.style.display='none',2800);
}
