/* ═══ motor rutinas ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// MOTOR DE RUTINAS ELABORADAS — métodos de intensidad + opciones por área ocupada
// Consulta la base de conocimiento (conocimiento.js) y la filosofía del entrenador.
// Funciona igual para rutinas de IA y de plantilla: solo rellena lo que falte.
// ═════════════════════════════════════════
function nivelNum(n){ return /AVAN/i.test(n||'')?3:/INTER/i.test(n||'')?2:1; }
function lesionKeys(lims){
  const t=(lims||[]).join(' ').toLowerCase(), k=[];
  if(/rodilla|menisco/.test(t)) k.push('rodilla');
  if(/lumbar|espalda/.test(t)) k.push('lumbar');
  if(/hombro|manguito/.test(t)) k.push('hombro');
  if(/cadera/.test(t)) k.push('cadera');
  if(/cuello|cervical/.test(t)) k.push('cuello');
  if(/card[ií]a/.test(t)) k.push('cardiaca');
  return k;
}
function objLetra(o){ return o==='FUERZA PURA'||o==='RENDIMIENTO DEPORTIVO'?'F': (o==='PERDER PESO'||o==='RESISTENCIA')?'R':'H'; }
const ZONA_LESION_ENF={rodilla:['cuadriceps'],lumbar:['femoral','espalda_media','gluteo'],hombro:['pecho','pecho_sup','deltoide','deltoide_lat','triceps'],cadera:['gluteo','femoral'],cuello:['trapecio']};
const EMPUJE=['pecho','pecho_sup','deltoide','deltoide_lat','triceps','cuadriceps'];
const JALON=['dorsal','espalda_media','deltoide_post','biceps','braquial','femoral','gluteo'];
const ANTAG={pecho:'dorsal',pecho_sup:'espalda_media',deltoide:'dorsal',deltoide_lat:'deltoide_post',triceps:'biceps',biceps:'triceps',braquial:'triceps',dorsal:'pecho',espalda_media:'pecho',deltoide_post:'deltoide_lat',cuadriceps:'femoral',femoral:'cuadriceps'};

function prng(seedStr){ let h=2166136261; for(const c of String(seedStr)) h=Math.imul(h^c.charCodeAt(0),16777619); return ()=>{ h=Math.imul(h^(h>>>15),2246822507); h=Math.imul(h^(h>>>13),3266489909); return ((h^=h>>>16)>>>0)/4294967296; }; }

function ctxDesdePerfil(p, filo){
  const f=filo||{};
  const m=f.metodos||{};
  return {
    nivel:nivelNum(p.nivel), obj:objLetra(p.objetivo), objetivo:p.objetivo||'',
    les:lesionKeys(p.limitaciones), fav:m.favoritos||[], evita:m.evita||[],
    frec:m.frecuencia||3, principiantes:m.principiantes||'basicos',
    equipo:(f.seleccion&&f.seleccion.libreVsMaquina)||3, sustit:(f.horaPico&&f.horaPico.sustitucion)||'maquina',
    restStyle:(f.exerciseStyle&&f.exerciseStyle.restStyle)||'fijo',
    sinMetodos: p.objetivo==='FLEXIBILIDAD',
    soloSuaves: p.objetivo==='REHABILITACIÓN',
  };
}
function metodosPermitidos(ctx){
  if(ctx.sinMetodos) return [];
  let tope=ctx.nivel;
  if(ctx.nivel===1){ if(ctx.principiantes==='no') return []; tope = ctx.principiantes==='si'?2:1; }
  return Object.keys(KB_METODOS).filter(id=>{
    const M=KB_METODOS[id];
    if(M.nivel>tope) return false;
    if(ctx.evita.includes(id)) return false;
    if(ctx.les.includes('cardiaca') && KB_METODO_EVITAR.cardiaca.includes(id)) return false;
    if(ctx.soloSuaves && !['tempo','pausa'].includes(id)) return false;
    return true;
  });
}
function cuantosMetodos(ctx,nEj){
  if(ctx.sinMetodos||nEj<2) return 0;
  const base={1:1,2:2,3:3}[ctx.nivel];
  return Math.max(ctx.nivel===1?0:1, Math.min(Math.ceil(nEj/2), base+Math.round((ctx.frec-3)/2)));
}
function datosEj(e){
  const kb=kbBuscar(e.nm||e.nombre);
  const enf=e.enf || (kb&&kb.enf) || '';
  const tipo=(kb&&kb.t) || (/press|sentadilla|remo|jal[oó]n|peso muerto|dominad|prensa|desplante|zancad|hip thrust/i.test(e.nm||e.nombre||'')?'c':'a');
  return {kb,enf,tipo};
}
// ═════════════════════════════════════════
// CARDIO — dos formas de prescribirlo
//  · CONTINUO (caminadora, bici, elíptica, remo ergómetro…): minutos FIJOS del plan + FC objetivo.
//    El socio solo registra su frecuencia cardíaca; el tiempo ya viene en el plan.
//  · POR RONDAS (burpees, saltos, escaladores, cuerdas, trineo…): rondas × repeticiones (o segundos),
//    con la FC al terminar cada ronda en lugar del peso. Si la FC queda bajo la meta se sube el volumen.
// La FC objetivo sale de la edad (FC máx = 208 − 0.7 × edad) y del objetivo del socio.
// ═════════════════════════════════════════
function esEjRondas(e){ const kb=kbBuscar(e.nm||e.nombre); return !!(kb&&kb.rondas); }
function esEjCardio(e){
  if(esEjRondas(e)) return false;
  const nm=e.nm||e.nombre||'';
  const d=datosEj(e);
  return d.enf==='cardio' || /cardio|caminad|bici|el[ií]ptica|trote|correr|remo erg[oó]?metro/i.test(nm);
}
function esEjMovilidad(e){
  const nm=e.nm||e.nombre||'';
  return /movilidad|estiramient|calentamiento|c[ií]rculos de/i.test(nm) || /^movilidad/i.test(String(e.ms||e.musculo||''));
}

// ═════════════════════════════════════════
// MOVILIDAD — se le explica al socio qué es, para qué está en su plan, qué músculo o
// articulación se suelta, qué movimientos o posturas incluye y cuánto dura.
// Rutinas conocidas salen de KB_MOVILIDAD; el resto (estiramientos sueltos, rehabilitación,
// plan de flexibilidad) se explica según su nombre. El coordinador puede escribir su propia
// explicación en el campo "Para qué es" (e.porque) y esa manda.
// ═════════════════════════════════════════
const MOV_ZONAS=[
  [/cuadriceps/,'frente del muslo (cuádriceps)','Reduce la tensión que el cuádriceps le pone a la rodilla y mantiene el rango para sentadillas y zancadas.'],
  [/isquio|femoral/,'parte trasera del muslo (isquiotibiales)','Un femoral corto jala la pelvis y carga la espalda baja; soltarlo mejora la bisagra de cadera y el peso muerto.'],
  [/flexor.*cadera|psoas/,'frente de la cadera (psoas)','Estar sentado acorta el psoas y tira de la espalda baja; abrirlo le da espacio a la cadera y descarga la zona lumbar.'],
  [/aductor/,'cara interna del muslo (aductores)','Da rango a la sentadilla profunda y a las aperturas de piernas, y protege la ingle.'],
  [/gemelo|soleo|pantorrilla|tobillo|plantar/,'pantorrilla y tobillo','Un tobillo con poco rango hace que rodilla y cadera compensen en la sentadilla y al caminar.'],
  [/hombro/,'hombro y escápula','Más rango y control del hombro facilita press, jalones y trabajo sobre la cabeza sin pinzar.'],
  [/cuello|trapecio|elevador|inclinacion lateral/,'cuello y trapecio','El trapecio se tensa por postura, estrés o compensación cuando algo más duele; soltarlo baja la tensión de cuello y cabeza.'],
  [/toracic/,'espalda alta (columna torácica)','Si la espalda alta no rota, la espalda baja compensa; recuperar el giro protege la lumbar.'],
  [/columna|gato/,'columna, vértebra por vértebra','Reparte el movimiento a lo largo de toda la columna y reduce la rigidez.'],
  [/cadera/,'articulación de la cadera','Más rango activo de cadera mejora sentadilla, bisagra y zancada, y reduce molestias de rodilla y lumbar.'],
  [/muneca|antebrazo|dedos/,'muñeca y antebrazo','Mantiene el rango de muñeca y antebrazo y reduce la carga en agarres y apoyos.'],
];
function movInfo(e,dia){
  const nm=e.nm||e.nombre||'', n=kbNorm(nm);
  const kb=KB_MOVILIDAD.find(m=>m.claves.some(c=>n.includes(c)))||null;
  let info;
  if(kb){
    info={kb, tipo:kb.tipo, forma:kb.forma, que:kb.que, porque:kb.porque, suelta:kb.suelta, cuando:kb.cuando, pasos:kb.pasos};
    const t=kbNorm((dia&&dia.tipo)||'');
    if(kb.id==='mov_dinamica'){
      if(/pierna|gluteo|full|cuerpo/.test(t)) info.hoy='Hoy toca pierna o cuerpo completo: dale más atención a cadera y tobillo.';
      else if(/torso|pecho|espalda|hombro|brazo/.test(t)) info.hoy='Hoy toca tren superior: dale más atención a hombro y espalda alta.';
    }
  } else {
    const estatico=/estiramiento/.test(n);
    const z=MOV_ZONAS.find(x=>x[0].test(n));
    info={kb:null, tipo:estatico?'estatico':'dinamica', forma:'rondas',
      que: estatico?'Postura sostenida: llevas el músculo a una tensión moderada (nunca dolor) y respiras lento hasta sentirlo ceder. Sin rebotes.'
                   :'Movimiento suave, continuo y controlado que lleva la articulación por todo su rango. No se sostiene la posición: se mueve.',
      porque: z?z[2]:'Prepara el cuerpo y mantiene el rango de movimiento para que el entrenamiento se sienta mejor.',
      suelta: z?z[1]:'articulaciones y músculos de la zona',
      cuando: estatico?'Al final del entrenamiento o en día de descanso; no antes de series pesadas.':'Al inicio, antes de cargar peso, o en día de recuperación activa.',
      pasos:null};
  }
  if(e.porque && String(e.porque).trim()) info.porque=String(e.porque).trim();
  info.tipoTxt={dinamica:'Movilidad dinámica · se mueve',estatico:'Estiramiento · postura sostenida',mixto:'Movilidad + posturas'}[info.tipo];
  return info;
}
// Prescripción de movilidad: rondas o tiempo, según la rutina
function movRx(e,dia){
  const i=movInfo(e,dia), kb=i.kb;
  const m=String(e.reps||'').match(/(\d+)\s*min/i);
  const min=m?+m[1]:(kb&&kb.forma==='tiempo'?parseInt(kb.reps):0);
  const ser=Math.max(1,Math.min(5,parseInt(e.series)||(kb?kb.series:2)));
  const np=i.pasos?i.pasos.length:0;
  if(kb && kb.forma==='tiempo') return {forma:'tiempo',min,series:1,np,sr:min+' min'+(np?' · '+np+' movimientos':'')};
  if(kb) return {forma:'rondas',min:0,series:ser,np,sr:ser+' rondas'+(np?' · '+np+' movimientos':'')};
  return {forma:'rondas',min:0,series:ser,np:0,sr:ser+' × '+limpiarReps(e.reps||'30 seg')};
}
function movBloqueHTML(e,dia){
  const i=movInfo(e,dia), r=movRx(e,dia), E=esc;
  const sec=(t,c)=>`<div class="mv-t">${t}</div><div class="mv-p">${c}</div>`;
  let h=`<div class="mv-tipo">${E(i.tipoTxt)}</div>`;
  h+=sec('¿Qué es?',E(i.que));
  h+=sec('¿Por qué está en tu plan?',E(i.porque)+(i.hoy?'<br><b>'+E(i.hoy)+'</b>':''));
  h+=sec('Qué trabajas',E(i.suelta.charAt(0).toUpperCase()+i.suelta.slice(1)));
  h+=sec('Cuándo',E(i.cuando));
  if(i.pasos){
    h+=`<div class="mv-t">${r.forma==='tiempo'?'Posturas y movimientos · ~'+r.min+' min en total':'Movimientos de cada ronda'}</div><ol class="mv-ol">`+
       i.pasos.map(p=>`<li><b>${E(p.nm)}</b> <span>${E(p.dosis)}</span><div>${E(p.como)}</div></li>`).join('')+'</ol>';
  }
  return h;
}
const FC_ZONA_CONT ={PERDER:[65,75],RESIST:[70,82],MASA:[60,70],DEF:[60,70]};
const FC_ZONA_RONDA={PERDER:[75,88],RESIST:[78,90],MASA:[70,85],DEF:[65,80]};
const MIN_CONT={PERDER:[15,20,25],RESIST:[15,20,25],MASA:[10,12,15],DEF:[10,12,15]};
function claveObjFc(o){ o=String(o||'').toUpperCase();
  if(/PERDER|COMPOSICI/.test(o)) return 'PERDER'; if(/RESISTENCIA|RENDIMIENTO/.test(o)) return 'RESIST';
  if(/GANAR|FUERZA/.test(o)) return 'MASA'; return 'DEF'; }
function fcMaxSocio(sx){ const ed=parseInt(sx&&sx.edad)||35; return Math.round(208-0.7*ed); }
function zonaFc(e,sx,tipo){
  const k=claveObjFc(sx&&sx.objetivo), fcmax=fcMaxSocio(sx);
  let [a,b]=(tipo==='ronda'?FC_ZONA_RONDA:FC_ZONA_CONT)[k];
  const m=String(e.peso||'').match(/(\d{2,3})\s*[–-]\s*(\d{2,3})\s*%/);   // el coordinador puede fijar su propio rango
  if(m && /FC/i.test(e.peso) && +m[2]>+m[1] && +m[2]<=100){ a=+m[1]; b=+m[2]; }
  return {loPct:a,hiPct:b,lo:Math.round(fcmax*a/100),hi:Math.round(fcmax*b/100),fcmax};
}
function cardioRx(e,sx){
  const nv=nivelNum(sx&&sx.nivel), k=claveObjFc(sx&&sx.objetivo);
  const m=String(e.reps||'').match(/(\d+)\s*min/i);
  const per=m?+m[1]:MIN_CONT[k][Math.max(0,Math.min(2,nv-1))];
  const bloques=m?Math.max(1,parseInt(e.series)||1):1;
  return Object.assign({per,bloques,total:per*bloques,minTxt:bloques>1?bloques+' × '+per+' min':per+' min'}, zonaFc(e,sx,'cont'));
}
function rondasRx(e,sx){
  const kb=kbBuscar(e.nm||e.nombre)||{}, rx=kb.rx||{u:'reps',v:[8,10,12]}, nv=nivelNum(sx&&sx.nivel);
  const ser=Math.max(2,Math.min(6,parseInt(e.series)||[3,4,4][nv-1]));
  const m=String(e.reps||'').match(/(\d+)\s*(reps?|seg|m)\b/i);
  const u1=m?(/^rep/i.test(m[2])?'reps':m[2].toLowerCase()):'';
  const base=(m&&u1===rx.u)?+m[1]:rx.v[Math.max(0,Math.min(2,nv-1))];
  return Object.assign({series:ser,u:rx.u,base,paso:rx.u==='reps'?2:5}, zonaFc(e,sx,'ronda'));
}
function txtUnidad(n,u){ return n+' '+(u==='reps'?'reps':u==='seg'?'seg':'m'); }
function limpiarReps(r){ return String(r||'').replace(/\s*·\s*tempo[^—]*/i,'').replace(/\s*—\s*(potencia|fuerza|hipertrofia|resistencia|control)/i,'').trim(); }
// Resultado de la última vez que el socio hizo este ejercicio (FC promedio vs meta)
function ultimoFc(sx,nm){
  const ses=(sx&&sx.logs&&sx.logs.sesiones)||[];
  for(let i=ses.length-1;i>=0;i--){ const d=(ses[i].detalle||[]).find(x=>(x.alt||x.n)===nm||x.n===nm); if(d&&d.fc) return d; }
  return null;
}
// Texto corto de la prescripción (lista del día, vista previa, PDF)
function rxTexto(e,sx){
  const base=sx||((typeof activeSocio!=='undefined'&&activeSocio)?activeSocio:qAnswers);
  if(esEjCardio(e)){ const r=cardioRx(e,base); return {sr:r.minTxt, carga:'FC objetivo '+r.lo+'–'+r.hi+' lpm'}; }
  if(esEjRondas(e)){ const r=rondasRx(e,base); return {sr:r.series+' rondas × '+txtUnidad(r.base,r.u), carga:'FC objetivo '+r.lo+'–'+r.hi+' lpm'}; }
  if(esEjMovilidad(e)) return {sr:movRx(e).sr, carga:'Sin carga'};
  return {sr:e.series+' × '+e.reps, carga:(pct1RM(e.peso)?'Esfuerzo moderado — deja 2 reps en reserva':(e.peso||''))};
}
// Al generar una rutina: deja escrito en el plan el tiempo fijo / rondas y la FC objetivo
function ajustarCardioRondas(semana,sx){
  (semana||[]).forEach(d=>{ if(!d||!Array.isArray(d.ejercicios)) return;
    d.ejercicios.forEach(e=>{
      if(!e.nm&&e.nombre) e.nm=e.nombre;
      if(esEjCardio(e)){ const r=cardioRx(e,sx); e.series=r.bloques; e.reps=r.per+' min'; e.peso='FC objetivo '+r.lo+'–'+r.hi+' lpm'; delete e.metodo; delete e.grupo; }
      else if(esEjRondas(e)){ const r=rondasRx(e,sx); e.series=r.series; e.reps=txtUnidad(r.base,r.u); e.peso='FC objetivo '+r.lo+'–'+r.hi+' lpm'; delete e.metodo; delete e.grupo; }
      else if(esEjMovilidad(e)){
        const mi=movInfo(e,d), mm=String(e.reps||'').match(/(\d+)\s*min/i);
        e.peso='Sin carga'; delete e.metodo; delete e.grupo;
        if(mi.kb){ e.series=mi.kb.series; e.reps=mm?mm[0]:mi.kb.reps; } else e.reps=limpiarReps(e.reps)||'30 seg';
      }
    });
  });
  return semana;
}
// ═════════════════════════════════════════
// ISOMÉTRICOS — se miden por TIEMPO (rondas × segundos), nunca por repeticiones.
// Un ejercicio es isométrico si el catálogo lo marca (iso:true), si dice "isométrico"
// o si su prescripción es solo de segundos ("30 seg", "6 seg × 8") sin repeticiones.
// ═════════════════════════════════════════
function esEjIsometrico(e){
  const reps=String(e.reps||''), nm=e.nm||e.nombre||'';
  if(/isom[eé]tric/i.test(reps) || /isom[eé]tric/i.test(nm)) return true;
  if(esEjCardio(e)||esEjRondas(e)) return false;
  const kb=kbBuscar(nm); if(kb && kb.iso) return true;
  return /\d\s*seg\b/i.test(reps) && !/rep/i.test(reps);
}
// ¿se hace por lado? (plancha lateral, pallof, rotaciones...) → el tiempo bajo tensión cuenta por los dos lados
function ladoIso(e){
  if(/por lado|por pierna|por brazo|cada lado|c\/lado/i.test(String(e.reps||''))) return true;
  const kb=kbBuscar(e.nm||e.nombre); return !!(kb && kb.lado);
}
// Segundos objetivo de UNA ronda (un lado). "30 seg"→30 · "6 seg × 8"→48 · "1 min"→60
function segMetaIso(e,nivel){
  const r=String(e.reps||'');
  let m=r.match(/(\d+)\s*seg\s*[×x]\s*(\d+)/i); if(m) return (+m[1])*(+m[2]);
  m=r.match(/(\d+)\s*min/i); if(m) return (+m[1])*60;
  m=r.match(/(\d+)\s*seg/i); if(m) return +m[1];
  const kb=kbBuscar(e.nm||e.nombre);
  const nv=nivel||((typeof activeSocio!=='undefined'&&activeSocio)?nivelNum(activeSocio.nivel):2);
  return (kb&&kb.tt?kb.tt[Math.max(0,Math.min(2,nv-1))]:30)||30;
}
// Tiempo bajo tensión isométrico PRESCRITO de una lista de ejercicios (segundos)
function tutIsoPrescrito(ejs,nivel){
  return (ejs||[]).reduce((a,e)=>esEjIsometrico(e)?a+(parseInt(e.series)||0)*segMetaIso(e,nivel)*(ladoIso(e)?2:1):a,0);
}
function fmtTut(seg){ seg=Math.round(seg||0); return seg>=90 ? (Math.round(seg/6)/10)+' min' : seg+' s'; }
// Dosis por nivel: principiante 3 rondas cortas · intermedio 3 · avanzado 4 rondas largas
function dosisIsometrico(kb,nivel){
  const tt=kb.tt||[20,30,45];
  return {series: nivel>=3?4:3, reps: tt[Math.max(0,Math.min(2,nivel-1))]+' seg'+(kb.lado?' por lado':'')+' — isométrico'};
}
function ajustarIsometricos(semana,ctx){
  if(ctx.sinMetodos||ctx.soloSuaves) return semana; // flexibilidad / rehabilitación traen su propio protocolo
  (semana||[]).forEach(d=>{ if(!d||!Array.isArray(d.ejercicios)) return;
    d.ejercicios.forEach(e=>{
      const nm=e.nm||e.nombre; if(!nm||esEjCardio(e)) return;
      const kb=kbBuscar(nm); if(!kb||!kb.iso) return;
      const ds=dosisIsometrico(kb,ctx.nivel);
      e.series=ds.series; e.reps=ds.reps;
      if(!e.peso||/1RM|moderado|progresiva|ligero/i.test(e.peso)) e.peso=(kb.z==='corporal'||kb.z==='trx')?'Corporal':'Corporal o carga extra ligera';
      if(!e.descanso) e.descanso='45 seg entre rondas';
    });
  });
  return semana;
}

// ═════════════════════════════════════════
// VARIEDAD — la plantilla local ahora reparte ejercicios del catálogo completo
// (máquinas, peso libre, mancuernas, ligas, TRX, discos) respetando lesiones, nivel
// y la filosofía del entrenador elegido: equipo preferido, trabajo unilateral,
// variedad, ejercicios firma y los que NUNCA programa.
// ═════════════════════════════════════════
function aplicarEjCatalogo(e,x){
  e.nombre=x.nm; e.nm=x.nm; e.musculo=x.ms; e.ms=x.ms; e.enf=x.enf;
  e.tip=x.tip||('Siente el músculo objetivo ('+x.ms+') durante todo el recorrido y controla la bajada.');
  delete e.alternativas; delete e.metodo; delete e.grupo;
  if(x.z==='corporal'||x.z==='trx') e.peso='Corporal';
  else if(x.z==='liga') e.peso='Banda — resistencia media';
  else if(!e.peso||/^(corporal|banda|sin carga)/i.test(e.peso)) e.peso='Moderado — 50% 1RM';
}
function diversificarSemana(semana,ctx,filo,semilla){
  if(ctx.sinMetodos||ctx.soloSuaves) return semana;
  const f=filo||{}, se=f.seleccion||{};
  const variedad=(f.exerciseStyle&&f.exerciseStyle.variety)||3;
  const pCambio=({1:.2,2:.4,3:.6,4:.8,5:.9})[variedad]||.6;
  const lista=s=>String(s||'').split(/[,;\n]+/).map(kbNorm).filter(x=>x.length>2);
  const nunca=lista(se.nunca), firma=lista(se.firma);
  const rnd=prng('div|'+semilla);
  const usados=new Set();
  const libres=['mancuernas','rack','banco','funcional','disco'], guiadas=['maquina','polea'];
  (semana||[]).forEach(d=>{
    if(!d||!Array.isArray(d.ejercicios)||/descanso|complemento/i.test(d.tipo||'')) return;
    d.ejercicios.forEach(e=>{
      const nm=e.nm||e.nombre; if(!nm||esEjCardio(e)||esEjRondas(e)||esEjMovilidad(e)) return;
      const kb=kbBuscar(nm); if(!kb||!kb.enf||kb.enf==='cardio') return;
      const prohibido=nunca.some(n=>kbNorm(nm).includes(n));
      const esFirma=firma.some(n=>kbNorm(nm).includes(n));
      const cands=KB_EJERCICIOS.filter(x=>x.enf===kb.enf && x.id!==kb.id && x.t===kb.t && !!x.iso===!!kb.iso && !x.rondas && !usados.has(x.id)
        && !ctx.les.some(l=>(x.ev||[]).includes(l)) && (x.nv||1)<=ctx.nivel
        && !nunca.some(n=>kbNorm(x.nm).includes(n)));
      if(!cands.length || (!prohibido && (esFirma || rnd()>pCambio))){ usados.add(kb.id); return; }
      const w=cands.map(x=>{ let v=1;
        if(ctx.equipo>=4 && libres.includes(x.z)) v+=2; else if(ctx.equipo<=2 && guiadas.includes(x.z)) v+=2;
        if(firma.some(n=>kbNorm(x.nm).includes(n))) v+=6;
        const uni=!!x.lado || /unilateral|una pierna|a una|alterno|b[uú]lgara|zancada|desplante|step/i.test(x.nm);
        if(se.unilateral>=4 && uni) v+=2; else if(se.unilateral<=2 && uni) v=Math.max(.3,v-.7);
        return v; });
      let r=rnd()*w.reduce((a,b)=>a+b,0), pick=cands[cands.length-1];
      for(let i=0;i<cands.length;i++){ r-=w[i]; if(r<=0){ pick=cands[i]; break; } }
      usados.add(pick.id);
      aplicarEjCatalogo(e,pick);
    });
  });
  return semana;
}
function cargaLesion(ctx,d){
  return ctx.les.some(l=>(d.kb&&(d.kb.ev||[]).includes(l)) || (ZONA_LESION_ENF[l]||[]).includes(d.enf));
}
function elegirPonderado(rnd, ids, ctx){
  if(!ids.length) return null;
  const w=ids.map(id=>{ const M=KB_METODOS[id]; let x=1; if(M.obj.includes(ctx.obj)) x+=2; if(ctx.fav.includes(id)) x+=4; return x; });
  let r=rnd()*w.reduce((a,b)=>a+b,0);
  for(let i=0;i<ids.length;i++){ r-=w[i]; if(r<=0) return ids[i]; }
  return ids[ids.length-1];
}
function aplicarMetodo(e,id,extra){
  const M=KB_METODOS[id];
  const repsOrig=e.reps||'';
  e.metodo={id, nm:M.nm, detalle:extra||''};
  if(M.series) e.series=M.series;
  if(M.reps){
    if(id==='drop_set'||id==='rest_pause') e.metodo.detalle=(extra||'Solo en la última serie');
    else { const prop=(repsOrig.split('—')[1]||'').trim(); e.reps=M.reps+(prop?' — '+prop:''); }
  }
}
function descansoPara(e,ctx,d){
  if(e.descanso) return e.descanso;
  let t = ctx.obj==='F' ? (d.tipo==='c'?'2-3 min':'90 s') : ctx.obj==='R' ? '30-45 s' : (d.tipo==='c'?'90 s':'60 s');
  if(/cardio/i.test(d.enf)) t='—';
  return ctx.restStyle==='autorregulado' && t!=='—' ? 'Autorregulado (~'+t+')' : t;
}
function alternativasPara(e,ctx,d){
  if(!d.kb) return [];
  const mapa=d.kb.alt||{};
  let ids=mapa[d.enf] || mapa[Object.keys(mapa)[0]] || [];
  const extraIds=KB_EJERCICIOS.filter(x=>x._custom && x.enf===d.enf && x.id!==d.kb.id).map(x=>x.id);
  ids=[...new Set([...ids,...extraIds])];
  if(!ids.length && d.enf) ids=KB_EJERCICIOS.filter(x=>x.enf===d.enf && x.id!==d.kb.id).map(x=>x.id);
  let alts=ids.map(id=>KB_IDX[id]).filter(a=>a && !ctx.les.some(l=>(a.ev||[]).includes(l)));
  // Preferencia del entrenador para hora pico
  const pref={maquina:['maquina','polea'], mancuernas:['mancuernas','funcional'], corporal:['corporal','funcional'], metodo:['polea','mancuernas']}[ctx.sustit]||[];
  const libre=ctx.equipo>=4, maquina=ctx.equipo<=2;
  alts.sort((a,b)=>{
    const s=x=>(x.z!==d.kb.z?4:0)+(pref.includes(x.z)?2:0)+(libre&&['mancuernas','rack','banco','funcional'].includes(x.z)?1:0)+(maquina&&['maquina','polea'].includes(x.z)?1:0);
    return s(b)-s(a);
  });
  const etq=KB_ENFOQUES[d.enf]||d.kb.ms;
  return alts.slice(0,3).map(a=>({nm:a.nm, ms:a.ms, z:a.z, nota:`Mismo enfoque (${etq}) en ${KB_ZONAS[a.z]||a.z}`}));
}

// Enriquecer la lista de ejercicios de UN día (formato interno: nm, ms, series, reps...)
function kbMetodosPropios(f){ return Object.keys(KB_METODOS).filter(id=>KB_METODOS[id]._custom && f(KB_METODOS[id])); }
function enriquecerDia(ejs, ctx, seed){
  if(!ejs||!ejs.length) return ejs;
  const rnd=prng(seed);
  const ds=ejs.map(datosEj);
  // 1) Opciones por área ocupada + enfoque + descanso
  ejs.forEach((e,i)=>{
    if(!e.enf && ds[i].enf) e.enf=ds[i].enf;
    if(!Array.isArray(e.alternativas) || !e.alternativas.length) e.alternativas=alternativasPara(e,ctx,ds[i]);
  });
  // 2) Métodos de intensidad
  const perm=metodosPermitidos(ctx);
  const valido=id=>perm.includes(id);
  ejs.forEach(e=>{ if(e.metodo && (!KB_METODOS[e.metodo.id] || esEjCardio(e) || esEjRondas(e) || esEjMovilidad(e))) delete e.metodo; });
  let faltan=cuantosMetodos(ctx,ejs.length)-ejs.filter(e=>e.metodo).length;
  const libre=i=>ejs[i] && !ejs[i].metodo && !/cardio/.test(ds[i].enf) && !esEjCardio(ejs[i]) && !esEjRondas(ejs[i]) && !esEjMovilidad(ejs[i]);
  // Sobre la zona lesionada solo métodos de baja carga (la fase manda: isométrico → resistencia → hipertrofia)
  const SEGUROS_LESION=['tempo','pausa','superserie_ant','biserie','circuito'];
  const esIsom=i=>/seg|isom|min/i.test(String(ejs[i].reps||'')+' '+(ejs[i].nm||''));
  const puede=(i,id)=>!(cargaLesion(ctx,ds[i]) && !SEGUROS_LESION.includes(id)) && !(esIsom(i) && !KB_METODOS[id].pareja);
  const intentos=[];
  // a) Compuesto principal
  intentos.push(()=>{
    const iComp=ds.findIndex((d,i)=>d.tipo==='c' && libre(i));
    if(iComp<0) return false;
    const ops=['piramide_asc','piramide_desc','escalera','cluster','pausa','tempo',...kbMetodosPropios(m=>!m.pareja&&m.aplica!=='aislamiento')].filter(id=>valido(id)&&puede(iComp,id));
    const id=elegirPonderado(rnd,ops,ctx); if(!id) return false;
    aplicarMetodo(ejs[iComp],id); return true;
  });
  // b) Pareja (superserie / biserie / pre-agotamiento / contraste)
  intentos.push(()=>{
    for(let i=0;i<ejs.length-1;i++){
      if(!libre(i)||!libre(i+1)) continue;
      const a=ds[i].enf, b=ds[i+1].enf; let ops=[];
      if(ANTAG[a]===b) ops.push('superserie_ant');
      if(a && a===b) ops.push('biserie','post_agot');
      if(ctx.obj==='R') ops.push('superserie_ant','circuito');
      ops.push(...kbMetodosPropios(m=>m.pareja));
      ops=[...new Set(ops)].filter(id=>valido(id)&&puede(i,id)&&puede(i+1,id));
      if(ds[i].tipo==='c' && ds[i+1].tipo==='c') ops=ops.filter(id=>id!=='post_agot');
      const id=elegirPonderado(rnd,ops,ctx); if(!id) continue;
      const g=String.fromCharCode(65+Object.keys(gruposUsados).length);
      gruposUsados[g]=1;
      ejs[i].grupo=g+'1'; ejs[i+1].grupo=g+'2';
      aplicarMetodo(ejs[i],id,'Con '+(ejs[i+1].nm||ejs[i+1].nombre)); aplicarMetodo(ejs[i+1],id,'Con '+(ejs[i].nm||ejs[i].nombre));
      return true;
    }
    return false;
  });
  // c) Cierre en aislamiento (drop set, rest-pause, 21s...)
  intentos.push(()=>{
    for(let i=ejs.length-1;i>=0;i--){
      if(!libre(i) || ds[i].tipo!=='a' || /core|abdomen|manguito/.test(ds[i].enf)) continue;
      const ops=['drop_set','rest_pause','metodo21','una_y_media','drop_mec','tempo',...kbMetodosPropios(m=>!m.pareja&&m.aplica!=='compuesto')].filter(id=>valido(id)&&puede(i,id));
      const id=elegirPonderado(rnd,ops,ctx); if(!id) continue;
      aplicarMetodo(ejs[i],id); return true;
    }
    return false;
  });
  // d) Relleno: tempo / pausa / 1½ en cualquier ejercicio libre
  intentos.push(()=>{
    for(let i=0;i<ejs.length;i++){
      if(!libre(i)) continue;
      const ops=['tempo','pausa','una_y_media','emom',...kbMetodosPropios(m=>!m.pareja)].filter(id=>valido(id)&&puede(i,id)&&(KB_METODOS[id].aplica==='ambos'||(KB_METODOS[id].aplica==='compuesto')===(ds[i].tipo==='c')));
      const id=elegirPonderado(rnd,ops,ctx); if(!id) continue;
      aplicarMetodo(ejs[i],id); return true;
    }
    return false;
  });
  const gruposUsados={}; ejs.forEach(e=>{ if(e.grupo) gruposUsados[e.grupo.charAt(0)]=1; });
  // orden: aleatorizado ligeramente por día para que no todas las sesiones se vean iguales
  const orden=[0,1,2,3].sort(()=>rnd()-0.5);
  if(ctx.obj==='R') orden.sort((x,y)=>(x===1?-1:y===1?1:0));
  for(let pass=0; pass<2 && faltan>0; pass++) for(const k of orden){ if(faltan<=0) break; if(intentos[k] && intentos[k]()) faltan--; }
  // 3) Descansos (en parejas, el primero va sin descanso)
  ejs.forEach((e,i)=>{
    if(e.grupo && /1$/.test(e.grupo) && ejs[i+1] && ejs[i+1].grupo && ejs[i+1].grupo.charAt(0)===e.grupo.charAt(0)) e.descanso=e.descanso||'Sin descanso → sigue con '+ejs[i+1].grupo;
    else e.descanso=descansoPara(e,ctx,ds[i]);
  });
  return ejs;
}
function enriquecerSemana(semana, ctx, semilla){
  (semana||[]).forEach((d,i)=>{
    if(!d || !Array.isArray(d.ejercicios) || !d.ejercicios.length) return;
    d.ejercicios.forEach(e=>{ if(!e.nm && e.nombre) e.nm=e.nombre; if(!e.ms && e.musculo) e.ms=e.musculo; });
    enriquecerDia(d.ejercicios, ctx, (semilla||'')+'|'+i+'|'+(d.tipo||''));
  });
  return semana;
}
// Para socios que ya existen (botón del panel staff). Solo agrega lo que falta.
function enriquecerSocio(s){
  const ent=s.entrenadorId?getEntrenador(s.entrenadorId):null;
  const ctx=ctxDesdePerfil({nivel:s.nivel,objetivo:s.objetivo,limitaciones:s.limitaciones}, ent&&ent.filosofia);
  const dias=DIAS_ORDER.map(k=>s.rutina&&s.rutina[k]).filter(Boolean);
  enriquecerSemana(dias, ctx, s.code);
  return s;
}
// Normaliza lo que devuelve la IA (alternativas con "nombre", método como texto, etc.)
function normalizarRutinaIA(r){
  (r.semana||[]).forEach(d=>(d.ejercicios||[]).forEach(e=>{
    e.nm=e.nm||e.nombre; e.ms=e.ms||e.musculo;
    if(typeof e.metodo==='string') e.metodo={id:e.metodo};
    if(e.metodo && KB_METODOS[e.metodo.id]) e.metodo.nm=KB_METODOS[e.metodo.id].nm; else delete e.metodo;
    if(Array.isArray(e.alternativas)) e.alternativas=e.alternativas.map(a=>{
      const nm=(a&&(a.nombre||a.nm))||String(a||''); const kb=kbBuscar(nm);
      return nm?{nm, ms:(a&&(a.musculo||a.ms))||(kb&&kb.ms)||'', z:kb?kb.z:'', nota:(a&&a.nota)||''}:null;
    }).filter(Boolean);
  }));
  return r;
}
// Texto de la base de conocimiento para el prompt de IA (filtrado para este socio)
function bloqueConocimientoIA(ctx){
  const perm=metodosPermitidos(ctx);
  const metodos=perm.map(id=>`   - ${id}: ${KB_METODOS[id].nm}${ctx.fav.includes(id)?' (FAVORITO DEL ENTRENADOR)':''} — ${KB_METODOS[id].como}`).join('\n');
  const porEnf={};
  KB_EJERCICIOS.forEach(e=>{ if(ctx.les.some(l=>(e.ev||[]).includes(l))) return; (porEnf[e.enf]=porEnf[e.enf]||[]).push(e.nm+' ['+e.z+']'); });
  const cat=Object.entries(porEnf).map(([k,v])=>`   ${KB_ENFOQUES[k]||k}: ${v.join(', ')}`).join('\n');
  const notasKB=Object.values(kbExtra().notas).filter(n=>n&&n.t).map(n=>`   - ${n.t}: ${n.x}`).join('\n');
  const linN=notasKB?`\nNOTAS Y CRITERIOS DEL CLUB:\n${notasKB}\n`:'';
  const lin=(DB.config&&DB.config.lineamientos)?`\nLINEAMIENTOS DEL COORDINADOR (obligatorios):\n${DB.config.lineamientos}\n`:'';
  return `PRINCIPIOS DEL CLUB:\n${KB_PRINCIPIOS.map((p,i)=>'   '+(i+1)+'. '+p).join('\n')}
${lin}${linN}
MÉTODOS DE INTENSIDAD PERMITIDOS PARA ESTE SOCIO (usa el id exacto en "metodo.id"):
${metodos||'   (ninguno: rutina con ejecución estándar y tempo controlado)'}
Usa ${cuantosMetodos(ctx,6)} métodos por sesión aproximadamente. Métodos de pareja (superserie, biserie, circuito, pre/post-agotamiento, contraste, triserie) se marcan con "grupo" (A1/A2, B1/B2...). Drop set y rest-pause solo en aislamiento y en la última serie. Nunca métodos de alta fatiga sobre la zona lesionada.

CATÁLOGO DE EJERCICIOS DEL GIMNASIO (usa estos nombres; entre corchetes la zona):
${cat}

OPCIONES POR ÁREA OCUPADA: cada ejercicio lleva 2 "alternativas" del MISMO enfoque muscular pero en OTRA zona del gimnasio (p. ej. Desplante con enfoque cuádriceps → Extensión de cuádriceps [maquina] o Prensa con pies bajos [maquina]).`;
}
