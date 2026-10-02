/* ═══ progresion ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// PROGRESIÓN POR BLOQUES (4-6 semanas)
// 1) El entrenador envía la evaluación → 2) el socio la contesta en su app
// 3) el sistema propone el siguiente bloque con sus datos reales + respuestas
// 4) el entrenador revisa y aprueba → la rutina anterior queda en el historial
// Todo funciona sin conexión (se sincroniza con la bandeja de pendientes).
// ═════════════════════════════════════════
const PQ_ZONAS={
  pierna:{nm:'Pierna',enf:['cuadriceps','femoral','pantorrilla']}, gluteo:{nm:'Glúteo',enf:['gluteo']},
  espalda:{nm:'Espalda',enf:['dorsal','espalda_media','trapecio']}, pecho:{nm:'Pecho',enf:['pecho','pecho_sup']},
  hombro:{nm:'Hombro',enf:['deltoide','deltoide_lat','deltoide_post']}, brazos:{nm:'Brazos',enf:['biceps','triceps','braquial']},
  core:{nm:'Abdomen y core',enf:['core','abdomen']}
};
const PQ_MOLESTIA_ENF={hombro:['pecho','pecho_sup','deltoide','deltoide_lat','triceps','manguito'],codo:['triceps','biceps','braquial'],lumbar:['femoral','espalda_media','gluteo'],cadera:['gluteo','femoral'],rodilla:['cuadriceps'],cuello:['trapecio']};
const PQ_PREG=[
  {id:'intensidad', k:'Intensidad', t:'¿Cómo sentiste tu rutina estas semanas?', o:[['facil','Muy fácil','Terminaba con mucha energía'],['adecuada','Adecuada','Me cansaba lo justo'],['retadora','Retadora','Me costaba, pero la completaba'],['pesada','Demasiado pesada','No lograba terminarla']]},
  {id:'rir', k:'Reps en reserva', t:'Al terminar cada serie, ¿cuántas repeticiones más podías hacer?', s:'Piensa en la mayoría de tus ejercicios.', o:[['4','4 o más','Me sobraba bastante'],['2','2 o 3','Quedaba poco'],['0','0 o 1','Llegaba al límite'],['no','No completaba las repeticiones','Me quedaba corto']]},
  {id:'asistencia', k:'Asistencia', t:'¿Cuántos días pudiste entrenar realmente?', o:[['todos','Todos los planeados',''],['casi','Casi todos','Faltaba uno por semana'],['mitad','Más o menos la mitad',''],['poco','Menos de la mitad','']]},
  {id:'recuperacion', k:'Recuperación', t:'¿Cómo te recuperas entre sesiones?', o:[['bien','Muy bien','Llego con energía'],['normal','Normal','Algo de dolor muscular que se quita'],['cansado','Llego cansado','Me cuesta arrancar'],['dolor','Dolor que no se quita','Tarda más de 3 días']]},
  {id:'molestia', k:'Molestias', t:'¿Tuviste alguna molestia en articulaciones?', s:'Puedes elegir varias.', multi:true, o:[['ninguna','Ninguna'],['hombro','Hombro'],['codo','Codo o muñeca'],['lumbar','Espalda baja'],['cadera','Cadera'],['rodilla','Rodilla'],['cuello','Cuello']]},
  {id:'tecnica', k:'Técnica', t:'¿Cómo te sientes con la técnica de tus ejercicios?', o:[['segura','Segura en todos',''],['dudas','Con dudas en algunos',''],['correccion','Necesito que me corrijan','']]},
  {id:'avance', k:'Avance', t:'¿Cuánto sientes que avanzas hacia tu objetivo?', o:[['mucho','Mucho',''],['algo','Algo',''],['igual','Sigo igual',''],['atras','Siento que retrocedo','']]},
  {id:'enfoque', k:'Preferencia', t:'Para tu siguiente bloque prefieres…', o:[['cargas','Mismos ejercicios, más peso','Ver mi avance fácilmente'],['variedad','Más variedad','Cambiar algunos ejercicios'],['tiempo','Sesiones más cortas','Tengo menos tiempo'],['zona','Enfocar una zona','Elige cuál abajo']]},
  {id:'disponibilidad', k:'Disponibilidad', t:'¿Cambió tu disponibilidad para entrenar?', o:[['igual','Igual que antes',''],['mas','Puedo más días',''],['menos','Puedo menos días','']]},
  {id:'quitar', k:'Quitar', t:'¿Algún ejercicio que no te gustó o no pudiste hacer?', s:'Opcional. Lo cambiamos por uno similar.', ejercicios:true, opcional:true},
  {id:'comentario', k:'Comentario', t:'¿Algo más que tu entrenador deba saber?', s:'Opcional.', texto:true, opcional:true}
];
const PQ_MOL_NM={hombro:'hombro',codo:'codo o muñeca',lumbar:'espalda baja',cadera:'cadera',rodilla:'rodilla',cuello:'cuello'};

// ── Datos del bloque ──
function pqBloque(s){
  const b=s.bloque||{};
  const primera=comoArray(s.logs&&s.logs.sesiones).map(x=>x&&x.fecha).filter(Boolean).sort()[0];
  return {n:+b.n||1, desde:b.desde||s.fechaRegistro||primera||fechaISO(new Date()), semanas:+b.semanas||4};
}
function pqSemanaActual(s){ const d=diasDesde(pqBloque(s).desde)||0; return Math.floor(Math.max(0,d)/7)+1; }
function pqEstado(s){ return (s.progresion&&s.progresion.estado)||''; }
function pqTocaProgresar(s){ return s.status==='activo' && pqSemanaActual(s)>=pqBloque(s).semanas; }
function pqNecesitaAccion(s){ const e=pqEstado(s); return e==='respondido'||e==='propuesta'||(pqTocaProgresar(s)&&(!e||e==='aprobado')); }
function pqStatsBloque(s){
  const b=pqBloque(s);
  const ses=comoArray(s.logs&&s.logs.sesiones).filter(x=>x && String(x.fecha||'')>=b.desde);
  const semTrans=Math.max(1,Math.min(b.semanas,Math.ceil(((diasDesde(b.desde)||0)+1)/7)));
  const meta=Math.max(1,(parseInt(s.dias)||3)*semTrans);
  return {sesiones:ses.length, adherencia:Math.min(100,Math.round(ses.length/meta*100)), ses};
}
function pqDatosEj(s,st,nm){
  const reg=[]; st.ses.forEach(x=>comoArray(x.detalle).forEach(d=>{ if(d && d.n===nm) reg.push(d); }));
  const conKg=reg.filter(d=>!d.alt && +d.kg>0);
  const ult=conKg.slice(-2).map(d=>+d.kg);
  const compl=reg.length ? reg.reduce((a,d)=>a+Math.min(1,(+d.s||0)/Math.max(1,+d.p||1)),0)/reg.length : null;
  return {veces:reg.length, kg:ult.length?Math.max(...ult):null, compl};
}
function pqParseKg(p){ const m=String(p||'').match(/(\d+(?:[.,]\d+)?)\s*kg/i); return m?parseFloat(m[1].replace(',','.')):null; }
function pqRedondear(kg){ return kg>=20 ? Math.round(kg/2.5)*2.5 : kg>=5 ? Math.round(kg) : Math.round(kg*2)/2; }
function pqFmtKg(n){ return (Math.round(n*10)/10)+' kg'; }
function pqSubirReps(txt,suave){
  const t=String(txt||''); if(!/\d/.test(t)) return null;
  const tiempo=/seg|min|\d\s*s\b/i.test(t);
  const inc=tiempo?(suave?5:10):(suave?1:2), tope=tiempo?90:30;
  return t.replace(/(\d+)(\s*-\s*(\d+))?/, (m,a,r,b)=>{ const na=Math.min(tope,+a+inc); return b ? na+'-'+Math.min(tope,+b+inc) : String(na); });
}
function pqAlternativa(e,de,molestias,usados,rnd){
  const ok=x=>x && x.nm && !usados.has(String(x.nm).toLowerCase()) && !molestias.some(m=>(x.ev||[]).includes(m)) && !(de.kb && x.id && x.id===de.kb.id) && x.nm!==e.nm;
  const porId=id=>KB_EJERCICIOS.find(x=>x.id===id);
  let lista=[];
  if(de.kb){ const mapa=de.kb.alt||{}; lista=lista.concat((mapa[de.enf]||mapa[Object.keys(mapa)[0]]||[]).map(porId)); }
  lista=lista.concat(comoArray(e.alternativas).map(a=>a&&(kbBuscar(a.nm)||{nm:a.nm,ms:a.ms,enf:de.enf})));
  if(de.enf) lista=lista.concat(KB_EJERCICIOS.filter(x=>x.enf===de.enf));
  const vistos=new Set(); lista=lista.filter(x=>{ if(!ok(x)) return false; const k=String(x.nm).toLowerCase(); if(vistos.has(k)) return false; vistos.add(k); return true; });
  if(!lista.length) return null;
  return lista[Math.floor(rnd()*Math.min(3,lista.length))];
}

// ── Motor de progresión: rutina actual + registros del bloque + respuestas ──
function pqMotor(s,r){
  r=r||{};
  const sinEval=!Object.keys(r).length;
  const st=pqStatsBloque(s), b=pqBloque(s);
  const obj=s.objetivo||'', letra=objLetra(obj), R=letra==='R';
  const suave=obj==='REHABILITACIÓN'||obj==='FLEXIBILIDAD';
  const res=[];
  let paso={facil:7.5,adecuada:5,retadora:2.5,pesada:0}[r.intensidad]; if(paso===undefined) paso=5;
  if(r.rir==='4') paso+=2.5; else if(r.rir==='0') paso-=2.5; else if(r.rir==='no') paso=0;
  paso=Math.max(0,Math.min(10,paso));
  if(sinEval) res.push('Propuesta hecha solo con sus registros (el socio no contestó la evaluación).');
  if(r.asistencia==='poco' || st.adherencia<40){ paso=0; res.push(`Asistencia baja (${st.adherencia}% del bloque): se mantienen las cargas para consolidar.`); }
  else if(r.asistencia==='mitad' || st.adherencia<65){ paso=Math.min(paso,2.5); res.push(`Asistencia media (${st.adherencia}%): progresión ligera.`); }
  else res.push(`Asistencia del bloque: ${st.adherencia}% (${st.sesiones} sesiones).`);
  let menosSerieTodo=false, menosSerieAcc=false;
  if(r.recuperacion==='dolor'){ paso=0; menosSerieTodo=true; res.push('No se recupera bien: bloque de descarga (−1 serie, sin subir peso).'); }
  else if(r.recuperacion==='cansado'){ paso=Math.min(paso,5); menosSerieAcc=true; res.push('Llega cansado: −1 serie en ejercicios accesorios.'); }
  if(r.enfoque==='tiempo'){ menosSerieAcc=true; res.push('Quiere sesiones más cortas: −1 serie en accesorios.'); }
  if(paso>0 && !suave) res.push(`Subida de peso base: +${R?paso/2:paso}%${R?' (objetivo de resistencia: se progresa más suave)':''}.`);
  const molestias=comoArray(r.molestia).filter(x=>x && x!=='ninguna');
  if(molestias.length) res.push('Molestias en '+molestias.map(m=>PQ_MOL_NM[m]||m).join(', ')+': esos ejercicios no suben peso y se cambian si hay una opción más amigable.');
  if(r.tecnica==='correccion') res.push('Pidió corrección de técnica: los ejercicios compuestos mantienen el peso. Revisa su técnica en piso.');
  else if(r.tecnica==='dudas') res.push('Tiene dudas de técnica: progresión moderada en compuestos.');
  const zonaEnf = r.enfoque==='zona' && PQ_ZONAS[r.zona] ? PQ_ZONAS[r.zona].enf : [];
  if(zonaEnf.length) res.push('Enfoque en '+PQ_ZONAS[r.zona].nm.toLowerCase()+': +1 serie en esos ejercicios.');
  if(r.enfoque==='variedad') res.push('Pidió variedad: se cambia un accesorio por día.');
  if(suave) res.push(obj==='FLEXIBILIDAD'?'Flexibilidad: se progresa tiempo y repeticiones, no peso.':'Rehabilitación: solo sube repeticiones/tiempo. El avance de fase se decide en el protocolo.');
  if((r.avance==='igual'||r.avance==='atras') && paso>0) res.push('Siente poco avance: considera también cambiar el estímulo (método, tempo o ángulo).');
  if(r.disponibilidad==='mas'||r.disponibilidad==='menos') res.push('⚠ Cambió su disponibilidad ('+(r.disponibilidad==='mas'?'puede más días':'puede menos días')+'): ajusta los días a mano.');
  if(r.comentario) res.push('Comentario del socio: “'+limpiarTexto(r.comentario)+'”');

  const rnd=prng(s.code+'|'+b.n+'|'+(r.enfoque||''));
  const quitar=comoArray(r.quitar);
  const rutina=JSON.parse(JSON.stringify(s.rutina||{}));
  const cambios=[];
  DIAS_ORDER.forEach(k=>{
    const d=rutina[k]; if(!d || !Array.isArray(d.ejercicios)) return;
    const usados=new Set(d.ejercicios.map(e=>String(e.nm||'').toLowerCase()));
    let variedadHecha=false;
    d.ejercicios.forEach((e,ei)=>{
      const antes={nm:e.nm||'', series:e.series, reps:e.reps||'', peso:e.peso||''};
      const mot=[];
      const de=datosEj(e), compuesto=de.tipo==='c';
      const esCardio=/cardio/i.test(de.enf||'') || /cardio|caminad|bici|el[ií]ptica|trote|correr|remo erg/i.test(e.nm||'');
      const tocaMolestia=molestias.some(m=>(de.kb&&(de.kb.ev||[]).includes(m)) || (PQ_MOLESTIA_ENF[m]||[]).includes(de.enf));
      // 1) Cambio de ejercicio
      let razon=null;
      if(quitar.includes(e.nm)) razon='no le gustó o no pudo hacerlo';
      else if(tocaMolestia && de.kb) razon='molestia en la zona';
      else if(r.enfoque==='variedad' && !compuesto && ei>0 && !variedadHecha && !esCardio) razon='más variedad';
      let cambiado=false;
      if(razon){
        const alt=pqAlternativa(e,de,molestias,usados,rnd);
        if(alt){
          usados.add(String(alt.nm).toLowerCase());
          e.alternativas=[{nm:antes.nm, ms:e.ms||'', nota:'Ejercicio del bloque anterior'}].concat(comoArray(e.alternativas).filter(a=>a && a.nm!==alt.nm && a.nm!==antes.nm)).slice(0,4);
          e.nm=alt.nm; if(alt.ms) e.ms=alt.ms; if(alt.enf) e.enf=alt.enf;
          e.tip='Ejercicio nuevo: busca la misma sensación que tenías en '+antes.nm+'.';
          if(!suave && !esCardio && pqParseKg(antes.peso)) e.peso='Ajustar: deja 2-3 reps en reserva';
          mot.push('Cambio de ejercicio ('+razon+')'); cambiado=true;
          if(razon==='más variedad') variedadHecha=true;
        } else if(razon!=='más variedad') mot.push('Revisar: '+razon+' (no encontré alternativa segura)');
      }
      // 2) Series
      const series=parseInt(e.series)||0;
      if(series){
        let dlt=0;
        if(menosSerieTodo) dlt-=1; else if(menosSerieAcc && !compuesto) dlt-=1;
        if(zonaEnf.includes(de.enf)) dlt+=1;
        const ns=Math.max(2,Math.min(5,series+dlt));
        if(ns!==series){ e.series=ns; mot.push(ns>series?'+1 serie (zona de enfoque)':'−1 serie'); }
      }
      // 3) Carga o repeticiones
      if(!cambiado && !esCardio){
        let p=paso;
        if(tocaMolestia) p=0;
        if(compuesto && r.tecnica==='correccion') p=0; else if(compuesto && r.tecnica==='dudas') p=Math.min(p,2.5);
        const dat=pqDatosEj(s,st,e.nm);
        if(dat.compl!==null && dat.compl<0.75 && p>0){ p=0; mot.push('No completó todas sus series: mismo peso'); }
        if(R) p=p/2;
        const kgPlan=pqParseKg(e.peso), base=dat.kg||kgPlan;
        if(!suave && base){
          if(p>0){
            let nuevo=pqRedondear(base*(1+p/100));
            if(nuevo<=base) nuevo=base+(base>=20?2.5:1);
            e.peso=pqFmtKg(nuevo);
            mot.push(`Peso ${pqFmtKg(base)} → ${pqFmtKg(nuevo)}${dat.kg&&dat.kg!==kgPlan?' (según lo que registró)':''}`);
          } else if(dat.kg && dat.kg!==kgPlan){ e.peso=pqFmtKg(dat.kg); mot.push('Peso ajustado a lo que realmente levanta: '+pqFmtKg(dat.kg)); }
          else if(tocaMolestia) mot.push('Mismo peso por la molestia');
        } else if(p>0 || (suave && paso>0)){
          const nr=pqSubirReps(e.reps,suave||R);
          if(nr && nr!==e.reps){ mot.push('Repeticiones: '+e.reps+' → '+nr); e.reps=nr; }
        }
      }
      if(mot.length) cambios.push({dia:k, antes, despues:{nm:e.nm, series:e.series, reps:e.reps||'', peso:e.peso||''}, motivo:mot.join(' · ')});
    });
  });
  return {rutina, cambios, resumen:res, fecha:fechaISO(new Date()), deBloque:b.n, sesiones:st.sesiones, adherencia:st.adherencia, sinEvaluacion:sinEval};
}

// ── Acciones del entrenador / coordinador ──
function pqStaffNombre(){ const e=document.getElementById('staff-nombre'); return (e&&e.textContent)||'Staff'; }
function pqGuardarStaff(s,campos){
  guardarLocal();
  const o={}; campos.forEach(k=>{ o[k]=(s[k]===undefined?null:s[k]); });
  fbEncolar('/socios/'+s.code,'update',o);
}
function pqRefrescarStaff(s){ staffRenderList(); staffRenderContent(s); setTimeout(()=>{ const el=document.getElementById('pg-sec'); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); },40); }
function pqEnviar(code){
  const s=getSocio(code); if(!s) return;
  s.progresion={estado:'enviado', bloque:pqBloque(s).n, fechaEnvio:fechaISO(new Date()), por:pqStaffNombre()};
  pqGuardarStaff(s,['progresion']); pqRefrescarStaff(s);
  showToast('📋 Evaluación enviada — la verá al entrar a su app');
}
function pqCancelar(code){
  const s=getSocio(code); if(!s) return;
  uiConfirm('¿Cancelar la evaluación de progreso de este socio?',()=>{
    delete s.progresion; pqGuardarStaff(s,['progresion']); pqRefrescarStaff(s);
  },{label:'Sí, cancelar',danger:true});
}
function pqGenerar(code){
  const s=getSocio(code); if(!s) return;
  if(staffDirty.has(code)) uiConfirm('Tienes cambios sin guardar en la rutina; la propuesta partirá de la rutina con esos cambios. ¿Continuar?',()=>pqGenerarFinal(code),{label:'Continuar'});
  else pqGenerarFinal(code);
}
function pqGenerarFinal(code){
  const s=getSocio(code); if(!s) return;
  const P=s.progresion||{};
  const prop=pqMotor(s,P.respuestas||null);
  s.progresion=Object.assign({},P,{estado:'propuesta', bloque:pqBloque(s).n, propuesta:prop});
  pqGuardarStaff(s,['progresion']); pqRefrescarStaff(s);
  showToast('✨ Propuesta lista: '+prop.cambios.length+' ajustes. Revísala antes de aprobar.');
}
function pqDescartar(code){
  const s=getSocio(code); if(!s||!s.progresion) return;
  const P=s.progresion;
  if(P.respuestas){ s.progresion=Object.assign({},P,{estado:'respondido'}); delete s.progresion.propuesta; }
  else delete s.progresion;
  pqGuardarStaff(s,['progresion']); pqRefrescarStaff(s);
}
function pqAprobar(code){
  const s=getSocio(code); const P=s&&s.progresion; const p=P&&P.propuesta; if(!p) return;
  const semEl=document.getElementById('pq-sem-'+code);
  const sem=Math.max(3,Math.min(8,parseInt(semEl&&semEl.value)||4));
  const b=pqBloque(s);
  uiConfirm(`¿Activar el bloque ${b.n+1} (${sem} semanas)?\nLa rutina actual se guarda en el historial y el socio verá la nueva al instante.`,
    ()=>pqAprobarFinal(code,sem), {label:'Activar bloque '+(b.n+1)});
}
function pqAprobarFinal(code,sem){
  const s=getSocio(code); const P=s&&s.progresion; const p=P&&P.propuesta; if(!p) return;
  const b=pqBloque(s), hoy=fechaISO(new Date()), st=pqStatsBloque(s);
  const hist=comoArray(s.historialRutinas);
  hist.push({n:b.n, desde:b.desde, hasta:hoy, semanas:b.semanas, rutina:limpio(s.rutina), sesiones:st.sesiones, adherencia:st.adherencia, respuestas:P.respuestas||null});
  s.historialRutinas=hist.slice(-12);
  s.rutina=JSON.parse(JSON.stringify(p.rutina));
  s.bloque={n:b.n+1, desde:hoy, semanas:sem}; staffProgSel='actual';
  s.progresion={estado:'aprobado', bloque:b.n+1, fecha:hoy, visto:false, resumen:(p.resumen||[]).filter(x=>!/^Comentario del socio/.test(x)).slice(0,6), nCambios:(p.cambios||[]).length, por:pqStaffNombre()};
  staffDirty.delete(code);
  pqGuardarStaff(s,['rutina','bloque','historialRutinas','progresion']);
  pqRefrescarStaff(s);
  showToast('🚀 Bloque '+(b.n+1)+' activado. Si quieres, afina ejercicios abajo y presiona GUARDAR.');
}

// ── Vista del entrenador ──
function pqRespuestasHTML(r){
  if(!r) return '';
  const filas=PQ_PREG.map(q=>{
    let v=r[q.id]; if(v==null || v==='' || (Array.isArray(v)&&!v.length)) return '';
    let txt;
    if(q.texto) return '';
    if(q.ejercicios) txt=comoArray(v).join(', ');
    else if(q.multi) txt=comoArray(v).map(x=>(q.o.find(o=>o[0]===x)||[x,x])[1]).join(', ');
    else { txt=(q.o.find(o=>o[0]===v)||[v,v])[1]; if(q.id==='enfoque' && v==='zona' && PQ_ZONAS[r.zona]) txt+=': '+PQ_ZONAS[r.zona].nm; }
    const alerta=(q.id==='recuperacion'&&v==='dolor')||(q.id==='molestia'&&comoArray(v).some(x=>x!=='ninguna'))||(q.id==='intensidad'&&v==='pesada')||(q.id==='tecnica'&&v==='correccion');
    return `<div class="pg-r${alerta?' al':''}"><span>${esc(q.k)}</span><b>${esc(txt)}</b></div>`;
  }).join('');
  return `<div class="pg-resp">${filas}</div>${r.comentario?`<div class="pg-com">“${esc(r.comentario)}”</div>`:''}`;
}
function pqEjTxt(x){ return [x.series?x.series+'×':'', x.reps||'', x.peso?'· '+x.peso:''].join(' ').replace(/\s+/g,' ').trim(); }
function pqPropuestaHTML(s,p){
  const porDia={}; (p.cambios||[]).forEach(c=>{ (porDia[c.dia]=porDia[c.dia]||[]).push(c); });
  const totalEj=DIAS_ORDER.reduce((a,k)=>a+comoArray(s.rutina&&s.rutina[k]&&s.rutina[k].ejercicios).length,0);
  const dias=DIAS_ORDER.filter(k=>porDia[k]).map(k=>`
    <div class="pg-dia">${esc(sc(DIAS_NAMES[k]).substring(0,3))} · ${esc(sc((p.rutina[k]&&p.rutina[k].tipo)||''))}</div>
    ${porDia[k].map(c=>{
      const nuevoNm=c.antes.nm!==c.despues.nm;
      return `<div class="pg-ch"><div class="pg-ch-n">${nuevoNm?`<s>${esc(c.antes.nm)}</s> → `:''}<b>${esc(c.despues.nm)}</b></div>
        <div class="pg-ch-v"><span>${esc(pqEjTxt(c.antes))}</span><i>→</i><b>${esc(pqEjTxt(c.despues))}</b></div>
        <div class="pg-ch-m">${esc(c.motivo)}</div></div>`;
    }).join('')}`).join('');
  return `
    <div class="pg-k">Propuesta para el bloque ${p.deBloque+1}</div>
    <ul class="pg-ul">${(p.resumen||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
    <div class="pg-cnt"><b>${(p.cambios||[]).length}</b> ajustes en ${totalEj} ejercicios · el resto se mantiene igual</div>
    ${dias||'<div class="pg-p">Sin cambios automáticos: mantiene la misma rutina. Puedes aprobarla y ajustarla a mano.</div>'}
    <div class="pg-apr">
      <label>Duración del nuevo bloque
        <select class="sf-in" id="pq-sem-${esc(s.code)}">${[4,5,6].map(n=>`<option value="${n}" ${n===(pqBloque(s).semanas||4)?'selected':''}>${n} semanas</option>`).join('')}</select>
      </label>
      <button type="button" class="sd-pri" onclick="pqAprobar('${esc(s.code)}')">Aprobar y activar bloque ${p.deBloque+1}</button>
      <div class="pg-acts"><button type="button" class="sd-b" onclick="pqGenerar('${esc(s.code)}')">Regenerar</button><button type="button" class="sd-b" onclick="pqDescartar('${esc(s.code)}')">Descartar</button></div>
      <div class="pg-p sm">Después de aprobar puedes afinar cualquier ejercicio en la rutina de abajo y presionar Guardar.</div>
    </div>`;
}
function pqRutinaMiniHTML(rut){
  return DIAS_ORDER.map(k=>{ const d=rut&&rut[k]; const ej=comoArray(d&&d.ejercicios); if(!ej.length) return '';
    return `<div class="pg-dia">${esc(sc(DIAS_NAMES[k]).substring(0,3))} · ${esc(sc(d.tipo||''))}</div>`+ej.map(e=>`<div class="pg-mini"><span>${esc(e.nm)}</span><b>${esc(pqEjTxt(e))}</b></div>`).join('');
  }).join('');
}
function pqHistorialHTML(s){
  const h=comoArray(s.historialRutinas).filter(Boolean);
  if(!h.length) return '';
  return `<div class="pg-hist-t">Bloques anteriores</div>`+h.slice().reverse().map(x=>`
    <details class="pg-h"><summary><b>Bloque ${esc(x.n)}</b><span>${esc(fmtFecha(x.desde))} – ${esc(fmtFecha(x.hasta))} · ${esc(x.sesiones)} sesiones · ${esc(x.adherencia)}%</span></summary>
      ${x.respuestas?pqRespuestasHTML(x.respuestas):''}
      ${pqRutinaMiniHTML(x.rutina)}
    </details>`).join('');
}
// Datos crudos de análisis (racha, volumen semanal, progresión de carga por ejercicio),
// compartidos entre la ficha del socio (bloqueAnalisisStaff) y el semáforo de la lista (semaforoSocio).
function analisisSocio(s){
  const sesiones=comoArray(s.logs&&s.logs.sesiones).slice().sort((a,b)=>String(a.fecha||'').localeCompare(String(b.fecha||'')));
  if(!sesiones.length) return {sesiones:[], diasSin:null, volUlt:0, volAnt:null, subiendo:[], estancados:[]};

  const ultFecha=sesiones[sesiones.length-1].fecha;
  const diasSin=diasDesde(ultFecha);

  function semanaDe(f){ const d=new Date(f+'T00:00:00'); const dow=(d.getDay()+6)%7; d.setDate(d.getDate()-dow); return fechaISO(d); }
  const volPorSemana={};
  sesiones.forEach(x=>{ const sem=semanaDe(x.fecha); volPorSemana[sem]=(volPorSemana[sem]||0)+(x.volumen||0); });
  const semanasOrd=Object.keys(volPorSemana).sort();
  const volUlt=volPorSemana[semanasOrd[semanasOrd.length-1]]||0;
  const volAnt=semanasOrd.length>1?volPorSemana[semanasOrd[semanasOrd.length-2]]:null;

  const porEj={};
  sesiones.forEach(x=>{ (x.detalle||[]).forEach(d=>{ if(d.kg){ (porEj[d.n]=porEj[d.n]||[]).push(d.kg); } }); });
  const subiendo=[], estancados=[];
  Object.entries(porEj).forEach(([nm,arr])=>{
    if(arr.length<2) return;
    const last=arr[arr.length-1], prev=arr[arr.length-2];
    if(last>prev) subiendo.push(nm);
    else if(arr.length>=3 && arr.slice(-3).every(k=>k===last)) estancados.push(nm);
  });

  return {sesiones, diasSin, volUlt, volAnt, subiendo, estancados};
}
// Semáforo para la lista de socios: 'r' foco urgente, 'y' atención, 'g' va bien, null sin evaluar (pendiente de aprobar).
function semaforoSocio(s){
  if(s.status==='pendiente') return null;
  const a=analisisSocio(s);
  if(a.diasSin===null || a.diasSin>7) return 'r';
  const ev=calcEvolucion(s);
  if(a.diasSin>=3 || ev.estaSemana<s.dias || a.estancados.length>=2) return 'y';
  return 'g';
}
function bloqueAnalisisStaff(s){
  const a=analisisSocio(s);
  if(!a.sesiones.length) return `<div class="sd-sec">Análisis de entrenamiento</div><div class="sd-body"><p class="pg-p">Aún no hay sesiones registradas — en cuanto entrene, aquí verás su racha, volumen y si está subiendo peso.</p></div>`;
  const {diasSin,volUlt,volAnt,subiendo,estancados}=a;
  const flechaVol= volAnt==null?'':(volUlt>volAnt*1.05?' ↑':volUlt<volAnt*0.95?' ↓':' →');

  const chip=(nm,warn)=>`<span class="stf-chip${warn?' warn':''}" style="margin:3px 6px 0 0">${esc(nm)}</span>`;

  return `<div class="sd-sec">Análisis de entrenamiento <small>a partir de sus sesiones registradas, día a día</small></div>
    <div class="sd-body">
      <div class="sd-kpis" style="grid-template-columns:repeat(3,1fr)">
        <div class="kpi" style="--kc:${diasSin>7?'var(--r)':'var(--v)'}"><div class="kpi-v">${diasSin===null?'—':diasSin}</div><div class="kpi-l">${diasSin===1?'día sin entrenar':'días sin entrenar'}</div></div>
        <div class="kpi" style="--kc:var(--n)"><div class="kpi-v">${Math.round(volUlt).toLocaleString()}${flechaVol}</div><div class="kpi-l">kg de volumen, esta semana</div></div>
        <div class="kpi" style="--kc:var(--g)"><div class="kpi-v">${subiendo.length}</div><div class="kpi-l">ejercicios subiendo carga</div></div>
      </div>
      ${estancados.length?`<p class="pg-p" style="margin-top:12px"><b>⚠ Sin subir peso en sus últimas 3 sesiones:</b></p><div>${estancados.map(nm=>chip(nm,true)).join('')}</div>`:''}
      ${subiendo.length?`<p class="pg-p" style="margin-top:12px"><b>↑ Progresando en carga:</b></p><div>${subiendo.map(nm=>chip(nm)).join('')}</div>`:''}
      ${(!estancados.length&&!subiendo.length)?'<p class="pg-p" style="margin-top:12px">Aún no hay suficientes sesiones con peso registrado por ejercicio para ver tendencia.</p>':''}
    </div>`;
}
function bloqueProgresionStaff(s,sinHist){
  if(s.status==='pendiente') return '';
  const b=pqBloque(s), sem=pqSemanaActual(s), est=pqEstado(s), st=pqStatsBloque(s), P=s.progresion||{}, c=esc(s.code);
  const semTxt=sem>b.semanas?`bloque terminado (semana ${sem})`:`semana ${sem} de ${b.semanas}`;
  let cuerpo='', hot=false;
  if(!est || est==='aprobado'){
    hot=sem>=b.semanas;
    cuerpo=`${est==='aprobado'&&P.bloque===b.n?`<div class="pg-ok">✓ Bloque ${b.n} activo desde ${esc(fmtFecha(b.desde))}${P.por?' · aprobado por '+esc(P.por):''}</div>`:''}
      <p class="pg-p">${hot?'<b>Toca progresar.</b> ':''}Envía la evaluación; cuando el socio la conteste te propongo su siguiente bloque con cargas más altas.</p>
      <div class="pg-acts"><button type="button" class="sd-b p" onclick="pqEnviar('${c}')">📋 Enviar evaluación</button><button type="button" class="sd-b" onclick="pqGenerar('${c}')">Generar sin evaluación</button></div>`;
  } else if(est==='enviado'){
    cuerpo=`<div class="pg-wait">⏳ Evaluación enviada el ${esc(fmtFecha(P.fechaEnvio||fechaISO(new Date())))}. Esperando sus respuestas.</div>
      <div class="pg-acts"><button type="button" class="sd-b" onclick="pqGenerar('${c}')">Generar sin esperar</button><button type="button" class="sd-b" onclick="pqCancelar('${c}')">Cancelar envío</button></div>`;
  } else if(est==='respondido'){
    hot=true;
    cuerpo=`<div class="pg-k">Respuestas del socio · ${esc(fmtFecha(P.fechaResp||fechaISO(new Date())))}</div>${pqRespuestasHTML(P.respuestas)}
      <button type="button" class="sd-pri" style="width:100%;margin-top:12px" onclick="pqGenerar('${c}')">✨ Generar propuesta de progresión</button>`;
  } else if(est==='propuesta' && P.propuesta){
    hot=true;
    cuerpo=`${P.respuestas?`<details class="pg-h"><summary><b>Respuestas del socio</b><span>${esc(fmtFecha(P.fechaResp||''))}</span></summary>${pqRespuestasHTML(P.respuestas)}</details>`:''}${pqPropuestaHTML(s,P.propuesta)}`;
  }
  return `<div class="sd-sec" id="pg-sec">Progresión <small>Bloque ${b.n} · ${semTxt} · ${st.sesiones} sesiones (${st.adherencia}%)</small></div>
    <div class="sd-body"><div class="pg-card${hot?' hot':''}">${cuerpo}</div>${sinHist?'':pqHistorialHTML(s)}</div>`;
}
function pqBadgeLista(s){
  const e=pqEstado(s);
  if(e==='respondido') return ' · 📋 Evaluación contestada';
  if(e==='propuesta') return ' · ✨ Propuesta por aprobar';
  if(e==='enviado') return ' · ⏳ Evaluación enviada';
  if(pqTocaProgresar(s)) return ' · 📈 Toca progresar';
  return '';
}

// ── Vista del socio ──
function pqCardSocio(s){
  if(!s || s.status!=='activo') return '';
  const e=pqEstado(s), P=s.progresion||{};
  if(e==='enviado') return `<div class="pg-home"><div class="pg-home-k">📋 Evaluación de progreso</div>
      <div class="pg-home-t">Terminaste tu bloque ${esc(pqBloque(s).n)}</div>
      <div class="pg-home-m">Contesta ${PQ_PREG.length} preguntas rápidas y tu entrenador prepara tu siguiente nivel.</div>
      <button type="button" class="btn-go" onclick="pqAbrir()">Responder · 2 min</button></div>`;
  if(e==='respondido'||e==='propuesta') return `<div class="pg-home soft"><div class="pg-home-m">✓ Evaluación enviada. Tu entrenador está preparando tu nuevo bloque.</div></div>`;
  if(e==='aprobado' && !P.visto) return `<div class="pg-home"><div class="pg-home-k">🚀 Nuevo bloque</div>
      <div class="pg-home-t">Bloque ${esc(pqBloque(s).n)} activo</div>
      <div class="pg-home-m">${esc(P.nCambios||0)} ajustes en tu rutina para seguir avanzando.</div>
      <button type="button" class="btn-go" onclick="pqVerProgreso(true)">Ver qué cambió</button></div>`;
  return '';
}
function pqPlanChip(s){
  if(!s || s.status!=='activo') return '';
  const b=pqBloque(s), sem=Math.min(pqSemanaActual(s),b.semanas);
  return `<button type="button" class="pg-plan" onclick="pqVerProgreso()"><div><b>Bloque ${esc(b.n)}</b><span>Semana ${sem} de ${b.semanas}</span></div><em>Mi progresión ${ico('chev')}</em></button>`;
}
function pqVerProgreso(marcarVisto){
  const s=activeSocio; if(!s) return;
  const b=pqBloque(s), h=comoArray(s.historialRutinas).filter(Boolean), prev=h[h.length-1];
  let comp='';
  if(prev){
    const ant={}; DIAS_ORDER.forEach(k=>comoArray(prev.rutina&&prev.rutina[k]&&prev.rutina[k].ejercicios).forEach(e=>{ if(e&&e.nm) ant[e.nm]=e; }));
    comp=DIAS_ORDER.map(k=>{ const d=s.rutina[k]; const ej=comoArray(d&&d.ejercicios); if(!ej.length) return '';
      return `<div class="pg-dia">${esc(sc(DIAS_NAMES[k]).substring(0,3))} · ${esc(sc(d.tipo||''))}</div>`+ej.map(e=>{
        const a=ant[e.nm]; const ka=a&&pqParseKg(a.peso), kn=pqParseKg(e.peso);
        let tag='';
        if(!a) tag='<i class="pg-tag new">Nuevo</i>';
        else if(ka&&kn&&kn>ka) tag=`<i class="pg-tag up">+${Math.round((kn-ka)*10)/10} kg</i>`;
        else if(a && (String(a.reps)!==String(e.reps)||String(a.series)!==String(e.series))) tag='<i class="pg-tag">Ajustado</i>';
        return `<div class="pg-mini"><span>${esc(e.nm)}${a&&pqEjTxt(a)!==pqEjTxt(e)?`<small>Antes: ${esc(pqEjTxt(a))}</small>`:''}</span><b>${esc(pqEjTxt(e))}${tag}</b></div>`;
      }).join('');
    }).join('');
  }
  const linea=h.map(x=>`<div class="pg-tl"><b>Bloque ${esc(x.n)}</b><span>${esc(fmtFecha(x.desde))} – ${esc(fmtFecha(x.hasta))} · ${esc(x.sesiones)} sesiones</span></div>`).join('')+
    `<div class="pg-tl on"><b>Bloque ${esc(b.n)} · actual</b><span>Desde ${esc(fmtFecha(b.desde))} · semana ${Math.min(pqSemanaActual(s),b.semanas)} de ${b.semanas}</span></div>`;
  document.getElementById('pg-body').innerHTML=`
    <div class="pg-m-t">Tu progresión</div>
    <div class="pg-tls">${linea}</div>
    ${prev?`<div class="pg-k" style="margin-top:16px">Qué cambió respecto al bloque ${esc(prev.n)}</div>${comp}`
      :`<div class="pg-p">Este es tu primer bloque. Al terminarlo, tu entrenador te enviará una evaluación y aquí verás cómo suben tus cargas.</div>`}
    <button type="button" class="btn-go" style="width:100%;justify-content:center;margin-top:18px" onclick="pqCerrar()">Listo</button>`;
  document.getElementById('modal-pg').classList.add('open');
  if(marcarVisto && s.progresion && s.progresion.estado==='aprobado' && !s.progresion.visto){ s.progresion.visto=true; dbSave(s.code); refreshDash(); }
}
function pqCerrar(){ document.getElementById('modal-pg').classList.remove('open'); }

// ── Cuestionario del socio ──
let pqResp={}, pqPaso=0, pqNombres=[];
function pqAbrir(){
  const s=activeSocio; if(!s) return;
  pqResp={}; pqPaso=0;
  pqNombres=[...new Set(DIAS_ORDER.flatMap(k=>comoArray(s.rutina&&s.rutina[k]&&s.rutina[k].ejercicios).map(e=>e&&e.nm).filter(Boolean)))];
  pqRender();
  document.getElementById('modal-pg').classList.add('open');
}
function pqRespondida(q){
  const v=pqResp[q.id];
  if(q.opcional) return true;
  if(q.multi) return comoArray(v).length>0;
  if(q.id==='enfoque' && v==='zona') return !!pqResp.zona;
  return !!v;
}
function pqRender(){
  const q=PQ_PREG[pqPaso], tot=PQ_PREG.length, v=pqResp[q.id];
  let cuerpo='';
  if(q.ejercicios){
    const sel=comoArray(v);
    cuerpo=pqNombres.length?`<div class="chk-grid pg-chk">${pqNombres.map((n,i)=>`<div class="chk${sel.includes(n)?' ck':''}" onclick="pqToggleEj(${i})"><span class="chk-tick">✓</span>${esc(n)}</div>`).join('')}</div>`:'<div class="pg-p">Tu rutina no tiene ejercicios registrados.</div>';
  } else if(q.texto){
    cuerpo=`<textarea id="pq-txt" class="pg-txt" rows="4" maxlength="400" placeholder="Ej. me cuesta la sentadilla, cambié de horario…" oninput="pqResp.comentario=this.value">${esc(v||'')}</textarea>`;
  } else if(q.multi){
    const sel=comoArray(v);
    cuerpo=`<div class="chk-grid pg-chk">${q.o.map(o=>`<div class="chk${sel.includes(o[0])?' ck':''}${o[0]==='ninguna'?' chk-none':''}" onclick="pqToggleMulti('${o[0]}')"><span class="chk-tick">✓</span>${esc(o[1])}</div>`).join('')}</div>`;
  } else {
    cuerpo=`<div class="pg-opts">${q.o.map(o=>`<div class="opt pg-opt${v===o[0]?' sel':''}" onclick="pqSel('${q.id}','${o[0]}')"><div class="ol">${esc(o[1])}</div>${o[2]?`<div class="os">${esc(o[2])}</div>`:''}</div>`).join('')}</div>`;
    if(q.id==='enfoque' && v==='zona') cuerpo+=`<div class="pg-k" style="margin-top:14px">¿Qué zona?</div><div class="chk-grid pg-chk">${Object.entries(PQ_ZONAS).map(([id,z])=>`<div class="chk${pqResp.zona===id?' ck':''}" onclick="pqResp.zona='${id}';pqRender()"><span class="chk-tick">✓</span>${esc(z.nm)}</div>`).join('')}</div>`;
  }
  const ult=pqPaso===tot-1;
  document.getElementById('pg-body').innerHTML=`
    <div class="pg-q-top"><span>Pregunta ${pqPaso+1} de ${tot}</span><button type="button" class="pg-x" onclick="pqCerrar()" aria-label="Cerrar">✕</button></div>
    <div class="pg-bar"><div style="width:${Math.round((pqPaso+1)/tot*100)}%"></div></div>
    <div class="pg-q-t">${esc(q.t)}</div>${q.s?`<div class="pg-q-s">${esc(q.s)}</div>`:''}
    ${cuerpo}
    <div class="pg-q-nav">
      ${pqPaso>0?`<button type="button" class="btn-go soft" onclick="pqPaso--;pqRender()">Atrás</button>`:'<span></span>'}
      <button type="button" class="btn-go" id="pq-next" ${pqRespondida(q)?'':'disabled style="opacity:.45"'} onclick="${ult?'pqFinalizar()':'pqPaso++;pqRender()'}">${ult?'Enviar':(q.opcional&&!(comoArray(v).length||v)?'Omitir':'Siguiente')}</button>
    </div>`;
  const mb=document.querySelector('#modal-pg .mbox'); if(mb) mb.scrollTop=0;
}
function pqSel(id,val){
  pqResp[id]=val; if(id==='enfoque' && val!=='zona') delete pqResp.zona;
  pqRender();
  if(!(id==='enfoque' && val==='zona') && pqPaso<PQ_PREG.length-1) setTimeout(()=>{ if(PQ_PREG[pqPaso].id===id){ pqPaso++; pqRender(); } },260);
}
function pqToggleMulti(val){
  let sel=comoArray(pqResp.molestia);
  if(val==='ninguna') sel=sel.includes('ninguna')?[]:['ninguna'];
  else { sel=sel.filter(x=>x!=='ninguna'); sel=sel.includes(val)?sel.filter(x=>x!==val):sel.concat(val); }
  pqResp.molestia=sel; pqRender();
}
function pqToggleEj(i){
  const n=pqNombres[i]; let sel=comoArray(pqResp.quitar);
  sel=sel.includes(n)?sel.filter(x=>x!==n):sel.concat(n);
  pqResp.quitar=sel; pqRender();
}
function pqFinalizar(){
  const s=activeSocio; if(!s) return;
  const r=Object.assign({},pqResp); if(r.comentario) r.comentario=limpiarTexto(r.comentario).slice(0,400); else delete r.comentario;
  if(!comoArray(r.quitar).length) delete r.quitar;
  s.progresion=Object.assign({}, s.progresion||{}, {estado:'respondido', respuestas:r, fechaResp:fechaISO(new Date()), bloque:pqBloque(s).n});
  dbSave(s.code);
  pqCerrar(); refreshDash();
  showToast('✓ ¡Gracias! Tu entrenador ya tiene tus respuestas');
}
