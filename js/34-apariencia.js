/* ═══ APARIENCIA · contenido autoadministrable por el director ═══
   El director (rol coordinador) cambia desde su panel, sin tocar código:
   - color principal, tipografía (combinaciones probadas)
   - logo, foto de bienvenida y foto del panel del socio
   - textos de portada (nombre del gimnasio, titular, frase)
   Se guarda en Firebase (/apariencia y /apariencia_img) y se aplica en todos los
   dispositivos al momento. Cada dispositivo guarda una copia local para que el
   diseño aparezca antes de conectarse. Las imágenes se comprimen en el navegador
   antes de subirlas. Las reglas de firebase-rules.json solo dejan escribir al director. ═══ */

const APAR_LS = 'fsp_apariencia_v1';
const APAR_FUENTES = {
  deportiva: {nm:'Deportiva (original)', fd:"'Kanit','Figtree'", fb:"'Figtree'",
    css:'family=Kanit:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Figtree:wght@400;500;600;700;800'},
  impacto:   {nm:'Impacto', fd:"'Anton','Barlow'", fb:"'Barlow'",
    css:'family=Anton&family=Barlow:wght@400;500;600;700;800'},
  atletica:  {nm:'Atlética', fd:"'Oswald','Source Sans 3'", fb:"'Source Sans 3'",
    css:'family=Oswald:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700;800'},
  moderna:   {nm:'Moderna', fd:"'Montserrat','Open Sans'", fb:"'Open Sans'",
    css:'family=Montserrat:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Open+Sans:wght@400;500;600;700;800'},
  amable:    {nm:'Amable', fd:"'Poppins','Nunito Sans'", fb:"'Nunito Sans'",
    css:'family=Poppins:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Nunito+Sans:wght@400;500;600;700;800'},
  elegante:  {nm:'Elegante', fd:"'Playfair Display','Lato'", fb:"'Lato'",
    css:'family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Lato:wght@400;700;900'}
};
const APAR_COLORES = ['#C8F23A','#2ECC71','#1E90FF','#00B8D9','#7C6CF5','#FF5A1F','#F5B700','#E8384F'];
const APAR_IMGS = {
  logo:       {nm:'Logo', ayuda:'Se muestra en la barra superior. Cuadrado, de preferencia con fondo.', max:512},
  bienvenida: {nm:'Foto de bienvenida', ayuda:'La foto grande de la pantalla de inicio.', max:1600, ruta:'hero/bienvenida'},
  panel:      {nm:'Foto del panel del socio', ayuda:'La foto de la tarjeta de arriba cuando el socio entra.', max:1600, ruta:'hero/inicio'}
};
const APAR_TEXTOS = {
  nombre:  {nm:'Nombre del gimnasio', max:60, def:()=>GYM.nombre},
  titular: {nm:'Titular de la portada', max:60, def:()=>'Entrena con un plan\nhecho para ti.', lineas:true},
  sub:     {nm:'Frase de la portada', max:120, def:()=>'Tu rutina, tu evolución y tu nutrición en un solo lugar.'},
  panel:   {nm:'Frase del panel del socio', max:60, def:()=>'Disciplina hoy,\nresultados mañana.', lineas:true}
};
const APAR_GYM_ORIG = {nombre:GYM.nombre, color:GYM.colorPrincipal};

let APAR = {cfg:{}, img:{}};        // lo guardado (Firebase o caché)
let aparDraft = null;               // edición en curso del director
let aparEscuchando = false;

/* ── Lectura de la caché local ── */
function aparCargarLocal(){
  try{ const v=JSON.parse(localStorage.getItem(APAR_LS)||'null'); if(v&&typeof v==='object') APAR={cfg:v.cfg||{}, img:v.img||{}}; }catch(e){}
}
function aparGuardarLocal(){
  try{ localStorage.setItem(APAR_LS, JSON.stringify(APAR)); }catch(e){ console.warn('apariencia: sin espacio local',e); }
}

/* ── Aplicar a la página ── */
function aparTexto(k, cfg){ const t=cfg&&cfg.textos&&cfg.textos[k]; return (typeof t==='string'&&t.trim())?t:APAR_TEXTOS[k].def(); }
function aparLineasHTML(t){ return String(t).split('\n').map(esc).join('<br>'); }
function aparHeroPanelHTML(){
  const src=aparDraft||APAR.cfg;
  return String(aparTexto('panel',src)).split('\n').map(l=>`<b>${esc(l)}</b>`).join('');
}
function aparAplicar(cfg, img){
  cfg=cfg||{}; img=img||{};
  // Color: reutiliza la lógica de config.js
  const ant=document.getElementById('gym-color'); if(ant) ant.remove();
  GYM.colorPrincipal = /^#[0-9a-fA-F]{6}$/.test(cfg.color||'') ? cfg.color : APAR_GYM_ORIG.color;
  // Nombre del gimnasio
  GYM.nombre = aparTexto('nombre',cfg);
  aplicarMarca();
  if(/^#[0-9a-fA-F]{6}$/.test(cfg.color||'')) document.documentElement.style.setProperty('--marca',cfg.color);
  else document.documentElement.style.removeProperty('--marca');
  // Tipografía
  const f=APAR_FUENTES[cfg.fuente]||APAR_FUENTES.deportiva;
  let st=document.getElementById('apar-fuente');
  if(cfg.fuente && cfg.fuente!=='deportiva'){
    let ln=document.getElementById('apar-fuente-link');
    const href='https://fonts.googleapis.com/css2?'+f.css+'&display=swap';
    if(!ln){ ln=document.createElement('link'); ln.id='apar-fuente-link'; ln.rel='stylesheet'; ln.crossOrigin='anonymous'; document.head.appendChild(ln); }
    if(ln.href!==href) ln.href=href;
    if(!st){ st=document.createElement('style'); st.id='apar-fuente'; document.head.appendChild(st); }
    st.textContent=`:root{--fd:${f.fd},system-ui,sans-serif;--fb:${f.fb},system-ui,-apple-system,'Segoe UI',sans-serif;}`;
  } else if(st){ st.remove(); }
  // Imágenes: el banco de imágenes (pic/imgSrc) consulta window.IMG_DATA antes que la carpeta img/
  const D={k:{},u:[]};
  Object.keys(APAR_IMGS).forEach(k=>{
    const r=APAR_IMGS[k].ruta; if(!r||!img[k]) return;
    D.u.push(img[k]); ['webp','jpg'].forEach(x=>{ D.k[r+'.'+x]=D.u.length-1; });
  });
  window.IMG_DATA = D.u.length ? D : null;
  const whp=document.getElementById('wc-hero-pic');
  if(whp && typeof pic==='function') whp.innerHTML=pic(['hero/bienvenida','hero/inicio'],'bolt','fill');
  document.querySelectorAll('.hero-card .hero-tx').forEach(e=>{ e.innerHTML=aparHeroPanelHTML(); });
  // Logo en las dos barras superiores
  document.querySelectorAll('.lm').forEach(lm=>{
    if(!lm.dataset.orig) lm.dataset.orig=lm.innerHTML;
    if(img.logo){ lm.innerHTML=`<img src="${img.logo}" alt="${esc(GYM.nombreCorto)}">`; }
    else if(lm.innerHTML!==lm.dataset.orig){ lm.innerHTML=lm.dataset.orig; }
  });
  // Textos de portada
  const h=document.getElementById('wc-titular'); if(h) h.innerHTML=aparLineasHTML(aparTexto('titular',cfg));
  const p=document.getElementById('wc-sub'); if(p) p.textContent=aparTexto('sub',cfg);
}
function aparAplicarGuardado(){ aparAplicar(APAR.cfg, APAR.img); }

/* ── Sincronización con Firebase ── */
function aparEscuchar(){
  if(aparEscuchando || typeof fbDB==='undefined' || !fbDB) return;
  aparEscuchando=true;
  fbDB.ref('/apariencia').on('value', s=>{ APAR.cfg=s.val()||{}; aparGuardarLocal(); if(!aparDraft) aparAplicarGuardado(); }, e=>console.warn('apariencia',e));
  fbDB.ref('/apariencia_img').on('value', s=>{ APAR.img=s.val()||{}; aparGuardarLocal(); if(!aparDraft) aparAplicarGuardado(); }, e=>console.warn('apariencia_img',e));
}

/* ── Compresión de imágenes en el navegador ── */
function aparComprimir(file, max){
  return new Promise((res,rej)=>{
    if(!file || !/^image\//.test(file.type)){ rej(new Error('No es una imagen')); return; }
    const url=URL.createObjectURL(file); const im=new Image();
    im.onload=()=>{
      URL.revokeObjectURL(url);
      const k=Math.min(1, max/Math.max(im.width,im.height));
      const c=document.createElement('canvas'); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k);
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      let out='';
      for(const q of [0.82,0.72,0.6,0.5]){
        out=c.toDataURL('image/webp',q);
        if(!out.startsWith('data:image/webp')) out=c.toDataURL('image/jpeg',q);
        if(out.length<=380000) break;
      }
      if(out.length>380000){ rej(new Error('La imagen sigue siendo muy pesada')); return; }
      res(out);
    };
    im.onerror=()=>{ URL.revokeObjectURL(url); rej(new Error('No se pudo leer la imagen')); };
    im.src=url;
  });
}

/* ── Contraste: avisa si el color no se va a leer ── */
function aparLum(hex){
  const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
}
function aparContraste(a,b){ const x=aparLum(a), y=aparLum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); }
function aparAvisoColor(c){
  if(!/^#[0-9a-fA-F]{6}$/.test(c)) return '';
  const osc=aparContraste(c,'#0A0E13');
  if(osc<3) return 'Este color casi no se ve sobre el fondo oscuro del modo Noche. Elige uno más claro o más vivo.';
  return '';
}

/* ── Pantalla del director ── */
function abrirApariencia(){
  if(staffRol!=='coordinador'){ showToast('Esta sección es solo para dirección'); return; }
  staffActivoId=null; if(typeof staffRenderList==='function') staffRenderList();
  aparDraft={cfg:JSON.parse(JSON.stringify(APAR.cfg||{})), img:Object.assign({},APAR.img||{})};
  aparDraft.cfg.textos=aparDraft.cfg.textos||{};
  // Carga todas las letras una vez para que las tarjetas muestren cada opción real
  if(!document.getElementById('apar-fuentes-todas')){
    const ln=document.createElement('link'); ln.id='apar-fuentes-todas'; ln.rel='stylesheet'; ln.crossOrigin='anonymous';
    ln.href='https://fonts.googleapis.com/css2?'+Object.values(APAR_FUENTES).filter(f=>f!==APAR_FUENTES.deportiva).map(f=>f.css).join('&')+'&display=swap';
    document.head.appendChild(ln);
  }
  aparRender();
  if(typeof staffVista==='function') staffVista('detalle');
}
function aparRender(){
  const d=aparDraft, c=d.cfg;
  const color=/^#[0-9a-fA-F]{6}$/.test(c.color||'')?c.color:(APAR_GYM_ORIG.color||'#C8F23A');
  const aviso=aparAvisoColor(color);
  const sec=(t,sub,body)=>`<section class="apar-sec"><h3>${t}</h3>${sub?`<p class="apar-sub">${sub}</p>`:''}${body}</section>`;
  const sw=APAR_COLORES.map(x=>`<button type="button" class="apar-sw${x.toLowerCase()===color.toLowerCase()?' on':''}" style="background:${x}" aria-label="Usar color ${x}" onclick="aparSetColor('${x}')"></button>`).join('');
  const fuentes=Object.keys(APAR_FUENTES).map(k=>{
    const f=APAR_FUENTES[k], on=(c.fuente||'deportiva')===k;
    return `<button type="button" class="apar-font${on?' on':''}" onclick="aparSetFuente('${k}')" aria-pressed="${on}">
      <span class="apar-font-t" style="font-family:${f.fd},sans-serif">ENTRENA HOY</span>
      <span class="apar-font-b" style="font-family:${f.fb},sans-serif">${esc(f.nm)} · Texto de ejemplo</span></button>`;
  }).join('');
  const imgs=Object.keys(APAR_IMGS).map(k=>{
    const m=APAR_IMGS[k], v=d.img[k];
    return `<div class="apar-img">
      <div class="apar-img-pv${k==='logo'?' logo':''}">${v?`<img src="${v}" alt="${esc(m.nm)}">`:'<span>Original</span>'}</div>
      <div class="apar-img-tx"><b>${esc(m.nm)}</b><span>${esc(m.ayuda)}</span>
        <div class="apar-img-bt">
          <label class="sd-b apar-up">Cambiar<input type="file" accept="image/*" onchange="aparSubirImg('${k}',this)"></label>
          ${v?`<button type="button" class="sd-b" onclick="aparQuitarImg('${k}')">Usar la original</button>`:''}
        </div></div></div>`;
  }).join('');
  const textos=Object.keys(APAR_TEXTOS).map(k=>{
    const m=APAR_TEXTOS[k], v=(c.textos&&c.textos[k])||'';
    const ph=esc(m.def()).replace(/\n/g,' / ');
    return `<label class="apar-fld"><span>${esc(m.nm)}${m.lineas?' <i>(Enter = salto de línea)</i>':''}</span>
      ${m.lineas?`<textarea rows="2" maxlength="${m.max}" placeholder="${ph}" oninput="aparSetTexto('${k}',this.value)">${esc(v)}</textarea>`
               :`<input type="text" maxlength="${m.max}" placeholder="${ph}" value="${esc(v)}" oninput="aparSetTexto('${k}',this.value)">`}</label>`;
  }).join('');
  const fecha=APAR.cfg&&APAR.cfg.actualizado?new Date(APAR.cfg.actualizado).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'}):'';
  document.getElementById('staff-content').innerHTML=`
  <div class="apar">
    <h2>Apariencia de la app</h2>
    <p class="apar-sub">Lo que cambies aquí se ve de inmediato en esta pantalla como vista previa. Los socios lo verán cuando toques <b>Guardar</b>.${fecha?` Último cambio guardado: ${esc(fecha)}.`:''}</p>
    ${sec('Color principal','Botones, acentos y gráficas. El texto de los botones se ajusta solo para que se lea.',
      `<div class="apar-colors">${sw}<label class="apar-pick" aria-label="Elegir otro color"><input type="color" value="${color}" oninput="aparSetColor(this.value)"><span>Otro</span></label></div>
       ${aviso?`<p class="apar-aviso">${esc(aviso)}</p>`:''}`)}
    ${sec('Tipografía','Combinaciones probadas de letra para títulos y texto.',`<div class="apar-fonts">${fuentes}</div>`)}
    ${sec('Imágenes','Se comprimen solas antes de subir. Usa fotos horizontales para las portadas.',imgs)}
    ${sec('Textos de portada','Déjalo vacío para usar el texto original.',textos)}
    <div class="apar-acc">
      <button type="button" class="sd-pri" onclick="aparGuardar()">Guardar cambios</button>
      <button type="button" class="sd-b" onclick="aparDescartar()">Descartar</button>
      <button type="button" class="sd-b" onclick="aparDeshacer()">Volver a la versión anterior</button>
      <button type="button" class="sd-b danger" onclick="aparRestaurar()">Restaurar diseño original</button>
    </div>
  </div>`;
}
function aparVista(){ aparAplicar(aparDraft.cfg, aparDraft.img); }
function aparSetColor(v){ aparDraft.cfg.color=v; aparVista(); aparRender(); }
function aparSetFuente(k){ aparDraft.cfg.fuente=k; aparVista(); aparRender(); }
function aparSetTexto(k,v){ aparDraft.cfg.textos[k]=v.slice(0,APAR_TEXTOS[k].max); aparVista(); }
async function aparSubirImg(k,inp){
  const f=inp.files&&inp.files[0]; if(!f) return;
  showToast('Preparando imagen…');
  try{ aparDraft.img[k]=await aparComprimir(f, APAR_IMGS[k].max); aparVista(); aparRender(); showToast('Imagen lista. Toca Guardar para publicarla.'); }
  catch(e){ showToast(e.message||'No se pudo usar esa imagen'); }
}
function aparQuitarImg(k){ delete aparDraft.img[k]; aparVista(); aparRender(); }
function aparDescartar(){ aparDraft=null; aparAplicarGuardado(); abrirApariencia(); showToast('Cambios descartados'); }

function aparPayload(){
  const c=aparDraft.cfg, out={};
  if(/^#[0-9a-fA-F]{6}$/.test(c.color||'')) out.color=c.color;
  if(APAR_FUENTES[c.fuente] && c.fuente!=='deportiva') out.fuente=c.fuente;
  const t={}; Object.keys(APAR_TEXTOS).forEach(k=>{ const v=(c.textos&&c.textos[k]||'').trim(); if(v) t[k]=v; });
  if(Object.keys(t).length) out.textos=t;
  out.actualizado=Date.now();
  const img={}; Object.keys(APAR_IMGS).forEach(k=>{ if(aparDraft.img[k]) img[k]=aparDraft.img[k]; });
  return {cfg:out, img};
}
async function aparEscribir(cfg, img, msg){
  if(typeof fbDB==='undefined' || !fbDB || !fbListo){ showToast('Necesitas conexión a internet para guardar'); return false; }
  try{
    // Copia de la versión actual para poder deshacer
    await fbDB.ref('/apariencia_prev').set({cfg:APAR.cfg||{}, img:APAR.img||{}, guardado:Date.now()});
    await fbDB.ref('/apariencia_img').set(Object.keys(img).length?img:null);
    await fbDB.ref('/apariencia').set(cfg);
    APAR={cfg, img}; aparGuardarLocal(); aparDraft=null; aparAplicarGuardado();
    showToast(msg); return true;
  }catch(e){
    console.warn('apariencia guardar',e);
    showToast(String(e&&e.code||e).includes('PERMISSION')?'Firebase no dio permiso: publica las reglas nuevas (firebase-rules.json)':'No se pudo guardar. Revisa tu conexión.');
    return false;
  }
}
async function aparGuardar(){ const p=aparPayload(); if(await aparEscribir(p.cfg,p.img,'Apariencia guardada: ya la ven todos los socios')) abrirApariencia(); }
function aparDeshacer(){
  uiConfirm('¿Volver a la versión que estaba antes del último guardado?', async()=>{
    try{
      const s=await fbDB.ref('/apariencia_prev').once('value'); const v=s.val();
      if(!v){ showToast('No hay una versión anterior guardada'); return; }
      if(await aparEscribir(v.cfg||{}, v.img||{}, 'Se restauró la versión anterior')) abrirApariencia();
    }catch(e){ showToast('No se pudo leer la versión anterior'); }
  },{label:'Volver a la anterior'});
}
function aparRestaurar(){
  uiConfirm('¿Quitar todos los cambios y volver al diseño original de la app? Podrás deshacerlo con «Volver a la versión anterior».', async()=>{
    if(await aparEscribir({actualizado:Date.now()}, {}, 'Se restauró el diseño original')) abrirApariencia();
  },{label:'Restaurar original', danger:true});
}

/* ── Arranque: aplica la caché local y se conecta a Firebase en cuanto esté listo ── */
aparCargarLocal();
aparAplicarGuardado();
(function aparEsperarFirebase(n){
  if(typeof fbDB!=='undefined' && fbDB && fbListo){ aparEscuchar(); return; }
  if(n<60) setTimeout(()=>aparEsperarFirebase(n+1), 500);
})(0);
