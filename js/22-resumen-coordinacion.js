/* ═══ resumen coordinacion ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// RESUMEN DE COORDINACIÓN — KPIs, riesgo de abandono, carga por entrenador, exportación
// ═════════════════════════════════════════
function diasDesde(iso){ if(!iso) return null; const [y,m,d]=iso.split('-').map(Number); return Math.floor((new Date().setHours(0,0,0,0)-new Date(y,m-1,d).getTime())/86400000); }
function ultimaActividad(s){
  const f=[...(s.logs?.sesiones||[]).map(x=>x.fecha),...(s.logs?.asistencia||[]).map(x=>x.fecha)].filter(Boolean).sort();
  return f.length?f[f.length-1]:null;
}
function calcResumen(){
  const socios=staffGetSocios();
  const iniSem=inicioSemana(new Date()).getTime();
  const activos=socios.filter(s=>s.status==='activo');
  const pend=socios.filter(s=>s.status==='pendiente').map(s=>({s,espera:diasDesde(s.fechaRegistro)||0})).sort((a,b)=>b.espera-a.espera);
  let checkGym=0, checkFuera=0, checkSinUbic=0, sesSem=0;
  socios.forEach(s=>{
    (s.logs?.asistencia||[]).forEach(a=>{ if((a.ts||0)>=iniSem){ if(a.ubicacion==='gym') checkGym++; else if(a.ubicacion==='outside') checkFuera++; else checkSinUbic++; }});
    sesSem+=(s.logs?.sesiones||[]).filter(x=>(x.ts||0)>=iniSem).length;
  });
  const adh=activos.map(s=>calcEvolucion(s).adherencia);
  const adhProm=adh.length?Math.round(adh.reduce((a,b)=>a+b,0)/adh.length):0;
  const riesgo=activos.map(s=>({s,ult:ultimaActividad(s)})).map(o=>({...o,dias:o.ult?diasDesde(o.ult):diasDesde(o.s.fechaRegistro)}))
    .filter(o=>o.dias!=null && o.dias>=14).sort((a,b)=>b.dias-a.dias);
  const porEnt={};
  socios.forEach(s=>{
    const k=s.entrenadorId||'_sin';
    if(!porEnt[k]) porEnt[k]={nombre:k==='_sin'?'Sin asignar':(getEntrenador(k)?.nombre||s.asignado||k),total:0,activos:0,pend:0,adh:[]};
    const e=porEnt[k]; e.total++;
    if(s.status==='activo'){ e.activos++; e.adh.push(calcEvolucion(s).adherencia); } else if(s.status!=='inactivo') e.pend++;
  });
  const plantilla=socios.filter(s=>s.origenRutina==='plantilla').length;
  const hace30=Date.now()-30*86400000, cambios={}, horas={};
  socios.forEach(s=>(s.logs?.sesiones||[]).filter(x=>(x.ts||0)>=hace30).forEach(x=>(x.cambios||[]).forEach(c=>{
    cambios[c.orig]=(cambios[c.orig]||0)+1;
    const h=(x.hora||'').substring(0,2); if(h) horas[h]=(horas[h]||0)+1;
  })));
  const topCambios=Object.entries(cambios).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const topHoras=Object.entries(horas).sort((a,b)=>b[1]-a[1]).slice(0,3);
  return {socios,activos,pend,checkGym,checkFuera,checkSinUbic,sesSem,adhProm,riesgo,porEnt,plantilla,topCambios,topHoras};
}
function abrirLugares(){
  if(staffRol!=='coordinador'){ showToast('Esta sección es solo para dirección'); return; }
  staffActivoId=null; staffRenderList();
  const lugares=comoArray(DB.config&&DB.config.lugares).map(l=>{
    const dist=haversine(l.lat,l.lng,GEO_CENTER.lat,GEO_CENTER.lng);
    return Object.assign({},l,{esClub:dist<=GEO_RADIO_M});
  }).sort((a,b)=>(b.visitas||0)-(a.visitas||0));
  const club=lugares.filter(l=>l.esClub), otros=lugares.filter(l=>!l.esClub);
  const fila=l=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--b)">
      <div style="min-width:0">
        <div style="font-family:var(--fd);font-size:var(--fs-lg)">${l.esClub?'🏋️ Club Campestre':'📍 '+l.lat.toFixed(3)+', '+l.lng.toFixed(3)}</div>
        <div style="font-size:var(--fs-xs);color:var(--mu);margin-top:2px">Visto ${l.visitas} vez${l.visitas===1?'':'es'} · ${comoArray(l.dias).length||1} día${(comoArray(l.dias).length||1)===1?'':'s'} distinto${(comoArray(l.dias).length||1)===1?'':'s'} · ${esc(fmtFecha(l.primera))}${l.primera!==l.ultima?' – '+esc(fmtFecha(l.ultima)):''}</div>
      </div>
      ${l.esClub?'':`<a href="https://www.google.com/maps?q=${l.lat},${l.lng}" target="_blank" rel="noopener" class="sd-b" style="text-decoration:none;white-space:nowrap;flex:none">Ver mapa ↗</a>`}
    </div>`;
  document.getElementById('staff-content').innerHTML=`
  <div style="padding:22px;max-width:700px">
    <h2 style="font-family:var(--fd);font-size:var(--fs-5xl);margin:0">Lugares visitados</h2>
    <p style="font-size:var(--fs-xs);color:var(--mu);margin:6px 0 22px;line-height:1.6">De dónde abren tus socios la app (según el GPS de su dispositivo, cuando lo permiten). Si ves visitas repetidas en un lugar que no es el club, puede ser un gimnasio donde ya conocen la app — vale la pena ir a ofrecerla ahí.</p>
    <h3 style="font-family:var(--fd);font-size:var(--fs-xl);margin:0 0 4px">Otros lugares ${otros.length?`(${otros.length})`:''}</h3>
    ${otros.length?otros.map(fila).join(''):'<p style="font-size:var(--fs-sm);color:var(--mu)">Por ahora todos los accesos registrados fueron dentro del club.</p>'}
    ${club.length?`<h3 style="font-family:var(--fd);font-size:var(--fs-xl);margin:26px 0 4px">Club Campestre</h3>${club.map(fila).join('')}`:''}
    ${(!otros.length&&!club.length)?'<p style="font-size:var(--fs-sm);color:var(--mu)">Aún no hay suficientes check-ins con ubicación para armar este reporte.</p>':''}
  </div>`;
}
function abrirResumen(){
  if(staffRol!=='coordinador'){ showToast('Esta sección es solo para dirección'); return; }
  staffActivoId=null; staffRenderList();
  const r=calcResumen();
  const kpi=(n,l,c)=>`<div style="padding:14px;border:1px solid var(--b);border-radius:10px;background:var(--gl)"><div style="font-family:var(--fd);font-size:var(--fs-5xl);line-height:1;color:${c||'var(--tx)'}">${n}</div><div style="font-size:var(--fs-2xs);color:var(--mu);margin-top:6px;line-height:1.35">${l}</div></div>`;
  const fila=(a,b,c)=>`<div style="display:grid;grid-template-columns:1fr auto;gap:10px;padding:9px 0;border-bottom:1px solid var(--b);font-size:var(--fs-xs);cursor:${c?'pointer':'default'}" ${c?`onclick="staffOpenSocio('${esc(c)}')"`:''}><span>${a}</span><span style="color:var(--mu);font-family:var(--fb);font-size:var(--fs-2xs)">${b}</span></div>`;
  const ents=Object.values(r.porEnt).sort((a,b)=>b.total-a.total);
  const titulo=(t,sub)=>`<h3 style="font-family:var(--fd);font-size:var(--fs-2xl);margin:26px 0 4px">${t}</h3>${sub?`<p style="font-size:var(--fs-2xs);color:var(--mu);margin:0 0 8px;line-height:1.5">${sub}</p>`:''}`;
  document.getElementById('staff-content').innerHTML=`
  <div style="padding:22px;max-width:900px">
    <h2 style="font-family:var(--fd);font-size:var(--fs-5xl);margin:0">Resumen del gimnasio</h2>
    <p style="font-size:var(--fs-xs);color:var(--mu);margin:4px 0 16px">Semana en curso (desde el lunes). ${staffRol==='coordinador'?'Todos los socios.':'Solo tus socios.'}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px">
      ${kpi(r.activos.length,'socios con plan activo')}
      ${kpi(r.pend.length,'planes esperando aprobación',r.pend.length?'var(--g)':'')}
      ${kpi(r.checkGym,'check-ins dentro del gimnasio esta semana','var(--v)')}
      ${kpi(r.sesSem,'sesiones registradas esta semana')}
      ${kpi(r.adhProm+'%','adherencia promedio (últimas 4 semanas)')}
      ${kpi(r.riesgo.length,'socios activos sin actividad en 14+ días',r.riesgo.length?'var(--r)':'')}
    </div>
    ${(r.checkFuera||r.checkSinUbic)?`<p style="font-size:var(--fs-2xs);color:var(--mu);margin:10px 0 0;line-height:1.5">Además hubo ${r.checkFuera} accesos desde fuera del club y ${r.checkSinUbic} sin ubicación; no cuentan como asistencia en el gimnasio.</p>`:''}

    ${titulo('Planes por aprobar','Ordenados por días de espera. Un socio que espera más de 2 días suele perder el impulso inicial.')}
    ${r.pend.length? r.pend.map(o=>fila(esc(o.s.nombre)+(o.s.origenRutina==='plantilla'?' <span style="color:var(--g);font-size:var(--fs-xs)">(plantilla)</span>':''), o.espera+' d · '+esc(o.s.asignado||'—'), o.s.code)).join('') : '<p style="font-size:var(--fs-xs);color:var(--mu)">Nada pendiente.</p>'}

    ${titulo('Riesgo de abandono','Socios activos sin sesión ni check-in en 14 días o más. Buen momento para que su entrenador los contacte.')}
    ${r.riesgo.length? r.riesgo.slice(0,30).map(o=>fila(esc(o.s.nombre), o.dias+' d sin actividad · '+esc(o.s.asignado||'—'), o.s.code)).join('') : '<p style="font-size:var(--fs-xs);color:var(--mu)">Nadie en riesgo.</p>'}

    ${titulo('Equipo saturado','Ejercicios que los socios cambiaron por su opción en los últimos 30 días. Te dice qué área o máquina se satura.')}
    ${r.topCambios.length? r.topCambios.map(([nm,n])=>fila(esc(nm), n+' cambio'+(n>1?'s':''))).join('') + (r.topHoras.length?`<p style="font-size:var(--fs-2xs);color:var(--mu);margin:8px 0 0">Horas con más cambios: ${r.topHoras.map(([h,n])=>h+':00 ('+n+')').join(', ')}.</p>`:'') : '<p style="font-size:var(--fs-xs);color:var(--mu)">Aún no hay cambios registrados.</p>'}

    ${titulo('Carga por entrenador','')}
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:var(--fs-xs);min-width:420px">
      <tr style="color:var(--mu);text-align:left;font-size:var(--fs-2xs)"><th style="padding:6px 0">Entrenador</th><th>Socios</th><th>Activos</th><th>Pendientes</th><th>Adherencia</th></tr>
      ${ents.map(e=>`<tr style="border-top:1px solid var(--b)"><td style="padding:8px 0">${esc(e.nombre)}</td><td>${e.total}</td><td>${e.activos}</td><td style="color:${e.pend?'var(--g)':'inherit'}">${e.pend}</td><td>${e.adh.length?Math.round(e.adh.reduce((a,b)=>a+b,0)/e.adh.length)+'%':'—'}</td></tr>`).join('')}
    </table></div>
    ${r.plantilla?`<p style="font-size:var(--fs-2xs);color:var(--mu);margin-top:10px">${r.plantilla} socio(s) tienen rutina generada con plantilla base, no con IA.</p>`:''}

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:24px">
      <button class="tb-btn" onclick="exportarCSV()" style="padding:9px 14px">⬇ Exportar socios (CSV)</button>
      ${staffRol==='coordinador'?'<button class="tb-btn" onclick="descargarRespaldo()" style="padding:9px 14px">💾 Respaldo completo (JSON)</button>':''}
    </div>
  </div>`;
}
function descargarArchivo(nombre, contenido, tipo){
  const blob=new Blob([contenido],{type:tipo}); const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=nombre; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500);
}
function exportarCSV(){
  const cols=['codigo','nombre','estado','objetivo','nivel','dias_semana','entrenador','fecha_registro','origen_rutina','sesiones_totales','sesiones_4_sem','adherencia_%','checkins_gym_30d','ultima_actividad','dias_sin_actividad','peso_inicial','peso_actual'];
  const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const hace30=Date.now()-30*86400000;
  const rows=staffGetSocios().map(s=>{
    const ev=calcEvolucion(s), ult=ultimaActividad(s);
    return [s.code,s.nombre,s.status,s.objetivo,s.nivel,s.dias,s.asignado,s.fechaRegistro,s.origenRutina||'',ev.total,ev.ult4,ev.adherencia,
      (s.logs?.asistencia||[]).filter(a=>a.ubicacion==='gym'&&(a.ts||0)>=hace30).length, ult||'', ult?diasDesde(ult):'', s.peso, pesoActual(s)].map(q).join(',');
  });
  descargarArchivo('socios_'+fechaISO(new Date())+'.csv','\ufeff'+cols.join(',')+'\n'+rows.join('\n'),'text/csv;charset=utf-8');
  showToast('⬇ CSV descargado ('+rows.length+' socios)');
}
function descargarRespaldo(){
  if(staffRol!=='coordinador'){ showToast('Solo dirección'); return; }
  const datos={exportado:new Date().toISOString(),socios:limpio(DB.socios),entrenadores:limpio(DB.entrenadores)};
  descargarArchivo('respaldo_gym_'+fechaISO(new Date())+'.json',JSON.stringify(datos,null,1),'application/json');
  showToast('💾 Respaldo descargado — guárdalo en un lugar seguro (contiene datos de salud)');
}
