/* ═══ mensualidad ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// MENSUALIDAD — cada socio tiene una fecha de renovación (mismo día cada mes).
//  · Vigente  → "Activo" hasta el día anterior a la renovación.
//  · Desde el día de renovación hay MEMB_TOL días de tolerancia (sigue entrando; el socio ve un aviso
//    y el director lo ve marcado). Si no paga, pasa solo a "Inactivo" y no puede entrar a su plan.
//  · El director registra el pago (renueva), pone Activo / Inactivo a mano o elimina al socio.
//  · Socios sin fecha de renovación NO se bloquean nunca (así no se afecta a los actuales).
// Todo se calcula con la fecha del dispositivo al abrir la app: no hay servidor que mande mensajes solos,
// por eso los avisos son dentro de la app (y un botón para mandar el recordatorio por WhatsApp).
// ═════════════════════════════════════════
const MEMB_TOL=3;
const MESES_C=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function p2(n){ return String(n).padStart(2,'0'); }
function isoP(iso){ const [y,m,d]=String(iso).split('-').map(Number); return {y,m,d}; }
function isoDias(a,b){ const A=isoP(a),B=isoP(b); return Math.round((Date.UTC(B.y,B.m-1,B.d)-Date.UTC(A.y,A.m-1,A.d))/86400000); }
function isoSumDias(iso,n){ const q=isoP(iso), d=new Date(Date.UTC(q.y,q.m-1,q.d+n)); return d.getUTCFullYear()+'-'+p2(d.getUTCMonth()+1)+'-'+p2(d.getUTCDate()); }
function isoMasMeses(iso,n,ancla){
  const q=isoP(iso); let m=q.m-1+n; const y=q.y+Math.floor(m/12); m=((m%12)+12)%12;
  const dim=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  return y+'-'+p2(m+1)+'-'+p2(Math.min(ancla||q.d,dim));
}
function fmtFC(iso){ if(!iso) return '—'; const q=isoP(iso); return q.d+' '+MESES_C[q.m-1]+(q.y!==new Date().getFullYear()?' '+q.y:''); }
function membEstado(s,hoy){
  hoy=hoy||fechaISO(new Date());
  if(!s) return {estado:'activo'};
  const m=s.membresia||{};
  if(s.status==='pendiente') return {estado:'pendiente',vence:m.vence||''};
  if(m.suspendido) return {estado:'inactivo',motivo:'manual',vence:m.vence||''};
  if(!m.vence) return {estado:s.status==='inactivo'?'inactivo':'activo',sinFecha:true,motivo:s.status==='inactivo'?'manual':'',vence:''};
  const dV=isoDias(m.vence,hoy);
  if(dV<0) return {estado:'activo',vence:m.vence,dV,faltan:-dV,porVencer:(-dV)<=3};
  if(dV<MEMB_TOL) return {estado:'tolerancia',vence:m.vence,dV,restan:MEMB_TOL-dV,limite:isoSumDias(m.vence,MEMB_TOL-1)};
  return {estado:'inactivo',motivo:'vencida',vence:m.vence,dV};
}
function membSiguienteVence(s,fechaPago){
  const m=s.membresia||{};
  if(m.vence && isoDias(m.vence,fechaPago)<MEMB_TOL) return isoMasMeses(m.vence,1,m.ancla||isoP(m.vence).d);   // renueva a tiempo (o dentro de la tolerancia): sigue su ciclo
  return isoMasMeses(fechaPago,1,isoP(fechaPago).d);                                                              // contrato nuevo o reactivación: el ciclo empieza el día del pago
}
function membTxt(s){
  const e=membEstado(s);
  if(e.estado==='pendiente') return 'Pendiente de aprobar';
  if(e.estado==='inactivo') return e.motivo==='manual'?'Inactivo (puesto a mano)':'Inactivo · venció el '+fmtFC(e.vence);
  if(e.sinFecha) return 'Sin mensualidad configurada';
  if(e.estado==='tolerancia') return 'En tolerancia · venció el '+fmtFC(e.vence)+' · le quedan '+e.restan+' día'+(e.restan===1?'':'s')+' (hasta el '+fmtFC(e.limite)+')';
  return 'Renueva el '+fmtFC(e.vence)+(e.faltan===0?'':' · en '+e.faltan+' día'+(e.faltan===1?'':'s'));
}
// Pasa a "inactivo" (o regresa a "activo") lo que corresponda según las fechas y avisa al staff
let membAvisoSig='';
function membSincronizar(){
  const socios=Object.values(DB.socios||{}).filter(Boolean);
  let tol=[], inact=[], cambios=0;
  socios.forEach(s=>{
    const e=membEstado(s);
    if(e.estado==='inactivo' && s.status==='activo'){ s.status='inactivo'; try{ pqGuardarStaff(s,['status']); }catch(err){} cambios++; }
    else if((e.estado==='activo'||e.estado==='tolerancia') && s.status==='inactivo' && !(s.membresia&&s.membresia.suspendido)){ s.status='activo'; try{ pqGuardarStaff(s,['status']); }catch(err){} cambios++; }
    if(e.estado==='tolerancia') tol.push(s); else if(e.estado==='inactivo' && e.motivo==='vencida') inact.push(s);
  });
  const sig=tol.map(s=>s.code+':'+membEstado(s).restan).join(',')+'|'+inact.map(s=>s.code).join(',');
  if((tol.length||inact.length) && sig!==membAvisoSig && typeof staffRol!=='undefined' && document.getElementById('s-panel') && document.getElementById('s-panel').classList.contains('on')){
    showToast('🔔 Mensualidades: '+(tol.length?tol.length+' en tolerancia':'')+(tol.length&&inact.length?' · ':'')+(inact.length?inact.length+' inactivo'+(inact.length>1?'s':'')+' por falta de pago':''));
  }
  membAvisoSig=sig;
  return {tol,inact,cambios};
}

function lsLoad(){ try{ const r=localStorage.getItem(LS_KEY); return r?JSON.parse(r):null; }catch(e){return null;} }
function fechaISO(d){ // fecha LOCAL (no UTC): en Aguascalientes UTC-6, toISOString() cambiaba de día a las 18:00
  const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
}
// Escapar texto de usuario antes de meterlo en innerHTML
function esc(v){ return String(v==null?'':v).replace(/[&<>"'`]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c])); }
function limpiarTexto(v){ return String(v||'').replace(/[<>"'`]/g,'').trim(); }
function fmtFecha(iso){
  const [y,m,d]=iso.split('-');
  return d+'/'+m+'/'+y.substring(2);
}

// ── Peso actual = último registro o peso inicial ──
function pesoActual(s){
  const logs = s.logs?.pesoCorporal || [];
  return logs.length ? logs[logs.length-1].kg : s.peso;
}
