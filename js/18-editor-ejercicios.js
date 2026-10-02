/* ═══ editor ejercicios ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// EDITOR RÁPIDO DE EJERCICIO — se elige del catálogo y series/repeticiones/descanso/método
// se ajustan con un toque (todo sigue pudiéndose escribir a mano).
// ═════════════════════════════════════════
function staffKindEj(e){ return esEjCardio(e)?'cardio':esEjRondas(e)?'rondas':esEjMovilidad(e)?'mov':esEjIsometrico(e)?'iso':'fuerza'; }
const ST_DESC=[['30 s','30 s'],['45 s','45 s'],['60 s','60 s'],['90 s','90 s'],['2 min','2 min'],['3 min','3 min'],['Libre','Autorregulado (~90 s)']];
const ST_PESOS=['Ligero — 30% 1RM','Moderado — 55% 1RM','Pesado — 75% 1RM','Corporal','Banda — resistencia media','Sin carga','Carga progresiva'];
function stNum(txt){ const m=String(txt||'').match(/\d+/); return m?parseInt(m[0]):null; }
function stChips(code,k,ei,grupo,opts,actual,fn){
  return opts.map(([lb,v])=>`<button type="button" class="ch${String(actual)===String(v)?' on':''}" data-g="${grupo}" onclick="${fn}('${code}','${k}',${ei},'${esc(String(v))}',this)">${esc(String(lb))}</button>`).join('');
}
function staffEjEditorHTML(s,k,d,e,ei){
  const code=s.code, kind=staffKindEj(e);
  const kb=kbBuscar(e.nm||''), les=lesionKeys(s.limitaciones||[]);
  const malLes=kb?(kb.ev||[]).filter(l=>les.includes(l)):[];
  const nombre=e.nm?esc(e.nm):'Elegir ejercicio…';
  const sub=[e.ms||'', kb&&KB_ZONAS[kb.z]?KB_ZONAS[kb.z]:''].filter(Boolean).join(' · ');
  const tag={cardio:'💓 Cardio continuo — minutos fijos del plan; la FC objetivo se calcula con la edad y el objetivo del socio',
             rondas:'💓 Por rondas — repeticiones (o segundos) y FC al terminar cada ronda en lugar de peso',
             iso:'⏱ Isométrico — se mide por tiempo: rondas × segundos por ronda',
             mov:'🧘 Movilidad — sin carga; se le explica al socio para qué es'}[kind]||'';
  const nRep=stNum(e.reps);
  let repOpts=[], repLbl='Repeticiones', repPh='Ej. 10 reps — hipertrofia';
  if(kind==='fuerza') repOpts=[5,6,8,10,12,15,20].map(n=>[n,n]);
  else if(kind==='iso'){ repLbl='Tiempo por ronda (seg)'; repOpts=[15,20,30,45,60].map(n=>[n+' s',n]); repPh='Ej. 30 seg — isométrico'; }
  else if(kind==='cardio'){ repLbl='Minutos (fijos del plan)'; repOpts=[10,12,15,20,25,30,40].map(n=>[n+' min',n]); repPh='Ej. 12 min'; }
  else if(kind==='rondas'){ const u=rondasRx(e,s).u; repLbl=u==='reps'?'Repeticiones por ronda':u==='seg'?'Segundos por ronda':'Metros por ronda'; repOpts=(u==='reps'?[6,8,10,12,15,20]:u==='seg'?[20,30,40,45,60]:[15,20,30,40]).map(n=>[n,n]); repPh='Ej. 12 reps'; }
  const serLbl=kind==='cardio'?'Bloques':(kind==='iso'||kind==='rondas'||kind==='mov')?'Rondas':'Series';
  const serOpts=(kind==='cardio'?[1,2,3]:kind==='mov'?[1,2,3,4]:[1,2,3,4,5,6]).map(n=>[n,n]);
  const metodoHTML = kind==='fuerza' ? `
      <div class="ej-g"><div class="ej-gl">Método de intensidad</div>
        <select class="sf-in" onchange="staffUpdMetodo('${code}','${k}',${ei},this.value)">
          <option value="">Sin método</option>
          ${Object.entries(KB_METODOS).map(([id,M])=>`<option value="${id}" ${e.metodo&&e.metodo.id===id?'selected':''}>${esc(M.nm)}${M.nivel>nivelNum(s.nivel)?' · nivel '+M.nivel:''}</option>`).join('')}
        </select>
        ${e.metodo&&KB_METODOS[e.metodo.id]?`<div class="ej-met-como">${esc(KB_METODOS[e.metodo.id].como)}</div>`:''}
      </div>` : '';
  const pesoHTML = (kind==='fuerza') ? `
      <div class="ej-g"><div class="ej-gl">Carga</div>
        <div class="ej-2c">
          <select class="sf-in" onchange="staffPesoSel('${code}','${k}',${ei},this.value,this)">
            <option value="">Elegir…</option>
            ${ST_PESOS.map(p=>`<option value="${esc(p)}" ${e.peso===p?'selected':''}>${esc(p)}</option>`).join('')}
          </select>
          <input class="sf-in" data-f="peso" value="${esc(e.peso||'')}" placeholder="o escribe: 40 kg" onchange="staffUpd('${code}','${k}',${ei},'peso',this.value)">
        </div></div>`
    : (kind==='cardio'||kind==='rondas') ? `
      <div class="ej-g"><div class="ej-gl">FC objetivo <small>vacío = automático (edad y objetivo del socio)</small></div>
        <input class="sf-in" data-f="peso" value="${esc(e.peso||'')}" placeholder="${esc((kind==='cardio'?(()=>{const r=cardioRx(e,s);return r.lo+'–'+r.hi+' lpm';})():(()=>{const r=rondasRx(e,s);return r.lo+'–'+r.hi+' lpm';})()))}" onchange="staffUpd('${code}','${k}',${ei},'peso',this.value)"></div>` : '';
  const descHTML = (kind==='cardio'||kind==='mov') ? '' : `
      <div class="ej-g"><div class="ej-gl">Descanso entre series</div>
        <div class="ch-row">${stChips(code,k,ei,'desc',ST_DESC,e.descanso||'','staffChipDesc')}</div></div>`;
  return `
  <div class="ej-ed" id="eje-${code}-${k}-${ei}">
    <div class="ej-ed-top">
      <span class="ej-ed-n">${ei+1}</span>
      <button type="button" class="ej-ed-nm${e.nm?'':' vacio'}" onclick="epAbrir('${code}','${k}',${ei})"><b>${nombre}</b><small>${esc(sub)||'Toca para cambiar'}</small></button>
      <div class="ej-ed-mv"><button type="button" onclick="staffMoverEj('${code}','${k}',${ei},-1)" aria-label="Subir">▲</button><button type="button" onclick="staffMoverEj('${code}','${k}',${ei},1)" aria-label="Bajar">▼</button></div>
      <button type="button" class="ej-ed-x" onclick="staffDelEj('${code}','${k}',${ei})" aria-label="Quitar ejercicio">✕</button>
    </div>
    ${tag?`<div class="ej-ed-cardio-tag">${tag}</div>`:''}
    ${malLes.length?`<div class="ej-warn">⚠ Evitar con lesión de: ${esc(malLes.join(', '))}</div>`:''}
    <div class="ej-g"><div class="ej-gl">${serLbl}</div><div class="ch-row">${stChips(code,k,ei,'ser',serOpts,parseInt(e.series)||'','staffChipSeries')}</div></div>
    <div class="ej-g"><div class="ej-gl">${repLbl}</div>
      ${repOpts.length?`<div class="ch-row">${stChips(code,k,ei,'rep',repOpts,nRep,'staffChipReps')}</div>`:''}
      <input class="sf-in" data-f="reps" value="${esc(e.reps||'')}" placeholder="${repPh}" onchange="staffUpd('${code}','${k}',${ei},'reps',this.value)"></div>
    ${pesoHTML}
    ${descHTML}
    ${metodoHTML}
    <label class="ej-ed-l">Nota propioceptiva<input class="sf-in" value="${esc(e.tip||'')}" placeholder="Dónde y cómo sentir el estímulo" onchange="staffUpd('${code}','${k}',${ei},'tip',this.value)"></label>
    ${kind==='mov'?`<label class="ej-ed-l">Para qué es esta movilidad (se muestra al socio)<input class="sf-in" value="${esc(e.porque||'')}" placeholder="${esc(movInfo(e,d).porque.slice(0,70))}…  (vacío = explicación automática)" onchange="staffUpd('${code}','${k}',${ei},'porque',this.value)"></label>`:''}
    <details class="ej-ed-more">
      <summary>Grupo, detalle del método y opciones</summary>
      <div class="ej-ed-r2">
        <label>Grupo (ej. A1)<input class="sf-in" value="${esc(e.grupo||'')}" onchange="staffUpd('${code}','${k}',${ei},'grupo',this.value.toUpperCase())"></label>
        <label>Descanso (texto libre)<input class="sf-in" data-f="descanso" value="${esc(e.descanso||'')}" onchange="staffUpd('${code}','${k}',${ei},'descanso',this.value)"></label>
      </div>
      ${kind==='fuerza'?`<label class="ej-ed-l">Detalle del método<input class="sf-in" value="${esc(e.metodo&&e.metodo.detalle||'')}" placeholder="Ej. drop de 25% en la última serie" onchange="staffUpdMetodoDet('${code}','${k}',${ei},this.value)"></label>`:''}
      <label class="ej-ed-l">Opciones si el área está ocupada (separadas por coma)<input class="sf-in" value="${esc((e.alternativas||[]).map(a=>a.nm).join(', '))}" onchange="staffUpdAlts('${code}','${k}',${ei},this.value)"></label>
    </details>
  </div>`;
}
function stEj(code,k,ei){ const s=getSocio(code); return s&&s.rutina[k]&&s.rutina[k].ejercicios[ei]||null; }
function stMarcar(btn){ if(!btn) return; const g=btn.dataset.g; btn.parentNode.querySelectorAll('.ch').forEach(x=>x.classList.toggle('on',x===btn&&true)); }
function stCampo(btn,f,v){ const box=btn&&btn.closest('.ej-ed'); const i=box&&box.querySelector('[data-f="'+f+'"]'); if(i) i.value=v; }
function staffChipSeries(code,k,ei,v,btn){ const e=stEj(code,k,ei); if(!e) return; staffDirty.add(code); e.series=+v; stMarcar(btn); }
function staffChipDesc(code,k,ei,v,btn){ const e=stEj(code,k,ei); if(!e) return; staffDirty.add(code); e.descanso=v; stMarcar(btn); stCampo(btn,'descanso',v); }
function staffChipReps(code,k,ei,v,btn){
  const s=getSocio(code), e=stEj(code,k,ei); if(!e) return; staffDirty.add(code);
  const n=+v, kind=staffKindEj(e); let txt;
  if(kind==='fuerza') txt=n+' reps — '+(n<=6?'fuerza':n<=12?'hipertrofia':'resistencia');
  else if(kind==='iso') txt=n+' seg'+(ladoIso(e)?' por lado':'')+' — isométrico';
  else if(kind==='cardio'){ txt=n+' min'; if(!(parseInt(e.series)>0)) e.series=1; }
  else if(kind==='rondas') txt=txtUnidad(n,rondasRx(e,s).u);
  else txt=n+' min';
  e.reps=txt; stMarcar(btn); stCampo(btn,'reps',txt);
}
function staffPesoSel(code,k,ei,v,sel){ const e=stEj(code,k,ei); if(!e||!v) return; staffDirty.add(code); e.peso=v; stCampo(sel,'peso',v); }
function staffMoverEj(code,k,ei,dir){
  const s=getSocio(code); if(!s) return; const arr=s.rutina[k].ejercicios, j=ei+dir;
  if(j<0||j>=arr.length) return; staffDirty.add(code);
  const t=arr[ei]; arr[ei]=arr[j]; arr[j]=t; staffRerender(code,k);
}

// ═════════════════════════════════════════
// SELECTOR DE EJERCICIOS (agregar / cambiar) + crear ejercicio nuevo en el catálogo
// ═════════════════════════════════════════
const EP_GRUPOS=[['sug','⭐ Sugeridos'],['pecho','Pecho'],['espalda','Espalda'],['hombro','Hombro'],['brazos','Brazos'],['pierna','Pierna'],['gluteo','Glúteo'],['core','Core'],['cardio','Cardio'],['mov','Movilidad'],['iso','⏱ Isométricos'],['propios','★ Propios'],['todos','Todos']];
const EP_ENF={pecho:['pecho','pecho_sup'],espalda:['dorsal','espalda_media','trapecio'],hombro:['deltoide','deltoide_lat','deltoide_post','manguito'],brazos:['biceps','triceps','braquial'],pierna:['cuadriceps','femoral','pantorrilla'],gluteo:['gluteo'],core:['core','abdomen'],cardio:['cardio']};
const EP_ZONAS=[['','Todo el equipo'],['maquina','Máquinas'],['polea','Poleas'],['mancuernas','Mancuernas'],['libre','Barra'],['corporal','Peso corporal'],['liga','Ligas'],['trx','TRX'],['disco','Discos'],['funcional','Funcional']];
let EP={code:null,k:null,ei:null,grupo:'sug',zona:'',q:''};
function epZonaOk(z,f){ if(!f) return true; if(f==='libre') return z==='rack'||z==='banco'; return z===f; }
function epAbrir(code,k,ei){
  const s=getSocio(code); if(!s) return;
  EP={code,k,ei:(ei==null?null:ei),grupo:'sug',zona:'',q:''};
  const d=s.rutina[k]||{};
  document.getElementById('ep-titulo').textContent=EP.ei==null?'Agregar ejercicio':'Cambiar ejercicio';
  const les=lesionKeys(s.limitaciones||[]);
  document.getElementById('ep-ctx').textContent=sc(DIAS_NAMES[k])+' · '+(d.tipo||'sin tipo')+' — '+tc(s.nombre)+' ('+sc(s.nivel)+(les.length?', cuidar: '+les.join(', '):'')+')';
  document.getElementById('ep-q').value='';
  document.getElementById('ep-q').style.display='';
  document.getElementById('ep-filtros').style.display='';
  document.getElementById('modal-ejpick').classList.add('open');
  epRender();
}
function epCerrar(){ document.getElementById('modal-ejpick').classList.remove('open'); }
function epSetGrupo(g){ EP.grupo=g; epRender(); }
function epSetZona(z){ EP.zona=z; epRender(); }
function epBuscar(v){ EP.q=v; epRender(); }
function epItems(s,d){
  const les=lesionKeys(s.limitaciones||[]);
  const yaDia=new Set((d.ejercicios||[]).map(x=>kbNorm(x.nm||'')));
  const q=kbNorm(EP.q);
  let items=KB_EJERCICIOS.map(x=>({id:x.id,nm:x.nm,ms:x.ms,z:x.z,t:x.t,enf:x.enf,iso:!!x.iso,cardio:x.enf==='cardio'||!!x.rondas,custom:!!x._custom,ev:x.ev||[],aka:x.aka||[]}));
  KB_MOVILIDAD.forEach(m=>items.push({id:m.id,nm:m.nm,ms:'Movilidad · '+m.tipo,z:'corporal',enf:'mov',mov:true,ev:[],aka:[]}));
  if(q){
    items=items.filter(x=>kbNorm(x.nm).includes(q)||kbNorm(x.ms).includes(q)||(x.aka||[]).some(a=>kbNorm(a).includes(q)));
  } else if(EP.grupo==='sug'){
    const par=KB_DIA_ENF.find(([key])=>kbNorm(d.tipo||'').includes(key));
    if(par) items=items.filter(x=>par[1].includes(x.enf)); else items=items.filter(x=>!x.mov);
  } else if(EP.grupo==='mov') items=items.filter(x=>x.mov);
  else if(EP.grupo==='iso') items=items.filter(x=>x.iso);
  else if(EP.grupo==='propios') items=items.filter(x=>x.custom);
  else if(EP.grupo!=='todos') items=items.filter(x=>(EP_ENF[EP.grupo]||[]).includes(x.enf));
  items=items.filter(x=>epZonaOk(x.z,EP.zona));
  items.forEach(x=>{ x.mal=x.ev.filter(l=>les.includes(l)); x.ya=yaDia.has(kbNorm(x.nm)); });
  items.sort((a,b)=>(a.mal.length?1:0)-(b.mal.length?1:0) || (a.ya?1:0)-(b.ya?1:0) || (a.iso?1:0)-(b.iso?1:0) || ((a.t==='c')?0:1)-((b.t==='c')?0:1) || a.nm.localeCompare(b.nm,'es'));
  return items;
}
function epRender(){
  const s=getSocio(EP.code); if(!s) return; const d=s.rutina[EP.k]||{ejercicios:[]};
  document.getElementById('ep-filtros').innerHTML=
    `<div class="ep-rowc">${EP_GRUPOS.map(([g,n])=>`<button type="button" class="ch${EP.grupo===g&&!EP.q?' on':''}" onclick="epSetGrupo('${g}')">${n}</button>`).join('')}</div>
     <div class="ep-rowc">${EP_ZONAS.map(([z,n])=>`<button type="button" class="ch${EP.zona===z?' on':''}" onclick="epSetZona('${z}')">${n}</button>`).join('')}</div>`;
  const items=epItems(s,d), tot=items.length, max=80;
  const lista=items.slice(0,max).map(x=>`
    <div class="ep-it${x.mal.length?' mal':''}" onclick="epElegir('${x.id}')">
      <div><b>${esc(x.nm)}</b><span>${esc(x.ms)}${KB_ZONAS[x.z]?' · '+esc(KB_ZONAS[x.z]):''}</span></div>
      <em class="${x.mal.length?'w':''}">${x.mal.length?'⚠ evitar: '+esc(x.mal.join(', ')):x.ya?'ya en el día':''}${x.iso?' ⏱':''}${x.cardio?' 💓':''}${x.custom?' ★':''}</em>
    </div>`).join('');
  const q=limpiarTexto(EP.q);
  document.getElementById('ep-lista').innerHTML=
    (lista||`<div class="ep-vacio">No encontré ejercicios con ese filtro.${q?'':' Prueba con otro grupo, o crea el ejercicio nuevo.'}</div>`)+
    (tot>max?`<div class="ep-vacio">Mostrando ${max} de ${tot}. Escribe en el buscador para afinar.</div>`:'')+
    `<button type="button" class="ep-new" onclick="epFormNuevo()">＋ ${q?'Crear «'+esc(q)+'» como ejercicio nuevo':'Crear un ejercicio nuevo'}</button>`;
}
function epElegir(id){
  const s=getSocio(EP.code); if(!s) return;
  const m=KB_MOVILIDAD.find(x=>x.id===id);
  const kb=m?{mov:true,id:m.id,nm:m.nm,ms:'Movilidad'}:KB_IDX[id];
  if(!kb) return;
  staffAplicarEj(EP.code,EP.k,EP.ei,kb);
}
// Datos prellenados del ejercicio según su tipo, el nivel y el objetivo del socio
function ejDefaults(kb,s){
  const nv=nivelNum(s.nivel), obj=claveObjFc(s.objetivo), esFza=/FUERZA/i.test(s.objetivo||'');
  const base={nm:kb.nm,ms:kb.ms,enf:kb.enf||'',series:3,reps:'10 reps — hipertrofia',peso:'Moderado — 55% 1RM',descanso:'90 s',tip:kb.tip||''};
  if(kb.mov){ const m=KB_MOVILIDAD.find(x=>x.id===kb.id); return Object.assign(base,{ms:'Movilidad',enf:'',series:m.series,reps:m.reps,peso:'Sin carga',descanso:'',tip:m.que}); }
  const tmp={nm:kb.nm,series:'',reps:'',peso:''};
  if(esEjCardio(tmp)){ const r=cardioRx(tmp,s); return Object.assign(base,{series:1,reps:r.per+' min',peso:'FC objetivo '+r.lo+'–'+r.hi+' lpm',descanso:'',tip:kb.tip||'Ritmo en el que puedas hablar frases cortas.'}); }
  if(esEjRondas(tmp)){ const r=rondasRx(tmp,s); return Object.assign(base,{series:r.series,reps:txtUnidad(r.base,r.u),peso:'FC objetivo '+r.lo+'–'+r.hi+' lpm',descanso:'60 s'}); }
  if(kb.iso || esEjIsometrico(tmp)){ const x=dosisIsometrico({tt:kb.tt,lado:kb.lado},nv); return Object.assign(base,{series:x.series,reps:x.reps,peso:'Corporal',descanso:'45 s',tip:kb.tip||'Respira lento y mantén la tensión sin moverte.'}); }
  const comp=kb.t==='c';
  let series=comp&&nv>=2?4:3, reps, desc;
  if(esFza){ reps=comp?'5 reps — fuerza':'10 reps — hipertrofia'; desc=comp?'2 min':'90 s'; }
  else if(obj==='MASA'){ reps=comp?'8 reps — hipertrofia':'12 reps — hipertrofia'; desc=comp?'90 s':'60 s'; }
  else if(obj==='PERDER'||obj==='RESIST'){ reps='15 reps — resistencia'; desc='45 s'; }
  else { reps=comp?'8 reps — hipertrofia':'12 reps — hipertrofia'; desc=comp?'90 s':'60 s'; }
  let peso=comp?'Moderado — 55% 1RM':'Moderado — 50% 1RM';
  if(kb.z==='corporal'||kb.z==='trx') peso='Corporal'; else if(kb.z==='liga') peso='Banda — resistencia media';
  if(kb._custom){ if(kb.series) series=kb.series; if(kb.reps) reps=kb.reps; if(kb.peso) peso=kb.peso; }
  return Object.assign(base,{series,reps,peso,descanso:desc,tip:kb.tip||('Siente el músculo objetivo ('+kb.ms+') durante todo el recorrido y controla la bajada.')});
}
function staffAplicarEj(code,k,ei,kb){
  const s=getSocio(code); if(!s) return;
  if(!s.rutina[k]) s.rutina[k]={tipo:'',color:'verde',ejercicios:[]};
  const d=s.rutina[k]; if(!Array.isArray(d.ejercicios)) d.ejercicios=[];
  const def=ejDefaults(kb,s);
  if(!esEjMovilidad(def)){
    try{ const ent=s.entrenadorId?getEntrenador(s.entrenadorId):null;
      const ctx=ctxDesdePerfil({nivel:s.nivel,objetivo:s.objetivo,limitaciones:s.limitaciones}, ent&&ent.filosofia);
      def.alternativas=alternativasPara(def,ctx,datosEj(def)); }catch(err){ console.warn('alternativas',err); }
  }
  if(ei==null) d.ejercicios.push(def); else { const old=d.ejercicios[ei]||{}; d.ejercicios[ei]=Object.assign({},def,old.grupo?{grupo:old.grupo}:{}); }
  if(/descanso/i.test(d.tipo||'')){ d.tipo=''; d.color='verde'; }
  staffDirty.add(code); epCerrar(); staffRerender(code,k);
  showToast('✓ '+def.nm+(ei==null?' agregado':' cambiado')+' — ajusta series y repeticiones con un toque y presiona GUARDAR');
}
function epFormNuevo(){
  const q=limpiarTexto(EP.q);
  document.getElementById('ep-q').style.display='none';
  document.getElementById('ep-filtros').style.display='none';
  document.getElementById('ep-lista').innerHTML=`
    <div class="f-grp"><label class="f-lbl" for="epn-nm">Nombre del ejercicio</label><input class="ti" id="epn-nm" maxlength="70" value="${esc(q)}" placeholder="Ej. Press Arnold"></div>
    <div class="f-grp"><label class="f-lbl" for="epn-ms">Músculos que trabaja</label><input class="ti" id="epn-ms" maxlength="70" placeholder="Ej. Deltoides · Tríceps"></div>
    <div class="f-row">
      <div class="f-grp"><label class="f-lbl" for="epn-enf">Enfoque muscular</label><select class="ti" id="epn-enf">${Object.entries(KB_ENFOQUES).map(([k,n])=>`<option value="${k}">${esc(n)}</option>`).join('')}</select></div>
      <div class="f-grp"><label class="f-lbl" for="epn-z">Equipo / zona</label><select class="ti" id="epn-z">${Object.entries(KB_ZONAS).map(([k,n])=>`<option value="${k}" ${k==='mancuernas'?'selected':''}>${esc(n)}</option>`).join('')}</select></div>
    </div>
    <div class="f-row">
      <div class="f-grp"><label class="f-lbl" for="epn-t">Tipo</label><select class="ti" id="epn-t"><option value="c">Compuesto (varias articulaciones)</option><option value="a">Aislamiento (un músculo)</option></select></div>
      <div class="f-grp"><label class="f-lbl" for="epn-iso">Cómo se mide</label><select class="ti" id="epn-iso"><option value="">Series × repeticiones</option><option value="1">Isométrico (por tiempo)</option></select></div>
    </div>
    <div class="f-grp"><label class="f-lbl" for="epn-tip">Descripción / nota propioceptiva</label><textarea class="ti" id="epn-tip" rows="3" placeholder="Dónde sentir el estímulo, ángulo, errores comunes…"></textarea></div>
    <div class="f-grp"><label class="f-lbl">Evitar si el socio tiene lesión en</label><div class="chk-grid">${KB_LESIONES_OPC.map(l=>`<div class="chk epn-ev" data-v="${l}" onclick="this.classList.toggle('ck')">${sc(l)}</div>`).join('')}</div></div>
    <div class="f-nota">Se guarda en el catálogo (queda para todas las rutinas y entrenadores) y se agrega a este día con series, repeticiones y descanso prellenados.</div>
    <div style="display:flex;gap:10px;margin-top:14px">
      <button type="button" class="sd-b" style="flex:1" onclick="epRender();document.getElementById('ep-q').style.display='';document.getElementById('ep-filtros').style.display=''">Volver</button>
      <button type="button" class="sd-pri" style="flex:1" onclick="epGuardarNuevo()">Guardar y agregar</button>
    </div>`;
}
function epGuardarNuevo(){
  const v=id=>document.getElementById(id).value;
  const nm=limpiarTexto(v('epn-nm')), ms=limpiarTexto(v('epn-ms'));
  if(!nm||!ms){ showToast('Completa el nombre y los músculos'); return; }
  if(KB_EJERCICIOS.find(x=>kbNorm(x.nm)===kbNorm(nm))){ showToast('Ya existe un ejercicio con ese nombre — búscalo en la lista'); return; }
  const iso=v('epn-iso')==='1', t=v('epn-t');
  const ev=[...document.querySelectorAll('#ep-lista .epn-ev.ck')].map(x=>x.dataset.v);
  const id=kbNuevoId('c',nm);
  kbExtra().ejercicios[id]={nm,ms,enf:v('epn-enf'),z:v('epn-z'),t,series:3,reps:iso?'30 seg — isométrico':(t==='c'?'8 reps — hipertrofia':'12 reps — hipertrofia'),peso:iso?'Corporal':'Moderado',tip:v('epn-tip').trim(),ev,aka:[],iso};
  kbAplicarExtra(); guardarLocal();
  const payload=limpio(kbExtra()); payload._v=1;
  fbEncolar('/config/kb','set',payload,{ok:()=>{}});
  if(estaSinConexion()||!fbListo) showToast('📚 Ejercicio guardado · se subirá al volver la conexión');
  const kb=KB_IDX[id]; if(!kb){ showToast('⚠ No se pudo guardar el ejercicio'); return; }
  staffAplicarEj(EP.code,EP.k,EP.ei,kb);
}
