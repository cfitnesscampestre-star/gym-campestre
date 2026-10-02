/* ═══ quiz ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// QUIZ — 11 pasos
// ═════════════════════════════════════════
let qStep = 1;
const Q_TOTAL = 11;
const qAnswers = {nombre:'',objetivo:'',nivel:'',dias:4,edad:35,genero:'',peso:75,estatura:170,zonas:[],limitaciones:[],cardio:'',disciplina:'',lesionRehab:'',entrenadorId:'',entrenadorNombre:'',diasSemana:[],tomaClases:'',clasesSel:[],clasesGrupales:[]};

function startQuiz(){
  qStep=1; showQStep(1); go('s-quiz');
}
function showQStep(n){
  qStep=n;
  document.querySelectorAll('.q-sc').forEach(s=>s.classList.remove('on'));
  document.getElementById('qq'+n).classList.add('on');
  document.getElementById('qstep').textContent=n;
  document.getElementById('qprog').style.width=Math.round(n/Q_TOTAL*100)+'%';
}

// ── Selección de objetivo: puede abrir sub-pasos ──
function qSelObjetivo(el,objetivo){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  qAnswers.objetivo=objetivo;
  // limpiar ramas previas
  qAnswers.disciplina=''; qAnswers.lesionRehab='';
  document.getElementById('qb2').disabled=false;
}
function qNext(step){
  if(step===1){
    const nom=document.getElementById('qi-nom').value.trim();
    if(!nom){ document.getElementById('qi-nom').style.borderColor='var(--r)'; return; }
    qAnswers.nombre=nom;
  }
  // Rama tras el objetivo
  if(step===2){
    if(qAnswers.objetivo==='RENDIMIENTO DEPORTIVO'){ abrirDisciplinas(); mostrarSub('qq2b'); return; }
    if(qAnswers.objetivo==='REHABILITACIÓN'){ abrirLesiones(); mostrarSub('qq2c'); return; }
  }
  // Tras elegir cuántos días: pedir CUÁLES días y si toma clases grupales
  if(step===4){
    qAnswers.dias=parseInt(document.getElementById('qr-dias').value);
    abrirDiasSemana();
    mostrarSub('qq4b');
    window.scrollTo(0,0);
    return;
  }
  showQStep(step+1); window.scrollTo(0,0);
}
function qPrev(step){
  if(step===5){ mostrarSub('qq4c'); window.scrollTo(0,0); return; }
  showQStep(step-1); window.scrollTo(0,0);
}
function quizBack(){ if(qStep>1) qPrev(qStep); else go('s-inicio'); }

// ── Q4b: días específicos de la semana (no solo cuántos) ──
function abrirDiasSemana(){
  const dias=[['lun','Lun'],['mar','Mar'],['mie','Mié'],['jue','Jue'],['vie','Vie'],['sab','Sáb'],['dom','Dom']];
  const cont=document.getElementById('dias-sem-opts');
  cont.innerHTML=dias.map(([k,l])=>`<div class="chk chk-compact" style="text-align:center;padding:12px 4px" onclick="qChkDiaSemana(this,'${k}')">${l}</div>`).join('');
  qAnswers.diasSemana=[];
  document.getElementById('q4b-need').textContent=qAnswers.dias;
  actualizarContadorDiasSemana();
}
function qChkDiaSemana(el,k){
  el.classList.toggle('ck');
  if(el.classList.contains('ck')){ if(!qAnswers.diasSemana.includes(k)) qAnswers.diasSemana.push(k); }
  else qAnswers.diasSemana=qAnswers.diasSemana.filter(x=>x!==k);
  actualizarContadorDiasSemana();
}
function actualizarContadorDiasSemana(){
  const n=qAnswers.diasSemana.length, need=qAnswers.dias;
  document.getElementById('q4b-count').textContent=n+' de '+need+' días seleccionados';
  document.getElementById('qb4b').disabled=(n!==need);
}
function qNext4b(){
  if(qAnswers.diasSemana.length!==qAnswers.dias) return;
  qAnswers.tomaClases=''; qAnswers.clasesSel=[]; qAnswers.clasesGrupales=[];
  document.getElementById('clases-bloque').style.display='none';
  document.querySelectorAll('#qq4c .opt').forEach(o=>o.classList.remove('sel'));
  document.getElementById('qb4c').disabled=true;
  mostrarSub('qq4c'); window.scrollTo(0,0);
}

// ── Q4c: clases grupales además del gym ──
const CLASES_GRUPALES_OPC=['Entrenamiento funcional','Body Pump','Body Combat','Body Balance','Yoga','Spinning','RPM','TRX','Bootcamp','Fit Mom','Acondicionamiento físico (adulto mayor)'];
function qSelTomaClases(el,val){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  qAnswers.tomaClases=val;
  document.getElementById('clases-bloque').style.display=val==='si'?'block':'none';
  if(val==='no'){ qAnswers.clasesSel=[]; qAnswers.clasesGrupales=[]; document.getElementById('qb4c').disabled=false; }
  else { abrirClasesGrupales(); actualizarBotonClases(); }
}
function abrirClasesGrupales(){
  const cont=document.getElementById('clases-check-opts');
  cont.innerHTML=CLASES_GRUPALES_OPC.map(c=>`<div class="chk" onclick="qChkClaseGrupal(this,'${c}')"><span>${c}</span><span class="chk-tick">✓</span></div>`).join('');
}
function qChkClaseGrupal(el,nombre){
  el.classList.toggle('ck');
  if(el.classList.contains('ck')){ if(!qAnswers.clasesSel.includes(nombre)) qAnswers.clasesSel.push(nombre); }
  else { qAnswers.clasesSel=qAnswers.clasesSel.filter(c=>c!==nombre); qAnswers.clasesGrupales=qAnswers.clasesGrupales.filter(c=>c.clase!==nombre); }
  renderClasesDetalle();
}
function renderClasesDetalle(){
  const cont=document.getElementById('clases-detalle');
  const diasCortos=[['lun','L'],['mar','M'],['mie','X'],['jue','J'],['vie','V'],['sab','S'],['dom','D']];
  cont.innerHTML=qAnswers.clasesSel.map(nombre=>{
    let c=qAnswers.clasesGrupales.find(x=>x.clase===nombre);
    if(!c){ c={clase:nombre,dias:[],entrenaMismoDia:false}; qAnswers.clasesGrupales.push(c); }
    return `<div style="padding:12px;background:var(--in-bg);border:1px solid var(--b);border-radius:12px;margin-bottom:8px">
      <div style="font-family:var(--fb);font-weight:700;font-size:13px;margin-bottom:8px">${nombre}</div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:10px">
        ${diasCortos.map(([k,l])=>`<div class="chk chk-compact ${c.dias.includes(k)?'ck':''}" style="text-align:center;padding:8px 2px;font-size:11px" onclick="qToggleDiaClase('${esc2(nombre)}','${k}',this)">${l}</div>`).join('')}
      </div>
      <div class="chk ${c.entrenaMismoDia?'ck':''}" style="justify-content:flex-start;text-align:left;font-size:12px;padding:10px 14px" onclick="qToggleMismoDia('${esc2(nombre)}',this)">
        <span class="chk-tick">✓</span><span>Ese día también quiero entrenar en el gym</span>
      </div>
    </div>`;
  }).join('');
  actualizarBotonClases();
}
function esc2(s){ return String(s).replace(/'/g,"\\'"); }
function qToggleDiaClase(nombre,dia,el){
  el.classList.toggle('ck');
  const c=qAnswers.clasesGrupales.find(x=>x.clase===nombre); if(!c) return;
  if(el.classList.contains('ck')){ if(!c.dias.includes(dia)) c.dias.push(dia); }
  else c.dias=c.dias.filter(d=>d!==dia);
  actualizarBotonClases();
}
function qToggleMismoDia(nombre,el){
  el.classList.toggle('ck');
  const c=qAnswers.clasesGrupales.find(x=>x.clase===nombre); if(!c) return;
  c.entrenaMismoDia=el.classList.contains('ck');
}
function actualizarBotonClases(){
  const btn=document.getElementById('qb4c'); if(!btn) return;
  if(qAnswers.tomaClases==='no'){ btn.disabled=false; return; }
  const ok=qAnswers.clasesSel.length>0 && qAnswers.clasesGrupales.every(c=>c.dias.length>0);
  btn.disabled=!ok;
}
function qNext4c(){
  if(document.getElementById('qb4c').disabled) return;
  showQStep(5); window.scrollTo(0,0);
}

// ── Sub-pantallas (disciplina / lesión) ──
function mostrarSub(id){
  document.querySelectorAll('.q-sc').forEach(s=>s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  window.scrollTo(0,0);
}
const DEPORTE_ICONOS={tenis:'racquet',golf:'golf',natacion:'swim',gimnasia:'stretch',futbol:'ball',padel:'racquet',frontenis:'racquet',basquet:'basketball',taekwondo:'belt',squash:'racquet',fitness:'flame'};
function abrirDisciplinas(){
  const cont=document.getElementById('disc-opts');
  cont.innerHTML=DEPORTES.map(d=>`<div class="opt" onclick="qSelDisc(this,'${d.id}')"><div class="oi">${ico(DEPORTE_ICONOS[d.id]||'star')}</div><div class="ol" style="font-size:15px">${d.nm}</div></div>`).join('');
}
function qSelDisc(el,id){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  qAnswers.disciplina=id;
  document.getElementById('qb2b').disabled=false;
}
function qNext2b(){ if(!qAnswers.disciplina) return; mostrarSub('qq2b2'); window.scrollTo(0,0); }
function qPrev2b(){ mostrarSub('qq2'); }
function qSelEntorno(el,val){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  qAnswers.entorno=val;
  document.getElementById('qb2b2').disabled=false;
}
function qNext2b2(){ if(!qAnswers.entorno) return; showQStep(3); window.scrollTo(0,0); }

function qNext2c(){
  if(!qAnswers.lesionRehab) return;
  abrirGimCuando();
  abrirGimClases();
  mostrarSub('qqg1');
  window.scrollTo(0,0);
}
function qPrev2c(){ mostrarSub('qq2'); }

// ══ CUESTIONARIO ESPECIALIZADO GIMNASIA (infantil) ══
qAnswers.gimEdad=10; qAnswers.gimInicioDolor=''; qAnswers.gimCuando=[];
qAnswers.gimDolor=3; qAnswers.gimClases=[]; qAnswers.gimSigue='';
qAnswers.gimDiagnostico=''; qAnswers.gimDiagTexto=''; qAnswers.gimMedicoAutoriza='';
qAnswers.entorno='';

const GIM_CUANDO_OPC = {
  osgood:['Al saltar o brincar','Al arrodillarse','Al hacer sentadillas o flexionar la rodilla','Al presionar la bolita bajo la rodilla','Al subir/bajar escaleras'],
  tobillo:['Al aterrizar de un salto','Al girar o pivotear','Al caminar en puntas','Al apoyar todo el peso','Con inestabilidad (se "va" el tobillo)'],
  plantar:['En el primer paso de la mañana','Al caminar en puntas o media punta','Al saltar','En el talón al apoyar','Después de entrenar'],
  muneca:['Al apoyar las manos (pino, rueda)','Al cargar peso en la muñeca','Al girar la muñeca','Al empujar o presionar','Con hormigueo en los dedos'],
  cadera:['Al abrir en split','En patadas altas','Al levantar la pierna','Con chasquido en la cadera','En la ingle profunda'],
  espalda:['Al hacer puente o arco','En hiperextensiones','Al inclinarse hacia atrás','Al levantarse','En movimientos de torsión'],
  hombro:['Al levantar el brazo','Al cargar peso arriba de la cabeza','De noche, al acostarte de ese lado','Al empujar (press, lagartijas)','Con hormigueo en el brazo o la mano'],
  cuello:['Al girar la cabeza','Después de estar mucho tiempo en el celular o la compu','Al cargar peso sobre los hombros','Con dolor de cabeza asociado','Al despertar'],
};
function abrirGimCuando(){
  const opts=GIM_CUANDO_OPC[qAnswers.lesionRehab]||['Al moverse','Al cargar peso','En reposo','Al entrenar'];
  const cont=document.getElementById('gcuando-opts');
  cont.innerHTML=opts.map(o=>`<div class="chk" style="justify-content:flex-start;text-align:left;line-height:1.3" onclick="gChkCuando(this)"><span class="chk-tick">✓</span><span class="chk-lbl">${esc(o)}</span></div>`).join('');
  qAnswers.gimCuando=[];
}
function gChkCuando(el){
  const txt=el.querySelector('.chk-lbl').textContent.trim();
  el.classList.toggle('ck');
  if(el.classList.contains('ck')){ if(!qAnswers.gimCuando.includes(txt)) qAnswers.gimCuando.push(txt); }
  else qAnswers.gimCuando=qAnswers.gimCuando.filter(x=>x!==txt);
}
function abrirGimClases(){
  const dias=[['lun','L'],['mar','M'],['mie','X'],['jue','J'],['vie','V'],['sab','S'],['dom','D']];
  const cont=document.getElementById('gclases-opts');
  cont.innerHTML=dias.map(([k,l])=>`<div class="chk chk-compact" style="text-align:center;padding:12px 4px" onclick="gChkClase(this,'${k}')">${l}</div>`).join('');
  qAnswers.gimClases=[];
}
function gChkClase(el,k){
  el.classList.toggle('ck');
  if(el.classList.contains('ck')){ if(!qAnswers.gimClases.includes(k)) qAnswers.gimClases.push(k); }
  else qAnswers.gimClases=qAnswers.gimClases.filter(x=>x!==k);
}
function gSel(el,key,val){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  if(key==='inicioDolor') qAnswers.gimInicioDolor=val;
  else if(key==='sigueEntrenando') qAnswers.gimSigue=val;
  else if(key==='medicoAutoriza') qAnswers.gimMedicoAutoriza=val;
  else if(key==='genero') qAnswers.gimGenero=val;
  else if(key==='soloTerapia') qAnswers.gimSoloTerapia=val;
  const g=el.closest('.q-sc').id;
  if(g==='qqg2') document.getElementById('gb2').disabled=false;
  if(g==='qqg1b') document.getElementById('gb1b').disabled=false;
}
function gNext1b(){
  if(!qAnswers.gimGenero) return;
  qAnswers.gimPeso=parseInt(document.getElementById('qr-gpeso').value);
  qAnswers.gimEstatura=parseInt(document.getElementById('qr-gest').value);
  mostrarSub('qqg2');
}
function gSelDiag(el,val){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  qAnswers.gimDiagnostico=val;
  document.getElementById('gb6').disabled=false;
  // Mostrar detalle si SÍ tiene diagnóstico, aviso si NO
  document.getElementById('gdiag-detalle').style.display = val==='si' ? 'block' : 'none';
  document.getElementById('gdiag-aviso').style.display = val==='no' ? 'block' : 'none';
}
function gNext(paso){
  if(paso===1){ qAnswers.gimEdad=parseInt(document.getElementById('qr-gedad').value); mostrarSub('qqg1b'); }
  else if(paso===2){ if(!qAnswers.gimInicioDolor) return; mostrarSub('qqg3'); }
  else if(paso===3){ mostrarSub('qqg4'); }
  else if(paso===4){ qAnswers.gimDolor=parseInt(document.getElementById('qr-gdolor').value); mostrarSub('qqg5'); }
  else if(paso===5){ mostrarSub('qqg6'); }
  else if(paso===6){
    if(!qAnswers.gimDiagnostico) return;
    qAnswers.gimDiagTexto=(document.getElementById('qi-gdiag')?.value||'').trim();
    qAnswers.gimClases=(qAnswers.gimClases||[]);
    qAnswers.nivel='PRINCIPIANTE';
    qAnswers.edad=qAnswers.gimEdad;
    qAnswers.dias=Math.min(6, Math.max(2, 7-qAnswers.gimClases.length));
    qAnswers.peso=qAnswers.gimPeso;
    qAnswers.estatura=qAnswers.gimEstatura;
    qAnswers.genero=qAnswers.gimGenero;
    qAnswers.cardio='NUNCA O CASI NUNCA';
    qNextToTrainer(generarRutinaGim,'qqg6');
  }
  window.scrollTo(0,0);
}

function abrirLesiones(){
  const cont=document.getElementById('lesion-opts');
const REHAB_ICONOS={osgood:'leg',tobillo:'leg',plantar:'leg',muneca:'dumbbell',cadera:'leg',espalda:'stretch'};
  cont.innerHTML=REHAB_PROTOCOLOS.map(p=>`<div class="opt" onclick="qSelLesion(this,'${p.id}')"><div class="oi">${ico(REHAB_ICONOS[p.id]||'medical')}</div><div class="ol" style="font-size:14px">${p.zona}</div><div class="os">${p.subtitulo}</div></div>`).join('');
}
function qSelLesion(el,id){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  qAnswers.lesionRehab=id;
  document.getElementById('qb2c').disabled=false;
}

function qSel(el,key){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  qAnswers[key]=el.querySelector('.ol').textContent.trim();
  const stepN=el.closest('.q-sc').id.replace('qq','');
  const btn=document.getElementById('qb'+stepN);
  if(btn) btn.disabled=false;
}
function qMulti(el){
  el.classList.toggle('sel');
  const label=el.querySelector('.ol').textContent.trim();
  if(el.classList.contains('sel')){ if(!qAnswers.zonas.includes(label)) qAnswers.zonas.push(label); }
  else qAnswers.zonas=qAnswers.zonas.filter(z=>z!==label);
}
function qChk(el){
  el.classList.toggle('ck');
  const label=el.textContent.trim().replace('✓','').trim();
  document.querySelector('.chk-none')?.classList.remove('ck');
  qAnswers.limitaciones=qAnswers.limitaciones.filter(l=>l!=='Sin limitaciones');
  if(el.classList.contains('ck')){ if(!qAnswers.limitaciones.includes(label)) qAnswers.limitaciones.push(label); }
  else qAnswers.limitaciones=qAnswers.limitaciones.filter(l=>l!==label);
}
function qNone(el){
  document.querySelectorAll('.chk').forEach(c=>c.classList.remove('ck'));
  el.classList.add('ck');
  qAnswers.limitaciones=['Sin limitaciones'];
}
