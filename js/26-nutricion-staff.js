/* ═══ nutricion staff ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// NUTRICIÓN — nutriólogo asignado, ajuste de requerimientos y menú
// ═════════════════════════════════════════
function entFunciones(e){ const f=e&&e.funciones; return (Array.isArray(f)&&f.length)?f:['entrenamiento']; }
function entHace(e,f){ return !!e && entFunciones(e).includes(f); }
function entTipoLabel(e){
  if(!e) return '';
  if(e.rol==='coordinador') return 'Director';
  const f=entFunciones(e), ent=f.includes('entrenamiento'), nut=f.includes('nutricion');
  return ent&&nut?'Entrenador · Nutrición':nut?'Nutriólogo':'Entrenador';
}
function staffNutricionistas(){ return Object.values(DB.entrenadores||{}).filter(e=>e && e.rol!=='coordinador' && entHace(e,'nutricion')); }
function nutPuedeEditar(s){
  if(staffRol==='coordinador') return true;
  if(!staffActivoEntId) return false;
  if(s.nutriologoId===staffActivoEntId) return true;
  const propio=DB.entrenadores[staffActivoEntId];
  return s.entrenadorId===staffActivoEntId && entHace(propio,'nutricion');
}
function bloqueAsignacionStaff(s){
  if(staffRol!=='coordinador') return '';
  const activosDe = id => Object.values(DB.socios||{}).filter(x=>x&&x.entrenadorId===id&&x.status==='activo').length;
  const ents=Object.values(DB.entrenadores||{}).filter(e=>e&&e.rol!=='coordinador'&&entHace(e,'entrenamiento'));
  const entPropio=s.entrenadorId?DB.entrenadores[s.entrenadorId]:null;
  const entPropioNut=entPropio&&entHace(entPropio,'nutricion');
  return `<div class="sd-sec">Asignación de staff <small>Decisión interna — el socio no la ve</small></div>
    <div class="sd-body">
      <div class="f-row">
        <div class="f-grp"><label class="f-lbl">Entrenador</label>
          <select class="ti" onchange="entAsignar('${esc(s.code)}',this.value)">
            <option value="">Sin asignar</option>
            ${ents.map(e=>`<option value="${esc(e.id)}" ${s.entrenadorId===e.id?'selected':''}>${esc(e.nombre)} · ${activosDe(e.id)} activo${activosDe(e.id)===1?'':'s'}</option>`).join('')}
          </select>
        </div>
        <div class="f-grp"><label class="f-lbl">Nutriólogo</label>
          <select class="ti" onchange="nutAsignar('${esc(s.code)}',this.value)">
            <option value="">${entPropioNut?'Su entrenador ('+esc(entPropio.nombre)+')':'Sin asignar'}</option>
            ${staffNutricionistas().filter(e=>e.id!==s.entrenadorId).map(e=>`<option value="${esc(e.id)}" ${s.nutriologoId===e.id?'selected':''}>${esc(e.nombre)}${entHace(e,'entrenamiento')?' (también entrena)':''}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="f-nota">Mover a un socio de entrenador solo cambia quién ve y edita su ficha — su rutina, historial y datos se quedan igual.</div>
    </div>`;
}
function entAsignar(code,entId){
  if(staffRol!=='coordinador') return;
  const s=getSocio(code); if(!s) return;
  if(entId && DB.entrenadores[entId]){ s.entrenadorId=entId; s.asignado=DB.entrenadores[entId].nombre; }
  else { s.entrenadorId=''; s.asignado='Sin asignar'; }
  pqGuardarStaff(s,['entrenadorId','asignado']);
  staffRenderList(); staffRenderContent(s);
  showToast(s.entrenadorId?'🏋️ Reasignado a '+s.asignado:'🏋️ Entrenador: sin asignar');
}
function bloqueNutricionStaff(s){
  const nut=nutricionFinal(s), base=calcNutricion(s);
  const nutriEnt=s.nutriologoId?DB.entrenadores[s.nutriologoId]:null;
  const entPropio=s.entrenadorId?DB.entrenadores[s.entrenadorId]:null;
  const entPropioNut=entPropio&&entHace(entPropio,'nutricion');
  const asignadoTxt = nutriEnt?esc(nutriEnt.nombre)
    : entPropioNut?esc(entPropio.nombre)+' <span style="color:var(--mu);font-weight:500">(su entrenador)</span>'
    : '<span style="color:var(--mu)">Sin asignar</span>';
  const menu=comoArray(s.nutricion&&s.nutricion.menu);
  const puede=nutPuedeEditar(s);
  return `<div class="sd-sec">Nutrición <small>Nutriólogo: ${asignadoTxt}</small></div>
    <div class="sd-body">
      <div class="sd-note"><b>${nut.manual?'Ajustado por '+esc(s.nutricion.por||'staff')+(s.nutricion.fecha?' · '+esc(fmtFecha(s.nutricion.fecha)):''):'Cálculo automático'}:</b> ${nut.kcal} kcal · P ${nut.prot} g · C ${nut.carbs} g · G ${nut.grasas} g · Agua ${nut.agua} L
      ${nut.manual?`<br><span>Cálculo automático de referencia: ${base.kcal} kcal</span>`:`<br><span>BMR ${nut.bmr} × ${nut.factor} (${esc(nut.ajusteTxt)})</span>`}</div>
      ${(nut.manual&&s.nutricion.nota)?`<div class="pg-com" style="margin-top:10px">"${esc(s.nutricion.nota)}"</div>`:''}
      ${menu.length?`<div class="pg-k" style="margin:14px 0 6px">Menú sugerido</div>${menu.map(m=>`<div class="pg-mini"><span>${esc(m.nombre)}</span><b style="max-width:58%;text-align:right;font-weight:500;white-space:pre-line">${esc(m.detalle)}</b></div>`).join('')}`:''}
      ${puede?`<div class="pg-acts" style="margin-top:14px">
        <button type="button" class="sd-b p" onclick="nutAbrir('${esc(s.code)}')">🥗 ${nut.manual?'Editar nutrición':'Personalizar nutrición'}</button>
        ${nut.manual?`<button type="button" class="sd-b" onclick="nutRestablecer('${esc(s.code)}')">Restablecer automático</button>`:''}
      </div>`:''}
    </div>`;
}
function nutAsignar(code,nutId){
  if(staffRol!=='coordinador') return;
  const s=getSocio(code); if(!s) return;
  if(nutId && DB.entrenadores[nutId]){ s.nutriologoId=nutId; s.nutriologo=DB.entrenadores[nutId].nombre; }
  else { s.nutriologoId=''; s.nutriologo=''; }
  pqGuardarStaff(s,['nutriologoId','nutriologo']);
  staffRenderList(); staffRenderContent(s);
  showToast(s.nutriologo?'🥗 Nutrición asignada a '+s.nutriologo:'🥗 Nutrición: sin nutriólogo dedicado');
}
let nutMenuTemp=[];
function nutAbrir(code){
  const s=getSocio(code); if(!s||!nutPuedeEditar(s)){ showToast('No tienes permiso para editar la nutrición de este socio'); return; }
  const base=calcNutricion(s), o=s.nutricion||{};
  document.getElementById('nut-code').value=code;
  document.getElementById('nut-titulo').textContent='Nutrición · '+tc(s.nombre);
  document.getElementById('nut-kcal').value=o.override?o.kcal:base.kcal;
  document.getElementById('nut-prot').value=o.override?o.prot:base.prot;
  document.getElementById('nut-carbs').value=o.override?o.carbs:base.carbs;
  document.getElementById('nut-grasas').value=o.override?o.grasas:base.grasas;
  document.getElementById('nut-agua').value=o.override?o.agua:base.agua;
  document.getElementById('nut-nota').value=o.nota||'';
  nutMenuTemp=comoArray(o.menu).map(m=>({nombre:m.nombre||'',detalle:m.detalle||''}));
  nutRenderMenu();
  document.getElementById('modal-nutricion').classList.add('open');
}
function nutCerrar(){ document.getElementById('modal-nutricion').classList.remove('open'); }
function nutRenderMenu(){
  document.getElementById('nut-menu-list').innerHTML = nutMenuTemp.length ? nutMenuTemp.map((m,i)=>`
    <div class="nut-comida">
      <button type="button" class="nut-del" onclick="nutQuitarComida(${i})" aria-label="Quitar">✕</button>
      <input type="text" class="ti" style="min-height:44px;padding:0 14px;margin-bottom:6px" value="${esc(m.nombre)}" placeholder="Ej. Desayuno · 8:00 am" oninput="nutMenuTemp[${i}].nombre=this.value">
      <textarea class="ti" rows="2" placeholder="Ej. 3 claras + 1 huevo, avena con fruta, café solo" oninput="nutMenuTemp[${i}].detalle=this.value">${esc(m.detalle)}</textarea>
    </div>`).join('') : '<div class="q-sub" style="margin-bottom:10px">Aún no agregas comidas — es opcional, puedes dejar solo los requerimientos.</div>';
}
function nutAgregarComida(){ nutMenuTemp.push({nombre:'',detalle:''}); nutRenderMenu(); }
function nutQuitarComida(i){ nutMenuTemp.splice(i,1); nutRenderMenu(); }
function nutGuardar(){
  const code=document.getElementById('nut-code').value; const s=getSocio(code); if(!s||!nutPuedeEditar(s)) return;
  const v=id=>document.getElementById(id).value;
  const kcal=parseInt(v('nut-kcal')), prot=parseInt(v('nut-prot')), carbs=parseInt(v('nut-carbs')), grasas=parseInt(v('nut-grasas')), agua=parseFloat(v('nut-agua'));
  if(!(kcal>=800&&kcal<=6000)){ showToast('Revisa las calorías (800 a 6000)'); return; }
  if(!(prot>=0&&carbs>=0&&grasas>=0)){ showToast('Revisa los gramos de macros'); return; }
  const menu=nutMenuTemp.filter(m=>m.nombre.trim()||m.detalle.trim()).map(m=>({nombre:limpiarTexto(m.nombre),detalle:limpiarTexto(m.detalle)}));
  s.nutricion={ override:true, kcal,prot,carbs,grasas, agua: agua||calcNutricion(s).agua, nota:limpiarTexto(v('nut-nota')), menu, por:pqStaffNombre(), fecha:fechaISO(new Date()) };
  pqGuardarStaff(s,['nutricion']);
  nutCerrar(); staffRenderList(); staffRenderContent(s);
  showToast('🥗 Nutrición actualizada — el socio la verá al instante');
}
function nutRestablecer(code){
  const s=getSocio(code); if(!s||!nutPuedeEditar(s)) return;
  uiConfirm('¿Restablecer al cálculo automático? Se perderá el ajuste y el menú personalizado.',()=>{
    delete s.nutricion; pqGuardarStaff(s,['nutricion']);
    staffRenderList(); staffRenderContent(s);
    showToast('↺ Nutrición restablecida al cálculo automático');
  },{label:'Restablecer',danger:true});
}

function abrirEntrenadores(){
  if(staffRol!=='coordinador'){ showToast('Solo el director puede ver esta sección'); return; }
  staffActivoId=null; staffRenderList();
  const lista=Object.values(DB.entrenadores||{}).filter(e=>e && e.rol!=='coordinador')
    .sort((a,b)=>(a.nombre||'').localeCompare(b.nombre||''));
  const coords=Object.values(DB.entrenadores||{}).filter(e=>e && e.rol==='coordinador');
  const tarjeta=(t,esCoord)=>{
    const socios=esCoord?[]:sociosDeEntrenador(t.id);
    const activos=socios.filter(s=>s.status==='activo').length, pend=socios.filter(s=>s.status==='pendiente').length;
    const tieneFilo=t.filosofia && t.filosofia.tagline;
    return `<div style="border:1px solid var(--b);border-radius:12px;padding:16px;background:var(--gl);display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;margin-bottom:10px">
      <div style="flex:0 0 auto;${tieneFilo?'':'opacity:.25'}">${svgRadarFilosofia(t.filosofia,54)}</div>
      <div style="flex:1;min-width:220px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <div style="font-family:var(--fd);font-size:var(--fs-xl)">${esc(t.nombre)}</div>
          <span style="font-size:var(--fs-2xs);letter-spacing:.02em;color:var(--mu);font-family:var(--fb);border:1px solid var(--b);border-radius:10px;padding:2px 7px">${esc(entTipoLabel(t)).toUpperCase()}</span>
          <span style="font-size:var(--fs-2xs);letter-spacing:.02em;color:var(--mu);font-family:var(--fb)">usuario: ${esc(t.id)}</span>
        </div>
        <div style="font-size:var(--fs-xs);margin:5px 0;${tieneFilo?'color:var(--v);font-style:italic':'color:var(--mu)'}">${tieneFilo?'"'+esc(t.filosofia.tagline)+'"':'Sin filosofía definida todavía'}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${(t.especialidades||[]).map(s=>`<span style="font-size:var(--fs-2xs);text-transform:uppercase;letter-spacing:.03em;background:var(--in-bg2);border:1px solid var(--b);color:var(--mu);padding:2px 7px;border-radius:20px">${esc(s)}</span>`).join('')||'<span style="font-size:var(--fs-2xs);color:var(--mu)">Sin especialidades registradas</span>'}</div>
        ${esCoord?'':`<div style="font-size:var(--fs-2xs);color:var(--mu);font-family:var(--fb)">${socios.length} socio${socios.length===1?'':'s'} asignado${socios.length===1?'':'s'} · ${activos} activos · ${pend} pendientes</div>`}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button onclick="abrirEditarEntrenador('${esc(t.id)}')" style="padding:7px 12px;border:1px solid var(--b);border-radius:7px;background:none;color:var(--tx);font-size:var(--fs-2xs);cursor:pointer">✎ Editar</button>
        ${esCoord?'':`<button onclick="abrirMiFilosofia('${esc(t.id)}')" style="padding:7px 12px;border:1px solid color-mix(in srgb,var(--p) 35%,transparent);border-radius:7px;background:none;color:var(--p);font-size:var(--fs-2xs);cursor:pointer">🧬 ${tieneFilo?'Editar':'Llenar'} filosofía</button>`}
        ${esCoord?'':`<button onclick="confirmarEliminarEntrenador('${esc(t.id)}')" style="padding:7px 12px;border:1px solid color-mix(in srgb,var(--r) 30%,transparent);border-radius:7px;background:none;color:var(--r);font-size:var(--fs-2xs);cursor:pointer">🗑 Eliminar</button>`}
      </div>
    </div>`;
  };
  document.getElementById('staff-content').innerHTML=`
    <div style="padding:22px;max-width:820px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <h2 style="font-family:var(--fd);font-size:var(--fs-5xl);margin:0">Entrenadores</h2>
        <button class="tb-btn" onclick="abrirNuevoEntrenador()" style="padding:9px 14px;color:var(--v);border-color:color-mix(in srgb, var(--v) 30%, transparent)">➕ Nuevo entrenador</button>
      </div>
      <p style="font-size:var(--fs-xs);color:var(--mu);margin:4px 0 18px">${lista.length} entrenador${lista.length===1?'':'es'}${coords.length?' · '+coords.length+' director'+(coords.length===1?'':'es'):''}</p>
      ${lista.length?lista.map(t=>tarjeta(t,false)).join(''):'<p style="font-size:var(--fs-xs);color:var(--mu)">Aún no hay entrenadores dados de alta.</p>'}
      ${coords.length?`<h3 style="font-family:var(--fd);font-size:var(--fs-lg);margin:22px 0 8px;color:var(--mu)">Coordinación</h3>${coords.map(t=>tarjeta(t,true)).join('')}`:''}
    </div>`;
}
// Compara especialidades ignorando emoji, mayúsculas y espacios — así "Tenis" y "🎾 TENIS" son la misma
function normEsp(s){ return String(s||'').toLowerCase().replace(/[^\p{L}\p{N} ]/gu,'').trim(); }
function abrirEditarEntrenador(id){
  if(staffRol!=='coordinador'){ showToast('Solo el director puede editar entrenadores'); return; }
  const t=DB.entrenadores[id]; if(!t) return;
  document.getElementById('ee-titulo').textContent=t.nombre;
  document.getElementById('ee-id').value=id;
  document.getElementById('ee-nombre').value=t.nombre||'';
  document.getElementById('ee-pass').value='';
  document.getElementById('ee-func-ent').classList.toggle('ck', entHace(t,'entrenamiento'));
  document.getElementById('ee-func-nut').classList.toggle('ck', entHace(t,'nutricion'));
  const cont=document.getElementById('ee-especialidades');
  const todas=[...DEPORTES.map(d=>d.emoji+' '+d.nm),'🏋️ Fuerza','🤸 Funcional','🏥 Rehabilitación'];
  const clavesLista=todas.map(normEsp);
  const actuales=(t.especialidades||[]);
  const actualesKeys=new Set(actuales.map(normEsp));
  const otras=actuales.filter(e=>!clavesLista.includes(normEsp(e))); // especialidades propias que no están en la lista fija (no se pierden)
  cont.innerHTML=todas.map(nm=>`<div class="chk ${actualesKeys.has(normEsp(nm))?'ck':''}" onclick="this.classList.toggle('ck')">${esc(nm)}</div>`).join('');
  document.getElementById('ee-otras').value=otras.join(', ');
  document.getElementById('modal-editar-ent').classList.add('open');
}
function cerrarModalEditarEnt(){ document.getElementById('modal-editar-ent').classList.remove('open'); }
async function guardarEdicionEntrenador(){
  if(staffRol!=='coordinador'){ showToast('Solo el director puede editar entrenadores'); return; }
  const id=document.getElementById('ee-id').value;
  const t=DB.entrenadores[id]; if(!t) return;
  const nombre=limpiarTexto(document.getElementById('ee-nombre').value);
  if(!nombre){ showToast('El nombre no puede quedar vacío'); return; }
  const funciones=[document.getElementById('ee-func-ent').classList.contains('ck')?'entrenamiento':null, document.getElementById('ee-func-nut').classList.contains('ck')?'nutricion':null].filter(Boolean);
  if(!funciones.length){ showToast('Elige al menos una función: entrenamiento o nutrición'); return; }
  t.nombre=nombre; t.funciones=funciones;
  const pass=document.getElementById('ee-pass').value.trim();
  if(pass){
    if(t.uid){ showToast('ℹ️ La contraseña de un acceso existente se cambia en Firebase → Authentication'); }
    else if(pass.length<6){ showToast('La contraseña debe tener al menos 6 caracteres'); return; }
    else{
      try{ t.uid=await fbCrearAccesoStaff(id,pass,'entrenador'); delete t.pass; showToast('🔐 Acceso seguro creado para '+nombre); }
      catch(e){ showToast('❌ '+msgErrorAcceso(e)); return; }
    }
  }
  const marcadas=[...document.querySelectorAll('#ee-especialidades .chk.ck')].map(e=>e.textContent.trim());
  const otras=limpiarTexto(document.getElementById('ee-otras').value).split(',').map(x=>x.trim()).filter(Boolean);
  t.especialidades=[...marcadas,...otras];
  // Reflejar el nombre en los socios que ya lo tenían asignado
  sociosDeEntrenador(id).forEach(s=>{ s.asignado=nombre; dbSaveStaff(s.code); });
  dbSaveEntrenador(id);
  cerrarModalEditarEnt();
  abrirEntrenadores();
  showToast('✓ Entrenador actualizado');
}
function confirmarEliminarEntrenador(id){
  if(staffRol!=='coordinador'){ showToast('Solo el director puede eliminar entrenadores'); return; }
  const t=DB.entrenadores[id]; if(!t) return;
  const socios=sociosDeEntrenador(id);
  const aviso=socios.length
    ? `Tiene ${socios.length} socio(s) asignado(s) — quedarán SIN entrenador asignado (sus rutinas no se borran). `
    : '';
  uiConfirm(`¿Eliminar a ${t.nombre}? ${aviso}`,
    ()=>uiPrompt('Para confirmar, escribe ELIMINAR','ELIMINAR',()=>confirmarEliminarEntrenadorFinal(id),{label:'Eliminar'}),
    {label:'Continuar',danger:true});
}
function confirmarEliminarEntrenadorFinal(id){
  if(staffRol!=='coordinador'){ showToast('Solo el director puede eliminar entrenadores'); return; }
  const t=DB.entrenadores[id]; if(!t) return;
  const socios=sociosDeEntrenador(id);
  socios.forEach(s=>{ s.entrenadorId=''; s.asignado='Sin asignar'; dbSaveStaff(s.code); });
  delete DB.entrenadores[id];
  guardarLocal();
  OUTBOX=OUTBOX.filter(x=>!(x.path==='/entrenadores/'+id && x.op==='set')); outGuardar();
  if(t.uid && fbListo){ fbDB.ref('/roles/'+t.uid).remove().catch(()=>{}); }   // revoca el acceso al panel
  fbEncolar('/entrenadores/'+id,'remove',null);
  abrirEntrenadores();
  showToast('🗑 Entrenador eliminado'+(socios.length?' — reasigna a sus socios cuando puedas':''));
}
