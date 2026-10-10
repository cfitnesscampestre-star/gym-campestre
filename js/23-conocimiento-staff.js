/* ═══ conocimiento staff ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// BASE DE CONOCIMIENTO — consulta para staff; lineamientos editables por coordinación
// ═════════════════════════════════════════

// ═════════════════════════════════════════
// CONOCIMIENTO PROPIO — lo que agrega el coordinador
// Se guarda en /config/kb y se mezcla con el catálogo base.
// ═════════════════════════════════════════
let KB_PRINCIPIOS_BASE=null;
const KB_LESIONES_OPC=['rodilla','lumbar','hombro','cadera','cuello'];
function kbExtra(){
  DB.config=DB.config||{};
  const k=DB.config.kb=(DB.config.kb&&typeof DB.config.kb==='object')?DB.config.kb:{};
  ['principios','ejercicios','metodos','notas'].forEach(x=>{ if(!k[x]||typeof k[x]!=='object') k[x]={}; });
  return k;
}
function kbAplicarExtra(){
  if(!KB_PRINCIPIOS_BASE) KB_PRINCIPIOS_BASE=KB_PRINCIPIOS.slice();
  const k=kbExtra();
  // principios
  KB_PRINCIPIOS.length=0; KB_PRINCIPIOS_BASE.forEach(p=>KB_PRINCIPIOS.push(p));
  Object.values(k.principios).forEach(p=>{ if(p&&p.t) KB_PRINCIPIOS.push(String(p.t)); });
  // ejercicios
  for(let i=KB_EJERCICIOS.length-1;i>=0;i--) if(KB_EJERCICIOS[i]._custom) KB_EJERCICIOS.splice(i,1);
  Object.entries(k.ejercicios).forEach(([id,e])=>{
    if(!e||!e.nm) return;
    KB_EJERCICIOS.push({id, nm:String(e.nm), ms:String(e.ms||''), z:KB_ZONAS[e.z]?e.z:'maquina', t:e.t==='a'?'a':'c',
      enf:e.enf||'', ev:comoArray(e.ev), aka:comoArray(e.aka), alt:{}, tip:e.tip||'', series:parseInt(e.series)||3,
      reps:e.reps||'12 reps — hipertrofia', peso:e.peso||'Moderado', iso:!!e.iso, tt:e.iso?[20,30,45]:undefined, _custom:true});
  });
  Object.keys(KB_IDX).forEach(x=>delete KB_IDX[x]);
  KB_EJERCICIOS.forEach(e=>{ KB_IDX[e.id]=e; });
  // métodos
  Object.keys(KB_METODOS).forEach(id=>{ if(KB_METODOS[id]._custom) delete KB_METODOS[id]; });
  Object.entries(k.metodos).forEach(([id,m])=>{
    if(!m||!m.nm) return;
    KB_METODOS[id]={nm:String(m.nm), nivel:Math.min(3,Math.max(1,parseInt(m.nivel)||1)), fatiga:Math.min(3,Math.max(1,parseInt(m.fatiga)||2)),
      aplica:['compuesto','aislamiento','ambos'].includes(m.aplica)?m.aplica:'ambos', pareja:!!m.pareja, obj:String(m.obj||'FHR'),
      como:String(m.como||''), reps:m.reps||undefined, series:parseInt(m.series)||undefined, _custom:true};
  });
}
function kbNuevoId(pref,nm){
  const slug=String(nm||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,24)||'item';
  return pref+'_'+slug+'_'+Math.random().toString(36).slice(2,6);
}
function kbGuardar(msg){
  kbAplicarExtra(); guardarLocal();
  const fin=()=>{ abrirConocimiento(); };
  const payload=limpio(kbExtra()); payload._v=1;   // _v evita que Firebase deje la rama vacía (y la rechace)
  fbEncolar('/config/kb','set',payload,{ok:()=>showToast('📚 '+msg)});
  if(estaSinConexion() || !fbListo) showToast('📚 '+msg+' · se subirá al volver la conexión');
  fin();
}
function kbModal(titulo,cuerpo,onSave){
  document.getElementById('kb-m-titulo').textContent=titulo;
  document.getElementById('kb-m-cuerpo').innerHTML=cuerpo;
  document.getElementById('kb-m-guardar').setAttribute('onclick',onSave);
  document.getElementById('modal-kb').classList.add('open');
}
function kbCerrar(){ document.getElementById('modal-kb').classList.remove('open'); }
const kbV=id=>document.getElementById(id).value;
function kbChips(sel,clase){ return [...document.querySelectorAll('#modal-kb .'+clase+'.ck')].map(e=>e.dataset.v); }

// ── Principios ──
function kbAgregarPrincipio(){
  if(staffRol!=='coordinador') return;
  const t=limpiarTexto(kbV('kb-nuevo-principio')); if(t.length<8){ showToast('Escribe el principio completo'); return; }
  kbExtra().principios[kbNuevoId('p',t)]={t};
  kbGuardar('Principio agregado');
}
function kbEliminarPrincipio(id){
  if(staffRol!=='coordinador') return;
  uiConfirm('¿Quitar este principio?',()=>{ delete kbExtra().principios[id]; kbGuardar('Principio eliminado'); },{label:'Quitar',danger:true});
}
// ── Notas / descripciones ──
function kbFormNota(id){
  const n=id?kbExtra().notas[id]:null;
  kbModal(n?'Editar nota':'Agregar nota',
    `<input type="hidden" id="kn-id" value="${esc(id||'')}">
     <div class="f-grp"><label class="f-lbl" for="kn-t">Título</label><input class="ti" id="kn-t" maxlength="80" value="${esc(n?n.t:'')}" placeholder="Ej. Protocolo para adultos mayores"></div>
     <div class="f-grp"><label class="f-lbl" for="kn-x">Descripción</label><textarea class="ti" id="kn-x" rows="7" placeholder="Criterios, reglas, explicaciones o cualquier información que el sistema deba considerar.">${esc(n?n.x:'')}</textarea></div>
     <div class="f-nota">Estas notas se envían a la IA junto con los principios, métodos y ejercicios cuando genera una rutina, y todo el staff las puede consultar.</div>`,
    'kbGuardarNota()');
}
function kbGuardarNota(){
  const t=limpiarTexto(kbV('kn-t')), x=kbV('kn-x').trim();
  if(!t||!x){ showToast('Completa el título y la descripción'); return; }
  const id=kbV('kn-id')||kbNuevoId('n',t);
  kbExtra().notas[id]={t,x}; kbCerrar(); kbGuardar('Nota guardada');
}
function kbEliminarNota(id){ if(staffRol!=='coordinador') return; uiConfirm('¿Eliminar esta nota?',()=>{ delete kbExtra().notas[id]; kbGuardar('Nota eliminada'); },{label:'Eliminar',danger:true}); }
// ── Métodos ──
function kbFormMetodo(id){
  const m=id?kbExtra().metodos[id]:null;
  const objs=String(m?m.obj:'FH');
  kbModal(m?'Editar método':'Agregar método de intensidad',
    `<input type="hidden" id="km-id" value="${esc(id||'')}">
     <div class="f-grp"><label class="f-lbl" for="km-nm">Nombre del método</label><input class="ti" id="km-nm" maxlength="60" value="${esc(m?m.nm:'')}" placeholder="Ej. Series 5-4-3-2-1"></div>
     <div class="f-row">
       <div class="f-grp"><label class="f-lbl" for="km-nivel">Nivel mínimo</label><select class="ti" id="km-nivel">${[[1,'Principiante'],[2,'Intermedio'],[3,'Avanzado']].map(([v,n])=>`<option value="${v}" ${(m?+m.nivel:2)===v?'selected':''}>${n}</option>`).join('')}</select></div>
       <div class="f-grp"><label class="f-lbl" for="km-fatiga">Fatiga</label><select class="ti" id="km-fatiga">${[[1,'Baja'],[2,'Media'],[3,'Alta']].map(([v,n])=>`<option value="${v}" ${(m?+m.fatiga:2)===v?'selected':''}>${n}</option>`).join('')}</select></div>
     </div>
     <div class="f-grp"><label class="f-lbl" for="km-aplica">Se aplica en</label><select class="ti" id="km-aplica">${[['ambos','Cualquier ejercicio'],['compuesto','Ejercicios compuestos'],['aislamiento','Ejercicios de aislamiento']].map(([v,n])=>`<option value="${v}" ${(m?m.aplica:'ambos')===v?'selected':''}>${n}</option>`).join('')}</select></div>
     <div class="f-grp"><label class="f-lbl">Objetivos donde encaja</label><div class="chk-grid">${[['F','Fuerza'],['H','Hipertrofia'],['R','Resistencia / pérdida de peso']].map(([v,n])=>`<div class="chk km-obj ${objs.includes(v)?'ck':''}" data-v="${v}" onclick="this.classList.toggle('ck')">${n}</div>`).join('')}</div></div>
     <div class="f-grp"><div class="chk km-par ${m&&m.pareja?'ck':''}" data-v="1" onclick="this.classList.toggle('ck')">Encadena 2 o más ejercicios (superserie, circuito…)</div></div>
     <div class="f-row">
       <div class="f-grp"><label class="f-lbl" for="km-series">Series (opcional)</label><input type="number" class="ti" id="km-series" min="1" max="10" value="${m&&m.series?m.series:''}"></div>
       <div class="f-grp"><label class="f-lbl" for="km-reps">Repeticiones (opcional)</label><input class="ti" id="km-reps" maxlength="40" value="${esc(m&&m.reps||'')}" placeholder="Ej. 10-8-6"></div>
     </div>
     <div class="f-grp"><label class="f-lbl" for="km-como">Cómo se ejecuta</label><textarea class="ti" id="km-como" rows="4" placeholder="Explica el método como se lo explicarías al socio.">${esc(m?m.como:'')}</textarea></div>`,
    'kbGuardarMetodo()');
}
function kbGuardarMetodo(){
  const nm=limpiarTexto(kbV('km-nm')), como=kbV('km-como').trim();
  if(!nm||!como){ showToast('Completa el nombre y cómo se ejecuta'); return; }
  const obj=kbChips('','km-obj').join('')||'FHR';
  const id=kbV('km-id')||kbNuevoId('m',nm);
  kbExtra().metodos[id]={nm,nivel:+kbV('km-nivel'),fatiga:+kbV('km-fatiga'),aplica:kbV('km-aplica'),obj,pareja:kbChips('','km-par').length>0,
    como, reps:limpiarTexto(kbV('km-reps')), series:parseInt(kbV('km-series'))||0};
  kbCerrar(); kbGuardar('Método guardado');
}
function kbEliminarMetodo(id){ if(staffRol!=='coordinador') return; uiConfirm('¿Eliminar este método? Las rutinas que ya lo usan lo conservan.',()=>{ delete kbExtra().metodos[id]; kbGuardar('Método eliminado'); },{label:'Eliminar',danger:true}); }
// ── Ejercicios ──
function kbFormEjercicio(id){
  const e=id?kbExtra().ejercicios[id]:null;
  const ev=e?comoArray(e.ev):[];
  kbModal(e?'Editar ejercicio':'Agregar ejercicio',
    `<input type="hidden" id="ke-id" value="${esc(id||'')}">
     <div class="f-grp"><label class="f-lbl" for="ke-nm">Nombre del ejercicio</label><input class="ti" id="ke-nm" maxlength="70" value="${esc(e?e.nm:'')}" placeholder="Ej. Press Arnold"></div>
     <div class="f-grp"><label class="f-lbl" for="ke-ms">Músculos que trabaja</label><input class="ti" id="ke-ms" maxlength="70" value="${esc(e?e.ms:'')}" placeholder="Ej. Deltoides · Tríceps"></div>
     <div class="f-row">
       <div class="f-grp"><label class="f-lbl" for="ke-enf">Enfoque muscular</label><select class="ti" id="ke-enf">${Object.entries(KB_ENFOQUES).map(([k,n])=>`<option value="${k}" ${(e?e.enf:'pecho')===k?'selected':''}>${esc(n)}</option>`).join('')}</select></div>
       <div class="f-grp"><label class="f-lbl" for="ke-z">Zona del gimnasio</label><select class="ti" id="ke-z">${Object.entries(KB_ZONAS).map(([k,n])=>`<option value="${k}" ${(e?e.z:'mancuernas')===k?'selected':''}>${esc(n)}</option>`).join('')}</select></div>
     </div>
     <div class="f-grp"><label class="f-lbl" for="ke-t">Tipo</label><select class="ti" id="ke-t"><option value="c" ${!e||e.t!=='a'?'selected':''}>Compuesto (varias articulaciones)</option><option value="a" ${e&&e.t==='a'?'selected':''}>Aislamiento (un músculo)</option></select></div>
     <div class="f-row">
       <div class="f-grp"><label class="f-lbl" for="ke-series">Series sugeridas</label><input type="number" class="ti" id="ke-series" min="1" max="10" value="${e&&e.series?e.series:3}"></div>
       <div class="f-grp"><label class="f-lbl" for="ke-reps">Repeticiones sugeridas</label><input class="ti" id="ke-reps" maxlength="40" value="${esc(e&&e.reps||'12 reps — hipertrofia')}"></div>
     </div>
     <div class="f-grp"><label class="f-lbl" for="ke-peso">Carga sugerida</label><input class="ti" id="ke-peso" maxlength="40" value="${esc(e&&e.peso||'Moderado')}" placeholder="Ej. Moderado — 55% 1RM"></div>
     <div class="f-grp"><label class="f-lbl" for="ke-tip">Descripción / nota propioceptiva</label><textarea class="ti" id="ke-tip" rows="4" placeholder="Dónde sentir el estímulo, ángulo, errores comunes…">${esc(e&&e.tip||'')}</textarea></div>
     <div class="f-grp"><label class="f-lbl">Evitar si el socio tiene lesión en</label><div class="chk-grid">${KB_LESIONES_OPC.map(l=>`<div class="chk ke-ev ${ev.includes(l)?'ck':''}" data-v="${l}" onclick="this.classList.toggle('ck')">${sc(l)}</div>`).join('')}</div></div>
     <div class="f-grp"><label class="f-lbl" for="ke-aka">Otros nombres (separados por coma)</label><input class="ti" id="ke-aka" maxlength="120" value="${esc(e?comoArray(e.aka).join(', '):'')}" placeholder="Ayuda a reconocerlo en rutinas ya escritas"></div>
     <div class="f-nota">Los ejercicios que agregas se usan en las rutinas nuevas (como ejercicios extra del día según su enfoque), como opción cuando el área está ocupada y en las indicaciones que recibe la IA.</div>`,
    'kbGuardarEjercicio()');
}
function kbGuardarEjercicio(){
  const nm=limpiarTexto(kbV('ke-nm')), ms=limpiarTexto(kbV('ke-ms'));
  if(!nm||!ms){ showToast('Completa el nombre y los músculos'); return; }
  const id=kbV('ke-id');
  const dup=KB_EJERCICIOS.find(x=>x.id!==id && kbNorm(x.nm)===kbNorm(nm));
  if(dup){ showToast('Ya existe un ejercicio con ese nombre en el catálogo'); return; }
  kbExtra().ejercicios[id||kbNuevoId('c',nm)]={nm,ms,enf:kbV('ke-enf'),z:kbV('ke-z'),t:kbV('ke-t'),series:parseInt(kbV('ke-series'))||3,
    reps:limpiarTexto(kbV('ke-reps'))||'12 reps — hipertrofia', peso:limpiarTexto(kbV('ke-peso'))||'Moderado', tip:kbV('ke-tip').trim(),
    ev:kbChips('','ke-ev'), aka:limpiarTexto(kbV('ke-aka')).split(',').map(x=>x.trim()).filter(Boolean)};
  kbCerrar(); kbGuardar('Ejercicio guardado');
}
function kbEliminarEjercicio(id){ if(staffRol!=='coordinador') return; uiConfirm('¿Eliminar este ejercicio del catálogo? Las rutinas que ya lo tienen lo conservan.',()=>{ delete kbExtra().ejercicios[id]; kbGuardar('Ejercicio eliminado'); },{label:'Eliminar',danger:true}); }

// ── Ejercicios extra del catálogo propio dentro de la rutina de plantilla ──
const KB_DIA_ENF=[
  ['pierna',['cuadriceps','gluteo','femoral','pantorrilla']],
  ['pecho',['pecho','pecho_sup','triceps']],
  ['espalda',['dorsal','espalda_media','biceps','braquial','trapecio']],
  ['hombro',['deltoide','deltoide_lat','deltoide_post','trapecio','manguito','core','abdomen']],
  ['torso',['pecho','pecho_sup','dorsal','espalda_media','deltoide','deltoide_lat','biceps','triceps']],
  ['full body',['cuadriceps','gluteo','femoral','pecho','dorsal','espalda_media','deltoide','core']],
  ['funcional',['cuadriceps','gluteo','femoral','pecho','dorsal','espalda_media','deltoide','core']],
  ['cardio',['cardio']],
  ['accesorios',['core','abdomen','biceps','triceps','deltoide_lat','pantorrilla']],
];
function kbExtrasParaDia(tipoMin,yaEnDia,semilla){
  const custom=KB_EJERCICIOS.filter(e=>e._custom); if(!custom.length) return [];
  const par=KB_DIA_ENF.find(([k])=>tipoMin.includes(k)); if(!par) return [];
  const les=lesionKeys(qAnswers.limitaciones||[]);
  const usados=new Set(yaEnDia.map(x=>kbNorm(x.nombre)));
  const cand=custom.filter(e=>par[1].includes(e.enf) && !usados.has(kbNorm(e.nm)) && !(e.ev||[]).some(l=>les.includes(l)));
  if(!cand.length) return [];
  const rnd=prng(semilla+'|'+tipoMin);
  cand.sort(()=>rnd()-0.5);
  return cand.slice(0,2).map(e=>({nombre:e.nm,series:e.series,reps:e.reps,peso:e.peso,musculo:e.ms,tip:e.tip||'Siente este músculo durante el movimiento.',enf:e.enf}));
}

// ── Pantalla de conocimiento ──
function abrirConocimiento(){
  staffActivoId=null; staffRenderList();
  const esCoord=staffRol==='coordinador';
  const k=kbExtra();
  const nivelTxt=['','Principiante+','Intermedio+','Avanzado'];
  const fatTxt=['','Baja','Media','Alta'];
  const cuentaZona={}; KB_EJERCICIOS.forEach(e=>cuentaZona[e.z]=(cuentaZona[e.z]||0)+1);
  const btnAdd=(fn,txt)=>esCoord?`<button class="tb-btn" style="margin-top:10px" onclick="${fn}">+ ${txt}</button>`:'';
  const acciones=(ed,del)=>esCoord?`<span style="float:right;display:inline-flex;gap:6px"><button class="kb-mini" onclick="${ed}" aria-label="Editar">Editar</button><button class="kb-mini kb-del" onclick="${del}" aria-label="Eliminar">Quitar</button></span>`:'';
  const principiosCustom=Object.entries(k.principios).filter(([,p])=>p&&p.t);
  const notas=Object.entries(k.notas).filter(([,n])=>n&&n.t);
  document.getElementById('staff-content').innerHTML=`
  <div style="padding:22px;max-width:900px">
    <h2 style="font-family:var(--fd);font-size:var(--fs-5xl);margin:0">Base de conocimiento</h2>
    <p style="font-size:var(--fs-sm);color:var(--mu);margin:4px 0 16px;line-height:1.5">Lo que consulta el sistema al crear cada rutina, junto con la filosofía del entrenador elegido. ${KB_EJERCICIOS.length} ejercicios, ${Object.keys(KB_METODOS).length} métodos de intensidad, ${KB_CLASES_GRUPALES.length} clases grupales, ${KB_PRINCIPIOS.length} principios y ${notas.length} nota(s).${esCoord?' Como director puedes agregar lo que falte.':''}</p>

    <h3 class="kb-h">Lineamientos del director</h3>
    <p class="kb-p">Reglas del club que la IA debe cumplir en todas las rutinas, por encima de la filosofía de cada entrenador.</p>
    ${esCoord
      ? `<textarea id="kb-lineamientos" rows="5" class="ti" style="padding:12px;resize:vertical" placeholder="Ej. Toda rutina de pierna lleva trabajo de glúteo medio.">${esc(DB.config&&DB.config.lineamientos&&DB.config.lineamientos.trim()||'')}</textarea>
         <button class="tb-btn" style="margin-top:8px" onclick="guardarLineamientos()">Guardar lineamientos</button>`
      : `<div style="font-size:var(--fs-sm);line-height:1.6;white-space:pre-wrap;padding:12px;border:1px solid var(--b);border-radius:12px">${esc(DB.config&&DB.config.lineamientos&&DB.config.lineamientos.trim()||'Sin lineamientos todavía.')}</div>`}

    <h3 class="kb-h">Notas y descripciones</h3>
    <p class="kb-p">Información libre que el sistema debe tener presente: protocolos, criterios, explicaciones.</p>
    ${notas.length?notas.map(([id,n])=>`<div class="kb-card">${acciones(`kbFormNota('${id}')`,`kbEliminarNota('${id}')`)}<div style="font-weight:700;font-size:var(--fs-md)">${esc(n.t)}</div><div style="font-size:var(--fs-sm);line-height:1.55;white-space:pre-wrap;margin-top:4px">${esc(n.x)}</div></div>`).join(''):'<div class="kb-vacio">Aún no hay notas.</div>'}
    ${btnAdd('kbFormNota()','Agregar nota')}

    <h3 class="kb-h">Principios del club</h3>
    <ol style="font-size:var(--fs-md);line-height:1.65;padding-left:20px;margin:0">${KB_PRINCIPIOS_BASE.map(p=>`<li>${esc(p)}</li>`).join('')}${principiosCustom.map(([id,p])=>`<li>${esc(p.t)} <button class="kb-mini kb-del" onclick="kbEliminarPrincipio('${id}')">Quitar</button></li>`).join('')}</ol>
    ${esCoord?`<div style="display:flex;gap:8px;margin-top:10px"><input class="ti" id="kb-nuevo-principio" maxlength="240" placeholder="Escribe un principio nuevo" style="min-height:46px"><button class="tb-btn" onclick="kbAgregarPrincipio()">Agregar</button></div>`:''}

    <h3 class="kb-h">Métodos de intensidad</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:8px">
      ${Object.entries(KB_METODOS).map(([id,M])=>`<div class="kb-card" style="margin:0">
        ${M._custom?acciones(`kbFormMetodo('${id}')`,`kbEliminarMetodo('${id}')`):''}
        <div style="font-weight:700;font-size:var(--fs-md)">${esc(M.nm)}${M._custom?' <span class="kb-tag">Agregado</span>':''}</div>
        <div style="font-size:var(--fs-sm);color:var(--mu);margin:2px 0 6px">${nivelTxt[M.nivel]} · fatiga ${fatTxt[M.fatiga].toLowerCase()}${M.pareja?' · encadenado':''}</div>
        <div style="font-size:var(--fs-sm);line-height:1.5">${esc(M.como)}</div></div>`).join('')}
    </div>
    ${btnAdd('kbFormMetodo()','Agregar método')}

    <h3 class="kb-h">Clases grupales del club</h3>
    <p class="kb-p">De qué trata cada clase, para que el sistema NO programe el mismo enfoque muscular el día antes, el mismo día o el día después de una clase que ya toma el socio — así se evita sobrecargar sin que tenga que decírtelo. Se usa cuando un socio marca en el cuestionario que toma clases además del gimnasio.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px">
      ${KB_CLASES_GRUPALES.map(c=>`<div class="kb-card" style="margin:0">
        <div style="font-weight:700;font-size:var(--fs-md)">${esc(c.nm)}</div>
        <div style="font-size:var(--fs-sm);color:var(--mu);margin:2px 0 6px">${esc(c.tipo)} · impacto ${esc(c.impacto)} · ${c.enfoque.map(e=>esc(KB_ENFOQUES[e]||e)).join(', ')}</div>
        <div style="font-size:var(--fs-sm);line-height:1.5">${esc(c.desc)}</div></div>`).join('')}
    </div>

    <h3 class="kb-h">Catálogo por zona del gimnasio</h3>
    <p class="kb-p">Las opciones por área ocupada se eligen de preferencia en otra zona.</p>
    ${Object.entries(KB_ZONAS).map(([z,nm])=>`<details style="border-bottom:1px solid var(--b);padding:9px 0"><summary style="cursor:pointer;font-size:var(--fs-md);font-weight:600">${esc(nm)} <span style="color:var(--mu);font-size:var(--fs-sm);font-weight:500">(${cuentaZona[z]||0})</span></summary>
      <div style="font-size:var(--fs-sm);line-height:1.75;padding:6px 0 4px">${KB_EJERCICIOS.filter(e=>e.z===z).map(e=>`<div>${e._custom?acciones(`kbFormEjercicio('${e.id}')`,`kbEliminarEjercicio('${e.id}')`):''}<b>${esc(e.nm)}</b>${e._custom?' <span class="kb-tag">Agregado</span>':''} <span style="color:var(--mu)">— ${esc(e.ms)}</span></div>`).join('')||'<span style="color:var(--mu)">Sin ejercicios</span>'}</div></details>`).join('')}
    ${btnAdd('kbFormEjercicio()','Agregar ejercicio')}
  </div>`;
}
function guardarLineamientos(){
  if(staffRol!=='coordinador') return;
  const v=document.getElementById('kb-lineamientos').value.trim();
  DB.config=DB.config||{}; DB.config.lineamientos=v;
  guardarLocal();
  fbEncolar('/config/lineamientos','set',v||' ',{ok:()=>showToast('📚 Lineamientos guardados — se aplican a las próximas rutinas')});
  if(estaSinConexion() || !fbListo) showToast('📚 Lineamientos guardados · se subirán al volver la conexión');
}
