/* ═══ socios admin ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// SOCIOS — editar datos y eliminar (solo coordinador)
// ═════════════════════════════════════════
const OBJETIVOS_LISTA=['GANAR MÚSCULO','PERDER PESO','FUERZA PURA','RESISTENCIA','FLEXIBILIDAD','RENDIMIENTO DEPORTIVO','REHABILITACIÓN'];
function opcionesSel(arr,actual){
  const lista=arr.includes(actual)||!actual?arr:[actual,...arr];
  return lista.map(v=>`<option value="${esc(v)}" ${v===actual?'selected':''}>${esc(sc(v))}</option>`).join('');
}
function abrirEditarSocio(code){
  if(staffRol!=='coordinador'){ showToast('Solo el director puede editar los datos del socio'); return; }
  const s=getSocio(code); if(!s) return; asegurarLogs(s);
  document.getElementById('es-titulo').textContent=tc(s.nombre);
  document.getElementById('es-code').value=code;
  document.getElementById('es-nombre').value=tc(s.nombre);
  document.getElementById('es-edad').value=s.edad||'';
  document.getElementById('es-estatura').value=s.estatura||'';
  document.getElementById('es-peso').value=pesoActual(s)||'';
  document.getElementById('es-genero').innerHTML=opcionesSel(['MASCULINO','FEMENINO'],s.genero);
  document.getElementById('es-objetivo').innerHTML=opcionesSel(OBJETIVOS_LISTA,s.objetivo);
  document.getElementById('es-nivel').innerHTML=opcionesSel(['PRINCIPIANTE','INTERMEDIO','AVANZADO'],s.nivel);
  document.getElementById('es-dias').innerHTML=[2,3,4,5,6].map(n=>`<option value="${n}" ${+s.dias===n?'selected':''}>${n} días por semana</option>`).join('');
  const ents=Object.values(DB.entrenadores||{}).filter(e=>e&&e.rol!=='coordinador');
  document.getElementById('es-ent').innerHTML='<option value="">Sin asignar</option>'+ents.map(e=>`<option value="${esc(e.id)}" ${s.entrenadorId===e.id?'selected':''}>${esc(e.nombre)}</option>`).join('');
  const nutris=staffNutricionistas();
  document.getElementById('es-nut').innerHTML='<option value="">Sin asignar (o el mismo entrenador, si da nutrición)</option>'+nutris.map(e=>`<option value="${esc(e.id)}" ${s.nutriologoId===e.id?'selected':''}>${esc(e.nombre)}${entHace(e,'entrenamiento')?' (también entrena)':''}</option>`).join('');
  document.getElementById('es-status').innerHTML=`<option value="activo" ${s.status==='activo'?'selected':''}>Activo</option><option value="inactivo" ${s.status==='inactivo'?'selected':''}>Inactivo</option><option value="pendiente" ${s.status==='pendiente'?'selected':''}>Pendiente de revisión</option>`;
  document.getElementById('es-limit').value=(s.limitaciones||[]).join(', ');
  document.getElementById('es-nuevocode').value='';
  document.getElementById('es-nuevocode').placeholder='Actual: '+code;
  document.getElementById('modal-editar-socio').classList.add('open');
}
function cerrarModalEditarSocio(){ document.getElementById('modal-editar-socio').classList.remove('open'); }
function guardarEdicionSocio(){
  if(staffRol!=='coordinador') return;
  const code=document.getElementById('es-code').value;
  const s=getSocio(code); if(!s) return; asegurarLogs(s);
  const v=id=>document.getElementById(id).value;
  const nombre=limpiarTexto(v('es-nombre')).toUpperCase();
  const edad=parseInt(v('es-edad')), est=parseFloat(v('es-estatura')), peso=parseFloat(v('es-peso'));
  if(!nombre){ showToast('El nombre no puede quedar vacío'); return; }
  if(!(edad>=5&&edad<=100)){ showToast('Revisa la edad (5 a 100 años)'); return; }
  if(!(est>=100&&est<=230)){ showToast('Revisa la estatura (100 a 230 cm)'); return; }
  if(!(peso>=30&&peso<=250)){ showToast('Revisa el peso (30 a 250 kg)'); return; }
  let nuevo=v('es-nuevocode').trim();
  if(nuevo && nuevo!==code){
    if(!/^\d{4}$/.test(nuevo)){ showToast('El código nuevo debe tener 4 dígitos'); return; }
    if(DB.socios[nuevo]){ showToast('Ese código ya lo usa otro socio'); return; }
  } else nuevo='';

  s.nombre=nombre; s.edad=edad; s.estatura=est; s.genero=v('es-genero'); s.objetivo=v('es-objetivo');
  s.nivel=v('es-nivel'); s.dias=parseInt(v('es-dias'))||s.dias;
  { const nuevoSt=v('es-status'); const mb=s.membresia=s.membresia||{};
    if(nuevoSt==='inactivo') mb.suspendido=true; else if(nuevoSt==='activo') mb.suspendido=false;
    s.status=nuevoSt; }
  const entId=v('es-ent');
  if(entId && DB.entrenadores[entId]){ s.entrenadorId=entId; s.asignado=DB.entrenadores[entId].nombre; }
  else { s.entrenadorId=''; s.asignado='Sin asignar'; }
  const nutId=v('es-nut');
  if(nutId && DB.entrenadores[nutId]){ s.nutriologoId=nutId; s.nutriologo=DB.entrenadores[nutId].nombre; }
  else { s.nutriologoId=''; s.nutriologo=''; }
  s.limitaciones=limpiarTexto(v('es-limit')).split(',').map(x=>x.trim()).filter(Boolean);
  // El peso nuevo se registra como pesaje de hoy (así la nutrición y las gráficas lo toman)
  if(peso!==pesoActual(s)){
    const hoy=fechaISO(new Date()), ex=s.logs.pesoCorporal.find(p=>p.fecha===hoy);
    if(ex) ex.kg=peso; else s.logs.pesoCorporal.push({fecha:hoy,kg:peso});
  }

  if(nuevo){   // cambio de código: se mueve el registro completo
    delete DB.socios[code]; s.code=nuevo; s.id='#CC-'+nuevo; DB.socios[nuevo]=s; staffActivoId=nuevo;
    guardarLocal();
    OUTBOX=OUTBOX.filter(x=>!(x.tipo==='socio' && x.code===code)); outGuardar();
    fbEncolar('/socios/'+nuevo,'set',asegurarLogs(s));
    fbEncolar('/socios/'+code,'remove',null);
  } else {
    guardarLocal();
    {
      {
        fbEncolar('/socios/'+code,'update',({
          nombre:s.nombre, edad:s.edad, estatura:s.estatura, genero:s.genero, objetivo:s.objetivo, nivel:s.nivel, dias:s.dias,
          status:s.status, membresia:s.membresia||null, asignado:s.asignado, entrenadorId:s.entrenadorId||'',
          nutriologoId:s.nutriologoId||'', nutriologo:s.nutriologo||'',
          limitaciones:s.limitaciones.length?s.limitaciones:null, 'logs/pesoCorporal':s.logs.pesoCorporal
        }));
      }
    }
  }
  cerrarModalEditarSocio();
  staffRenderList(); staffOpenSocio(s.code);
  showToast('✓ Datos del socio actualizados'+(nuevo?' · nuevo código '+nuevo:''));
}
function staffMostrarVacio(){
  staffVista('lista');
  document.getElementById('staff-content').innerHTML=`<div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:var(--mu);padding:40px;text-align:center;"><div style="font-family:var(--fd);font-size:var(--fs-4xl);">Selecciona un socio</div><div style="font-size:var(--fs-sm);line-height:1.6;">Elige un socio para editar su rutina,<br>ver su evolución y su plan de nutrición.</div></div>`;
}
function confirmarEliminarSocio(code){
  if(staffRol!=='coordinador'){ showToast('Solo el director puede eliminar socios'); return; }
  const s=getSocio(code); if(!s) return;
  const nSes=comoArray(s.logs&&s.logs.sesiones).length;
  uiConfirm(`¿Eliminar a ${tc(s.nombre)}?\n\nSe borrará su rutina y todo su historial (${nSes} sesión(es), pesos y récords). No se puede deshacer.\n\nSi quieres conservar una copia, cancela y usa 💾 Respaldo.`,
    ()=>uiPrompt('Para confirmar, escribe ELIMINAR','ELIMINAR',()=>confirmarEliminarSocioFinal(code),{label:'Eliminar'}),
    {label:'Continuar',danger:true});
}
function confirmarEliminarSocioFinal(code){
  const s=getSocio(code); if(!s) return;
  const copia=s;
  delete DB.socios[code]; guardarLocal();
  OUTBOX=OUTBOX.filter(x=>!(x.tipo==='socio' && x.code===code)); outGuardar();
  staffActivoId=null; staffRenderList(); staffMostrarVacio();
  fbEncolar('/socios/'+code,'remove',null,{
    ok:()=>showToast('🗑 Socio eliminado'),
    err:e=>{
      DB.socios[code]=copia; guardarLocal(); staffRenderList();
      console.warn('No se pudo eliminar',e);
      showToast('🔒 Firebase no permitió eliminar. Pega las reglas nuevas de firebase-rules.json y vuelve a intentar.');
    }
  });
  if(estaSinConexion() || !fbListo) showToast('🗑 Socio eliminado · se aplicará en todos los dispositivos al volver la conexión');
}
