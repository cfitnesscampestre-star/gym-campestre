/* ═══ panel staff ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// PANEL STAFF — conectado a la misma DB
// ═════════════════════════════════════════
const STAFF_USERS={};   // v8.2: el acceso del staff vive en Firebase Authentication (ya no hay contraseñas en el código)
let staffRol='entrenador', staffActivoId=null, staffFilterVal='todos', staffSearchVal='';
let staffActivoEntId=null; // id del entrenador logueado (para su propia filosofía)

function staffSelRol(el,rol){
  document.querySelectorAll('#staff-roles .opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel'); staffRol=rol;
  // ya no se autocompletan usuarios demo
}
async function doStaffLogin(){
  const u=document.getElementById('staff-user').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
  const pw=document.getElementById('staff-pass').value;
  const err=document.getElementById('staff-err');
  const fallo=(t)=>{ err.textContent=t||'Usuario o contraseña incorrectos.'; err.style.display='block'; };
  if(!u||!pw){ fallo(); return; }
  if(!fbListo||!fbAuth){ fallo('Necesitas conexión a internet para entrar al panel.'); return; }
  const btn=document.querySelector('#s-staff .btn-main, .btn-main[onclick="doStaffLogin()"]');
  if(btn) btn.disabled=true;
  try{
    const cred=await fbAuth.signInWithEmailAndPassword(u+STAFF_DOM, pw);
    const rol=await fbCargarRol(cred.user);
    if(!rol){ await fbAuth.signOut(); fallo('Esta cuenta no tiene permiso para el panel. Habla con el director.'); return; }
    err.style.display='none';
    guardarSesion({tipo:'staff', user:u});
    if(rol==='coordinador'){ fbEscuchar(); }
    fbEscucharStaff();
    entrarComoStaff(u, rol);
    document.getElementById('staff-pass').value='';
  }catch(e){
    const c=String(e&&e.code||'');
    if(c.includes('network')) fallo('Sin conexión con Firebase. Revisa tu internet.');
    else if(c.includes('too-many')) fallo('Demasiados intentos. Espera unos minutos e inténtalo de nuevo.');
    else fallo();
  }finally{ if(btn) btn.disabled=false; }
}

let STAFF_CONTENT_VACIO=null;
function staffLimpiarPanel(){
  const c=document.getElementById('staff-content'); if(!c) return;
  if(STAFF_CONTENT_VACIO===null) STAFF_CONTENT_VACIO=c.dataset.vacio||'';
  c.innerHTML=STAFF_CONTENT_VACIO;
  const l=document.getElementById('staff-list'); if(l) l.innerHTML='';
}
function staffLogout(){ staffLimpiarPanel(); borrarSesion(); staffActivoId=null; staffActivoEntId=null; staffRol='entrenador'; try{ if(fbAuth) fbAuth.signOut(); }catch(e){} fbDetenerStaff(); go('s-inicio'); }

function fbAbrirSetup(){
  const ta=document.getElementById('fb-config-input');
  if(ta && !ta.value.trim()){
    const cfg=leerFbConfig();
    if(cfg) ta.value=JSON.stringify(cfg,null,2);
  }
}
function fbAccesoPermitido(){ return staffRol==='coordinador'; }
function fbConectar(){
  if(!fbAccesoPermitido()){ showToast('Solo dirección puede configurar Firebase'); return; }
  const raw=document.getElementById('fb-config-input').value.trim();
  let cfg;
  try{ cfg=JSON.parse(raw); }catch(e){ cfg=null; }
  if(!cfg||!cfg.apiKey||!cfg.databaseURL){ document.getElementById('fb-err').style.display='block'; return; }
  document.getElementById('fb-err').style.display='none';
  if(!initFirebase(cfg)){ document.getElementById('fb-err').textContent='❌ No se pudo conectar. Revisa el databaseURL.'; document.getElementById('fb-err').style.display='block'; return; }
  guardarFbConfig(cfg);
  fbArrancar();
  actualizarFbBadge();
  showToast('🔥 Firebase conectado correctamente');
  go('s-inicio');
}
function fbDesconectar(){
  try{ localStorage.removeItem(LS_FB_CFG); }catch(e){}
  showToast('Firebase desconectado — recarga la app'); borrarSesion(); location.reload();
}
// ── Navegación del panel: en celular se ve la lista O la ficha (con botón para volver) ──
function staffVista(v){
  const p=document.getElementById('s-panel'); if(p) p.setAttribute('data-vista',v);
  window.scrollTo(0,0);
}
function staffVolverLista(){ staffVista('lista'); }
function actualizarFbBadge(){
  const b=document.getElementById('fb-status-badge'); if(!b) return;
  b.style.display='inline-flex';
  b.className='stf-chip '+(fbListo?'':'warn');
  b.textContent=fbListo?'Conectado a Firebase':'Modo local';
}
// ── Menú del staff (celular): agrupa las acciones que antes ocupaban toda la barra ──
function staffMenu(){
  const grupos=[
    ['Personas',['btn-mi-filosofia','btn-ver-ent','btn-nuevo-ent','btn-conocimiento']],
    ['Datos y sistema',['btn-resumen','btn-apariencia','btn-lugares','btn-respaldo','btn-firebase','btn-reset']],
    ['Cuenta',['btn-logout']]
  ];
  let html='';
  grupos.forEach(([t,ids])=>{
    const items=ids.map(id=>document.getElementById(id)).filter(b=>b && b.style.display!=='none');
    if(!items.length) return;
    html+=`<div class="sm-g">${t}</div>`+items.map(b=>{
      const raw=b.textContent.trim(); const m=raw.match(/^([^\p{L}\p{N}]+)\s*(.*)$/u);
      const ic=b.id==='btn-logout'?'🚪':(m?m[1].trim():'•'), lb=m?m[2]:raw;
      const cls=b.id==='btn-logout'?' danger':(b.id==='btn-reset'?' warn':'');
      return `<button type="button" class="sm-row${cls}" onclick="staffMenuIr('${b.id}')"><span class="sm-ic">${ic}</span><span>${esc(lb)}</span></button>`;
    }).join('');
  });
  document.getElementById('staff-menu-body').innerHTML=html;
  document.getElementById('modal-staff-menu').classList.add('open');
}
function staffMenuCerrar(){ document.getElementById('modal-staff-menu').classList.remove('open'); }
function staffMenuIr(id){ staffMenuCerrar(); const b=document.getElementById(id); if(b) setTimeout(()=>b.click(),60); }

function staffGetSocios(){
  const todos=Object.values(DB.socios||{}).filter(Boolean);
  if(staffRol==='coordinador' || !staffActivoEntId) return todos;
  // Cada entrenador o nutriólogo ve solo a quienes lo eligieron a él (entrenamiento) o se lo asignaron a él (nutrición).
  // Los socios sin asignar solo los ve el coordinador.
  return todos.filter(s=>s.entrenadorId===staffActivoEntId || s.nutriologoId===staffActivoEntId);
}
function membBadgeCls(e){ return e.estado==='pendiente'?'pend':e.estado==='tolerancia'?'tol':e.estado==='inactivo'?'off':'ok'; }
function membBadgeTxt(e){ return e.estado==='pendiente'?'Pendiente':e.estado==='tolerancia'?'Tolerancia · '+e.restan+' d':e.estado==='inactivo'?'Inactivo':'Activo'; }
function staffRenderList(){
  const cont=document.getElementById('staff-socio-list'); if(!cont) return;
  try{ membSincronizar(); }catch(err){ console.warn('membSincronizar',err); }
  const todos=staffGetSocios();
  const est=s=>membEstado(s).estado;
  const cnt={todos:todos.length,pendiente:todos.filter(s=>s.status==='pendiente').length,activo:todos.filter(s=>{const e=est(s);return e==='activo'||e==='tolerancia';}).length,
    tolerancia:todos.filter(s=>est(s)==='tolerancia').length,inactivo:todos.filter(s=>est(s)==='inactivo').length,progresion:todos.filter(pqNecesitaAccion).length};
  ['todos','pendiente','activo','tolerancia','inactivo','progresion'].forEach(k=>{ const e=document.getElementById('slc-'+k); if(e) e.textContent=cnt[k]; });
  const tt=document.getElementById('sl-count'); if(tt) tt.textContent='('+todos.length+')';
  const av=document.getElementById('staff-memb-aviso');
  if(av){
    const porV=todos.filter(s=>{const e=membEstado(s);return e.estado==='activo'&&e.porVencer;}).length;
    av.innerHTML=(cnt.tolerancia||cnt.inactivo||porV)?`<div class="mb-aviso" onclick="staffFiltroDirecto('${cnt.tolerancia?'tolerancia':cnt.inactivo?'inactivo':'activo'}')"><b>🔔 Mensualidades</b>${cnt.tolerancia?cnt.tolerancia+' en tolerancia (tienen '+MEMB_TOL+' días para pagar). ':''}${cnt.inactivo?cnt.inactivo+' inactivo'+(cnt.inactivo>1?'s':'')+'. ':''}${porV?porV+(porV===1?' renueva':' renuevan')+' en 3 días o menos.':''}</div>`:'';
  }
  let list=todos.slice();
  if(staffFilterVal==='progresion') list=list.filter(pqNecesitaAccion);
  else if(staffFilterVal==='activo') list=list.filter(s=>{const e=est(s);return e==='activo'||e==='tolerancia';});
  else if(staffFilterVal==='tolerancia'||staffFilterVal==='inactivo'||staffFilterVal==='pendiente') list=list.filter(s=>est(s)===staffFilterVal);
  const q=(staffSearchVal||'').trim().toLowerCase();
  if(q) list=list.filter(s=>String(s.nombre||'').toLowerCase().includes(q)||String(s.code||'').includes(q));
  const orden={pendiente:0,tolerancia:1,activo:2,inactivo:3};
  list.sort((a,b)=>((orden[est(a)]??2)-(orden[est(b)]??2))||String(a.nombre||'').localeCompare(String(b.nombre||''),'es'));
  cont.innerHTML = list.length ? list.map(s=>{
    const ini=tc(s.nombre).split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
    const me=membEstado(s);
    const sem=me.estado==='inactivo'?null:semaforoSocio(s);
    const semColor=sem==='r'?'var(--r)':sem==='y'?'var(--g)':sem==='g'?'var(--v)':'';
    const semStyle=sem?` style="border-color:${semColor};box-shadow:0 0 0 1px ${semColor},0 8px 18px -10px ${semColor}"`:(me.estado==='inactivo'?' style="opacity:.62"':'');
    return `<div class="sl-item${staffActivoId===s.code?' sel':''}"${semStyle} onclick="staffOpenSocio('${esc(s.code)}')" role="button" tabindex="0">
      <div class="sl-ini">${esc(ini)}</div>
      <div class="sl-tx"><div class="sl-nm">${esc(tc(s.nombre))}</div><div class="sl-sub">${esc(s.id)} · ${esc(sc(s.objetivo))}${esc(pqBadgeLista(s))}</div></div>
      <span class="sl-st ${membBadgeCls(me)}">${membBadgeTxt(me)}</span>
    </div>`;
  }).join('') : `<div class="empty-msg">${q?'Ningún socio coincide con tu búsqueda.':'Aún no hay socios en esta lista.'}</div>`;
}
function staffFiltroDirecto(val){
  const btn=[...document.querySelectorAll('#staff-filters .sl-f')].find(b=>(b.getAttribute('onclick')||'').includes("'"+val+"'"));
  if(btn) staffFilterStatus(btn,val);
}
function staffFilterStatus(el,val){
  document.querySelectorAll('#staff-filters .sl-f').forEach(d=>d.classList.remove('ac'));
  el.classList.add('ac'); staffFilterVal=val; staffRenderList();
}
function staffFilterSocios(v){ staffSearchVal=v; staffRenderList(); }
function staffOpenSocio(code){
  staffActivoId=code; staffRenderList();
  const s=getSocio(code);
  if(s && staffTabCode!==code){ staffTabCode=code; staffTab=(s.status==='pendiente')?'rutina':'evolucion'; staffProgSel='actual'; }
  if(!s){ showToast('⚠ No se encontró ese socio en la base de datos (code: '+code+')'); return; }
  try{
    staffRenderContent(s); staffVista('detalle');
  }catch(e){
    console.error('Error al abrir socio', code, e);
    showToast('⚠ Error al abrir el socio — revisa la consola (F12)');
  }
}

function staffRenderContent(s){
  const ca=document.getElementById('staff-content');
  const isPend=s.status==='pendiente';
  const ev=calcEvolucion(s);
  const pesoNow=pesoActual(s);
  const limitHTML=s.limitaciones?.length
    ? s.limitaciones.map(l=>`<span style="padding:2px 7px;border-radius:4px;font-size:var(--fs-xs);font-family:var(--fb);color:var(--r);border:1px solid color-mix(in srgb,var(--r) 30%,transparent);background:color-mix(in srgb,var(--r) 6%,transparent);margin-right:4px">${l}</span>`).join('')
    : '<span style="font-size:var(--fs-xs);color:var(--v);font-family:var(--fb)">✓ Sin limitaciones</span>';

  if(!s.rutina) s.rutina={};
  const ini=tc(s.nombre).split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const puedeEd=staffRol==='coordinador';
  const limChips=s.limitaciones?.length
    ? s.limitaciones.map(l=>`<span class="sd-lim-c">${esc(l)}</span>`).join('')
    : '<span class="sd-lim-ok">✓ Sin limitaciones</span>';
  const diasHTML = DIAS_ORDER.map(k=>{
    if(!s.rutina[k]) s.rutina[k]={tipo:'DESCANSO',color:'descanso',ejercicios:[]};
    const d=s.rutina[k];
    if(!Array.isArray(d.ejercicios)) d.ejercicios=[];
    const ab=staffDiasAbiertos.has(s.code+'|'+k);
    const ejRows=d.ejercicios.map((e,ei)=>staffEjEditorHTML(s,k,d,e,ei)).join('');
    return `
      <div class="dia-card${ab?' open':''}">
        <div class="dia-h" onclick="staffToggleDia('${s.code}','${k}',this)">
          <span class="dia-n">${DIAS_NAMES[k].substring(0,3)}</span>
          <input class="dia-t" value="${esc(d.tipo||'')}" placeholder="Tipo de sesión" onclick="event.stopPropagation()" onchange="staffUpdTipo('${s.code}','${k}',this.value)" aria-label="Tipo de sesión del ${DIAS_NAMES[k]}">
          <span class="dia-c">${d.ejercicios.length} ej.</span><span class="dia-chev" aria-hidden="true">›</span>
        </div>
        <div id="stb-${s.code}-${k}" class="dia-b" style="display:${ab?'block':'none'}">
          <div class="dia-swap">
            <label>Intercambiar todo este día con
              <select class="sf-in" id="swap-${s.code}-${k}">
                <option value="">Elige un día…</option>
                ${DIAS_ORDER.filter(k2=>k2!==k).map(k2=>`<option value="${k2}">${esc(DIAS_NAMES[k2])} — ${esc(sc((s.rutina[k2]&&s.rutina[k2].tipo)||'Descanso'))}</option>`).join('')}
              </select>
            </label>
            <button type="button" class="sd-b" onclick="diaIntercambiar('${s.code}','${k}',document.getElementById('swap-${s.code}-${k}').value)">🔀 Intercambiar</button>
          </div>
          ${ejRows}
          <button type="button" class="dia-add" onclick="staffAddEj('${s.code}','${k}')">+ Agregar ejercicio</button>
        </div>
      </div>`;
  }).join('');

  // ── Pestañas: Evolución · Nutrición · Rutina · Progresión ──
  if(staffTab==='progresion' && isPend) staffTab='rutina';
  const hotProg = !isPend && pqNecesitaAccion(s);
  const TABS=[['evolucion','Evolución','chart'],['nutricion','Nutrición','leaf'],['rutina','Rutina','dumbbell'],['progresion','Progresión','trophy']];
  const tabsHTML=`<div class="sd-tabs" id="sd-tabs" role="tablist">${TABS.map(([id,nm,ic])=>`<button type="button" role="tab" class="tb${staffTab===id?' on':''}" data-t="${id}" onclick="staffSetTab('${id}')">${ico(ic)}${nm}${(id==='progresion'&&hotProg)?'<i></i>':''}</button>`).join('')}</div>`;
  const pane=(id,html)=>`<div class="sd-pane${staffTab===id?' on':''}" id="sdp-${id}">${html}</div>`;
  const recientes=comoArray(s.logs&&s.logs.sesiones).filter(Boolean).slice(-6).reverse();
  const recHTML=recientes.length?`<div class="sd-sec">Últimas sesiones</div><div class="sd-body">${recientes.map(x=>`<div class="pg-mini"><span>${esc(fmtFecha(x.fecha))} · ${esc(sc(x.tipo||''))}</span><b>${x.volumen?Math.round(x.volumen).toLocaleString()+' kg':''}${x.tut>=20?(x.volumen?' · ':'')+esc(fmtTut(x.tut)):''}${x.cardioMin?(x.volumen||x.tut>=20?' · ':'')+x.cardioMin+' min cardio':''}</b></div>`).join('')}</div>`:'';
  const asigTxt=`Entrenador: <b>${esc(s.asignado||'Sin asignar')}</b>${s.nutriologo?` · Nutrición: <b>${esc(s.nutriologo)}</b>`:''}`;
  const asigHTML = puedeEd
    ? `<details class="sd-asig-d"><summary><span>${asigTxt}</span><em>Cambiar ›</em></summary>${bloqueAsignacionStaff(s)}</details>`
    : `<div class="sd-asig">${asigTxt}</div>`;

  ca.innerHTML=`
    <datalist id="kb-nombres">${casaNombresDatalist(s)}</datalist>
    <div class="sd">
      <div class="sd-head">
        <div class="sd-top">
          <div class="sd-ini">${esc(ini)}</div>
          <div class="sd-tit">
            <div class="sd-nom">${esc(tc(s.nombre))}</div>
            <div class="sd-cod">Código ${esc(s.code)} · ${esc(s.id)}</div>
          </div>
          ${membBadgeHTML(s,puedeEd)}
        </div>
        <div class="sd-chips">
          <span>${esc(sc(s.nivel))}</span><span>${esc(s.edad)} años</span><span>${esc(pesoNow)} kg</span><span>${esc(s.estatura)} cm</span><span>${esc(s.dias)} días/sem</span>
        </div>
        ${asigHTML}
        <div class="sd-memb ${membBadgeCls(membEstado(s))==='tol'?'tol':membBadgeCls(membEstado(s))==='off'?'off':''}">💳 <b>${esc(membTxt(s))}</b></div>
        <div class="sd-lim">${limChips}</div>
        ${(s.clasesGrupales&&s.clasesGrupales.length)?`<div class="sd-lim" style="margin-top:4px">${s.clasesGrupales.map(c=>`<span class="sd-lim-c" style="color:var(--n);border-color:color-mix(in srgb,var(--n) 30%,transparent);background:color-mix(in srgb,var(--n) 6%,transparent)">${esc(c.clase)} · ${c.dias.map(d=>sc(DIAS_NAMES[d])).join('/')}${c.entrenaMismoDia?' +gym':''}</span>`).join('')}</div>`:''}
        ${puedeEd?`<div class="sd-acts"><button type="button" class="sd-b" onclick="abrirEditarSocio('${s.code}')">Editar datos</button></div>`:''}
      </div>

      ${isPend?`<div class="sd-alert">⏳ Plan generado por cuestionario: pendiente de tu revisión y aprobación.${s.origenRutina==='plantilla'?' <b>Ojo: se generó con la plantilla base (la IA no estaba disponible); revísalo con más detalle.</b>':s.origenRutina==='ia'?' Generado con IA.':''}</div>`:''}

      ${tabsHTML}

      ${pane('evolucion',`
        <div class="sd-kpis">
          <div class="kpi" style="--kc:var(--v)"><div class="kpi-v">${ev.total}</div><div class="kpi-l">Sesiones</div></div>
          <div class="kpi" style="--kc:var(--n)"><div class="kpi-v">${ev.estaSemana}/${esc(s.dias)}</div><div class="kpi-l">Esta semana</div></div>
          <div class="kpi" style="--kc:var(--g)"><div class="kpi-v">${ev.adherencia}%</div><div class="kpi-l">Adherencia, 4 sem</div></div>
          <div class="kpi" style="--kc:var(--p)"><div class="kpi-v">${ev.deltaPeso===null?'—':(ev.deltaPeso>0?'+':'')+ev.deltaPeso+' kg'}</div><div class="kpi-l">Cambio de peso</div></div>
        </div>
        ${bloqueAnalisisStaff(s)}
        ${recHTML}`)}

      ${pane('nutricion',bloqueNutricionStaff(s))}

      ${pane('rutina',`
        ${bloqueRecordatorioFilosofia()}
        <div class="sd-sec">Rutina semanal <small>Toca un día para abrirlo. Elige el ejercicio del catálogo y ajusta series, repeticiones y descanso con un toque.</small></div>
        <div class="sd-body">
          ${casaBannerStaff(s)}
          <div class="rt-bar">
            <button type="button" class="sd-b p" onclick="staffEnriquecer('${s.code}')" title="Agrega métodos de intensidad y opciones por área ocupada donde falten, según tu filosofía">✨ Métodos y opciones</button>
            ${casaBarraHTML(s)}
            ${staffRutBackup[s.code]?`<button type="button" class="sd-b" onclick="staffDeshacerBase('${s.code}')">↩ Deshacer rutina cargada</button>`:''}
          </div>
          ${diasHTML}
        </div>`)}

      ${pane('progresion',bloqueProgresionTab(s))}

      <div class="sd-bar">
        ${isPend?`<button type="button" class="sd-pri ghost" onclick="staffAprobar('${s.code}')">Aprobar plan</button>`:''}
        <button type="button" class="sd-pri" onclick="staffGuardar('${s.code}')">Guardar cambios</button>
      </div>
    </div>`;
}

// ═════════════════════════════════════════
// PANEL DEL STAFF · pestañas
// ═════════════════════════════════════════
let staffTab='evolucion', staffTabCode=null, staffProgSel='actual';
const staffDiasAbiertos=new Set();   // "código|día" de los días de rutina que están abiertos
const staffRutBackup={};             // respaldo de la rutina antes de cargar un bloque anterior
function staffSetTab(t){
  staffTab=t;
  document.querySelectorAll('#sd-tabs .tb').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  document.querySelectorAll('#staff-content .sd-pane').forEach(p=>p.classList.toggle('on',p.id==='sdp-'+t));
  const el=document.getElementById('sd-tabs'); if(el&&el.scrollIntoView) el.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function staffToggleDia(code,k,el){
  const key=code+'|'+k, b=document.getElementById('stb-'+code+'-'+k); if(!b) return;
  const o=b.style.display==='none';
  b.style.display=o?'block':'none'; el.parentNode.classList.toggle('open',o);
  if(o) staffDiasAbiertos.add(key); else staffDiasAbiertos.delete(key);
}
function staffRerender(code,k){
  const s=getSocio(code); if(!s) return;
  if(k) staffDiasAbiertos.add(code+'|'+k);
  staffRenderContent(s);
}
