/* ═══ filosofia entrenador ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// HUELLA VISUAL DE FILOSOFÍA — radar SVG reutilizable
// (selector de coach en el registro + resumen en "Mi filosofía")
// ═════════════════════════════════════════
function svgRadarFilosofia(ph, size){
  size = size||64;
  const pr = (ph&&ph.priorities) || {fuerza:3,hipertrofia:3,movilidad:3,rendimiento:3};
  const variedad = (ph&&ph.exerciseStyle&&ph.exerciseStyle.variety) || 3;
  const axes = [
    {v: pr.fuerza||3}, {v: pr.hipertrofia||3}, {v: pr.movilidad||3}, {v: pr.rendimiento||3}, {v: variedad}
  ];
  const n=axes.length, cx=size/2, cy=size/2, R=size*0.36;
  const ns="http://www.w3.org/2000/svg";
  let svg = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  for(let ring=1; ring<=3; ring++){
    const r=R*(ring/3); let pts=[];
    for(let i=0;i<n;i++){ const a=-Math.PI/2+i*(2*Math.PI/n); pts.push(`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`); }
    svg += `<polygon points="${pts.join(' ')}" fill="none" stroke="var(--b)" stroke-width="0.6"/>`;
  }
  let dpts=[];
  axes.forEach((a,i)=>{ const r=R*(a.v/5); const ang=-Math.PI/2+i*(2*Math.PI/n); dpts.push(`${cx+r*Math.cos(ang)},${cy+r*Math.sin(ang)}`); });
  svg += `<polygon points="${dpts.join(' ')}" fill="var(--p)" fill-opacity="0.32" stroke="var(--p)" stroke-width="1.4"/>`;
  svg += `</svg>`;
  return svg;
}

// ═════════════════════════════════════════
// MI FILOSOFÍA — quiz del entrenador (9 pasos)
// Se guarda en DB.entrenadores[id].filosofia y de ahí
// alimenta el prompt de IA y el selector de coach del socio.
// ═════════════════════════════════════════
let filoStep=1;
let filoDraft=null;
function actualizarBotonMiFilosofia(){
  const bF=document.getElementById('btn-mi-filosofia');
  const bN=document.getElementById('btn-nuevo-ent');
  if(bF) bF.style.display = (staffActivoEntId && entHace(DB.entrenadores[staffActivoEntId],'entrenamiento')) ? 'inline-block' : 'none';
  if(bN) bN.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bV=document.getElementById('btn-ver-ent'); if(bV) bV.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bRes=document.getElementById('btn-resumen'); if(bRes) bRes.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bAp=document.getElementById('btn-apariencia'); if(bAp) bAp.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bLu=document.getElementById('btn-lugares'); if(bLu) bLu.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bFb=document.getElementById('btn-firebase'); if(bFb) bFb.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bR=document.getElementById('btn-respaldo'); if(bR) bR.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bX=document.getElementById('btn-reset'); if(bX) bX.style.display = (staffRol==='coordinador' && !fbListo) ? 'inline-block' : 'none';
}
function filoBase(){
  return {tagline:'',priorities:{fuerza:3,hipertrofia:3,movilidad:3,rendimiento:3,funcional:3},progressStyle:'',
    structure:{split:'',periodization:'',warmupRatio:2,method:''},exerciseStyle:{variety:3,restStyle:''},
    dosis:{fuerza:'',hipertrofia:'',resistencia:''},
    metodos:{favoritos:[],evita:[],frecuencia:3,principiantes:'basicos'},
    seleccion:{libreVsMaquina:3,unilateral:3,firma:'',nunca:''},
    sesion:{calentamiento:'',orden:'',tempo:'',core:'',cardio:''},
    horaPico:{sustitucion:'maquina',nota:''},
    sampleRoutineNote:'',adjustmentPhilosophy:'',
    rutinasModelo:{}};   // hasta 3 rutinas reales del entrenador: fuerza · grasa · rendimiento (ver js/32-filosofia-modelos.js)
}
function filoMezclar(base,obj){
  const out=JSON.parse(JSON.stringify(base));
  Object.keys(obj||{}).forEach(k=>{
    if(obj[k] && typeof obj[k]==='object' && !Array.isArray(obj[k]) && out[k] && typeof out[k]==='object') out[k]=Object.assign(out[k],obj[k]);
    else if(obj[k]!==undefined && obj[k]!==null) out[k]=obj[k];
  });
  return out;
}
const FILO_TOTAL=10;
let filoEditId=null; // a quién se le está editando la filosofía (coordinador puede editar la de otros)
function abrirMiFilosofia(idAjeno){
  const id = idAjeno || staffActivoEntId;
  if(!id){ showToast('Esta sección es solo para entrenadores con perfil propio'); return; }
  if(idAjeno && staffRol!=='coordinador'){ showToast('Solo dirección puede editar la filosofía de otro entrenador'); return; }
  filoEditId=id;
  const ent=getEntrenador(id);
  filoDraft = filoMezclar(filoBase(), ent&&ent.filosofia);
  filoStep=1;
  renderFiloStep();
  const t=document.getElementById('filo-modal-tag'); if(t) t.textContent = idAjeno ? ('FILOSOFÍA DE '+(ent?ent.nombre:idAjeno).toUpperCase()) : 'TU FILOSOFÍA DE ENTRENAMIENTO';
  document.getElementById('modal-filosofia').classList.add('open');
}
// Guarda automáticamente el avance en cada paso, para no perderlo si se cierra el cuestionario a medias
function filoGuardarProgreso(){
  if(!filoEditId) return;
  if(!DB.entrenadores[filoEditId]) DB.entrenadores[filoEditId]={id:filoEditId,nombre:document.getElementById('staff-nombre')?.textContent||filoEditId,rol:'entrenador',especialidades:[]};
  DB.entrenadores[filoEditId].filosofia = JSON.parse(JSON.stringify(filoDraft));
  dbSaveEntrenador(filoEditId);
}
function cerrarModalFilosofia(){ document.getElementById('modal-filosofia').classList.remove('open'); }

function filoSliderRow(label, val, path, extremos){
  const id='fs-'+path.replace('.','-');
  return `<div style="margin-bottom:14px">
    <div style="display:flex;justify-content:space-between;margin-bottom:5px">
      <span style="font-size:var(--fs-sm);font-weight:600">${label}</span>
      <span style="font-size:var(--fs-xs);color:var(--p);font-weight:700" id="${id}">${val}</span>
    </div>
    <input type="range" min="1" max="5" value="${val}" style="width:100%;accent-color:var(--p)"
      oninput="document.getElementById('${id}').textContent=this.value; filoDraft.${path}=parseInt(this.value)">
    ${extremos?`<div style="display:flex;justify-content:space-between;font-size:var(--fs-2xs);color:var(--mu);margin-top:2px"><span>${extremos[0]}</span><span>${extremos[1]}</span></div>`:''}
  </div>`;
}
function filoChoiceGroup(name, options, current){
  return `<div class="opts" style="grid-template-columns:1fr;max-height:none;gap:6px;margin-bottom:12px">` +
    options.map(o=>`<div class="opt" style="padding:9px 12px;text-align:left;${current===o.value?'border-color:var(--p);background:color-mix(in srgb, var(--p) 6%, transparent)':''}" onclick="filoSetChoice(this,'${name}','${o.value}')"><div class="ol" style="font-size:var(--fs-sm)">${o.label}</div>${o.sub?`<div class="os" style="text-transform:none;letter-spacing:0">${o.sub}</div>`:''}</div>`).join('') +
    `</div>`;
}
function filoSetChoice(el,name,val){
  el.parentElement.querySelectorAll('.opt').forEach(o=>{o.style.borderColor='';o.style.background='';});
  el.style.borderColor='var(--p)'; el.style.background='color-mix(in srgb, var(--p) 6%, transparent)';
  const path=name.split('.');
  if(path.length===1) filoDraft[path[0]]=val; else filoDraft[path[0]][path[1]]=val;
}
function filoText(path, ph, rows){
  const val=path.split('.').reduce((o,k)=>o&&o[k],filoDraft)||'';
  return `<textarea rows="${rows||2}" style="width:100%;padding:11px;background:var(--in-bg);border:1px solid var(--b);border-radius:10px;font-family:var(--fb);font-size:var(--fs-sm);color:var(--tx);outline:none;resize:vertical;margin-bottom:12px" placeholder="${ph}" oninput="filoDraft.${path}=this.value">${esc(val)}</textarea>`;
}
function filoSub(t){ return `<div class="q-sub" style="margin:4px 0 7px">${t}</div>`; }
function filoCycleMetodo(id,el){
  const m=filoDraft.metodos;
  if(m.favoritos.includes(id)){ m.favoritos=m.favoritos.filter(x=>x!==id); m.evita.push(id); }
  else if(m.evita.includes(id)){ m.evita=m.evita.filter(x=>x!==id); }
  else m.favoritos.push(id);
  el.className='filo-chip '+(m.favoritos.includes(id)?'fav':m.evita.includes(id)?'no':'');
}
function renderFiloStep(){
  document.getElementById('filo-prog').style.width=(filoStep/FILO_TOTAL*100)+'%';
  const c=document.getElementById('filo-body');
  const F=filoDraft;
  const paso=`<div style="font-size:var(--fs-2xs);color:var(--mu);margin-bottom:6px">Paso ${filoStep} de ${FILO_TOTAL}</div>`;
  let html=paso;
  if(filoStep===1){
    html+=`<div class="q-title" style="font-size:var(--fs-2xl)">En una frase, ¿cuál es tu método?</div>
      ${filoSub('Es lo primero que lee el socio cuando te elige.')}
      ${filoText('tagline','Ej. Construyo fuerza real antes que estética.')}
      ${filoSub('¿Qué prioriza tu método? (1 casi nada · 5 tu sello)')}
      ${filoSliderRow('Fuerza', F.priorities.fuerza, 'priorities.fuerza')}
      ${filoSliderRow('Hipertrofia / estética', F.priorities.hipertrofia, 'priorities.hipertrofia')}
      ${filoSliderRow('Movilidad y prevención', F.priorities.movilidad, 'priorities.movilidad')}
      ${filoSliderRow('Rendimiento deportivo', F.priorities.rendimiento, 'priorities.rendimiento')}
      ${filoSliderRow('Entrenamiento funcional', F.priorities.funcional, 'priorities.funcional')}`;
  } else if(filoStep===2){
    html+=`<div class="q-title" style="font-size:var(--fs-2xl)">Progreso y estructura</div>
      ${filoSub('¿Cómo defines el progreso?')}
      ${filoChoiceGroup('progressStyle',[{value:'numeros',label:'Por números (peso, reps, cargas)'},{value:'calidad',label:'Por calidad de movimiento'},{value:'mixto',label:'Ambos, según la persona'}], F.progressStyle)}
      ${filoSub('¿Cómo periodizas?')}
      ${filoChoiceGroup('structure.periodization',[
        {value:'lineal',label:'Lineal',sub:'Subo carga poco a poco, bloque tras bloque'},
        {value:'ondulante',label:'Ondulante',sub:'Alterno días pesados, medios y ligeros en la semana'},
        {value:'bloques',label:'Por bloques',sub:'Acumulación → intensificación → descarga'},
        {value:'conjugada',label:'Conjugada',sub:'Fuerza máxima y velocidad en la misma semana'}], F.structure.periodization)}
      ${filoSub('¿Cómo estructuras la semana?')}
      ${filoText('structure.split','Ej. Torso/pierna 4 días; full body para principiantes.')}`;
  } else if(filoStep===3){
    html+=`<div class="q-title" style="font-size:var(--fs-2xl)">Intensidad y dosis</div>
      ${filoSub('¿Con qué dosificas la intensidad?')}
      ${filoChoiceGroup('structure.method',[{value:'rpe',label:'RPE (esfuerzo percibido)'},{value:'rir',label:'RIR (repeticiones en reserva)'},{value:'porcentajes',label:'% de 1RM'},{value:'fallo',label:'Series al fallo'}], F.structure.method)}
      ${filoSub('Tus rangos de repeticiones por objetivo')}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
        ${[['fuerza','Fuerza','3-6'],['hipertrofia','Hipertrofia','8-12'],['resistencia','Resistencia','15-20']].map(([k,l,ph])=>`<label style="font-size:var(--fs-2xs);color:var(--mu)">${l}<input class="ti" style="margin-top:4px" placeholder="${ph}" value="${esc(F.dosis[k]||'')}" oninput="filoDraft.dosis.${k}=this.value"></label>`).join('')}
      </div>
      ${filoSub('Descanso entre series')}
      ${filoChoiceGroup('exerciseStyle.restStyle',[{value:'fijo',label:'Tiempo fijo'},{value:'autorregulado',label:'Autorregulado'}], F.exerciseStyle.restStyle)}
      ${filoSliderRow('Variedad de ejercicios', F.exerciseStyle.variety, 'exerciseStyle.variety',['Pocos y dominados','Mucha variedad'])}`;
  } else if(filoStep===4){
    html+=`<div class="q-title" style="font-size:var(--fs-2xl)">Tus métodos de intensidad</div>
      ${filoSub('Toca una vez = lo uso seguido (verde). Dos veces = no lo uso (rojo). Tres = neutral.')}
      <div class="filo-chips">${Object.entries(KB_METODOS).map(([id,M])=>`<div class="filo-chip ${F.metodos.favoritos.includes(id)?'fav':F.metodos.evita.includes(id)?'no':''}" title="${esc(M.como)}" onclick="filoCycleMetodo('${id}',this)">${M.nm}</div>`).join('')}</div>
      ${filoSliderRow('¿Qué tanto los usas?', F.metodos.frecuencia, 'metodos.frecuencia',['Rutinas limpias','Casi cada ejercicio'])}
      ${filoSub('Con principiantes...')}
      ${filoChoiceGroup('metodos.principiantes',[{value:'no',label:'Nada de métodos: técnica primero'},{value:'basicos',label:'Solo básicos (tempo, pausas, superserie antagonista)'},{value:'si',label:'También intermedios si la técnica lo permite'}], F.metodos.principiantes)}`;
  } else if(filoStep===5){
    html+=`<div class="q-title" style="font-size:var(--fs-2xl)">Cómo eliges ejercicios</div>
      ${filoSliderRow('Equipo que prefieres', F.seleccion.libreVsMaquina, 'seleccion.libreVsMaquina',['Máquinas y poleas','Peso libre'])}
      ${filoSliderRow('Trabajo unilateral', F.seleccion.unilateral, 'seleccion.unilateral',['Casi nunca','Mucho'])}
      ${filoSub('Tus ejercicios firma (los que siempre usas)')}
      ${filoText('seleccion.firma','Ej. Hip thrust con pausa, jalón unilateral, sentadilla búlgara.')}
      ${filoSub('Ejercicios que nunca programas y por qué')}
      ${filoText('seleccion.nunca','Ej. Press tras nuca (riesgo de hombro), peso muerto en principiantes.')}`;
  } else if(filoStep===6){
    html+=`<div class="q-title" style="font-size:var(--fs-2xl)">Anatomía de tu sesión</div>
      ${filoSub('Calentamiento')}
      ${filoChoiceGroup('sesion.calentamiento',[{value:'movilidad',label:'Movilidad general + activación'},{value:'aproximacion',label:'Series de aproximación del primer ejercicio'},{value:'especifico',label:'Activación específica del músculo del día'}], F.sesion.calentamiento)}
      ${filoSub('Orden de los ejercicios')}
      ${filoChoiceGroup('sesion.orden',[{value:'compuesto',label:'Compuesto pesado primero, aislamiento al final'},{value:'preagot',label:'A veces pre-agoto antes del compuesto'},{value:'prioridad',label:'Primero lo que el socio más necesita'}], F.sesion.orden)}
      ${filoSub('Tempo')}
      ${filoChoiceGroup('sesion.tempo',[{value:'controlado',label:'Controlado siempre (bajada lenta)'},{value:'explosivo',label:'Bajada controlada, subida explosiva'},{value:'fase',label:'Depende de la fase'}], F.sesion.tempo)}`;
  } else if(filoStep===7){
    html+=`<div class="q-title" style="font-size:var(--fs-2xl)">Core y cardio</div>
      ${filoSub('Core')}
      ${filoChoiceGroup('sesion.core',[{value:'diario',label:'Algo de core en cada sesión'},{value:'semanal',label:'2-3 bloques a la semana'},{value:'integrado',label:'Integrado en los compuestos, casi sin aislado'}], F.sesion.core)}
      ${filoSub('Cardio')}
      ${filoChoiceGroup('sesion.cardio',[{value:'dias',label:'Días propios de cardio'},{value:'final',label:'Bloque corto al final (zona 2)'},{value:'intervalos',label:'Intervalos / circuitos metabólicos'},{value:'objetivo',label:'Según el objetivo del socio'}], F.sesion.cardio)}`;
  } else if(filoStep===8){
    html+=`<div class="q-title" style="font-size:var(--fs-2xl)">Hora pico</div>
      ${filoSub('Si el área está ocupada, ¿qué opción prefieres darle al socio?')}
      ${filoChoiceGroup('horaPico.sustitucion',[{value:'maquina',label:'Máquina o polea con el mismo enfoque'},{value:'mancuernas',label:'Mancuernas o zona funcional'},{value:'corporal',label:'Peso corporal / bandas'},{value:'metodo',label:'Cambiar el método (p. ej. superserie con lo disponible)'}], F.horaPico.sustitucion)}
      ${filoSub('Mensaje para tus socios en hora pico')}
      ${filoText('horaPico.nota','Ej. No esperes más de 3 minutos: usa la opción y mantén el tempo.')}`;
  } else if(filoStep===9){
    html+=`<div class="q-title" style="font-size:var(--fs-2xl)">Tu sello final</div>
      ${filoSub('Describe una sesión típica tuya, como se la explicarías a otro coach. Es lo que más ayuda a que la IA escriba como tú.')}
      ${filoText('sampleRoutineNote','Ej. Pierna: calentamiento de cadera, sentadilla en pirámide 12-10-8-6, búlgara + extensión en biserie, curl femoral con drop set, cierro con pantorrilla en tempo 3-1-1.',4)}
      ${filoSub('Si un socio se estanca...')}
      ${filoText('adjustmentPhilosophy','Ej. Reviso técnica antes que cargas...',3)}
      <div style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--in-bg2);border-radius:12px">
        ${svgRadarFilosofia(F,110)}
        <div style="font-size:var(--fs-xs);color:var(--mu);line-height:1.7">Así se ve tu huella; esto verá el socio al elegirte.</div>
      </div>`;
  } else if(filoStep===10){
    html+=filoPasoModelos();
  }
  c.innerHTML=html;
  const nb=document.getElementById('filo-next-btn');
  if(nb) nb.textContent = filoStep===FILO_TOTAL ? 'GUARDAR MI FILOSOFÍA ✓' : 'CONTINUAR →';
  const pb=document.querySelector('#filo-nav .btn-prev');
  if(pb) pb.style.visibility = filoStep===1 ? 'hidden' : 'visible';
  c.scrollTop=0;
}
function filoNext(){
  filoGuardarProgreso();
  if(filoStep<FILO_TOTAL){ filoStep++; renderFiloStep(); }
  else guardarFilosofia();
}
function filoPrev(){ if(filoStep>1){ filoStep--; renderFiloStep(); } }
function guardarFilosofia(){
  if(!filoEditId) return;
  filoGuardarProgreso();
  const esPropia = filoEditId===staffActivoEntId;
  cerrarModalFilosofia();
  showToast(esPropia?'🧬 Tu filosofía quedó guardada — tus rutinas nacerán con tu estilo':'🧬 Filosofía guardada para '+(getEntrenador(filoEditId)?.nombre||filoEditId));
  if(staffRol==='coordinador' && document.getElementById('staff-content')?.innerHTML.includes('Entrenadores')) abrirEntrenadores();
}
