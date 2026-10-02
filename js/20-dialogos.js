/* ═══ dialogos ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// DIÁLOGOS PROPIOS — reemplazan confirm()/prompt() nativos, que el
// navegador puede bloquear dentro de vistas empotradas (como una vista
// previa). Con estos, los botones de confirmar/eliminar funcionan igual
// en cualquier contexto.
// ═════════════════════════════════════════
let UIC_CB=null;
function uiConfirm(msg,onYes,opts){
  opts=opts||{};
  document.getElementById('uic-msg').textContent=msg;
  const yes=document.getElementById('uic-yes');
  yes.textContent=opts.label||'Confirmar'; yes.className='sd-pri'+(opts.danger?' danger':''); yes.disabled=false; yes.style.opacity=1;
  document.getElementById('uic-input-wrap').style.display='none';
  UIC_CB=onYes;
  document.getElementById('modal-uic').classList.add('open');
}
function uiPrompt(msg,expected,onYes,opts){
  opts=opts||{};
  document.getElementById('uic-msg').textContent=msg;
  const yes=document.getElementById('uic-yes');
  yes.textContent=opts.label||'Confirmar'; yes.className='sd-pri danger';
  document.getElementById('uic-input-wrap').style.display='block';
  const inp=document.getElementById('uic-input'); inp.value=''; inp.placeholder=expected;
  yes.disabled=true; yes.style.opacity=.45;
  inp.oninput=()=>{ const ok=inp.value.trim()===expected; yes.disabled=!ok; yes.style.opacity=ok?1:.45; };
  UIC_CB=onYes;
  document.getElementById('modal-uic').classList.add('open');
  setTimeout(()=>inp.focus(),250);
}
function uiNo(){ document.getElementById('modal-uic').classList.remove('open'); UIC_CB=null; }
function uiYes(){ const cb=UIC_CB; if(document.getElementById('uic-yes').disabled) return; document.getElementById('modal-uic').classList.remove('open'); UIC_CB=null; if(cb) cb(); }
