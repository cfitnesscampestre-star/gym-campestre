/* ═══ ÍNDICE LIGERO DE SOCIOS (escalabilidad del panel del staff) ═══
   Antes el panel descargaba el expediente COMPLETO de todos los socios (rutina + historial):
   con 2,000 socios eran cientos de MB por apertura. Ahora:
   - /indice/<code> guarda ~500 bytes por socio con lo que pide la lista (nombre, estado,
     mensualidad, entrenador, fechas de las últimas sesiones, progresión).
   - La lista del panel usa ese índice. El expediente completo (/socios/<code>) se descarga
     solo al abrir a ese socio, y queda escuchando sus cambios mientras esté abierto.
   - El Resumen y el Respaldo del director cargan todos los expedientes bajo demanda.
   - Quien escribe un socio (el socio al registrar su sesión, o el staff) actualiza su índice
     después de que Firebase confirma el guardado.
   - Si el índice aún no existe (primera vez), el director lo construye una sola vez. ═══ */

const LS_IDX='fitkiosk_indice_v1';
let IDX=(()=>{ try{ return JSON.parse(localStorage.getItem(LS_IDX))||{}; }catch(e){ return {}; } })();
let IDX_LITE={};                  // fichas ligeras ya armadas (se rehacen cuando cambia el índice)
let idxFallo=false;               // sin permiso para /indice (reglas sin publicar): el panel vuelve al modo anterior
let idxEscuchando=false, idxConstruyendo=false, idxTodosCargados=false, idxAvisoReglas=false;
const idxCargando=new Map();      // code -> promesa de carga del expediente completo
const idxEscuchas=[];             // códigos con escucha activa (máx. IDX_MAX_ESCUCHAS)
const IDX_MAX_ESCUCHAS=8;

function idxGuardarLocal(){ try{ localStorage.setItem(LS_IDX, JSON.stringify(IDX)); }catch(e){} }
function idxCompleto(s){ return !!(s && !s._lite); }

/* ── Resumen de un socio para el índice ── */
function idxDeSocio(s){
  if(!s) return null;
  const ses=comoArray(s.logs&&s.logs.sesiones).filter(x=>x&&x.fecha).slice().sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha))||((a.ts||0)-(b.ts||0)));
  const m=s.membresia||{};
  let est=0; try{ est=analisisSocio(asegurarLogs(JSON.parse(JSON.stringify(s)))).estancados.length; }catch(e){}
  const o={
    n:s.nombre||'', i:s.id||'', o:s.objetivo||'', st:s.status||'',
    e:s.entrenadorId||'', nu:s.nutriologoId||'', as:s.asignado===undefined?null:s.asignado,
    d:s.dias||null, fr:s.fechaRegistro||null, b:s.bloque||null,
    pe:(s.progresion&&s.progresion.estado)||'',
    f:ses.slice(-8).map(x=>({f:x.fecha, t:x.ts||null})),
    p1:ses.length?ses[0].fecha:null,
    x:est, u:Date.now()
  };
  if(m.vence||m.ancla||m.suspendido) o.m={v:m.vence||null, a:m.ancla||null, su:m.suspendido||null};
  return limpio(o);
}
/* ── Ficha ligera para la lista (misma forma que un socio, sin rutina ni historial pesado) ── */
function idxLite(code){
  if(IDX_LITE[code]) return IDX_LITE[code];
  const x=IDX[code]; if(!x) return null;
  const ses=comoArray(x.f).map(r=>({fecha:r.f, ts:r.t||0}));
  if(x.p1 && !ses.some(r=>r.fecha===x.p1)) ses.unshift({fecha:x.p1, ts:0});
  const lite={code, nombre:x.n, id:x.i, objetivo:x.o, status:x.st, entrenadorId:x.e||'', nutriologoId:x.nu||'',
    asignado:x.as, dias:x.d, fechaRegistro:x.fr, bloque:x.b||undefined,
    progresion:x.pe?{estado:x.pe}:undefined,
    membresia:x.m?{vence:x.m.v||undefined, ancla:x.m.a||undefined, suspendido:x.m.su||undefined}:undefined,
    logs:{sesiones:ses, asistencia:[], pesoCorporal:[], medidas:[], lesiones:[], prs:{}},
    limitaciones:[], zonas:[], _lite:true, _est:x.x||0};
  IDX_LITE[code]=lite;
  return lite;
}
/* Todos los socios que ve el staff: expediente completo si ya se cargó, ficha ligera si no */
function sociosParaStaff(){
  const out={};
  Object.keys(IDX).forEach(c=>{ const l=idxLite(c); if(l) out[c]=l; });
  Object.keys(DB.socios||{}).forEach(c=>{ if(DB.socios[c]) out[c]=DB.socios[c]; });
  return Object.values(out).filter(Boolean);
}

/* ── Escribir el índice después de que Firebase confirma un guardado ── */
function idxEscribir(code, s){
  if(!fbListo || !fbDB || !code) return Promise.resolve();
  const v=s?idxDeSocio(s):null;
  return fbDB.ref('/indice/'+code).set(v).then(()=>{
    if(fbEsStaff){ if(v) IDX[code]=v; else delete IDX[code]; delete IDX_LITE[code]; idxGuardarLocal(); }
  }).catch(e=>{
    if(!idxAvisoReglas && String(e&&(e.code||e.message)||'').toLowerCase().includes('permission')){
      idxAvisoReglas=true; console.warn('Índice de socios: Firebase no dio permiso. Publica las reglas nuevas (firebase-rules.json).');
    }
  });
}
// Llamada desde enviar() (01-datos-firebase.js) cuando un cambio a /socios/... quedó guardado
function idxTrasEscritura(en, snapVal){
  try{
    const m=String(en.path||'').match(/^\/socios\/([^\/]+)/); if(!m) return;
    const code=en.code||m[1];
    if(en.op==='remove' && en.path==='/socios/'+code){ idxEscribir(code,null); return; }
    if(snapVal){ idxEscribir(code, asegurarLogs(snapVal)); return; }
    const s=DB.socios&&DB.socios[code];
    if(idxCompleto(s)){ idxEscribir(code, s); return; }
    // Cambio parcial (p. ej. estado de la mensualidad) sobre un socio no abierto: se lee y se reindexa
    fbDB.ref('/socios/'+code).once('value').then(sn=>{ const v=sn.val(); if(v) idxEscribir(code, asegurarLogs(v)); }).catch(()=>{});
  }catch(e){ console.warn('idxTrasEscritura',e); }
}

/* ── Staff: escucha el índice en lugar de todos los expedientes ── */
function idxEscucharStaff(){
  if(idxFallo){ return; }
  if(idxEscuchando || !fbListo || !fbEsStaff) return;
  idxEscuchando=true;
  fbDB.ref('/indice').on('value', snap=>{
    const raw=snap.val();
    if(!raw){ idxConstruir(); return; }
    IDX=raw; IDX_LITE={}; idxGuardarLocal();
    const n=Object.keys(raw).length;
    if(DB.config && DB.config.totalSocios!==n){ DB.config.totalSocios=n; fbDB.ref('/config/totalSocios').set(n).catch(()=>{}); }
    if(document.getElementById('s-panel')?.classList.contains('on')) staffRenderList();
  }, e=>{
    idxEscuchando=false; console.warn('indice',e);
    if(String(e&&(e.code||e.message)||'').toLowerCase().includes('permission')){
      idxFallo=true; console.warn('Índice de socios sin permiso: publica las reglas nuevas (firebase-rules.json). Se usa la carga completa.');
      fbEscucharStaff();
    }
  });
}
function idxDetener(){
  try{ if(idxEscuchando) fbDB.ref('/indice').off('value'); }catch(e){}
  idxEscuchando=false;
  idxEscuchas.splice(0).forEach(c=>{ try{ fbDB.ref('/socios/'+c).off('value'); }catch(e){} });
  idxCargando.clear(); idxTodosCargados=false;
}
/* Primera vez: no hay índice. El director lo construye leyendo todos los expedientes una sola vez. */
function idxConstruir(){
  if(idxConstruyendo || staffRol!=='coordinador') return;
  idxConstruyendo=true;
  showToast('Preparando la lista rápida de socios (solo esta vez)…');
  fbDB.ref('/socios').once('value').then(sn=>{
    const todos=sn.val()||{}, upd={};
    Object.keys(todos).forEach(c=>{ const v=idxDeSocio(asegurarLogs(todos[c])); if(v) upd[c]=v; });
    if(!Object.keys(upd).length){ idxConstruyendo=false; return; }
    return fbDB.ref('/indice').update(upd).then(()=>{ idxConstruyendo=false; showToast('Lista rápida lista: '+Object.keys(upd).length+' socios'); });
  }).catch(e=>{ idxConstruyendo=false; console.warn('idxConstruir',e); showToast('No se pudo preparar la lista rápida. Revisa las reglas de Firebase.'); });
}

/* ── Expediente completo de UN socio (al abrirlo) ── */
function idxAplicarSocio(code, raw){
  if(!raw){
    if(tienePendiente(code)) return;
    delete BASE[code]; baseGuardar();
    delete DB.socios[code]; guardarLocal(); return;
  }
  if(!tienePendiente(code)) BASE[code]=baseDeSocio(raw);
  baseGuardar();
  const d={}; d[code]=asegurarLogs(raw);
  let s=aplicarPendientes('/socios', d)[code] || d[code];
  const local=DB.socios[code];
  if(staffDirty.has(code) && idxCompleto(local)){ s.rutina=local.rutina; s.status=local.status; s.asignado=local.asignado; }
  DB.socios[code]=asegurarLogs(s);
  guardarLocal();
}
function idxCargarSocio(code){
  if(!fbListo || !fbDB) return Promise.resolve(getSocio(code));
  if(idxEscuchas.includes(code) && idxCompleto(DB.socios[code])) return Promise.resolve(DB.socios[code]);
  if(idxCargando.has(code)) return idxCargando.get(code);
  const p=new Promise(res=>{
    let primera=true;
    fbDB.ref('/socios/'+code).on('value', sn=>{
      idxAplicarSocio(code, sn.val());
      if(primera){ primera=false; idxCargando.delete(code); res(DB.socios[code]||null); return; }
      if(staffActivoId===code && document.getElementById('s-panel')?.classList.contains('on')){
        const s=getSocio(code); if(s && typeof staffRenderContent==='function' && !staffDirty.has(code)) staffRenderContent(s);
      }
    }, e=>{ console.warn('socio',code,e); idxCargando.delete(code); res(getSocio(code)); });
    idxEscuchas.push(code);
    while(idxEscuchas.length>IDX_MAX_ESCUCHAS){
      const viejo=idxEscuchas.shift();
      if(viejo!==staffActivoId){ try{ fbDB.ref('/socios/'+viejo).off('value'); }catch(e){} if(!tienePendiente(viejo)&&!staffDirty.has(viejo)){ delete DB.socios[viejo]; idxTodosCargados=false; } }
      else idxEscuchas.push(viejo);
    }
  });
  idxCargando.set(code,p);
  return p;
}
/* Resumen / Respaldo del director: necesitan todos los expedientes (se piden bajo demanda) */
function idxCargarTodos(){
  if(idxTodosCargados || !fbListo || !fbDB) return Promise.resolve();
  showToast('Cargando todos los expedientes…');
  return fbDB.ref('/socios').once('value').then(sn=>{
    const todos=sn.val()||{};
    Object.keys(todos).forEach(c=>{ if(!idxCompleto(DB.socios[c]) || !tienePendiente(c)) idxAplicarSocio(c, todos[c]); });
    idxTodosCargados=true;
  }).catch(e=>{ console.warn('idxCargarTodos',e); showToast('No se pudieron cargar todos los expedientes'); });
}
