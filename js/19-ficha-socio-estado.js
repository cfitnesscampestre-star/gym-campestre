/* ═══ ficha socio estado ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// PROGRESIÓN · bloques: se elige "Bloque 1, 2…" y se ve la rutina de ese bloque y lo logrado
// ═════════════════════════════════════════
function pqLogros(s,desde,hasta){
  const m={};
  comoArray(s.logs&&s.logs.sesiones).forEach(x=>{
    if(!x||!x.fecha) return; if(desde&&x.fecha<desde) return; if(hasta&&x.fecha>hasta) return;
    comoArray(x.detalle).forEach(d=>{ if(!d||!d.n) return; const r=m[d.n]=m[d.n]||{};
      if(d.kg) r.kg=Math.max(r.kg||0,d.kg); if(d.fc) r.fc=d.fc; if(d.seg) r.seg=Math.max(r.seg||0,d.seg); });
  });
  return m;
}
function pqRutinaLogrosHTML(rut,logros){
  return DIAS_ORDER.map(k=>{ const d=rut&&rut[k]; const ej=comoArray(d&&d.ejercicios); if(!ej.length) return '';
    return `<div class="pg-dia">${esc(sc(DIAS_NAMES[k]).substring(0,3))} · ${esc(sc(d.tipo||''))}</div>`+ej.map(e=>{
      const l=logros&&logros[e.nm]; const t=l?(l.kg?'logró '+l.kg+' kg':l.fc?'FC '+l.fc+' lpm':l.seg?l.seg+' s':''):'';
      return `<div class="pg-mini"><span>${esc(e.nm)}</span><b>${esc(pqEjTxt(e))}${t?`<span class="pg-logro">${esc(t)}</span>`:''}</b></div>`; }).join('');
  }).join('')||'<p class="pg-p">Este bloque no tiene ejercicios registrados.</p>';
}
function staffProgElegir(code,n){ staffProgSel=(n==='actual')?'actual':+n; const s=getSocio(code); if(s) staffRenderContent(s); }
function bloqueProgresionTab(s){
  if(s.status==='pendiente') return `<div class="sd-sec">Progresión</div><div class="sd-body"><p class="pg-p">Disponible en cuanto apruebes el plan inicial del socio.</p></div>`;
  const hist=comoArray(s.historialRutinas).filter(Boolean).slice().sort((a,b)=>(+a.n||0)-(+b.n||0));
  const b=pqBloque(s), c=esc(s.code);
  if(staffProgSel!=='actual' && !hist.find(x=>+x.n===+staffProgSel)) staffProgSel='actual';
  const chips=hist.map(x=>`<button type="button" class="ch${staffProgSel===+x.n?' on':''}" onclick="staffProgElegir('${c}','${+x.n}')">Progresión ${esc(x.n)}</button>`).join('')+
    `<button type="button" class="ch${staffProgSel==='actual'?' on':''}" onclick="staffProgElegir('${c}','actual')">Progresión ${esc(b.n)} · actual</button>`;
  let cuerpo='';
  if(staffProgSel==='actual'){
    const logros=pqLogros(s,b.desde,null);
    cuerpo=bloqueProgresionStaff(s,true)+`<details class="pg-h" style="margin:12px 16px 0" open><summary><b>Rutina del bloque ${esc(b.n)}</b><span>lo que lleva logrado en este bloque</span></summary>${pqRutinaLogrosHTML(s.rutina,logros)}</details>`;
  } else {
    const x=hist.find(y=>+y.n===+staffProgSel), logros=pqLogros(s,x.desde,x.hasta);
    cuerpo=`<div class="sd-sec">Progresión ${esc(x.n)} <small>${esc(fmtFecha(x.desde))} – ${esc(fmtFecha(x.hasta))} · ${esc(x.semanas||'')} semanas · ${esc(x.sesiones)} sesiones · ${esc(x.adherencia)}% de adherencia</small></div>
      <div class="sd-body">
        ${x.respuestas?`<details class="pg-h"><summary><b>Respuestas del socio</b><span>evaluación de ese bloque</span></summary>${pqRespuestasHTML(x.respuestas)}</details>`:''}
        <div class="pg-card" style="margin-top:10px">${pqRutinaLogrosHTML(x.rutina,logros)}</div>
        <div class="pg-acts" style="margin-top:12px"><button type="button" class="sd-b p" onclick="staffUsarBloque('${c}',${+x.n})">📋 Usar esta rutina como base</button></div>
        <p class="pg-p" style="margin-top:8px">Carga la rutina de este bloque en la pestaña Rutina para editarla; no se guarda hasta que presiones Guardar cambios, y puedes deshacerlo.</p>
      </div>`;
  }
  return `<div class="sd-body" style="padding-top:14px"><div class="pg-chs">${chips}</div></div>${cuerpo}`;
}
function staffUsarBloque(code,n){
  const s=getSocio(code); if(!s) return;
  const x=comoArray(s.historialRutinas).find(y=>y&&+y.n===+n); if(!x||!x.rutina) return;
  uiConfirm('¿Cargar la rutina de la Progresión '+n+' en el editor?\nReemplaza la rutina actual en pantalla; no se guarda hasta que presiones Guardar cambios y puedes deshacerlo.',()=>{
    staffRutBackup[code]=limpio(s.rutina);
    s.rutina=JSON.parse(JSON.stringify(x.rutina)); staffDirty.add(code);
    staffTab='rutina'; staffRenderContent(s);
    showToast('📋 Rutina de la Progresión '+n+' cargada — edítala y presiona GUARDAR');
  },{label:'Cargar rutina'});
}
function staffDeshacerBase(code){
  const s=getSocio(code); if(!s||!staffRutBackup[code]) return;
  s.rutina=staffRutBackup[code]; delete staffRutBackup[code]; staffDirty.add(code);
  staffRenderContent(s); showToast('↩ Rutina anterior restaurada');
}

// ── Recordatorio de la propia filosofía al modificar una rutina ──
// Así el ajuste que hace el entrenador se siente suyo, no genérico.
function bloqueRecordatorioFilosofia(){
  if(!staffActivoEntId) return '';
  const ent=getEntrenador(staffActivoEntId);
  const ph=ent&&ent.filosofia;
  if(!ph||!ph.tagline) return '';
  return `<div style="margin:12px 22px 0;padding:11px 14px;background:color-mix(in srgb, var(--p) 5%, transparent);border:1px solid color-mix(in srgb, var(--p) 20%, transparent);border-radius:9px;display:flex;gap:10px;align-items:flex-start">
    <div style="font-size:16px">🧬</div>
    <div style="font-size:10.5px;color:var(--mu);font-family:var(--fb);line-height:1.7">
      <span style="color:var(--p)">TU FILOSOFÍA</span> — "${ph.tagline}"${ph.adjustmentPhilosophy?'<br>Ante estancamiento: '+ph.adjustmentPhilosophy:''}
    </div>
  </div>`;
}


// ═════════════════════════════════════════
// SUBMENÚ DEL ESTADO (solo director): pago, fecha de renovación, activo / inactivo, recordatorio y eliminar
// ═════════════════════════════════════════
function membBadgeHTML(s,puedeEd){
  const e=membEstado(s), cls=membBadgeCls(e), txt=membBadgeTxt(e);
  return puedeEd?`<button type="button" class="sl-st ${cls}" onclick="membAbrir('${esc(s.code)}')" aria-label="Estado y mensualidad">${txt}</button>`:`<span class="sl-st ${cls}">${txt}</span>`;
}
let MB={code:null,vista:'menu'};
function membAbrir(code,vista){
  if(staffRol!=='coordinador'){ showToast('Solo el director maneja las mensualidades'); return; }
  MB={code,vista:vista||'menu'}; membRender();
  document.getElementById('modal-memb').classList.add('open');
}
function membCerrar(){ document.getElementById('modal-memb').classList.remove('open'); }
function membGuardar(s,campos){
  guardarLocal();
  try{ pqGuardarStaff(s,campos||['membresia','status']); }catch(e){ console.warn(e); }
  staffRenderList(); if(staffActivoId===s.code) staffRenderContent(s);
}
function membRender(){
  const s=getSocio(MB.code), b=document.getElementById('memb-body'); if(!s||!b) return;
  const e=membEstado(s), m=s.membresia||{}, hoy=fechaISO(new Date());
  const cab=`<div class="m-title" style="margin-bottom:10px">${esc(tc(s.nombre))}</div>`;
  if(MB.vista==='pago'){
    const prev=membSiguienteVence(s,hoy);
    b.innerHTML=cab+`<div class="mb-h" style="margin-top:0">Registrar pago de mensualidad</div>
      <div class="f-row">
        <div class="f-grp"><label class="f-lbl" for="mbp-f">Fecha de pago</label><input type="date" class="ti" id="mbp-f" value="${hoy}" onchange="membPrevPago()"></div>
        <div class="f-grp"><label class="f-lbl" for="mbp-m">Monto (opcional)</label><input type="number" inputmode="decimal" class="ti" id="mbp-m" placeholder="$"></div>
      </div>
      <div class="f-row">
        <div class="f-grp"><label class="f-lbl" for="mbp-t">Forma de pago</label><select class="ti" id="mbp-t"><option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option><option>Otro</option></select></div>
        <div class="f-grp"><label class="f-lbl" for="mbp-n">Nota (opcional)</label><input class="ti" id="mbp-n" maxlength="60" placeholder="Ej. mes de noviembre"></div>
      </div>
      <div class="mb-prev" id="mbp-prev"></div>
      <div style="display:flex;gap:10px;margin-top:14px"><button type="button" class="sd-b" style="flex:1" onclick="MB.vista='menu';membRender()">Volver</button><button type="button" class="sd-pri" style="flex:1" onclick="membRegistrarPago()">Registrar pago</button></div>`;
    membPrevPago(); return;
  }
  if(MB.vista==='fecha'){
    b.innerHTML=cab+`<div class="mb-h" style="margin-top:0">Fecha de renovación</div>
      <p style="font-size:14px;color:var(--mu);line-height:1.5;margin-bottom:10px">Es el día en que debe pagar su siguiente mensualidad. Úsala para configurar a un socio que ya estaba o para corregir una fecha.</p>
      <div class="f-grp"><label class="f-lbl" for="mbf-f">Renueva el</label><input type="date" class="ti" id="mbf-f" value="${m.vence||isoMasMeses(hoy,1)}" onchange="membPrevFecha()"></div>
      <div class="mb-prev" id="mbf-prev"></div>
      <div style="display:flex;gap:10px;margin-top:14px"><button type="button" class="sd-b" style="flex:1" onclick="MB.vista='menu';membRender()">Volver</button><button type="button" class="sd-pri" style="flex:1" onclick="membGuardarFecha()">Guardar fecha</button></div>`;
    membPrevFecha(); return;
  }
  // menú principal
  const pagos=comoArray(m.pagos).filter(Boolean).slice(-4).reverse();
  const inact=e.estado==='inactivo';
  const wa=membMensaje(s);
  b.innerHTML=cab+`
    <div class="mb-sum"><span class="sl-st ${membBadgeCls(e)}" style="display:inline-block">${membBadgeTxt(e)}</span><br><b>${esc(membTxt(s))}</b>
      ${e.estado==='tolerancia'?'<br>Al terminar la tolerancia pasa solo a inactivo y ya no podrá entrar a su plan.':''}
      ${e.sinFecha&&e.estado==='activo'?'<br>Sin fecha de renovación no se le bloquea el acceso nunca.':''}</div>
    <button type="button" class="mb-opt" onclick="MB.vista='pago';membRender()"><span class="em">💳</span><span>Registrar pago<small>Renueva su mensualidad y lo deja activo</small></span></button>
    <button type="button" class="mb-opt" onclick="MB.vista='fecha';membRender()"><span class="em">📅</span><span>Fecha de renovación<small>${m.vence?'Actual: '+esc(fmtFC(m.vence))+' · tolerancia de '+MEMB_TOL+' días':'Configúrala para empezar a cobrar mes a mes'}</small></span></button>
    <div class="mb-h">Estado</div>
    <button type="button" class="mb-opt${!inact?' on':''}" onclick="membActivar('${esc(s.code)}')"><span class="em">✅</span><span>Activo<small>Puede entrar a su plan y registrar entrenamientos</small></span></button>
    <button type="button" class="mb-opt${inact?' on':''}" onclick="membInactivar('${esc(s.code)}')"><span class="em">⏸</span><span>Inactivo<small>Al poner su código verá "usuario inactivo". No se borra nada</small></span></button>
    ${(e.estado!=='pendiente')?`<div class="mb-h">Recordatorio</div>
    <div class="f-grp"><label class="f-lbl" for="mb-tel">WhatsApp del socio (10 dígitos)</label><input class="ti" id="mb-tel" inputmode="tel" value="${esc(s.telefono||'')}" placeholder="449 000 0000" onchange="membTel('${esc(s.code)}',this.value)"></div>
    <button type="button" class="mb-opt" onclick="membWhatsApp('${esc(s.code)}')"><span class="em">💬</span><span>Enviar recordatorio por WhatsApp<small>Abre WhatsApp con el mensaje listo: ${esc(wa.slice(0,60))}…</small></span></button>`:''}
    ${pagos.length?`<div class="mb-h">Últimos pagos</div>${pagos.map(p=>`<div class="mb-pago"><b>${esc(fmtFC(p.fecha))}${p.monto?' · $'+esc(p.monto):''}</b><span>${esc(p.metodo||'')} → renueva ${esc(fmtFC(p.despues))}</span></div>`).join('')}
      <button type="button" class="mb-opt" style="min-height:44px;margin-top:6px" onclick="membDeshacerPago('${esc(s.code)}')"><span class="em">↩</span><span>Deshacer el último pago<small>Si lo registraste por error</small></span></button>`:''}
    <div class="mb-sep"></div>
    <button type="button" class="mb-opt danger" onclick="membCerrar();confirmarEliminarSocio('${esc(s.code)}')"><span class="em">🗑</span><span>Eliminar socio<small>Borra su rutina e historial. Pide confirmación doble</small></span></button>`;
}
function membPrevPago(){
  const s=getSocio(MB.code), f=document.getElementById('mbp-f').value, el=document.getElementById('mbp-prev'); if(!s||!f||!el) return;
  const nv=membSiguienteVence(s,f), m=s.membresia||{};
  const sigue=m.vence && isoDias(m.vence,f)<MEMB_TOL;
  el.className='mb-prev'; el.innerHTML=`Su siguiente renovación será el <b>${esc(fmtFC(nv))}</b>.<br><span style="color:var(--mu);font-size:13px">${sigue?'Continúa su ciclo mensual (mismo día cada mes).':'Es un ciclo nuevo: cuenta desde el día del pago.'}</span>`;
}
function membRegistrarPago(){
  const s=getSocio(MB.code); if(!s) return;
  const f=document.getElementById('mbp-f').value; if(!f){ showToast('Elige la fecha del pago'); return; }
  const m=s.membresia=s.membresia||{};
  const antes=m.vence||'', anclaAntes=m.ancla||null;
  const nv=membSiguienteVence(s,f);
  m.ancla=(antes&&isoDias(antes,f)<MEMB_TOL)?(m.ancla||isoP(antes).d):isoP(f).d;
  m.vence=nv; m.suspendido=false;
  const pagos=comoArray(m.pagos).filter(Boolean);
  pagos.push({fecha:f,monto:(document.getElementById('mbp-m').value||'').trim(),metodo:document.getElementById('mbp-t').value,nota:limpiarTexto(document.getElementById('mbp-n').value),antes,anclaAntes,despues:nv,por:pqStaffNombre()});
  m.pagos=pagos.slice(-24);
  if(s.status==='inactivo') s.status='activo';
  membGuardar(s,['membresia','status']); membCerrar();
  showToast('💳 Pago registrado · renueva el '+fmtFC(nv)+' · '+tc(s.nombre));
}
function membDeshacerPago(code){
  const s=getSocio(code), m=s&&s.membresia; const pagos=comoArray(m&&m.pagos).filter(Boolean); if(!pagos.length) return;
  const u=pagos[pagos.length-1];
  uiConfirm('¿Deshacer el pago del '+fmtFC(u.fecha)+'?\nLa renovación vuelve al '+(u.antes?fmtFC(u.antes):'estado sin fecha')+'.',()=>{
    m.vence=u.antes||''; m.ancla=u.anclaAntes||null; m.pagos=pagos.slice(0,-1);
    membGuardar(s,['membresia','status']); membRender(); showToast('↩ Pago deshecho');
  },{label:'Deshacer pago'});
}
function membPrevFecha(){
  const s=getSocio(MB.code), f=document.getElementById('mbf-f').value, el=document.getElementById('mbf-prev'); if(!s||!f||!el) return;
  const hoy=fechaISO(new Date()), dV=isoDias(f,hoy);
  let t, warn=false;
  if(dV<0) t='Quedará <b>activo</b> hasta el '+fmtFC(isoSumDias(f,-1))+'. Renueva el '+fmtFC(f)+'.';
  else if(dV<MEMB_TOL){ t='Con esa fecha quedaría <b>en tolerancia</b> (le quedan '+(MEMB_TOL-dV)+' día'+((MEMB_TOL-dV)===1?'':'s')+').'; warn=true; }
  else { t='Con esa fecha quedaría <b>inactivo</b> (ya pasó la tolerancia).'; warn=true; }
  el.className='mb-prev'+(warn?' warn':''); el.innerHTML=t;
}
function membGuardarFecha(){
  const s=getSocio(MB.code); if(!s) return;
  const f=document.getElementById('mbf-f').value; if(!f){ showToast('Elige la fecha'); return; }
  const m=s.membresia=s.membresia||{}; m.vence=f; m.ancla=isoP(f).d;
  membGuardar(s,['membresia','status']); membCerrar(); showToast('📅 Renueva el '+fmtFC(f)+' · '+tc(s.nombre));
}
function membActivar(code){
  const s=getSocio(code); if(!s) return;
  const m=s.membresia=s.membresia||{}; m.suspendido=false;
  if(s.status==='inactivo') s.status='activo';
  const e=membEstado(s);
  if(e.estado==='inactivo'){   // sigue vencido: hay que registrar el pago para que no vuelva a inactivarse solo
    membGuardar(s,['membresia','status']);
    showToast('La mensualidad está vencida: registra el pago para dejarlo activo'); MB.vista='pago'; membRender(); return;
  }
  membGuardar(s,['membresia','status']); membCerrar(); showToast('✅ '+tc(s.nombre)+' está activo');
}
function membInactivar(code){
  const s=getSocio(code); if(!s) return;
  uiConfirm('¿Poner inactivo a '+tc(s.nombre)+'?\nNo podrá entrar a su plan hasta que lo actives o registres su pago. No se borra nada.',()=>{
    const m=s.membresia=s.membresia||{}; m.suspendido=true; s.status='inactivo';
    membGuardar(s,['membresia','status']); membCerrar(); showToast('⏸ '+tc(s.nombre)+' quedó inactivo');
  },{label:'Poner inactivo',danger:true});
}
function membTel(code,v){ const s=getSocio(code); if(!s) return; s.telefono=String(v||'').replace(/[^\d+]/g,'').slice(0,15); guardarLocal(); try{ pqGuardarStaff(s,['telefono']); }catch(e){} }
function membMensaje(s){
  const e=membEstado(s), n=tc(s.nombre).split(' ')[0];
  if(e.estado==='tolerancia') return `Hola ${n}, tu mensualidad venció el ${fmtFC(e.vence)}. Tienes hasta el ${fmtFC(e.limite)} para renovar y continuar con tu programa de entrenamiento. ¡Te esperamos!`;
  if(e.estado==='inactivo') return `Hola ${n}, tu acceso a tu programa de entrenamiento está inactivo porque no se registró tu mensualidad. Cuando la renueves lo reactivamos al instante.`;
  if(e.vence) return `Hola ${n}, te recordamos que tu mensualidad se renueva el ${fmtFC(e.vence)}. ¡Gracias por entrenar con nosotros!`;
  return `Hola ${n}, te escribimos de tu gimnasio sobre tu mensualidad.`;
}
function membWhatsApp(code){
  const s=getSocio(code); if(!s) return;
  const el=document.getElementById('mb-tel'); if(el) membTel(code,el.value);
  let t=String(s.telefono||'').replace(/\D/g,'');
  if(t.length<10){ showToast('Escribe el WhatsApp del socio (10 dígitos)'); if(el) el.focus(); return; }
  if(t.length===10) t='52'+t;
  window.open('https://wa.me/'+t+'?text='+encodeURIComponent(membMensaje(s)),'_blank');
}
// Lado del socio: aviso de tolerancia y bloqueo cuando está inactivo
function membBloqueoSocio(s){
  const e=membEstado(s);
  if(e.estado!=='inactivo') return false;
  return true;
}
const MEMB_MSG_INACTIVO='Usuario inactivo. Tu mensualidad no está vigente; acércate a recepción o con tu entrenador para renovarla y volver a entrar a tu plan.';
function membAvisoSocioHTML(s){
  const e=membEstado(s);
  if(e.estado==='tolerancia') return `<div class="memb-aviso-socio"><b>⏳ Tu mensualidad venció el ${esc(fmtFC(e.vence))}</b>Tienes ${e.restan} día${e.restan===1?'':'s'} (hasta el ${esc(fmtFC(e.limite))}) para renovar y continuar con tu programa. Después tu acceso quedará inactivo.</div>`;
  if(e.estado==='activo' && e.porVencer) return `<div class="memb-aviso-socio" style="background:var(--gl);border-color:var(--b2)"><b>💳 Tu mensualidad se renueva el ${esc(fmtFC(e.vence))}</b>${e.faltan===1?'Es mañana.':'Faltan '+e.faltan+' días.'}</div>`;
  return '';
}

function diaIntercambiar(code,k1,k2){
  if(!k2){ showToast('Elige con qué día intercambiar'); return; }
  const s=getSocio(code); if(!s) return;
  if(!s.rutina[k1]) s.rutina[k1]={tipo:'DESCANSO',color:'descanso',ejercicios:[]};
  if(!s.rutina[k2]) s.rutina[k2]={tipo:'DESCANSO',color:'descanso',ejercicios:[]};
  const tmp=s.rutina[k1]; s.rutina[k1]=s.rutina[k2]; s.rutina[k2]=tmp;
  staffDirty.add(code);
  staffRenderContent(s);
  showToast('🔀 '+DIAS_NAMES[k1]+' ↔ '+DIAS_NAMES[k2]+' — presiona Guardar cambios para confirmarlo');
}
function staffUpd(code,k,ei,field,val){
  const s=getSocio(code); if(!s||!s.rutina[k]||!s.rutina[k].ejercicios[ei]) return; staffDirty.add(code);
  s.rutina[k].ejercicios[ei][field]=val;
}
// El nombre decide si el ejercicio se trata como cardio (tiempo/FC) o fuerza (series/peso/reps).
// A diferencia de staffUpd, aquí SÍ se vuelve a pintar la ficha para que esos campos cambien
// en cuanto el director escribe o elige un ejercicio de cardio del catálogo — antes se quedaban
// pegados en los campos de fuerza hasta cerrar y volver a abrir al socio.
function staffUpdNombreEj(code,k,ei,val){
  staffUpd(code,k,ei,'nm',val);
  const s=getSocio(code); if(s) staffRenderContent(s);
}
function staffUpdTipo(code,k,val){
  const s=getSocio(code); if(!s||!s.rutina[k]) return; staffDirty.add(code);
  s.rutina[k].tipo=val;
  s.rutina[k].color = /descanso/i.test(val) ? 'descanso' : (s.rutina[k].color==='descanso'?'verde':s.rutina[k].color);
}
function staffUpdMetodo(code,k,ei,id){
  const s=getSocio(code); const e=s&&s.rutina[k]&&s.rutina[k].ejercicios[ei]; if(!e) return; staffDirty.add(code);
  if(!id){ delete e.metodo; staffRerender(code,k); return; }
  const det=(e.metodo&&e.metodo.detalle)||'', antes=e.series+'|'+e.reps;
  aplicarMetodo(e,id,det);   // ajusta series/repeticiones según el método (pirámide, cluster, tempo…)
  staffRerender(code,k);
  if(antes!==(e.series+'|'+e.reps)) showToast('⚡ '+KB_METODOS[id].nm+': se ajustaron series y repeticiones al método');
}
function staffUpdMetodoDet(code,k,ei,v){
  const s=getSocio(code); const e=s&&s.rutina[k]&&s.rutina[k].ejercicios[ei]; if(!e||!e.metodo) { showToast('Elige primero un método'); return; }
  staffDirty.add(code); e.metodo.detalle=v;
}
function staffUpdAlts(code,k,ei,txt){
  const s=getSocio(code); const e=s&&s.rutina[k]&&s.rutina[k].ejercicios[ei]; if(!e) return; staffDirty.add(code);
  e.alternativas=txt.split(',').map(x=>x.trim()).filter(Boolean).slice(0,4).map(nm=>{
    const kb=kbBuscar(nm); return {nm:kb?kb.nm:nm, ms:kb?kb.ms:'', z:kb?kb.z:'', nota:kb?('En '+(KB_ZONAS[kb.z]||kb.z)):''};
  });
}
function staffEnriquecer(code){
  const s=getSocio(code); if(!s) return;
  staffDirty.add(code);
  enriquecerSocio(s);
  staffRenderContent(s);
  showToast('✨ Métodos y opciones agregados donde faltaban — revisa y presiona GUARDAR');
}
function staffDelEj(code,k,ei){
  const s=getSocio(code); if(!s) return; staffDirty.add(code);
  s.rutina[k].ejercicios.splice(ei,1);
  staffRerender(code,k);
}
function staffAddEj(code,k){ staffDiasAbiertos.add(code+'|'+k); epAbrir(code,k,null); }
function staffAprobar(code){
  const s=getSocio(code); if(!s) return;
  s.status='activo';
  if(s.asignado==='—') s.asignado=document.getElementById('staff-nombre').textContent||'Staff';
  dbSaveStaff(s.code); staffRenderList(); staffRenderContent(s);
  showToast('✓ Plan aprobado y activado — el socio ya puede entrenar');
  if(staffRol==='coordinador' && !(s.membresia&&s.membresia.vence)) setTimeout(()=>membAbrir(s.code,'pago'),400);   // empieza su mensualidad
}
function staffGuardar(code){
  const s=getSocio(code); if(!s) return;
  delete staffRutBackup[code];
  dbSaveStaff(s.code); staffRenderList();
  showToast('✓ Cambios guardados — visibles para el socio al instante');
}
