/* ═══ datos firebase ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// CAPA DE DATOS — Firebase Realtime Database
// + localStorage como caché offline
// ═════════════════════════════════════════
const LS_KEY    = 'fitkiosk_pro_v1';
const LS_FB_CFG = 'fitkiosk_fb_cfg';
const DIAS_ORDER = ['lun','mar','mie','jue','vie','sab','dom'];
const DIAS_NAMES = {lun:'LUNES',mar:'MARTES',mie:'MIÉRCOLES',jue:'JUEVES',vie:'VIERNES',sab:'SÁBADO',dom:'DOMINGO'};

// ── Cruza los días de entrenamiento elegidos con los días de clase grupal ──
// Devuelve 3 grupos de días:
//   puro       → gimnasio completo (sigue el split normal)
//   conClase   → ese día también hay clase Y el socio quiere entrenar aparte → sesión LIGERA/complementaria (no sobrecargar)
//   soloClase  → ese día hay clase y el socio NO quiere entrenar aparte → sin gimnasio, ya tiene su estímulo en la clase
function derivarDiasEntrenamiento(){
  const base=(qAnswers.diasSemana&&qAnswers.diasSemana.length)?qAnswers.diasSemana:DIAS_ORDER.slice(0,qAnswers.dias||4);
  const infoClasePorDia={};
  (qAnswers.clasesGrupales||[]).forEach(c=>{
    (c.dias||[]).forEach(d=>{ infoClasePorDia[d]={clase:c.clase, entrenaMismoDia:!!c.entrenaMismoDia}; });
  });
  const puro=[], conClase=[], soloClase=[];
  DIAS_ORDER.filter(d=>base.includes(d)).forEach(d=>{
    const info=infoClasePorDia[d];
    if(!info) puro.push(d);
    else if(info.entrenaMismoDia) conClase.push(d);
    else soloClase.push(d);
  });
  return {puro,conClase,soloClase,infoClasePorDia};
}
let HOY_KEY   = ['dom','lun','mar','mie','jue','vie','sab'][new Date().getDay()];
function actualizarHoy(){ HOY_KEY=['dom','lun','mar','mie','jue','vie','sab'][new Date().getDay()]; }
document.addEventListener('visibilitychange',()=>{ if(!document.hidden){ const antes=HOY_KEY; actualizarHoy(); if(antes!==HOY_KEY && activeSocio && document.getElementById('s-dash').classList.contains('on')) refreshDash(); } });

// ── Estado Firebase ──
let fbApp  = null;
let fbDB   = null;
let fbListo = false;

// ── Caché en memoria (siempre disponible, siempre sync) ──
let DB = { socios: {}, entrenadores: {}, config: {}, version: 1 };

function guardarFbConfig(cfg){ try{ localStorage.setItem(LS_FB_CFG,JSON.stringify(cfg)); }catch(e){} }
function leerFbConfig(){ try{ return JSON.parse(localStorage.getItem(LS_FB_CFG)); }catch(e){ return null; } }

let fbIntentos = 0;
function initFirebase(cfg){
  if(typeof firebase==='undefined'){
    if(fbIntentos < 6){
      fbIntentos++;
      setTimeout(()=>{ if(!fbListo && initFirebase(cfg)){ fbArrancar(); actualizarFbBadge(); }}, 800);
    } else {
      console.warn('Firebase SDK no disponible — trabajando con datos locales');
    }
    return false;
  }
  try{
    if(!firebase.apps.length) firebase.initializeApp(cfg);
    fbApp=firebase.app(); fbDB=firebase.database(); fbListo=true;
    try{ fbAuth=firebase.auth(); }catch(e){ console.warn('Auth no disponible',e); }
    return true;
  }catch(e){ console.warn('Firebase init error',e); return false; }
}

// ═════════════════════════════════════════
// AUTENTICACIÓN (v8.2) — staff con correo/contraseña de Firebase, socios con sesión anónima
// El rol del staff vive en /roles/<uid> ("coordinador" o "entrenador"). Los socios solo leen su propio registro.
// ═════════════════════════════════════════
const STAFF_DOM='@staff.fitnesspro.app';
let fbAuth=null, fbUid=null, fbRolDB=null, fbEsStaff=false, fbRolListo=false, fbArrancando=false;
let fbWaiters=[], fbPrimerEstado=null, fbPrimerResolver=null;
fbPrimerEstado=new Promise(r=>{ fbPrimerResolver=r; });
function fbConUsuario(ms){
  const esp=new Promise(res=>{ if(fbAuth&&fbAuth.currentUser&&fbRolListo) res(true); else fbWaiters.push(res); });
  return Promise.race([esp,new Promise(r=>setTimeout(()=>r(false),ms||6000))]);
}
async function fbCargarRol(user){
  fbRolListo=false; fbRolDB=null; fbEsStaff=false;
  if(user && !user.isAnonymous){
    try{ const r=await fbDB.ref('/roles/'+user.uid).once('value'); fbRolDB=r.val()||null; fbEsStaff=!!fbRolDB; }catch(e){ console.warn('Sin rol',e); }
  }
  fbRolListo=true;
  return fbRolDB;
}
function fbArrancar(){
  if(!fbListo || !fbAuth || fbArrancando) return;
  fbArrancando=true;
  fbAuth.onAuthStateChanged(async u=>{
    if(!u){
      fbUid=null; fbRolDB=null; fbEsStaff=false; fbRolListo=false;
      fbDetenerStaff();
      if(fbPrimerResolver){ fbPrimerResolver({user:null,rol:null}); fbPrimerResolver=null; }
      try{ await fbAuth.signInAnonymously(); }catch(e){ console.warn('Sesión anónima no disponible',e); }
      return;
    }
    fbUid=u.uid;
    await fbCargarRol(u);
    if(!fbEsStaff) fbDetenerStaff();
    fbEscuchar();                       // /config y /entrenadores (una sola vez)
    if(fbEsStaff) fbEscucharStaff();    // todos los socios, solo para el staff
    const w=fbWaiters; fbWaiters=[]; w.forEach(f=>f(true));
    if(fbPrimerResolver){ fbPrimerResolver({user:u,rol:fbRolDB}); fbPrimerResolver=null; }
    actualizarFbBadge();
  });
}

function fbEscuchar(){
  if(!fbListo || fbEscuchando) return;
  fbEscuchando=true;
  fbDB.ref('.info/connected').on('value', snap=>{
    fbConectado=!!snap.val();
    if(fbConectado){ fbYaConecto=true; vaciarBandeja(); }
    actualizarPillSync();
  });
  fbDB.ref('/config').on('value', snap=>{ DB.config=aplicarPendientes('/config', snap.val()||{}); kbAplicarExtra(); guardarLocal(); if(document.getElementById('s-panel')?.classList.contains('on') && document.querySelector('#staff-content')) { /* sin refrescar la ficha abierta */ } actualizarContadorSocios(); }, ()=>{});

  fbDB.ref('/entrenadores').on('value', snap=>{
    const raw=snap.val();
    const data=aplicarPendientes('/entrenadores', raw||{});
    if(Object.keys(data).length){
      DB.entrenadores=data;
      guardarLocal();
    } else if(!raw) {
      seedEntrenadores(); // solo local: nunca escribe contraseñas en Firebase
    }
    if(document.getElementById('s-quiz')?.classList.contains('on')) renderTrainerPicker();
  }, ()=>{});
  vaciarBandeja();   // subir lo que quedó pendiente de antes (aunque se haya cerrado la app)
}

// ── Staff: escucha TODA la lista de socios ──
let fbStaffEscuchando=false;
function fbEscucharStaff(){
  if(fbStaffEscuchando || !fbListo || !fbEsStaff) return;
  fbStaffEscuchando=true;
  fbDB.ref('/socios').on('value', snap=>{
    const raw=snap.val();
    // Huella de lo confirmado por Firebase (solo socios sin cambios pendientes en este dispositivo)
    const srv=raw||{};
    Object.keys(srv).forEach(c=>{ if(!tienePendiente(c)) BASE[c]=baseDeSocio(srv[c]); });
    Object.keys(BASE).forEach(c=>{ if(!srv[c] && !tienePendiente(c)) delete BASE[c]; });
    baseGuardar();
    const data=aplicarPendientes('/socios', raw?srv:{});
    if(Object.keys(data).length){
      aplicarSnapshotSocios(data);
      guardarLocal();
      if(document.getElementById('s-panel')?.classList.contains('on')) staffRenderList();
      OUTBOX.forEach(en=>{ if(en.tipo==='socio' && !enVuelo.has(en.id)) enviar(en); });  // reintentar pendientes en espera
    } else {
      // Base vacía: ya NO se siembran socios demo en producción
      DB.socios={};
      if(document.getElementById('s-panel')?.classList.contains('on')) staffRenderList();
    }
    // Contador público (lo leen los socios sin descargar la lista)
    const n=Object.keys(srv).length;
    if(fbEsStaff && DB.config && DB.config.totalSocios!==n){ DB.config.totalSocios=n; fbDB.ref('/config/totalSocios').set(n).catch(()=>{}); }
  }, ()=>{ fbStaffEscuchando=false; const l=lsLoad(); if(l) DB=l; });
}
function fbDetenerStaff(){
  if(!fbStaffEscuchando) return;
  try{ fbDB.ref('/socios').off('value'); }catch(e){}
  fbStaffEscuchando=false;
}

// ── Socio: escucha SOLO su propio registro ──
let fbSocioCode=null;
function fbEscucharSocio(code){
  if(!fbListo || !code) return;
  if(fbSocioCode && fbSocioCode!==code){ try{ fbDB.ref('/socios/'+fbSocioCode).off('value'); }catch(e){} fbSocioCode=null; }
  if(fbSocioCode===code) return;
  fbConUsuario().then(ok=>{
    if(!ok || fbEsStaff || fbSocioCode===code) return;
    fbSocioCode=code;
    fbDB.ref('/socios/'+code).on('value', snap=>{
      const raw=snap.val();
      if(!raw){
        if(tienePendiente(code)) return;
        delete BASE[code]; baseGuardar();
        if(DB.socios[code]){
          delete DB.socios[code]; guardarLocal();
          if(activeSocio && activeSocio.code===code){ logoutSocio(); showToast('Tu acceso fue dado de baja. Habla con recepción.'); }
        }
        return;
      }
      if(!tienePendiente(code)) BASE[code]=baseDeSocio(raw);
      baseGuardar();
      const data={}; data[code]=asegurarLogs(raw);
      aplicarSnapshotSocios(aplicarPendientes('/socios', data));
      guardarLocal();
      OUTBOX.forEach(en=>{ if(en.tipo==='socio' && !enVuelo.has(en.id)) enviar(en); });
    }, ()=>{ fbSocioCode=null; });
  });
}
function fbDetenerSocio(){
  if(fbSocioCode){ try{ fbDB.ref('/socios/'+fbSocioCode).off('value'); }catch(e){} fbSocioCode=null; }
}
function actualizarContadorSocios(){
  const el=document.getElementById('inicio-socios'); if(!el) return;
  const t=DB.config&&DB.config.totalSocios;
  el.textContent = 100 + (typeof t==='number' ? t : Object.keys(DB.socios||{}).length);
}

// ── Sincronización segura ──
// Firebase entrega objetos NUEVOS en cada snapshot. Antes, activeSocio seguía apuntando
// al objeto viejo y el siguiente guardado escribía la copia fresca SIN el cambio
// (se perdían pesos, medidas, sesiones). Aquí se re-apunta y se protegen ediciones del staff.
let staffDirty = new Set(); // socios con cambios del staff aún sin guardar
function aplicarSnapshotSocios(data){
  const teniaActivo = activeSocio && DB.socios && DB.socios[activeSocio.code];
  Object.values(data).forEach(asegurarLogs);
  staffDirty.forEach(c=>{
    const local=DB.socios[c];
    if(local && data[c]){ data[c].rutina=local.rutina; data[c].status=local.status; data[c].asignado=local.asignado; }
  });
  DB.socios=data;
  if(activeSocio){
    const n=data[activeSocio.code];
    if(n){ n._asistHoy=activeSocio._asistHoy; n._yaRegistrado=activeSocio._yaRegistrado; activeSocio=n; }
    else if(teniaActivo){ logoutSocio(); showToast('Tu acceso fue dado de baja. Habla con recepción.'); }
  }
}

// ── Utilidades de datos (v4) ──
// Guarda TODO en el dispositivo (antes se perdía la configuración al guardar un socio)
function guardarLocal(){
  try{ localStorage.setItem(LS_KEY,JSON.stringify({socios:DB.socios,entrenadores:DB.entrenadores,config:DB.config||{},version:1})); }catch(e){}
}
// Firebase NO guarda arrays ni objetos vacíos: un socio nuevo vuelve sin "sesiones", "prs", etc.
// Esta función los restaura para que registrar una sesión nunca falle por un campo faltante.
function comoArray(v){ return Array.isArray(v) ? v : (v && typeof v==='object' ? Object.values(v) : []); }
function asegurarLogs(s){
  if(!s) return s;
  if(!s.logs || typeof s.logs!=='object') s.logs={};
  const L=s.logs;
  ['sesiones','pesoCorporal','asistencia','medidas','lesiones'].forEach(k=>{ L[k]=comoArray(L[k]); });
  if(!L.prs || typeof L.prs!=='object' || Array.isArray(L.prs)) L.prs={};
  s.limitaciones=comoArray(s.limitaciones);
  s.zonas=comoArray(s.zonas);
  return s;
}
// Firebase prohíbe . # $ / [ ] en las llaves: un récord de "Caminata / Elíptica" hacía fallar TODO el guardado
function prKey(nm){ return String(nm||'').replace(/[.#$\/\[\]]/g,'-').trim() || 'ejercicio'; }

function sinTemporales(k,v){ return (typeof k==='string' && k.charAt(0)==='_') ? undefined : v; }
function limpio(o){ return o==null ? o : JSON.parse(JSON.stringify(o,sinTemporales)); }

function fbErrorMsg(e){
  const code = (e && (e.code||e.message||'')).toString().toLowerCase();
  if(code.includes('permission_denied') || code.includes('permission-denied')){
    return '🔒 Firebase rechazó el guardado (reglas de seguridad) — revisa Reglas en Firebase Console. Cambio guardado localmente.';
  }
  return '⚠ Sin conexión — cambio guardado localmente';
}

// ═════════════════════════════════════════
// MODO SIN CONEXIÓN — bandeja de cambios pendientes
// Cada cambio se guarda primero en el dispositivo y en una "bandeja" que
// sobrevive aunque se cierre la app. Al volver internet se sube solo.
// Las sesiones/pesos/medidas se FUSIONAN con lo que ya hay en Firebase
// (transacción), así no se pisan datos registrados desde otro dispositivo.
// ═════════════════════════════════════════
const LS_OUT='fitkiosk_outbox_v1', LS_BASE='fitkiosk_base_v1';
const FB_SDK=['https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js','https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js'];
let OUTBOX=(()=>{ try{ const o=JSON.parse(localStorage.getItem(LS_OUT)); return Array.isArray(o)?o:[]; }catch(e){ return []; } })();
let BASE=(()=>{ try{ return JSON.parse(localStorage.getItem(LS_BASE))||{}; }catch(e){ return {}; } })(); // huella de lo último CONFIRMADO por Firebase, por socio y campo
const enVuelo=new Set(), OUT_CB={};
let outSeq=Date.now(), fbConectado=false, fbYaConecto=false, fbEscuchando=false;
function outGuardar(){ try{ localStorage.setItem(LS_OUT,JSON.stringify(OUTBOX)); }catch(e){} actualizarPillSync(); }
function baseGuardar(){ try{ localStorage.setItem(LS_BASE,JSON.stringify(BASE)); }catch(e){} }
function quitarEntrada(id){ const n=OUTBOX.length; OUTBOX=OUTBOX.filter(x=>x.id!==id); if(OUTBOX.length!==n) outGuardar(); }
function tienePendiente(code){ const p='/socios/'+code; return OUTBOX.some(x=>x.path===p||x.path.indexOf(p+'/')===0); }

// Representación canónica (llaves ordenadas, sin vacíos ni temporales) — igual a como lo guarda Firebase
function canon(v){
  if(v===null||v===undefined) return 'n';
  if(Array.isArray(v)){ return v.length ? '['+v.map(canon).join(',')+']' : 'n'; }
  if(typeof v==='object'){
    const out=[]; Object.keys(v).sort().forEach(k=>{ if(k.charAt(0)==='_') return; const c=canon(v[k]); if(c!=='n') out.push(JSON.stringify(k)+':'+c); });
    return out.length ? '{'+out.join(',')+'}' : 'n';
  }
  if(typeof v==='number' && !isFinite(v)) return 'n';
  return JSON.stringify(v);
}
function huella(v){ const t=canon(v); let h=5381; for(let i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return (h>>>0).toString(36)+'.'+t.length; }
function camposSocio(a,b){ const k=new Set([...Object.keys(a||{}),...Object.keys(b||{})]); return [...k].filter(x=>x!=='logs'&&x.charAt(0)!=='_'); }
function baseDeSocio(s){ const o={}; camposSocio(s,null).forEach(k=>{ o[k]=huella(s[k]); }); return o; }

// Historial: se unen los registros de ambos lados (nada se pierde)
const LOG_LLAVES={
  sesiones:x=>x.ts?('t'+x.ts):(x.fecha+'|'+(x.hora||'')+'|'+(x.diaKey||'')),
  asistencia:x=>x.fecha, pesoCorporal:x=>x.fecha, medidas:x=>x.fecha,
  lesiones:x=>(x.protoId||'')+'|'+(x.fechaInicio||'')
};
function unirLogs(L,S){
  L=L||{}; S=S||{};
  const out=Object.assign({},S,L);
  Object.keys(LOG_LLAVES).forEach(k=>{
    const la=comoArray(L[k]), sa=comoArray(S[k]), key=LOG_LLAVES[k], vistos=new Set(la.filter(Boolean).map(key));
    const extra=sa.filter(x=>x && !vistos.has(key(x)));
    let r=la.concat(extra);
    if(extra.length){
      if(k==='asistencia') r=r.sort((a,b)=>String(b.fecha||'').localeCompare(String(a.fecha||''))).slice(0,90);
      else if(k==='sesiones') r=r.sort((a,b)=>String(a.fecha||'').localeCompare(String(b.fecha||''))||((a.ts||0)-(b.ts||0)));
      else if(k==='pesoCorporal'||k==='medidas') r=r.sort((a,b)=>String(a.fecha||'').localeCompare(String(b.fecha||'')));
    }
    out[k]=r;
  });
  const pl=(L.prs&&typeof L.prs==='object')?L.prs:{}, ps=(S.prs&&typeof S.prs==='object')?S.prs:{}, prs=Object.assign({},ps);
  Object.keys(pl).forEach(k=>{ if(!ps[k] || (+pl[k].kg||0)>=(+ps[k].kg||0)) prs[k]=pl[k]; });
  out.prs=prs;
  return out;
}
// Fusión de 3 vías por campo: si solo cambió en Firebase (p. ej. el coordinador editó la rutina) gana Firebase;
// si cambió en este dispositivo, gana el dispositivo. El historial siempre se une.
function fusionarSocio(code,local,server){
  const b=BASE[code]||{}, r={};
  camposSocio(local,server).forEach(k=>{
    const hs=huella(server[k]), hl=huella(local[k]); let v;
    if(b[k]!==undefined && hs!==b[k] && hl===b[k]) v=server[k];
    else if(local[k]===undefined && b[k]===undefined) v=server[k];
    else v=local[k];
    if(v!==undefined) r[k]=v;
  });
  r.logs=unirLogs(local.logs, server.logs);
  return asegurarLogs(r);
}
// Aplica un cambio pendiente sobre un árbol de datos (para que lo que llega de Firebase no borre lo pendiente)
function ponerEn(obj,partes,val){
  let o=obj;
  for(let i=0;i<partes.length-1;i++){ if(!o[partes[i]]||typeof o[partes[i]]!=='object') o[partes[i]]={}; o=o[partes[i]]; }
  const ult=partes[partes.length-1];
  if(val===null||val===undefined) delete o[ult]; else o[ult]=JSON.parse(JSON.stringify(val));
}
function aplicarPendientes(raiz,data){
  data=data||{};
  OUTBOX.slice().forEach(en=>{
    if(en.path!==raiz && en.path.indexOf(raiz+'/')!==0) return;
    const rel=en.path.slice(raiz.length+1), partes=rel?rel.split('/'):[];
    if(en.tipo==='socio'){
      const local=DB.socios&&DB.socios[en.code];
      if(!local) return;
      if(data[en.code]) data[en.code]=fusionarSocio(en.code,local,asegurarLogs(data[en.code]));
      else if(BASE[en.code]) quitarEntrada(en.id);   // lo eliminaron desde otro dispositivo: no revivirlo
      else data[en.code]=local;                       // socio nuevo creado sin conexión
      return;
    }
    if(!partes.length) return;
    if(en.op==='set') ponerEn(data,partes,en.data);
    else if(en.op==='remove') ponerEn(data,partes,null);
    else if(en.op==='update' && en.data) Object.keys(en.data).forEach(k=>ponerEn(data,partes.concat(k.split('/')),en.data[k]));
  });
  return data;
}

function enviar(en){
  if(!fbListo || !fbDB) return;
  const id=en.id, gen=en.gen;
  let p;
  try{
    const ref=fbDB.ref(en.path);
    if(en.tipo==='socio'){
      const code=en.code;
      if(!DB.socios[code]){ quitarEntrada(id); return; }
      p=ref.transaction(cur=>{
        const local=DB.socios[code];
        if(!local) return;                                   // eliminado localmente → cancelar
        if(!cur){
          if(BASE[code]) return;                             // existía en Firebase y ya no: se espera a confirmar (no revivir socios dados de baja)
          return limpio(asegurarLogs(local));                // socio nuevo creado sin conexión
        }
        return limpio(fusionarSocio(code,local,asegurarLogs(cur)));
      }).then(res=>{
        if(res && res.committed && res.snapshot && res.snapshot.val()){ BASE[code]=baseDeSocio(res.snapshot.val()); baseGuardar(); return true; }
        return !!(res && res.committed);
      });
    }
    else if(en.op==='set') p=ref.set(en.data);
    else if(en.op==='update') p=ref.update(en.data);
    else if(en.op==='remove') p=ref.remove();
    else { quitarEntrada(id); return; }
  }catch(e){
    console.warn('Firebase no aceptó los datos:',e); quitarEntrada(id);
    showToast('⚠ No se pudo sincronizar: '+(e.message||e)); return;
  }
  enVuelo.add(id);
  p.then(ok=>{
    enVuelo.delete(id);
    if(ok===false){ actualizarPillSync(); return; }   // transacción en espera: se reintenta al llegar datos de Firebase
    const cur=OUTBOX.find(x=>x.id===id);
    if(cur && cur.gen===gen) quitarEntrada(id);
    const cb=OUT_CB[id]; if(cb && cur && cur.gen===gen){ delete OUT_CB[id]; if(cb.ok) cb.ok(); }
    actualizarPillSync();
  }).catch(e=>{
    enVuelo.delete(id);
    console.warn('Firebase write error',en.path,e);
    const txt=String(e&&(e.code||e.message)||'').toLowerCase();
    if(txt.includes('permission')) quitarEntrada(id);   // reglas de Firebase: reintentar no sirve
    const cb=OUT_CB[id]; delete OUT_CB[id];
    if(cb && cb.err) cb.err(e); else showToast(fbErrorMsg(e));
    actualizarPillSync();
  });
}
// Cambio genérico (staff, conocimiento, entrenadores…)
function fbEncolar(path,op,data,cb){
  if(op==='set') OUTBOX=OUTBOX.filter(x=>!(x.tipo!=='socio' && x.path===path && x.op==='set'));
  const en={id:'o'+(++outSeq), path, op, data:(data===undefined?null:limpio(data)), gen:1, ts:Date.now()};
  OUTBOX.push(en); outGuardar();
  if(cb) OUT_CB[en.id]=cb;
  enviar(en);
  return en;
}
// Datos de un socio (sesiones, pesos, medidas, rutina…) — se fusionan al subir
function fbEncolarSocio(code){
  let en=OUTBOX.find(x=>x.tipo==='socio' && x.code===code);
  if(en){ en.gen=(en.gen||1)+1; en.ts=Date.now(); }
  else { en={id:'o'+(++outSeq), tipo:'socio', code, path:'/socios/'+code, gen:1, ts:Date.now()}; OUTBOX.push(en); }
  outGuardar();
  enviar(en);
}
function vaciarBandeja(){
  if(!fbListo) return;
  OUTBOX.slice().forEach(en=>{ if(!enVuelo.has(en.id)) enviar(en); });
  actualizarPillSync();
}
function estaSinConexion(){ return !navigator.onLine || (fbListo && fbYaConecto && !fbConectado); }

// Indicador superior: "Sin conexión · 3 cambios por subir" / "Sincronizando…" / "Todo sincronizado"
let pillTimer=null, pillHabiaPend=false;
function actualizarPillSync(){
  const el=document.getElementById('sync-pill'); if(!el) return;
  const n=OUTBOX.length, cambios=n+' '+(n===1?'cambio':'cambios');
  let txt='', cls='';
  if(estaSinConexion()){ cls='off'; txt='Sin conexión · '+(n?cambios+' por subir':'modo local'); }
  else if(n && fbListo){ txt='Sincronizando '+cambios+'…'; }
  else if(!n && pillHabiaPend){ cls='ok'; txt='✓ Todo sincronizado'; }
  pillHabiaPend = n>0;
  if(!txt){ if(!el.classList.contains('ok')) el.classList.remove('on'); return; }
  clearTimeout(pillTimer);
  el.className='sync-pill on '+cls;
  el.innerHTML='<span class="dot"></span><span></span>'; el.lastChild.textContent=txt;
  if(cls==='ok') pillTimer=setTimeout(()=>{ el.classList.remove('on'); setTimeout(()=>el.classList.remove('ok'),350); },2500);
}
function cargarScript(src){ return new Promise((res,rej)=>{ const sc=document.createElement('script'); sc.src=src; sc.crossOrigin='anonymous'; sc.onload=res; sc.onerror=rej; document.head.appendChild(sc); }); }
window.addEventListener('offline', actualizarPillSync);
window.addEventListener('online', ()=>{
  actualizarPillSync();
  if(fbListo) return;
  // La app abrió sin internet y sin SDK de Firebase: cargarlo ahora y subir lo pendiente
  const cfg=leerFbConfig(); if(!cfg) return;
  const carga = (typeof firebase==='undefined') ? cargarScript(FB_SDK[0]).then(()=>cargarScript(FB_SDK[1])).then(()=>cargarScript(FB_SDK[2])) : Promise.resolve();
  carga.then(()=>{ fbIntentos=0; if(initFirebase(cfg)){ fbArrancar(); if(typeof actualizarFbBadge==='function') actualizarFbBadge(); } }).catch(()=>{});
});

function dbSave(socioCode){
  guardarLocal();
  if(!socioCode){ console.warn('dbSave sin código bloqueado: no se reescribe toda la base'); return; }
  if(!DB.socios[socioCode]) return; // el socio fue eliminado: no lo volvemos a crear
  fbEncolarSocio(socioCode);
}
// Guardado del staff: solo los campos que edita el staff (no pisa sesiones/pesos que el socio registró mientras tanto)
function dbSaveStaff(code){
  guardarLocal();
  staffDirty.delete(code);
  const s=DB.socios[code]; if(!s) return;
  fbEncolar('/socios/'+code,'update',{rutina:s.rutina,status:s.status,asignado:s.asignado,entrenadorId:s.entrenadorId||''});
}

function dbSaveEntrenador(entId){
  guardarLocal();
  if(!entId){ console.warn('dbSaveEntrenador sin id bloqueado'); return; }
  if(!DB.entrenadores[entId]) return;
  const d=Object.assign({},DB.entrenadores[entId]); delete d.pass;   // v8.2: nunca se guardan contraseñas en la base
  fbEncolar('/entrenadores/'+entId,'set',d);
}

function getEntrenador(id){ return DB.entrenadores[id]||null; }
function listaEntrenadoresConFilosofia(){
  return Object.values(DB.entrenadores||{}).filter(e=>e && e.filosofia && e.filosofia.tagline);
}
// Todos los entrenadores elegibles (rol entrenador), tengan o no filosofía definida.
// Los que ya definieron su filosofía van primero.
function listaEntrenadoresParaElegir(){
  return Object.values(DB.entrenadores||{}).filter(e=>e && e.rol!=='coordinador' && entHace(e,'entrenamiento'))
    .sort((a,b)=>{
      const fa=a.filosofia&&a.filosofia.tagline?1:0, fb=b.filosofia&&b.filosofia.tagline?1:0;
      return fb-fa || (a.nombre||'').localeCompare(b.nombre||'');
    });
}

function getSocio(code){ return DB.socios[code]||null; }
