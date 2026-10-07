/* ═══ Rutinas en casa · generador y panel del entrenador ═══
   Fitness System Pro · módulo cargado por index.html después de 30-casa-catalogo.js.
   SOLO el staff (entrenador o coordinador) decide a qué socio se le arma una rutina en casa; el socio no ve ningún
   botón ni opción para pedirla. El socio sigue haciendo su registro normal; cuando el staff aprueba su plan,
   puede generarle una rutina completa para casa con sus datos (objetivo, nivel, edad, limitaciones, días,
   zonas a priorizar, clases grupales) y el equipo que el entrenador marque como disponible.
   La rutina de gimnasio se respalda (s.rutinaGym) para poder volver a ella.                                 ═══ */

// ── Datos del socio → zonas prioritarias (mismas opciones del cuestionario) ──
function casaZonasPrioridad(s){
  const out=new Set();
  (s.zonas||[]).forEach(z=>{
    const t=String(z).toLowerCase();
    if(/pierna/.test(t)) ['cuadriceps','gluteo','femoral','pantorrilla'].forEach(x=>out.add(x));
    if(/pecho/.test(t)) ['pecho','pecho_sup'].forEach(x=>out.add(x));
    if(/espalda/.test(t)) ['dorsal','espalda_media'].forEach(x=>out.add(x));
    if(/hombro/.test(t)) ['deltoide','deltoide_lat','deltoide_post'].forEach(x=>out.add(x));
    if(/brazo/.test(t)) ['biceps','triceps','braquial'].forEach(x=>out.add(x));
    if(/core|abdom/.test(t)) ['core','abdomen'].forEach(x=>out.add(x));
  });
  return out;
}

// ── Cruce de días × clases grupales usando los datos del socio (igual que en el registro) ──
function casaDerivarDias(s,base){
  const info={};
  (s.clasesGrupales||[]).forEach(c=>(c.dias||[]).forEach(d=>{ info[d]={clase:c.clase,entrenaMismoDia:!!c.entrenaMismoDia}; }));
  const puro=[],conClase=[],soloClase=[];
  DIAS_ORDER.filter(d=>base.includes(d)).forEach(d=>{
    const i=info[d];
    if(!i) puro.push(d); else if(i.entrenaMismoDia) conClase.push(d); else soloClase.push(d);
  });
  return {puro,conClase,soloClase,info};
}

// ── Plantillas de sesión: cada hueco indica qué enfoques cubre y qué tan indispensable es (p: 1 esencial · 3 opcional) ──
const CASA_SLOTS={
  cuadC:{e:['cuadriceps'],t:'c',p:1}, gluteoC:{e:['gluteo'],t:'c',p:1}, femoral:{e:['femoral'],p:1},
  pantorrilla:{e:['pantorrilla'],p:3}, pechoC:{e:['pecho','pecho_sup'],t:'c',p:1}, pechoA:{e:['pecho','pecho_sup'],t:'a',p:2},
  jalonC:{e:['dorsal','espalda_media'],t:'c',p:1}, espaldaA:{e:['dorsal','espalda_media'],t:'a',p:2},
  hombroC:{e:['deltoide'],t:'c',p:2}, lateralA:{e:['deltoide_lat','deltoide'],t:'a',p:2}, posterior:{e:['deltoide_post','espalda_media'],t:'a',p:2},
  manguito:{e:['manguito'],p:3}, biceps:{e:['biceps','braquial'],p:2}, triceps:{e:['triceps'],p:2}, trapecio:{e:['trapecio'],p:3},
  coreIso:{e:['core','abdomen'],iso:true,p:1}, coreDin:{e:['core','abdomen'],iso:false,p:2}, coreAny:{e:['core','abdomen'],p:2},
  unilateral:{e:['cuadriceps','gluteo'],t:'c',lado:true,p:2}, gluteoA:{e:['gluteo'],t:'a',p:2},
  cardioRondas:{e:['cardio'],cardio:'r',p:2}, cardioCont:{e:['cardio'],cardio:'c',p:1},
};
const CASA_SESIONES=[
  // [clave en el tipo (minúsculas), [huecos en orden de la sesión]]
  ['full body funcional',['cuadC','pechoC','jalonC','cardioRondas','coreIso','gluteoC','cardioRondas','coreDin']],
  ['full body',['cuadC','pechoC','jalonC','gluteoC','hombroC','coreIso','femoral','biceps','triceps','coreDin']],
  ['torso',['pechoC','jalonC','hombroC','pechoA','biceps','posterior','triceps','coreIso']],
  ['pierna',['cuadC','gluteoC','femoral','unilateral','gluteoA','pantorrilla','coreIso','coreDin']],
  ['pecho',['pechoC','pechoC','pechoA','triceps','triceps','coreIso','lateralA']],
  ['espalda',['jalonC','jalonC','posterior','biceps','biceps','trapecio','coreIso']],
  ['hombro',['hombroC','lateralA','posterior','manguito','trapecio','coreIso','coreDin']],
  ['cardiovascular',['cardioCont','cardioRondas','cardioRondas','coreIso']],
  ['accesorios',['cardioCont','coreIso','coreDin','posterior','pantorrilla']],
  ['complemento',['coreIso','coreAny','posterior','manguito']],
];
const CASA_SPLIT={
  1:[['Full Body','verde']],
  2:[['Full Body A','verde'],['Full Body B','neon']],
  3:[['Full Body A','verde'],['Full Body B','neon'],['Full Body C','gold']],
  4:[['Torso A','verde'],['Pierna A','gold'],['Torso B','neon'],['Pierna B','gold']],
  5:[['Torso A','verde'],['Pierna A','gold'],['Torso B','neon'],['Pierna B','gold'],['Accesorios + Core','hombro']],
  6:[['Pecho + Tríceps','verde'],['Espalda + Bíceps','neon'],['Pierna','gold'],['Hombro + Core','hombro'],['Full Body Funcional','red'],['Cardiovascular','red']],
};

// ── Elección de un ejercicio para un hueco ──
function casaElegir(slot,pool,ctx,estado,rnd){
  const nivel=ctx.nivel;
  let c=pool.filter(x=>{
    if(!slot.e.includes(x.enf)) return false;
    if(slot.cardio==='r'){ if(!x.rondas) return false; } else if(slot.cardio==='c'){ if(!x.cont) return false; }
    else if(x.rondas||x.cont) return false;
    if(slot.t && x.t!==slot.t) return false;
    if(slot.iso===true && !x.iso) return false;
    if(slot.iso===false && x.iso) return false;
    if(slot.lado && !x.lado) return false;
    if(estado.enDia.has(x.id)) return false;
    return true;
  });
  if(!c.length && slot.lado) return casaElegir(Object.assign({},slot,{lado:false}),pool,ctx,estado,rnd);
  if(!c.length && slot.t) return casaElegir(Object.assign({},slot,{t:null}),pool,ctx,estado,rnd);
  if(!c.length) return null;
  const w=c.map(x=>{
    let v=1;
    if((x.nv||1)===nivel) v+=1.5; else if((x.nv||1)<nivel) v+=.5;
    if((x.eq||[]).length) v+=1;                              // aprovechar el equipo que sí tiene
    if(estado.prio.has(x.enf)) v+=1.5;                       // zona que quiere priorizar
    if(estado.firmas && estado.firmas.has(kbNorm(x.nm))) v+=3;   // ejercicio de su rutina modelo
    if((ctx.obj==='F'||ctx.obj==='H') && x.lado && x.t==='c') v+=.8;   // unilateral = más carga sin pesas
    if(estado.semana.has(x.id)) v*=.2;                       // ya salió esta semana
    return Math.max(.05,v);
  });
  let r=rnd()*w.reduce((a,b)=>a+b,0), pick=c[c.length-1];
  for(let i=0;i<c.length;i++){ r-=w[i]; if(r<=0){ pick=c[i]; break; } }
  return pick;
}

// ── Prescripción de un ejercicio de casa ──
function casaPesoTxt(x){
  const q=x.eq||[];
  if(q.includes('mancuernas')) return 'Mancuernas — carga con 2 reps en reserva';
  if(q.includes('kettlebell')) return 'Kettlebell — carga con 2 reps en reserva';
  if(q.includes('mochila'))    return 'Mochila — carga con 2 reps en reserva';
  if(q.includes('ligas'))      return 'Banda — resistencia media';
  return 'Corporal';
}
function casaRx(x,ctx,duracion){
  const e={nm:x.nm, ms:x.ms, enf:x.enf, tip:x.tip||('Siente el músculo objetivo ('+x.ms+') durante todo el recorrido y controla la bajada.'), alternativas:[]};
  const nv=ctx.nivel, cargado=(x.eq||[]).some(q=>['mancuernas','kettlebell','mochila','ligas'].includes(q));
  if(x.iso){ const d=dosisIsometrico(x,nv); e.series=d.series; e.reps=d.reps; e.peso=casaPesoTxt(x); e.descanso='45 seg entre rondas'; return e; }
  if(x.rondas){ e.series=3; e.reps=(x.rx&&x.rx.u==='reps'?'10 reps':'40 seg'); e.peso='FC objetivo'; e.descanso='45-60 s entre rondas'; return e; }
  if(x.cont){ e.series=1; e.reps='20 min'; e.peso='FC objetivo'; e.descanso='—'; return e; }
  const lado=x.lado?' por lado':'';
  let reps;
  if(ctx.sinMetodos){ reps=(x.eq&&x.eq.length?'10':'12')+' reps'+lado+' — movilidad lenta'; e.series=2; e.peso=casaPesoTxt(x); e.descanso='—'; return e; }   // flexibilidad
  if(ctx.soloSuaves){ reps='10 reps'+lado+' — control'; e.reps=reps; e.series=3; e.peso=casaPesoTxt(x); e.descanso='60 s'; return e; }   // rehabilitación
  if(ctx.repsModelo) reps=(ctx.repsModelo.min===ctx.repsModelo.max?ctx.repsModelo.min:ctx.repsModelo.min+'-'+ctx.repsModelo.max)+' reps'+lado;
  else if(ctx.obj==='F')      reps=(cargado?8:(nv>=3?8:10))+' reps'+lado+' — fuerza';
  else if(ctx.obj==='R') reps=(cargado?15:(nv>=3?20:15))+' reps'+lado+' — resistencia';
  else                   reps=(cargado?10:(nv>=3?15:12))+' reps'+lado+' — hipertrofia';
  e.reps=reps;
  e.series=(x.t==='c'&&nv>=3&&duracion>=45)?4:3;
  e.peso=casaPesoTxt(x);
  e.descanso=ctx.obj==='F'?'90 s':ctx.obj==='R'?'30-45 s':'60 s';
  return e;
}
// Alternativas: mismo enfoque con el equipo que sí tiene (para cuando algo no se puede hacer ese día)
function casaAlternativas(x,disp,enDia){
  const etq=(typeof KB_ENFOQUES!=='undefined'&&KB_ENFOQUES[x.enf])||x.ms;
  const c=disp.filter(y=>y.id!==x.id && y.enf===x.enf && !!y.iso===!!x.iso && !y.rondas===!x.rondas && !!y.cont===!!x.cont && !enDia.has(y.id));
  const mismo=c.filter(y=>y.t===x.t), lista=(mismo.length>=3?mismo:c);
  return lista.slice(0,3).map(y=>({nm:y.nm, ms:y.ms, z:y.z, nota:'Mismo enfoque ('+etq+') · opción en casa'}));
}

// ── Generador principal ──
// opts: {equipo:[ids], dias:[claves de día], duracion:30|45|60, evitarImpacto:bool, semilla:string}
function casaGenerar(s,opts){
  opts=opts||{};
  const avisos=[];
  const ent=s.entrenadorId?getEntrenador(s.entrenadorId):null;
  const ctx=ctxDesdePerfil({nivel:s.nivel,objetivo:s.objetivo,limitaciones:s.limitaciones}, ent&&ent.filosofia);
  const edad=parseInt(s.edad)||35;
  const equipo=(opts.equipo||[]).filter(q=>CASA_EQUIPO[q]);
  const duracion=[30,45,60].includes(+opts.duracion)?+opts.duracion:45;
  const evitarImpacto=opts.evitarImpacto!==undefined?!!opts.evitarImpacto:(edad>=55||ctx.les.length>0);
  const obj=s.objetivo||'';
  const rehab=obj==='REHABILITACIÓN', flex=obj==='FLEXIBILIDAD', deporte=obj==='RENDIMIENTO DEPORTIVO';
  const semilla=String(opts.semilla||Math.random());
  const rnd=prng((s.code||'')+'|casa|'+semilla);

  // Pool: solo lo que puede hacer con su equipo, sin lo que choca con sus limitaciones, a su nivel
  let pool=casaDisponibles(equipo,ctx.les).filter(x=>(x.nv||1)<=Math.max(1,ctx.nivel));
  if(evitarImpacto) pool=pool.filter(x=>!x.imp && x.id!=='sentadilla_salto' && !/salto|burpee|jumping|escaladores/i.test(x.nm));
  if(rehab) pool=pool.filter(x=>(x.nv||1)<=1 && !x.imp);
  if(ctx.les.includes('cardiaca')){ pool=pool.filter(x=>!x.imp); avisos.push('Tiene limitación cardíaca: se evitaron saltos y cardio de alto impacto; revisa las FC objetivo.'); }
  if(!pool.length) return {error:'Con ese equipo y sus limitaciones no hay ejercicios disponibles. Marca más equipo.'};

  // Días: los del socio (o los que elija el entrenador) cruzados con sus clases grupales
  const base=(opts.dias&&opts.dias.length)?DIAS_ORDER.filter(d=>opts.dias.includes(d)):((s.diasSemana&&s.diasSemana.length)?s.diasSemana:DIAS_ORDER.slice(0,parseInt(s.dias)||3));
  const deriv=casaDerivarDias(s,base);
  const nFull=deriv.puro.length;
  const tiposSesion=CASA_SPLIT[nFull]||CASA_SPLIT[Math.max(1,Math.min(6,nFull))]||CASA_SPLIT[4];
  const mapa={};
  deriv.puro.forEach((d,i)=>{ const t=tiposSesion[i]||tiposSesion[tiposSesion.length-1]; mapa[d]={tipo:t[0],color:t[1]}; });
  deriv.conClase.forEach(d=>{ mapa[d]={tipo:'Complemento — '+deriv.info[d].clase,color:'hombro',clase:deriv.info[d].clase}; });
  deriv.soloClase.forEach(d=>{ mapa[d]={tipo:'Descanso (clase: '+deriv.info[d].clase+')',color:'descanso',vacio:true}; });
  if(flex){
    // Flexibilidad: sesiones de movilidad y posturas (sin pesas)
    const pat={2:['S','D','D','S','D','D','D'],3:['S','D','S','D','S','D','D']};
    DIAS_ORDER.forEach(d=>{ if(mapa[d]&&!mapa[d].vacio) mapa[d]={tipo:'Movilidad y flexibilidad',color:'neon',flex:true}; });
  }

  const estado={prio:casaZonasPrioridad(s), semana:new Set(), enDia:new Set()};
  const filo=ent&&ent.filosofia;   // rutina modelo del entrenador para el objetivo del socio
  estado.firmas=new Set(typeof filoModeloFirmas==='function'?filoModeloFirmas(filo,s.objetivo):[]);
  ctx.repsModelo=typeof filoModeloReps==='function'?filoModeloReps(filo,s.objetivo):null;
  const nMax=duracion>=60?8:duracion>=45?6:5;
  const rutina={};
  const dias=[];
  DIAS_ORDER.forEach(k=>{
    const m=mapa[k];
    if(!m||m.vacio){ rutina[k]={label:DIAS_NAMES[k],tipo:m?m.tipo:'DESCANSO',color:'descanso',ejercicios:[]}; return; }
    estado.enDia=new Set();
    const ejs=[];
    if(m.flex){
      ejs.push(casaMov('Movilidad articular dinámica'));
      const poolM=pool.filter(x=>/^h_mov_/.test(x.id));
      const orden=poolM.slice().sort(()=>rnd()-.5).slice(0,4);
      orden.forEach(x=>{ const e=casaRx(x,ctx,duracion); ejs.push(e); estado.semana.add(x.id); });
      ejs.push(casaMov('Movilidad y estiramiento'));
      rutina[k]={label:DIAS_NAMES[k],tipo:m.tipo,color:m.color,ejercicios:ejs}; dias.push(rutina[k]); return;
    }
    const tl=m.tipo.toLowerCase();
    const plantilla=(CASA_SESIONES.find(([clave])=>tl.includes(clave))||CASA_SESIONES[1])[1];
    let slots=plantilla.map((nm,i)=>Object.assign({i},CASA_SLOTS[nm],{nm}));
    // Complemento en día de clase: evita el enfoque de esa clase
    let evitarEnf=[];
    if(m.clase){ const kc=KB_CLASES_IDX[m.clase]; evitarEnf=(kc&&kc.enfoque)||[]; }
    // Objetivos de pérdida de peso / resistencia: siempre hay trabajo cardiovascular en las sesiones completas
    if(!m.clase && (ctx.obj==='R') && !rehab && !slots.some(x=>x.cardio)){ slots.splice(Math.max(1,slots.length-1),0,Object.assign({i:99},CASA_SLOTS.cardioRondas,{nm:'cardioRondas',p:0})); }
    // Rehabilitación: más isométricos y control, menos volumen
    const tope=m.clase?4:(rehab?Math.min(5,nMax):nMax+((ctx.obj==='R'&&!flex)?1:0));
    if(slots.length>tope){
      const sel=slots.map((x,i)=>({x,i})).sort((a,b)=>a.x.p-b.x.p||a.i-b.i).slice(0,tope).sort((a,b)=>a.i-b.i);
      slots=sel.map(o=>o.x);
    }
    slots.forEach(sl=>{
      let ss=sl;
      if(evitarEnf.length) ss=Object.assign({},sl,{e:sl.e.filter(en=>!evitarEnf.includes(en))}); if(!ss.e.length) return;
      let x=casaElegir(ss,pool,ctx,estado,rnd);
      if(!x) return;
      estado.enDia.add(x.id); estado.semana.add(x.id);
      ejs.push(Object.assign(casaRx(x,ctx,duracion),{_x:x}));
    });
    if(duracion>=45 && !m.clase && /full body|pierna|torso|pecho|espalda|hombro/.test(tl)) ejs.unshift(casaMov('Movilidad articular dinámica'));
    if(/cardiovascular|accesorios/.test(tl)) ejs.push(casaMov('Movilidad y estiramiento'));
    if(m.clase) ejs.push(casaMov('Movilidad de cadera y hombro'));
    rutina[k]={label:DIAS_NAMES[k],tipo:m.tipo,color:m.color,ejercicios:ejs}; dias.push(rutina[k]);
  });
  DIAS_ORDER.forEach(k=>{ if(!rutina[k]) rutina[k]={label:DIAS_NAMES[k],tipo:'DESCANSO',color:'descanso',ejercicios:[]}; });

  // Métodos de intensidad que se pueden hacer en casa (tempo, pausa, 1½) según nivel, objetivo y filosofía del entrenador
  const perm=metodosPermitidos(ctx).filter(id=>['tempo','pausa','una_y_media'].includes(id));
  if(perm.length && !flex){
    dias.forEach((d,di)=>{
      const cand=d.ejercicios.filter(e=>e._x && !e._x.iso && !e._x.rondas && !e._x.cont && !e._x.lado);
      let n=Math.min(cuantosMetodos(ctx,cand.length), 2);
      const compuestos=cand.filter(e=>e._x.t==='c'), resto=cand.filter(e=>e._x.t!=='c');
      [...compuestos,...resto].slice(0,n).forEach(e=>{
        const ok=perm.filter(id=>{ const M=KB_METODOS[id]; return M.aplica==='ambos' || (M.aplica==='compuesto')===(e._x.t==='c'); });
        const id=elegirPonderado(rnd,ok,ctx); if(id) aplicarMetodo(e,id);
      });
    });
  }
  // Alternativas, FC objetivo (cardio) y limpieza de campos internos
  const sx={nivel:s.nivel,objetivo:s.objetivo,edad:s.edad};
  const disp=pool;
  dias.forEach(d=>{
    const enDia=new Set(d.ejercicios.filter(e=>e._x).map(e=>e._x.id));
    d.ejercicios.forEach(e=>{ if(e._x) e.alternativas=casaAlternativas(e._x,disp,enDia); });
  });
  ajustarCardioRondas(dias,sx);
  dias.forEach(d=>d.ejercicios.forEach(e=>{ delete e._x; if(e.metodo===undefined) e.metodo=null; if(e.grupo===undefined) e.grupo=''; }));

  if(rehab) avisos.push('Rehabilitación: el protocolo por fases del socio sigue siendo la referencia. Esta rutina usa solo ejercicios suaves y sin impacto; revísala antes de guardar.');
  if(deporte) avisos.push('Rendimiento deportivo'+(s.disciplina?' ('+s.disciplina+')':'')+': la rutina en casa es una base general de fuerza y acondicionamiento; ajusta lo específico de su disciplina.');
  if(!equipo.some(q=>['ligas','mochila','toalla','trx','barra_dom','kettlebell','mancuernas'].includes(q)) && !flex) avisos.push('Sin nada para jalar (liga, mochila, toalla, barra…) la espalda queda limitada a superman y elevaciones Y-T-W: considera sugerirle una liga o una mochila.');
  if(equipo.length===0 && (ctx.obj==='F'||ctx.obj==='H')) avisos.push('Sin equipo la sobrecarga viene de variantes más difíciles, pausas y tempo lento: avísale que en casa progresa con técnica y repeticiones.');
  if(deriv.conClase.length) avisos.push('En los días con clase grupal + entrenamiento ('+deriv.conClase.map(d=>DIAS_NAMES[d]).join(', ')+') la sesión es corta y evita el enfoque de la clase.');
  const total=dias.reduce((a,d)=>a+d.ejercicios.length,0);
  return {rutina, avisos, dias:dias.length, total, nFull};
}
function casaMov(nm){
  const mi=KB_MOVILIDAD.find(m=>m.nm===nm)||KB_MOVILIDAD[0];
  return {nm:mi.nm, ms:'Movilidad · '+mi.tipo, enf:'', tip:mi.que, series:mi.series, reps:mi.reps, peso:'Sin carga', descanso:'—', alternativas:[], metodo:null, grupo:''};
}

// ═════════════════════════════════════════
// PANEL DEL ENTRENADOR
// ═════════════════════════════════════════
const CASA_UI={code:null,equipo:new Set(),dias:new Set(),duracion:45,impacto:true,hechoCss:false};
function casaCss(){
  if(CASA_UI.hechoCss) return; CASA_UI.hechoCss=true;
  const st=document.createElement('style'); st.id='casa-css';
  st.textContent=`
  .cs-sec{font:700 12px var(--fb,inherit);letter-spacing:.06em;text-transform:uppercase;color:var(--mu);margin:16px 0 8px}
  .cs-row{display:flex;flex-wrap:wrap;gap:8px}
  .cs-chip{border:1px solid var(--bd,#d9d9e3);background:transparent;color:var(--tx);border-radius:999px;padding:8px 12px;font-size:13px;cursor:pointer;display:inline-flex;gap:6px;align-items:center}
  .cs-chip.on{background:color-mix(in srgb,var(--v,#6c5ce7) 18%,transparent);border-color:var(--v,#6c5ce7);font-weight:700}
  .cs-resumen{font-size:12.5px;line-height:1.55;color:var(--mu);background:color-mix(in srgb,var(--v,#6c5ce7) 7%,transparent);border-radius:12px;padding:10px 12px}
  .cs-resumen b{color:var(--tx)}
  .cs-ban{border:1px solid color-mix(in srgb,var(--n,#00b894) 40%,transparent);background:color-mix(in srgb,var(--n,#00b894) 8%,transparent);border-radius:14px;padding:10px 12px;margin:0 0 12px;font-size:13px;line-height:1.5}
  .cs-ban b{color:var(--tx)} .cs-ban ul{margin:6px 0 0 16px;padding:0;color:var(--mu);font-size:12.5px}
  .cs-ban .sd-b{margin-top:8px}
  .cs-socio{display:flex;gap:10px;align-items:center;border-radius:14px;padding:10px 12px;margin:0 0 12px;background:color-mix(in srgb,var(--n,#00b894) 10%,transparent);font-size:13px}
  .cs-socio span{font-size:20px}
  .cs-acts{display:flex;gap:10px;margin-top:16px}.cs-acts>*{flex:1}
  `;
  document.head.appendChild(st);
}
function casaEnsureModal(){
  casaCss();
  let m=document.getElementById('modal-casa'); if(m) return m;
  m=document.createElement('div'); m.className='modal'; m.id='modal-casa';
  m.onclick=function(e){ if(e.target===m) casaCerrar(); };
  m.innerHTML='<div class="mbox" style="max-width:560px;max-height:90vh;overflow-y:auto"><div id="casa-body"></div></div>';
  document.body.appendChild(m); return m;
}
function casaCerrar(){ const m=document.getElementById('modal-casa'); if(m) m.classList.remove('open'); }

// Botones en la pestaña Rutina del staff (solo se muestran para planes ya aprobados)
function casaBarraHTML(s){
  if(!s || s.status==='pendiente') return '';
  const c=esc(s.code);
  return `<button type="button" class="sd-b p" onclick="casaAbrir('${c}')" title="Arma una rutina completa para entrenar en casa con los datos del socio">🏠 ${s.modo==='casa'?'Regenerar rutina en casa':'Rutina en casa'}</button>`
    +(s.modo==='casa'&&s.rutinaGym?`<button type="button" class="sd-b" onclick="casaVolverGym('${c}')">🏋️ Volver a rutina de gimnasio</button>`:'');
}
function casaBannerStaff(s){
  if(!s || s.modo!=='casa') return '';
  const eq=(s.casa&&s.casa.equipo)||[];
  const eqTxt=eq.length?eq.map(q=>CASA_EQUIPO[q]?CASA_EQUIPO[q].nm:q).join(', '):'solo peso corporal';
  const av=(s.casa&&s.casa.avisos)||[];
  return `<div class="cs-ban">🏠 <b>Este socio entrena en casa.</b> Equipo: ${esc(eqTxt)}${s.casa&&s.casa.duracion?' · sesiones de ~'+esc(s.casa.duracion)+' min':''}.
    ${av.length?`<ul>${av.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>`:''}</div>`;
}
// Chip que ve el socio en "Mi plan" (solo informa; no puede cambiarlo)
function casaChipSocio(s){
  if(!s || s.modo!=='casa') return '';
  const eq=(s.casa&&s.casa.equipo)||[];
  const eqTxt=eq.length?eq.map(q=>CASA_EQUIPO[q]?CASA_EQUIPO[q].nm:q).join(' · '):'Solo peso corporal';
  return `<div class="cs-socio"><span>🏠</span><div><b>Tu rutina es para entrenar en casa</b><div style="color:var(--mu);font-size:12px;margin-top:2px">${esc(eqTxt)}</div></div></div>`;
}

function casaAbrir(code){
  const s=getSocio(code); if(!s) return;
  if(s.status==='pendiente'){ showToast('Primero aprueba el plan del socio'); return; }
  casaEnsureModal();
  CASA_UI.code=code;
  const prev=(s.modo==='casa'&&s.casa)?s.casa:null;
  CASA_UI.equipo=new Set(prev?prev.equipo:[]);
  const base=(prev&&prev.dias&&prev.dias.length)?prev.dias:((s.diasSemana&&s.diasSemana.length)?s.diasSemana:DIAS_ORDER.slice(0,parseInt(s.dias)||3));
  CASA_UI.dias=new Set(base);
  CASA_UI.duracion=prev&&prev.duracion?prev.duracion:45;
  const les=lesionKeys(s.limitaciones||[]), ed=parseInt(s.edad)||35;
  CASA_UI.impacto=prev&&prev.evitarImpacto!==undefined?!!prev.evitarImpacto:(ed>=55||les.length>0);
  casaRender();
  document.getElementById('modal-casa').classList.add('open');
}
function casaRender(){
  const s=getSocio(CASA_UI.code); if(!s) return;
  const les=(s.limitaciones||[]).filter(Boolean);
  const clases=(s.clasesGrupales||[]).filter(c=>c&&c.dias&&c.dias.length).map(c=>c.clase+' ('+c.dias.map(d=>DIAS_NAMES[d].substring(0,3)).join('/')+')');
  const resumen=`<div class="cs-resumen"><b>Se toma del perfil del socio:</b> objetivo ${esc(sc(s.objetivo||'—'))} · nivel ${esc(sc(s.nivel||'—'))} · ${esc(s.edad||'—')} años · limitaciones: ${les.length?esc(les.join(', ')):'ninguna'}${(s.zonas&&s.zonas.length)?' · prioriza: '+esc(s.zonas.join(', ')):''}${clases.length?' · clases: '+esc(clases.join(', ')):''}.</div>`;
  const paquetes=Object.entries(CASA_PAQUETES).map(([id,p])=>`<button type="button" class="cs-chip" onclick="casaPaquete('${id}')">${esc(p.nm)}</button>`).join('');
  const equipo=Object.entries(CASA_EQUIPO).map(([id,q])=>`<button type="button" class="cs-chip${CASA_UI.equipo.has(id)?' on':''}" onclick="casaToggleEq('${id}')">${q.ic} ${esc(q.nm)}</button>`).join('');
  const dias=DIAS_ORDER.map(k=>`<button type="button" class="cs-chip${CASA_UI.dias.has(k)?' on':''}" onclick="casaToggleDia('${k}')">${esc(DIAS_NAMES[k].substring(0,3))}</button>`).join('');
  const durs=[30,45,60].map(n=>`<button type="button" class="cs-chip${CASA_UI.duracion===n?' on':''}" onclick="casaSetDur(${n})">${n} min</button>`).join('');
  const nPool=casaDisponibles([...CASA_UI.equipo],lesionKeys(s.limitaciones||[])).length;
  document.getElementById('casa-body').innerHTML=`
    <div style="font:800 18px var(--fd,inherit);margin-bottom:4px">🏠 Rutina en casa</div>
    <div style="color:var(--mu);font-size:13px;margin-bottom:12px">${esc(tc(s.nombre))} · genera una rutina completa para casa. Reemplaza la rutina actual y guardas una copia para volver al gimnasio.</div>
    ${resumen}
    <div class="cs-sec">Paquetes rápidos de equipo</div><div class="cs-row">${paquetes}</div>
    <div class="cs-sec">Equipo que tiene en casa <span style="text-transform:none;letter-spacing:0;font-weight:400">(peso corporal, pared y piso ya cuentan)</span></div>
    <div class="cs-row">${equipo}</div>
    <div class="cs-sec">Días de entrenamiento</div><div class="cs-row">${dias}</div>
    <div class="cs-sec">Duración de cada sesión</div><div class="cs-row">${durs}</div>
    <div class="cs-sec">Impacto</div>
    <div class="cs-row"><button type="button" class="cs-chip${CASA_UI.impacto?' on':''}" onclick="casaToggleImpacto()">Evitar saltos y alto impacto</button></div>
    <div style="font-size:12px;color:var(--mu);margin-top:12px">${nPool} ejercicios disponibles con este equipo y sus limitaciones.</div>
    <div class="cs-acts"><button type="button" class="sd-b" onclick="casaCerrar()">Cancelar</button><button type="button" class="sd-pri" onclick="casaAplicar()">Generar rutina en casa</button></div>`;
}
function casaPaquete(id){ const p=CASA_PAQUETES[id]; if(!p) return; CASA_UI.equipo=new Set(p.eq); casaRender(); }
function casaToggleEq(id){ if(CASA_UI.equipo.has(id)) CASA_UI.equipo.delete(id); else CASA_UI.equipo.add(id); casaRender(); }
function casaToggleDia(k){ if(CASA_UI.dias.has(k)){ if(CASA_UI.dias.size>1) CASA_UI.dias.delete(k); } else CASA_UI.dias.add(k); casaRender(); }
function casaSetDur(n){ CASA_UI.duracion=n; casaRender(); }
function casaToggleImpacto(){ CASA_UI.impacto=!CASA_UI.impacto; casaRender(); }

function casaAplicar(){
  const s=getSocio(CASA_UI.code); if(!s) return;
  const opts={equipo:[...CASA_UI.equipo], dias:DIAS_ORDER.filter(k=>CASA_UI.dias.has(k)), duracion:CASA_UI.duracion, evitarImpacto:CASA_UI.impacto};
  const r=casaGenerar(s,opts);
  if(r.error){ showToast('⚠ '+r.error); return; }
  const copia=JSON.parse(JSON.stringify(s.rutina||{}));
  if(s.modo!=='casa' || !s.rutinaGym) s.rutinaGym=copia;           // respaldo de la rutina de gimnasio (solo la primera vez)
  staffRutBackup[s.code]=copia;                                      // y el botón "Deshacer" de la pestaña
  s.rutina=r.rutina; s.modo='casa';
  s.casa={equipo:opts.equipo, dias:opts.dias, duracion:opts.duracion, evitarImpacto:opts.evitarImpacto, fecha:fechaISO(new Date()), por:pqStaffNombre(), avisos:r.avisos};
  staffDirty.add(s.code);
  casaCerrar();
  staffTab='rutina';
  staffRenderContent(s);
  showToast('🏠 Rutina en casa lista: '+r.total+' ejercicios en '+r.dias+' días. Revísala y presiona GUARDAR');
}
function casaVolverGym(code){
  const s=getSocio(code); if(!s||!s.rutinaGym) return;
  uiConfirm('¿Volver a la rutina de gimnasio?\nLa rutina en casa actual se reemplaza por la que tenía antes.',()=>{
    staffRutBackup[code]=JSON.parse(JSON.stringify(s.rutina||{}));
    s.rutina=s.rutinaGym; delete s.rutinaGym; delete s.modo; delete s.casa;
    staffDirty.add(code); staffRenderContent(s);
    showToast('🏋️ Rutina de gimnasio restaurada — presiona GUARDAR');
  },{label:'Sí, volver al gimnasio'});
}

// ── Métodos y opciones para una rutina en casa (solo agrega tempo/pausa a lo que no tenga; sin ejercicios de gimnasio) ──
function casaEnriquecer(s){
  const ent=s.entrenadorId?getEntrenador(s.entrenadorId):null;
  const ctx=ctxDesdePerfil({nivel:s.nivel,objetivo:s.objetivo,limitaciones:s.limitaciones}, ent&&ent.filosofia);
  const perm=metodosPermitidos(ctx).filter(id=>['tempo','pausa','una_y_media'].includes(id));
  const rnd=prng((s.code||'')+'|casa-met|'+Date.now());
  const equipo=(s.casa&&s.casa.equipo)||[], disp=casaDisponibles(equipo,ctx.les);
  DIAS_ORDER.forEach(k=>{
    const d=s.rutina&&s.rutina[k]; if(!d||!Array.isArray(d.ejercicios)) return;
    const enDia=new Set(d.ejercicios.map(e=>{ const kb=kbBuscar(e.nm); return kb&&kb.id; }).filter(Boolean));
    d.ejercicios.forEach(e=>{
      const kb=kbBuscar(e.nm); if(!kb) return;
      if(!(e.alternativas&&e.alternativas.length) && !esEjMovilidad(e)) e.alternativas=casaAlternativas(kb,disp,enDia);
      if(perm.length && !e.metodo && !kb.iso && !kb.rondas && !kb.cont && !kb.lado && !esEjMovilidad(e) && rnd()<.5){
        const ok=perm.filter(id=>{ const M=KB_METODOS[id]; return M.aplica==='ambos'||(M.aplica==='compuesto')===(kb.t==='c'); });
        const id=elegirPonderado(rnd,ok,ctx); if(id) aplicarMetodo(e,id);
      }
    });
  });
}
// Lista de nombres para el buscador del editor de rutina (usa los de casa si el socio está en modo casa)
function casaNombresDatalist(s){
  const lista=(s&&s.modo==='casa')?casaPool():KB_EJERCICIOS;
  return lista.map(e=>`<option value="${esc(e.nm)}">`).join('');
}
