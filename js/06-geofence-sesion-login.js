/* ═══ geofence sesion login ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// GEOFENCE — Club Campestre Aguascalientes
// ═════════════════════════════════════════
const GEO_CENTER = { lat: 21.8818, lng: -102.2871 }; // ← ajusta al GPS real del club
const GEO_RADIO_M = 200;
let geoStatus = 'unknown';
let geoCoords = null;

// Ya no restringe nada — la app funciona en cualquier lugar. Solo usa el GPS (si el
// socio lo permite) para clasificar el check-in en el Resumen y para armar "Lugares
// visitados" en el menú del coordinador, sin mostrarle nada de esto al socio.
function initGeofence(){
  if(!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    pos => {
      geoCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const dist = haversine(geoCoords.lat, geoCoords.lng, GEO_CENTER.lat, GEO_CENTER.lng);
      geoStatus = dist <= GEO_RADIO_M ? 'gym' : 'outside';
    },
    () => { geoStatus='unknown'; },
    { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
  );
}
// Agrupa el check-in en una celda de ~55m (para juntar el ruido normal del GPS) y lleva
// la cuenta de cuántas veces y en qué días se ha abierto la app desde ahí.
function registrarLugarVisitado(coords){
  if(!coords || typeof coords.lat!=='number' || typeof coords.lng!=='number') return;
  const lat=Math.round(coords.lat*2000)/2000, lng=Math.round(coords.lng*2000)/2000;
  const arr=comoArray(DB.config&&DB.config.lugares).slice();
  const hoy=fechaISO(new Date());
  const i=arr.findIndex(x=>x&&x.lat===lat&&x.lng===lng);
  if(i>=0){
    const l=arr[i]; l.visitas=(l.visitas||1)+1; l.ultima=hoy;
    l.dias=comoArray(l.dias); if(!l.dias.includes(hoy)){ l.dias.push(hoy); if(l.dias.length>60) l.dias=l.dias.slice(-60); }
  } else arr.push({lat,lng,visitas:1,primera:hoy,ultima:hoy,dias:[hoy]});
  arr.sort((a,b)=>(b.visitas||0)-(a.visitas||0));
  DB.config=DB.config||{}; DB.config.lugares=arr.slice(0,80);
  guardarLocal();
  fbEncolar('/config/lugares','set',DB.config.lugares);
}
function setGeoBanner(type, msg){
  const b=document.getElementById('geo-banner'), t=document.getElementById('geo-txt');
  if(!b||!t) return;
  b.className='geo-banner geo-'+type; t.textContent=msg;
}
function haversine(lat1,lng1,lat2,lng2){
  const R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function registrarAsistencia(s){
  const now = new Date();
  asegurarLogs(s);
  if(!s.logs) s.logs = {sesiones:[],pesoCorporal:[],prs:{},asistencia:[],medidas:[],lesiones:[]};
  if(!s.logs.asistencia) s.logs.asistencia = [];
  const registro = {
    fecha: fechaISO(now), hora: now.toTimeString().substring(0,5),
    ts: now.getTime(), ubicacion: geoStatus,
    lat: geoCoords?.lat||null, lng: geoCoords?.lng||null,
  };
  const yaRegistrado = s.logs.asistencia.some(r=>r.fecha===registro.fecha);
  if(!yaRegistrado){
    s.logs.asistencia.unshift(registro);
    if(s.logs.asistencia.length>90) s.logs.asistencia = s.logs.asistencia.slice(0,90);
    dbSave(s.code);
    registrarLugarVisitado(geoCoords);
  }
  return { registro, yaRegistrado };
}

window.addEventListener('load', ()=>{
  { const c=document.getElementById('staff-content'); if(c) STAFF_CONTENT_VACIO=c.innerHTML; }
  // ── Cargar caché local de inmediato (offline-first) ──
  const localInicial = lsLoad();
  if(localInicial && localInicial.socios && Object.keys(localInicial.socios).length){ DB = localInicial; }
  else { DB = seedDB(); }
  if(!DB.entrenadores || !Object.keys(DB.entrenadores).length){ DB.entrenadores = seedEntrenadores(); }
  DB.config = DB.config || {};
  // v8.2: este dispositivo ya no guarda la lista completa de socios salvo que sea del staff
  { const ses0=leerSesion();
    if(!ses0 || ses0.tipo!=='staff'){
      const guardar=new Set(OUTBOX.filter(x=>x.tipo==='socio').map(x=>x.code));
      if(ses0 && ses0.tipo==='socio') guardar.add(ses0.code);
      const dejar={}; Object.keys(DB.socios||{}).forEach(c=>{ if(guardar.has(c)) dejar[c]=DB.socios[c]; });
      DB.socios=dejar;
      Object.keys(BASE).forEach(c=>{ if(!guardar.has(c)) delete BASE[c]; }); baseGuardar();
    }
    Object.values(DB.entrenadores||{}).forEach(e=>{ if(e && e.uid && e.pass!==undefined) delete e.pass; });
    guardarLocal();
  }
  Object.values(DB.socios||{}).forEach(asegurarLogs);
  kbAplicarExtra();

  // ── Config real del proyecto gym-campestre ──
  const FIREBASE_CONFIG = {
  "apiKey": "AIzaSyADuYE2LQ_XxmjoapBAmtQ0U3IDgVjABZA",
  "authDomain": "gym-campestre.firebaseapp.com",
  "databaseURL": "https://gym-campestre-default-rtdb.firebaseio.com",
  "projectId": "gym-campestre",
  "storageBucket": "gym-campestre.firebasestorage.app",
  "messagingSenderId": "355837299373",
  "appId": "1:355837299373:web:8f117a8a4d850ab9081424",
  "measurementId": "G-Z0PPSRKV1L"
};
  const cfg = leerFbConfig() || FIREBASE_CONFIG;
  guardarFbConfig(cfg); // Guardar para siguientes cargas
  const ok = initFirebase(cfg);
  if(!ok){
    // Sin Firebase: ya tenemos la caché local cargada arriba
  } else {
    fbArrancar();
  }
  initGeofence();
  restaurarSesion();
  actualizarPillSync();
  // Footer del inicio
  { const whp=document.getElementById('wc-hero-pic'); if(whp) whp.innerHTML=pic(['hero/bienvenida','hero/inicio'],'bolt','fill'); }
  const n = new Date();
  const sem = Math.ceil((((n - new Date(n.getFullYear(),0,1)) / 86400000) + new Date(n.getFullYear(),0,1).getDay()+1)/7);
  document.getElementById('inicio-fecha').textContent = 'Semana '+sem+' · '+n.getFullYear();
  actualizarContadorSocios();
});

// ═════════════════════════════════════════
// SESIÓN PERSISTENTE (sobrevive refresh/PWA)
// ═════════════════════════════════════════
const LS_SES='fitkiosk_sesion_v1';
function guardarSesion(o){ try{localStorage.setItem(LS_SES,JSON.stringify(o));}catch(e){} }
function borrarSesion(){ try{localStorage.removeItem(LS_SES);}catch(e){} }
function leerSesion(){ try{return JSON.parse(localStorage.getItem(LS_SES));}catch(e){return null;} }

function restaurarSesion(){
  const ses=leerSesion(); if(!ses) return;
  if(ses.tipo==='socio'){
    const socio=getSocio(ses.code);
    if(!socio){ borrarSesion(); return; }
    if(membBloqueoSocio(socio)){ borrarSesion(); return; }
    activeSocio=socio;
    fbEscucharSocio(ses.code);
    // Recuperar el check-in de hoy si ya existe; si no, registrarlo
    const hoy=fechaISO(new Date());
    const existente=(socio.logs?.asistencia||[]).find(r=>r.fecha===hoy);
    if(existente){ socio._asistHoy=existente; socio._yaRegistrado=true; }
    else { const {registro}=registrarAsistencia(socio); socio._asistHoy=registro; }
    refreshDash();
    dashTab('inicio');
    go('s-dash');
  } else if(ses.tipo==='staff'){
    restaurarStaff(ses);
  }
}
async function restaurarStaff(ses){
  if(!fbListo || !fbAuth){ return; }     // sin Firebase no se puede verificar al staff: se queda en el inicio
  const est=await Promise.race([fbPrimerEstado,new Promise(r=>setTimeout(()=>r(null),6000))]);
  if(!est || !est.user || est.user.isAnonymous || !est.rol){ borrarSesion(); return; }
  entrarComoStaff(ses.user, est.rol);
}
function entrarComoStaff(usuario, rolDB){
  const esCoord = rolDB==='coordinador';
  const entObj = DB.entrenadores && DB.entrenadores[usuario];
  staffRol = esCoord ? 'coordinador' : ((entObj&&entObj.rol&&entObj.rol!=='coordinador')?entObj.rol:'entrenador');
  staffActivoEntId = esCoord ? null : (entObj?usuario:null);
  const badge=document.getElementById('staff-role-badge');
  badge.style.display='inline-block';
  badge.textContent=sc((entObj&&!esCoord?entTipoLabel(entObj):(esCoord?'director':staffRol)).toUpperCase());
  document.getElementById('staff-nombre').textContent=(entObj&&entObj.nombre)||(esCoord?'Director':usuario);
  staffActivoId=null;
  staffLimpiarPanel();
  staffRenderList();
  go('s-panel'); staffVista('lista');
  actualizarFbBadge();
  actualizarBotonMiFilosofia();
  if(esCoord){
    // Borra de Firebase las contraseñas antiguas en texto (ya no sirven: el acceso es por Firebase Authentication)
    Object.keys(DB.entrenadores||{}).forEach(id=>{
      const e=DB.entrenadores[id];
      if(e && e.pass!==undefined){ delete e.pass; try{ fbDB.ref('/entrenadores/'+id+'/pass').remove().catch(()=>{}); }catch(x){} }
    });
    guardarLocal();
    avisarEntrenadoresSinAcceso();
  }
}
function avisarEntrenadoresSinAcceso(){
  const n=Object.values(DB.entrenadores||{}).filter(e=>e && e.rol!=='coordinador' && !e.uid).length;
  if(n) setTimeout(()=>showToast('🔐 '+n+' entrenador(es) aún sin acceso seguro: abre Entrenadores → Editar y crea su contraseña (mín. 6)'),1200);
}

// ═════════════════════════════════════════
// NAVEGACIÓN
// ═════════════════════════════════════════
let activeSocio = null;
let activeRutinaKey = HOY_KEY;

function go(id){
  document.querySelectorAll('.sc').forEach(s=>s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  window.scrollTo(0,0);
  updateTb(id);
}
function updateTb(id){
  const tba=document.getElementById('tb-actions');
  const g=document.getElementById('global-tb');
  if(g) g.style.display=(['s-panel','s-quiz','s-det','s-preview','s-dash'].includes(id))?'none':'';
  if(id==='s-dash'){
    tba.innerHTML = `<div class="tb-btn" onclick="logoutSocio()"><svg class="ico" aria-hidden="true"><use href="#i-logout"/></svg>Salir</div>`;
  } else if(id==='s-inicio'||id==='s-login'){
    tba.innerHTML = `<div class="live-tag"><span class="dot-pulse"></span>Kiosco activo</div>`;
    if(id==='s-inicio') actualizarContadorSocios();
  } else { tba.innerHTML=''; }
}
function logoutSocio(){ av3dDestruir(); fbDetenerSocio(); activeSocio=null; borrarSesion(); ['cd1','cd2','cd3','cd4'].forEach(i=>document.getElementById(i).value=''); go('s-inicio'); }

// ═════════════════════════════════════════
// LOGIN SOCIO
// ═════════════════════════════════════════
const cds = document.querySelectorAll('.cd');
cds.forEach((d,i)=>{
  d.addEventListener('input',()=>{ if(d.value && i<cds.length-1) cds[i+1].focus(); });
  d.addEventListener('keydown',e=>{ if(e.key==='Backspace'&&!d.value&&i>0) cds[i-1].focus(); });
});

async function doLogin(){
  const code = ['cd1','cd2','cd3','cd4'].map(id=>document.getElementById(id).value).join('');
  const errEl=document.getElementById('login-err');
  let socio = getSocio(code);
  if(/^\d{4}$/.test(code) && fbListo && fbAuth && navigator.onLine){
    try{
      if(await fbConUsuario()){
        const snap=await fbDB.ref('/socios/'+code).once('value');
        const v=snap.val();
        if(v){
          asegurarLogs(v);
          const previo=DB.socios[code];
          DB.socios[code]=(previo && tienePendiente(code)) ? fusionarSocio(code,previo,v) : v;
          if(!tienePendiente(code)){ BASE[code]=baseDeSocio(v); baseGuardar(); }
          guardarLocal();
          socio=DB.socios[code];
        } else {
          if(DB.socios[code] && !tienePendiente(code)){ delete DB.socios[code]; guardarLocal(); }
          socio=tienePendiente(code)?DB.socios[code]:null;
        }
      }
    }catch(e){ console.warn('Consulta de socio sin conexión',e); }
  }
  if(!socio){ errEl.textContent='No encontramos ese código. Revisa tus 4 dígitos.'; errEl.classList.remove('inact'); errEl.style.display='block'; return; }
  if(membBloqueoSocio(socio)){ errEl.textContent=MEMB_MSG_INACTIVO; errEl.classList.add('inact'); errEl.style.display='block'; return; }
  errEl.style.display='none';
  activeSocio = socio;
  guardarSesion({tipo:'socio', code});
  fbEscucharSocio(code);
  const { registro, yaRegistrado } = registrarAsistencia(socio);
  socio._asistHoy = registro;
  socio._yaRegistrado = yaRegistrado;
  refreshDash();
  dashTab('inicio');
  go('s-dash');
}
