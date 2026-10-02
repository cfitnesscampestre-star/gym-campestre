/* ═══ registro sesion ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// DETALLE DÍA + REGISTRO DE SESIÓN
// ═════════════════════════════════════════
let sesionTemp = null; // {diaKey, ej:{idx:{done, sets:[{kg,ok}]}}}

function openDay(key){
  const s=activeSocio; if(!s) return;
  const d=s.rutina[key]; if(!d) return;
  activeRutinaKey=key;
  sesionTemp={diaKey:key, ej:{}};
  const ejs=d.ejercicios||[];
  const series=ejs.reduce((a,e)=>a+(parseInt(e.series)||0),0);
  const grupos=[...new Set(ejs.map(e=>sc(String(e.ms||'').split(' ')[0])).filter(Boolean))].slice(0,3).join(' · ');
  document.getElementById('det-hero').innerHTML=`
    ${pic(basesSesion(d.tipo),iconoTipo(d.tipo),'fill')}
    <div class="det-ov"></div>
    <div class="det-tx">
      <span class="det-badge">${esc(sc(d.tipo.split(' ')[0]))}</span>
      <h1>${esc(sc(d.tipo))}</h1>
      <div class="det-meta">${esc(sc(d.label))}${key===HOY_KEY?' · hoy':''}${grupos?' · '+esc(grupos):''}</div>
    </div>`;
  document.getElementById('det-stats').innerHTML=ejs.length?`
    <div class="ds">${ico('layers')}<b>${ejs.length}</b><span>Ejercicios</span></div>
    <div class="ds">${ico('dumbbell')}<b>${series}</b><span>Series</span></div>
    ${tutIsoPrescrito(ejs,nivelNum(s.nivel))>0?`<div class="ds">${ico('timer')}<b>${fmtTut(tutIsoPrescrito(ejs,nivelNum(s.nivel)))}</b><span>Isométrico</span></div>`:''}
    <div class="ds">${ico('target')}<b>${esc(sc(s.nivel))}</b><span>Nivel</span></div>`:'';
  document.getElementById('btn-finalizar').style.display = key===HOY_KEY ? 'flex':'none';

  const list=document.getElementById('ej-list');
  list.innerHTML='';
  if(!ejs.length){
    list.innerHTML='<div class="empty-msg" style="padding:40px">Día de descanso / recuperación activa</div>';
  } else {
    ejs.forEach((ej,idx)=>{
      list.innerHTML+=`
        <div class="ej-card" id="ejc-${idx}" onclick="openModal(${idx})">
          <div class="ej-pic">${pic(basesEjercicioMini(ej),'dumbbell','thumb')}<span class="ej-n">${ej.grupo?esc(ej.grupo):String(idx+1)}</span></div>
          <div class="ej-i">
            <div class="ej-nm" id="ejnm-${idx}">${esc(ej.nm)}</div>
            <div class="ej-dt">${esc(rxTexto(ej).sr)} · ${esc(rxTexto(ej).carga)}${ej.descanso?' · '+esc(ej.descanso):''}</div>
            <div class="ej-ms">${esc(ej.ms)}</div>
            ${((ej.metodo&&!esEjCardio(ej)&&!esEjRondas(ej)&&!esEjMovilidad(ej))||(ej.alternativas||[]).length)?`<div class="ej-extra">${(ej.metodo&&!esEjCardio(ej)&&!esEjRondas(ej)&&!esEjMovilidad(ej))?`<span class="ej-met">${ico('bolt')}${esc(ej.metodo.nm)}</span>`:''}${(ej.alternativas||[]).length?`<span class="ej-alt">${ej.alternativas.length} ${ej.alternativas.length>1?'opciones':'opción'} por área ocupada</span>`:''}</div>`:''}
          </div>
          <div class="ej-r">
            <div class="ck" id="ejk-${idx}" onclick="event.stopPropagation();toggleEjDone(${idx})" role="checkbox" aria-label="Marcar como hecho">${ico('check')}</div>
          </div>
        </div>`;
    });
  }
  actualizarProgresoDia();
  go('s-det');
  window.scrollTo(0,0);
}

function actualizarProgresoDia(){
  const tot=document.querySelectorAll('#ej-list .ej-card').length;
  const ok=document.querySelectorAll('#ej-list .ck.yes').length;
  const i=document.getElementById('det-prog-i'); if(i) i.style.width=(tot?Math.round(ok/tot*100):0)+'%';
  const n=document.getElementById('det-prog-n'); if(n) n.textContent=ok+' de '+tot;
}

function toggleEjDone(idx){
  const card=document.getElementById('ejc-'+idx);
  const ck=document.getElementById('ejk-'+idx);
  const on=!ck.classList.contains('yes');
  ck.classList.toggle('yes',on);
  card.classList.toggle('done',on);
  if(!sesionTemp.ej[idx]) sesionTemp.ej[idx]={done:false,sets:[]};
  sesionTemp.ej[idx].done=on;
  actualizarProgresoDia();
}

// Ejercicio que se ejecuta HOY (original u opción elegida por área ocupada)
function ejEjecutado(ej,idx){
  const a=sesionTemp&&sesionTemp.ej[idx]&&sesionTemp.ej[idx].alt;
  return (a!=null && ej.alternativas && ej.alternativas[a]) ? ej.alternativas[a] : null;
}
function repsDeSerie(ej,i){
  const m=String(ej.reps||'').match(/^\s*(\d+(?:\s*-\s*\d+){2,})/);
  if(!m) return ej.reps;
  const arr=m[1].split('-').map(x=>x.trim());
  return (arr[i]||arr[arr.length-1])+' reps';
}
function elegirAlternativa(idx,ai){
  if(!sesionTemp.ej[idx]) sesionTemp.ej[idx]={done:false,sets:[]};
  sesionTemp.ej[idx].alt = (ai===null || sesionTemp.ej[idx].alt===ai) ? null : ai;
  const ej=activeSocio.rutina[activeRutinaKey].ejercicios[idx];
  const alt=ejEjecutado(ej,idx);
  const nmEl=document.getElementById('ejnm-'+idx);
  if(nmEl) nmEl.innerHTML = alt ? `${esc(alt.nm)} <span class="ej-opc">opción · en lugar de ${esc(ej.nm)}</span>` : esc(ej.nm);
  openModal(idx);
  showToast(alt ? '⇄ Hoy harás: '+alt.nm : '↺ Regresaste al ejercicio original');
}
// ── Preferencia de unidad de peso (kg/lb) para registrar series y ver PRs — solo de visualización, todo se guarda en kg ──
let unidadPeso = localStorage.getItem('unidadPeso')==='lb' ? 'lb' : 'kg';
const KG_A_LB = 2.20462;
function kgToDisplay(kg){
  if(kg==null||kg===''||isNaN(kg)) return '';
  const v = unidadPeso==='lb' ? kg*KG_A_LB : kg;
  return Math.round(v*2)/2; // redondeado a .5, como los discos/placas típicos
}
function displayToKg(v){
  if(v===''||v==null) return 0;
  const n=parseFloat(v); if(isNaN(n)) return 0;
  return unidadPeso==='lb' ? n/KG_A_LB : n;
}
function toggleUnidadPeso(){
  unidadPeso = unidadPeso==='kg' ? 'lb' : 'kg';
  localStorage.setItem('unidadPeso', unidadPeso);
  if(window._modalIdx!=null) openModal(window._modalIdx);
}
function actualizarUnitToggleUI(){
  document.querySelectorAll('#unit-toggle .unit-opt').forEach(el=>el.classList.toggle('on', el.dataset.u===unidadPeso));
  const lbl=document.getElementById('m-kg-label'); if(lbl) lbl.textContent = unidadPeso==='lb' ? 'LB USADAS' : 'KG USADOS';
}

// ── Burbuja de descanso: cronómetro flotante y movible, solo visual (cuenta hacia arriba desde 0) ──
let burbuja={visible:false, running:false, startTs:0, elapsed:0, interval:null, dragging:false, moved:false};
function toggleBurbujaVisible(){
  burbuja.visible=!burbuja.visible;
  const el=document.getElementById('rest-bubble');
  if(el) el.style.display=burbuja.visible?'flex':'none';
  const btn=document.getElementById('btn-rest-timer');
  if(btn) btn.classList.toggle('ac',burbuja.visible);
}
function burbujaTap(){
  const el=document.getElementById('rest-bubble');
  if(burbuja.running){
    clearInterval(burbuja.interval); burbuja.interval=null; burbuja.running=false;
    document.getElementById('rest-bubble-lbl').textContent='TOCA';
  } else {
    burbuja.startTs=Date.now(); burbuja.running=true;
    document.getElementById('rest-bubble-lbl').textContent='DESCANSO';
    burbujaActualizarTexto();
    burbuja.interval=setInterval(burbujaActualizarTexto,250);
  }
  el.classList.toggle('running',burbuja.running);
}
function burbujaActualizarTexto(){
  const seg=burbuja.running?Math.floor((Date.now()-burbuja.startTs)/1000):0;
  const mm=String(Math.floor(seg/60)).padStart(2,'0'), ss=String(seg%60).padStart(2,'0');
  const t=document.getElementById('rest-bubble-t'); if(t) t.textContent=mm+':'+ss;
}
function burbujaInitDrag(){
  const el=document.getElementById('rest-bubble'); if(!el||el._dragInit) return;
  el._dragInit=true;
  let sx=0,sy=0,ox=0,oy=0;
  el.addEventListener('pointerdown',e=>{
    if(e.target.classList.contains('rb-x')) return;
    burbuja.dragging=true; burbuja.moved=false;
    sx=e.clientX; sy=e.clientY;
    const r=el.getBoundingClientRect(); ox=r.left; oy=r.top;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove',e=>{
    if(!burbuja.dragging) return;
    const dx=e.clientX-sx, dy=e.clientY-sy;
    if(Math.abs(dx)>6||Math.abs(dy)>6) burbuja.moved=true;
    if(burbuja.moved){
      el.style.left=Math.max(4,Math.min(window.innerWidth-el.offsetWidth-4,ox+dx))+'px';
      el.style.top=Math.max(4,Math.min(window.innerHeight-el.offsetHeight-4,oy+dy))+'px';
      el.style.right='auto'; el.style.bottom='auto';
    }
  });
  el.addEventListener('pointerup',e=>{
    if(!burbuja.dragging) return;
    burbuja.dragging=false;
    if(!burbuja.moved && !e.target.classList.contains('rb-x')) burbujaTap();
  });
}
document.addEventListener('DOMContentLoaded',burbujaInitDrag);
if(document.readyState!=='loading') burbujaInitDrag();

// Detecta si el peso está dado como % de 1RM (ej. "Moderado — 55% 1RM" o "50-60% 1RM")
function pct1RM(pesoTxt){
  const m=String(pesoTxt||'').match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*%\s*1\s*RM/i);
  if(!m) return null;
  const a=+m[1], b=m[2]?+m[2]:a;
  return {a,b};
}
// % real de 1RM según las repeticiones del ejercicio, dejando "rir" reps en reserva
// (misma fórmula de Epley usada para estimar el 1RM, así el cálculo es consistente en ambos sentidos
// y nunca sugiere un peso muy por debajo de lo que el socio ya demostró poder levantar).
function pctPorReps(reps,rir){
  rir = rir==null ? 2 : rir;
  const r = Math.max(1, (reps||10) + rir);
  return 30/(30+r);
}
function openModal(idx){
  const s=activeSocio; if(!s) return;
  const d=s.rutina[activeRutinaKey];
  const ej=d.ejercicios[idx]; if(!ej) return;
  window._modalIdx=idx;
  const alt=ejEjecutado(ej,idx);
  const nmHoy=alt?alt.nm:ej.nm;
  document.getElementById('m-tag').textContent=((alt?alt.ms:ej.ms)||'Ejercicio')+(ej.grupo?' · grupo '+ej.grupo:'');
  document.getElementById('m-title').textContent=nmHoy;
  { const rt=rxTexto(ej,s);
    document.getElementById('m-sub').textContent = esEjCardio(ej)||esEjRondas(ej)
      ? `${rt.sr} · ${rt.carga}`
      : esEjMovilidad(ej) ? `${rt.sr} · sin carga`
      : `${ej.series} series · ${rt.carga}${ej.descanso?' · descanso '+ej.descanso:''}`; }
  const tipTxt=(alt?'⇄ Opción en lugar de '+ej.nm+'. Busca la misma sensación: ':'💡 ')+(ej.tip||'Siente este músculo durante el movimiento.');
  document.getElementById('m-musculo').innerHTML=ejImagenHTML(alt||ej, esc(tipTxt));

  const mm=document.getElementById('m-metodo');
  if(ej.metodo && KB_METODOS[ej.metodo.id] && !esEjCardio(ej) && !esEjRondas(ej) && !esEjMovilidad(ej)){
    const M=KB_METODOS[ej.metodo.id];
    mm.style.display='block';
    mm.innerHTML=`<div class="m-metodo-nm">⚡ ${esc(M.nm)}${ej.grupo?` <span>grupo ${esc(ej.grupo)}</span>`:''}</div><div>${esc(M.como)}</div>${ej.metodo.detalle?`<div class="m-metodo-det">${esc(ej.metodo.detalle)}</div>`:''}`;
  } else mm.style.display='none';

  const ma=document.getElementById('m-alts');
  const alts=ej.alternativas||[];
  if(alts.length){
    const sel=sesionTemp.ej[idx]&&sesionTemp.ej[idx].alt;
    ma.style.display='block';
    ma.innerHTML=`<div class="m-alts-t">¿Área ocupada? Cámbialo solo por hoy</div>`+
      alts.map((a,ai)=>`<div class="m-alt ${sel===ai?'on':''}" onclick="elegirAlternativa(${idx},${ai})"><div><b>${esc(a.nm)}</b><span>${esc(a.nota||a.ms||'')}</span></div><em>${sel===ai?'✓ Hoy':'Usar'}</em></div>`).join('')+
      (sel!=null?`<div class="m-alt-reset" onclick="elegirAlternativa(${idx},null)">↺ Volver a ${esc(ej.nm)}</div>`:'');
  } else ma.style.display='none';

  // PR actual
  const pr=s.logs?.prs?.[prKey(nmHoy)]||s.logs?.prs?.[nmHoy];
  const prEl=document.getElementById('m-pr');
  if(pr){ prEl.style.display='block'; prEl.textContent=`🏆 Tu récord en este ejercicio: ${kgToDisplay(pr.kg)} ${unidadPeso} (${fmtFecha(pr.fecha)})`; }
  else prEl.style.display='none';

  // RM (repetición máxima): si el peso está dado como % de 1RM, se calcula solo con
  // el progreso del socio (fórmula de Epley sobre sus series registradas). No lo captura nadie a mano.
  // El % que se aplica NO es el texto fijo de la plantilla (es solo una etiqueta de dificultad, no
  // está calibrado por repeticiones) — se recalcula según las repeticiones reales del ejercicio,
  // dejando 2 en reserva, para que nunca sugiera menos peso del que el socio ya demostró levantar.
  const pctRM=pct1RM(ej.peso);
  const rmBox=document.getElementById('m-rm');
  if(pctRM && !esEjCardio(ej)){
    const rmKey=prKey(nmHoy);
    const rmKg=s.logs?.rm?.[rmKey];
    const repsBase=parseInt(ej.reps)||10;
    const pctCalc=pctPorReps(repsBase,2);
    rmBox.style.display='block';
    if(rmKg){
      const kgTarget=kgToDisplay(rmKg*pctCalc);
      document.getElementById('m-rm-txt').innerHTML=`💪 <b>Peso sugerido hoy: ${kgTarget} ${unidadPeso}</b> <span style="font-weight:400">(≈${Math.round(pctCalc*100)}% de tu 1RM estimado, dejando 2 reps en reserva)</span><br><span style="font-weight:400">Calculado con tu progreso en este ejercicio — se sigue ajustando solo cada vez que registras una serie.</span>`;
    } else {
      document.getElementById('m-rm-txt').innerHTML=`💡 <b>Aún no tenemos tu peso calculado aquí.</b><br><span style="font-weight:400">Registra tus series con el peso que uses hoy. Desde tu próxima sesión, aquí verás el peso real en vez del porcentaje.</span>`;
    }
  } else {
    rmBox.style.display='none';
  }

  actualizarUnitToggleUI();
  if(!sesionTemp.ej[idx]) sesionTemp.ej[idx]={done:false,sets:[]};
  const saved=sesionTemp.ej[idx].sets;
  const head=document.getElementById('m-sets-head');
  { const mv0=document.getElementById('m-mov'); if(mv0){ mv0.style.display='none'; mv0.innerHTML=''; } }
  const cap=t=>`<div style="font-size:12.5px;color:var(--mu);font-family:var(--fb);line-height:1.5;padding:0 4px 8px">${t}</div>`;
  const msgFc=(ult,tipo,r)=>{
    if(!ult||!ult.fc) return '';
    const lo=ult.fcMeta?ult.fcMeta[0]:r.lo, hi=ult.fcMeta?ult.fcMeta[1]:r.hi;
    const ev=ult.fc<lo?'bajo':ult.fc>hi?'alto':'ok';
    const acc= tipo==='ronda'
      ? (ev==='bajo'?'Hoy sube '+r.paso+' '+(r.u==='reps'?'repeticiones':r.u==='seg'?'segundos':'metros')+' por ronda para llegar a la zona.':ev==='alto'?'Hoy baja '+r.paso+' '+(r.u==='reps'?'repeticiones':r.u==='seg'?'segundos':'metros')+' por ronda.':'Mantén el volumen de la vez pasada.')
      : (ev==='bajo'?'Sube un poco la velocidad o la resistencia.':ev==='alto'?'Baja un poco el ritmo para quedarte en zona.':'Mantén el ritmo.');
    return cap(`📊 Última vez: <b>${ult.fc} lpm</b> promedio (meta ${lo}–${hi}) — ${ev==='ok'?'en zona':ev==='bajo'?'por debajo de la meta':'por encima de la meta'}. ${acc}`);
  };
  if(esEjCardio(ej)){
    if(head) head.style.display='none';
    const s0=saved[0]||{}, r=cardioRx(ej,s);
    document.getElementById('m-sets').innerHTML=`
    <div class="cardio-log">
      ${cap(`⏱ <b>${r.minTxt}</b> continuos, según tu plan.<br>💓 Mantén <b>${r.lo}–${r.hi} lpm</b> (${r.loPct}–${r.hiPct}% de tu FC máx ≈ ${r.fcmax} lpm).`)}
      ${msgFc(ultimoFc(s,nmHoy),'cont',r)}
      <label>Tu frecuencia cardíaca promedio (lpm)<input class="set-kg" type="number" inputmode="numeric" placeholder="Opcional"
        value="${s0.fc!=null?s0.fc:''}" onchange="setCardioFc(${idx},this.value)" onclick="event.stopPropagation()"></label>
      <div class="set-d cardio-ok ${s0.ok?'ok':''}" onclick="setCardioOk(${idx},this)">${s0.ok?'✓ Completado':'Marcar como completado'}</div>
    </div>`;
    document.getElementById('modal-ej').classList.add('open');
    return;
  }
  if(esEjRondas(ej)){
    if(head) head.style.display='none';
    const r=rondasRx(ej,s), ult=ultimoFc(s,nmHoy);
    let obj=r.base;
    if(ult&&ult.fc){ const lo=ult.fcMeta?ult.fcMeta[0]:r.lo, hi=ult.fcMeta?ult.fcMeta[1]:r.hi; if(ult.fc<lo) obj=r.base+r.paso; else if(ult.fc>hi) obj=Math.max(r.paso,r.base-r.paso); }
    document.getElementById('m-sets').innerHTML=
      cap(`💓 Al terminar <b>cada ronda</b> anota tu frecuencia cardíaca. Meta: <b>${r.lo}–${r.hi} lpm</b> (${r.loPct}–${r.hiPct}% de tu FC máx ≈ ${r.fcmax} lpm).`)+msgFc(ult,'ronda',r)+
      Array.from({length:r.series},(_,i)=>`
      <div class="set-r fcr">
        <div class="set-n">${i+1}</div>
        <div class="set-i">${esc(txtUnidad(obj,r.u))}</div>
        <input class="set-kg" type="number" inputmode="numeric" placeholder="lpm" title="Frecuencia cardíaca al terminar la ronda"
          value="${saved[i]?.fc!=null?saved[i].fc:''}" onchange="setFcRonda(${idx},${i},this.value)" onclick="event.stopPropagation()">
        <div class="set-d ${saved[i]?.ok?'ok':''}" onclick="setOk(${idx},${i},this)">${saved[i]?.ok?'✓':''}</div>
      </div>`).join('');
    document.getElementById('modal-ej').classList.add('open');
    return;
  }
  if(esEjMovilidad(ej)){
    if(head) head.style.display='none';
    const mr=movRx(ej,d), mi=movInfo(ej,d);
    const mv=document.getElementById('m-mov'); mv.innerHTML=movBloqueHTML(ej,d); mv.style.display='block';
    const lab=mi.kb
      ? (mr.forma==='tiempo' ? 'Secuencia completa · ~'+mr.min+' min' : 'Ronda completa · '+mr.np+' movimientos')
      : (limpiarReps(ej.reps)||'30 seg');
    document.getElementById('m-sets').innerHTML=cap('Sin carga — marca cada '+(mr.forma==='tiempo'?'secuencia':'ronda')+' al terminarla.')+Array.from({length:mr.series},(_,i)=>`
      <div class="set-r mov"><div class="set-n">${i+1}</div><div class="set-i">${esc(lab)}</div>
      <div class="set-d ${saved[i]?.ok?'ok':''}" onclick="setOk(${idx},${i},this)">${saved[i]?.ok?'✓':''}</div></div>`).join('');
    document.getElementById('modal-ej').classList.add('open');
    return;
  }
  const n=parseInt(ej.series)||4;
  const esIso=esEjIsometrico(ej);
  if(head) head.style.display=esIso?'none':'';
  const metaIso=esIso?segMetaIso(ej):0, ladoI=esIso&&ladoIso(ej);
  const capIso=esIso?`<div style="font-size:12px;color:var(--mu);font-family:var(--fb);line-height:1.45;padding:0 4px 6px">⏱ Se mide por <b>tiempo</b>: anota los segundos que sostuviste en cada ronda${ladoI?' (por lado)':''}. Si usas carga extra (disco, mancuerna), anótala en ${unidadPeso}.</div>`:'';
  document.getElementById('m-sets').innerHTML=capIso+Array.from({length:n},(_,i)=> esIso ? `
    <div class="set-r iso">
      <div class="set-n">${i+1}</div>
      <div class="set-i">Meta ${metaIso} s${ladoI?' / lado':''}</div>
      <input class="set-kg" type="number" inputmode="numeric" placeholder="seg" title="Segundos sostenidos"
        value="${saved[i]?.seg!=null?saved[i].seg:''}" onchange="setSeg(${idx},${i},this.value)" onclick="event.stopPropagation()">
      <input class="set-kg" type="number" inputmode="decimal" step="0.5" placeholder="+${unidadPeso}" title="Carga extra (opcional)"
        value="${saved[i]?.kg!=null?kgToDisplay(saved[i].kg):''}" onchange="setKg(${idx},${i},this.value)" onclick="event.stopPropagation()">
      <div class="set-d ${saved[i]?.ok?'ok':''}" onclick="setOk(${idx},${i},this)">${saved[i]?.ok?'✓':''}</div>
    </div>` : `
    <div class="set-r">
      <div class="set-n">${i+1}</div>
      <div class="set-i">${esc(repsDeSerie(ej,i))}</div>
      <input class="set-kg" type="number" inputmode="decimal" step="0.5" placeholder="${unidadPeso}"
        value="${saved[i]?.kg!=null?kgToDisplay(saved[i].kg):''}" onchange="setKg(${idx},${i},this.value)" onclick="event.stopPropagation()">
      <div class="set-d ${saved[i]?.ok?'ok':''}" onclick="setOk(${idx},${i},this)">${saved[i]?.ok?'✓':''}</div>
    </div>`).join('');
  document.getElementById('modal-ej').classList.add('open');
}
function setCardioMin(idx,v){
  if(!sesionTemp.ej[idx]) sesionTemp.ej[idx]={done:false,sets:[]};
  if(!sesionTemp.ej[idx].sets[0]) sesionTemp.ej[idx].sets[0]={};
  sesionTemp.ej[idx].sets[0].min = v===''?null:+v;
}
function setCardioFc(idx,v){
  if(!sesionTemp.ej[idx]) sesionTemp.ej[idx]={done:false,sets:[]};
  if(!sesionTemp.ej[idx].sets[0]) sesionTemp.ej[idx].sets[0]={};
  sesionTemp.ej[idx].sets[0].fc = v===''?null:+v;
}
function setCardioOk(idx,el){
  if(!sesionTemp.ej[idx]) sesionTemp.ej[idx]={done:false,sets:[]};
  if(!sesionTemp.ej[idx].sets[0]) sesionTemp.ej[idx].sets[0]={};
  const on=!el.classList.contains('ok');
  el.classList.toggle('ok',on); el.textContent=on?'✓ Completado':'Marcar como completado';
  sesionTemp.ej[idx].sets[0].ok=on;
}
function setFcRonda(idx,i,v){
  if(!sesionTemp.ej[idx]) sesionTemp.ej[idx]={done:false,sets:[]};
  if(!sesionTemp.ej[idx].sets[i]) sesionTemp.ej[idx].sets[i]={};
  sesionTemp.ej[idx].sets[i].fc = (v===''||+v<=0)?null:Math.round(+v);
}
function setKg(idx,i,v){
  if(!sesionTemp.ej[idx]) sesionTemp.ej[idx]={done:false,sets:[]};
  if(!sesionTemp.ej[idx].sets[i]) sesionTemp.ej[idx].sets[i]={};
  sesionTemp.ej[idx].sets[i].kg=displayToKg(v);
}
function setSeg(idx,i,v){
  if(!sesionTemp.ej[idx]) sesionTemp.ej[idx]={done:false,sets:[]};
  if(!sesionTemp.ej[idx].sets[i]) sesionTemp.ej[idx].sets[i]={};
  sesionTemp.ej[idx].sets[i].seg = (v===''||+v<=0)?null:Math.round(+v);
}
function setOk(idx,i,el){
  if(!sesionTemp.ej[idx]) sesionTemp.ej[idx]={done:false,sets:[]};
  if(!sesionTemp.ej[idx].sets[i]) sesionTemp.ej[idx].sets[i]={};
  const on=!el.classList.contains('ok');
  el.classList.toggle('ok',on); el.textContent=on?'✓':'';
  sesionTemp.ej[idx].sets[i].ok=on;
}
function closeModal(){ document.getElementById('modal-ej').classList.remove('open'); }
document.getElementById('modal-ej').addEventListener('click',e=>{ if(e.target===e.currentTarget) closeModal(); });

// ── Finalizar sesión: registra evolución y PRs ──
function finalizarSesion(){
  const s0=activeSocio;
  if(!s0){ showToast('⚠ Vuelve a entrar con tu código para registrar la sesión'); return; }
  if(!sesionTemp){ showToast('⚠ Abre el día desde tu rutina para registrar la sesión'); return; }
  const idxs0=Object.keys(sesionTemp.ej);
  const hechos0=idxs0.filter(i=>sesionTemp.ej[i].done || (sesionTemp.ej[i].sets||[]).some(x=>x&&(x.ok||x.kg||x.seg||x.fc))).length;
  if(hechos0===0) uiConfirm('No marcaste ningún ejercicio. ¿Registrar la sesión de todas formas?',finalizarSesionConfirmada,{label:'Registrar de todas formas'});
  else finalizarSesionConfirmada();
}
function finalizarSesionConfirmada(reemplazar){
  try{
    const s=activeSocio;
    if(!s) return;
    asegurarLogs(s);
    const d=s.rutina[sesionTemp.diaKey];
    if(!d){ showToast('⚠ No se encontró la rutina de ese día'); return; }
    const idxs=Object.keys(sesionTemp.ej);
    const hechos=idxs.filter(i=>sesionTemp.ej[i].done || (sesionTemp.ej[i].sets||[]).some(x=>x&&(x.ok||x.kg||x.seg||x.fc))).length;
    const hoy=fechaISO(new Date());
    const previa=s.logs.sesiones.find(x=>x.fecha===hoy);
    if(previa && !reemplazar){
      uiConfirm('Ya registraste una sesión hoy ('+(previa.tipo||'tu rutina')+'). ¿Quieres reemplazarla con lo que acabas de registrar? Tus récords y pesos calculados se actualizarán con estos datos nuevos.',
        ()=>finalizarSesionConfirmada(true), {label:'Reemplazar sesión de hoy'});
      return;
    }
    if(previa) s.logs.sesiones=s.logs.sesiones.filter(x=>x.fecha!==hoy);

    // Volumen y PRs
    let volumen=0, tutSes=0, cardioMinSes=0; const cambios=[], detalle=[];
    idxs.forEach(i=>{
      const ej=d.ejercicios[i]; if(!ej) return;
      const alt=ejEjecutado(ej,i);
      const nmHecho=alt?alt.nm:ej.nm;
      if(alt) cambios.push({orig:ej.nm, alt:alt.nm});
      // Detalle por ejercicio: peso máximo y series hechas (para proponer la progresión)
      const sets=(sesionTemp.ej[i].sets||[]).filter(Boolean);
      const kgs=sets.map(x=>+x.kg||0).filter(x=>x>0);
      const hechas=sets.filter(x=>x.ok||x.kg>0||x.seg>0||x.fc>0).length || (sesionTemp.ej[i].done?(parseInt(ej.series)||0):0);
      // Isométricos: cuentan por TIEMPO. Segundos reales si los anotó; si solo marcó ✓, la meta de la ronda.
      const esIsoEj=esEjIsometrico(ej);
      let segsEj=[];
      if(esIsoEj){
        const metaI=segMetaIso(ej), multI=ladoIso(ej)?2:1;
        segsEj=sets.map(x=>x.seg>0?x.seg:(x.ok?metaI:0)).filter(x=>x>0);
        if(!segsEj.length && sesionTemp.ej[i].done) segsEj=Array.from({length:parseInt(ej.series)||0},()=>metaI);
        tutSes += segsEj.reduce((a,b)=>a+b,0)*multI;
        // con carga extra: 3 s de tensión ≈ 1 repetición → kg × segundos ÷ 3 entra al volumen
        sets.forEach(x=>{ const sg=x.seg>0?x.seg:(x.ok?metaI:0);
          if(x.kg>0 && sg>0){ volumen += x.kg*sg*multI/3;
            const k=prKey(nmHecho), pr=s.logs.prs[k]; if(!pr || x.kg>pr.kg) s.logs.prs[k]={kg:x.kg,fecha:hoy}; } });
      }
      // Cardio: FC promedio vs zona objetivo (para proponer más o menos volumen la próxima vez)
      let fcInfo=null;
      if(esEjCardio(ej)||esEjRondas(ej)){
        const rxC=esEjCardio(ej)?cardioRx(ej,s):rondasRx(ej,s);
        const fcs=sets.map(x=>x.fc).filter(x=>x>0);
        if(esEjCardio(ej) && sets[0] && sets[0].ok) cardioMinSes += rxC.total;
        if(fcs.length){ const prom=Math.round(fcs.reduce((a,b)=>a+b,0)/fcs.length);
          fcInfo={fc:prom, fcMeta:[rxC.lo,rxC.hi], fcEval:prom<rxC.lo?'bajo':prom>rxC.hi?'alto':'ok'}; }
      }
      if(hechas||kgs.length||segsEj.length||fcInfo){ const reg={n:ej.nm, s:hechas, p:parseInt(ej.series)||hechas}; if(kgs.length) reg.kg=Math.max(...kgs); if(segsEj.length) reg.seg=Math.max(...segsEj); if(fcInfo) Object.assign(reg,fcInfo); if(alt) reg.alt=alt.nm; detalle.push(reg); }
      if(esIsoEj) return;
      (sesionTemp.ej[i].sets||[]).forEach((set,si)=>{
        if(set&&set.kg>0){
          const repsTxt=repsDeSerie(ej,si), repsObj=parseInt(repsTxt)||0;
          volumen += set.kg*(repsObj||10);
          const k=prKey(nmHecho), pr=s.logs.prs[k];
          if(!pr || set.kg>pr.kg) s.logs.prs[k]={kg:set.kg,fecha:hoy};
          // 1RM estimado (fórmula de Epley) a partir de esta serie — solo con reps de fuerza normales,
          // nunca con series de tiempo (seg/min) donde el número no son repeticiones.
          if(repsObj>0 && repsObj<=20 && !/seg|min/i.test(repsTxt)){
            const rmEst=Math.round(set.kg*(1+repsObj/30)*10)/10;
            if(!s.logs.rm) s.logs.rm={};
            if(!s.logs.rm[k] || rmEst>s.logs.rm[k]) s.logs.rm[k]=rmEst;
          }
        }
      });
    });

    s.logs.sesiones.push({
      fecha:hoy, ts:Date.now(), diaKey:sesionTemp.diaKey,
      tipo:d.tipo, ejercicios:hechos||d.ejercicios.length, volumen:Math.round(volumen), tut:Math.round(tutSes), cardioMin:Math.round(cardioMinSes),
      hora:new Date().toTimeString().substring(0,5), cambios, detalle
    });
    dbSave(s.code);
    sesionTemp=null;
    showToast('✓ Sesión guardada'+(volumen>0?' · '+Math.round(volumen).toLocaleString()+' kg de volumen':'')+(tutSes>=20?' · '+fmtTut(tutSes)+' de isométricos':'')+(cardioMinSes>0?' · '+cardioMinSes+' min de cardio':''));
    go('s-dash'); refreshDash(); dashTab('progreso');
  }catch(e){
    console.error('finalizarSesion',e);
    showToast('⚠ No se pudo guardar la sesión: '+(e&&e.message||e));
  }
}
