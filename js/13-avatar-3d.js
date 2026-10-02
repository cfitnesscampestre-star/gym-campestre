/* ═══ avatar 3d ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// AVATAR 3D — Three.js paramétrico
// Adaptado de los prototipos React de Fer:
// mismo estilo anatómico, ahora conectado
// a las medidas reales del socio + morph
// INICIO ⇄ HOY
// ═════════════════════════════════════════
let av3d = null;          // {renderer,scene,camera,partes,raf,destruir}
let av3dThreePromise = null;

function cargarThree(){
  if(window.THREE) return Promise.resolve();
  if(av3dThreePromise) return av3dThreePromise;
  av3dThreePromise = new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; s.crossOrigin='anonymous';
    s.onload=()=>res();
    s.onerror=()=>{ av3dThreePromise=null; rej(new Error('three load')); };
    document.head.appendChild(s);
  });
  return av3dThreePromise;
}

// Escalas de cada parte según medidas (reusa medEscala de la versión SVG)
function av3dEscalas(med){
  return {
    pecho:   medEscala(med,'pecho'),
    cintura: medEscala(med,'cintura'),
    cadera:  medEscala(med,'cadera'),
    brazo:   medEscala(med,'brazo'),
    muslo:   medEscala(med,'muslo'),
  };
}

function av3dDestruir(){
  if(!av3d) return;
  cancelAnimationFrame(av3d.raf);
  try{
    av3d.renderer.domElement.remove();
    av3d.renderer.dispose();
    av3d.scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material) o.material.dispose(); });
  }catch(e){}
  window.removeEventListener('resize', av3d.onResize);
  av3d=null;
}

async function abrirAvatar3D(){
  const s=activeSocio; if(!s) return;
  const wrap=document.getElementById('av3d-wrap'); if(!wrap) return;
  wrap.classList.add('on');
  wrap.querySelector('.av3d-cargando').style.display='flex';
  try{ await cargarThree(); }
  catch(e){ showToast('⚠ No se pudo cargar el visor 3D — revisa tu conexión'); wrap.classList.remove('on'); return; }
  wrap.querySelector('.av3d-cargando').style.display='none';
  const {primera,ultima}=getMedidas(s);
  av3dCrear(document.getElementById('av3d-canvas-zone'), ultima||null, primera||null);
  // marcar HOY activo
  document.getElementById('av3d-btn-hoy')?.classList.add('ac');
  document.getElementById('av3d-btn-inicio')?.classList.remove('ac');
}
function cerrarAvatar3D(){
  av3dDestruir();
  document.getElementById('av3d-wrap')?.classList.remove('on');
}

// ── Textura procedural "tejido muscular" (fibras + variación de tono) para el avatar 3D ──
function crearTexturaMuscular(){
  const c=document.createElement('canvas'); c.width=256; c.height=256;
  const ctx=c.getContext('2d');
  const grad=ctx.createLinearGradient(0,0,0,256);
  grad.addColorStop(0,'#f2a394'); grad.addColorStop(0.5,'#e8786c'); grad.addColorStop(1,'#c2584b');
  ctx.fillStyle=grad; ctx.fillRect(0,0,256,256);
  // fibras claras (highlights de tendón/fascia)
  ctx.strokeStyle='rgba(255,240,230,.22)'; ctx.lineWidth=1.1;
  for(let i=0;i<90;i++){
    const x=Math.random()*256, y=Math.random()*256, len=12+Math.random()*34, ang=Math.PI/2+(Math.random()-0.5)*0.5;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(ang)*len,y+Math.sin(ang)*len); ctx.stroke();
  }
  // fibras oscuras (sombra entre haces musculares)
  ctx.strokeStyle='rgba(80,20,14,.16)'; ctx.lineWidth=1.4;
  for(let i=0;i<55;i++){
    const x=Math.random()*256, y=Math.random()*256, len=10+Math.random()*26, ang=Math.PI/2+(Math.random()-0.5)*0.5;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(ang)*len,y+Math.sin(ang)*len); ctx.stroke();
  }
  const tex=new THREE.CanvasTexture(c);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  return tex;
}

function av3dCrear(zone, medHoy, medInicio){
  av3dDestruir();
  zone.innerHTML='';
  const W=zone.clientWidth||340, H=340;

  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x0a0e1a);

  const camera=new THREE.PerspectiveCamera(60,W/H,0.1,100);
  camera.position.set(0,0.25,5.6);

  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.domElement.className='av3d-canvas';
  zone.appendChild(renderer.domElement);

  // Iluminación estilo estudio (de tu prototipo)
  scene.add(new THREE.AmbientLight(0xffffff,0.55));
  const key=new THREE.DirectionalLight(0x4aff8c,0.85); key.position.set(5,5,5); scene.add(key);
  const fill=new THREE.DirectionalLight(0x00e5ff,0.35); fill.position.set(-5,3,5); scene.add(fill);
  const back=new THREE.DirectionalLight(0x4aff8c,0.25); back.position.set(0,-2,-5); scene.add(back);

  // Materiales anatómicos — textura procedural tipo tejido muscular (fibras + brillo húmedo)
  const muscTex=crearTexturaMuscular();
  const mMusc=new THREE.MeshPhongMaterial({map:muscTex, shininess:70, specular:0x5a2018});
  const mHueso=new THREE.MeshPhongMaterial({color:0xd3d3d3,shininess:50});
  const mPiel=new THREE.MeshPhongMaterial({color:0xd9a584,shininess:20});

  // ── Cuerpo paramétrico — guardamos referencias para morph ──
  const g=new THREE.Group();
  const partes={};

  // Cabeza + cuello
  const cabeza=new THREE.Mesh(new THREE.SphereGeometry(0.34,18,18),mPiel);
  cabeza.position.y=2.85; g.add(cabeza);
  const cuello=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.15,0.3,10),mPiel);
  cuello.position.y=2.5; g.add(cuello);

  // Torso: cilindro con radio superior=pecho, inferior=cintura
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.36,1.5,18),mMusc);
  torso.position.y=1.55; torso.scale.z=0.72; g.add(torso);
  partes.torso=torso;

  // Pectorales
  const pecho=new THREE.Mesh(new THREE.SphereGeometry(0.5,18,18,0,Math.PI*2,0,Math.PI/2),mMusc);
  pecho.position.y=2.05; pecho.scale.set(1.05,0.55,0.7); g.add(pecho);
  partes.pecho=pecho;

  // Abdomen segmentado (six-pack) — pequeños relieves sobre el torso para dar textura anatómica
  partes.abs=[];
  for(let row=0;row<3;row++){
    [-1,1].forEach(s=>{
      const ab=new THREE.Mesh(new THREE.SphereGeometry(0.115,10,10),mMusc);
      ab.position.set(s*0.135,1.78-row*0.24,0.40-row*0.02);
      ab.scale.set(1,0.8,0.5);
      g.add(ab); partes.abs.push(ab);
    });
  }

  // Hombros (deltoides)
  partes.hombros=[];
  [-1,1].forEach(s=>{
    const sh=new THREE.Mesh(new THREE.SphereGeometry(0.26,14,14),mMusc);
    sh.position.set(s*0.72,2.18,0); g.add(sh); partes.hombros.push(sh);
  });

  // Brazos: cono superior (bíceps) + antebrazo + mano
  partes.brazosSup=[]; partes.brazosInf=[];
  [-1,1].forEach(s=>{
    const sup=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.13,0.85,12),mMusc);
    sup.position.set(s*0.86,1.65,0); sup.rotation.z=s*-0.18; g.add(sup); partes.brazosSup.push(sup);
    const bicep=new THREE.Mesh(new THREE.SphereGeometry(0.1,10,10),mMusc);
    bicep.position.set(s*0.88,1.7,0.13); bicep.scale.set(1,1.3,0.6); g.add(bicep);
    const inf=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.08,0.8,12),mMusc);
    inf.position.set(s*1.02,0.92,0); inf.rotation.z=s*-0.22; g.add(inf); partes.brazosInf.push(inf);
    const mano=new THREE.Mesh(new THREE.SphereGeometry(0.11,10,10),mPiel);
    mano.position.set(s*1.13,0.48,0); g.add(mano);
  });

  // Cadera / pelvis
  const pelvis=new THREE.Mesh(new THREE.SphereGeometry(0.42,16,16),mMusc);
  pelvis.position.y=0.68; pelvis.scale.set(1.15,0.62,0.8); g.add(pelvis);
  partes.pelvis=pelvis;

  // Piernas: muslo + pantorrilla + pie
  partes.muslos=[]; partes.pantorrillas=[];
  [-1,1].forEach(s=>{
    const mus=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.17,1.25,14),mMusc);
    mus.position.set(s*0.30,-0.18,0); g.add(mus); partes.muslos.push(mus);
    const pan=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.10,1.15,12),mMusc);
    pan.position.set(s*0.32,-1.35,0); g.add(pan); partes.pantorrillas.push(pan);
    const pie=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.14,0.42),mPiel);
    pie.position.set(s*0.32,-2.0,0.08); g.add(pie);
  });

  // Columna (vértebras, guiño anatómico de tu prototipo)
  for(let i=0;i<6;i++){
    const v=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,8),mHueso);
    v.position.set(0,2.25-i*0.3,-0.30); g.add(v);
  }

  g.position.y=-0.5;
  scene.add(g);

  // ── Aplicar medidas (escala objetivo por parte) ──
  function objetivos(med){
    const e=av3dEscalas(med);
    return {
      torsoX: (e.pecho+e.cintura)/2, torsoZ: 0.72*((e.pecho+e.cintura)/2),
      pechoS: e.pecho,
      hombroS: 0.7+0.3*e.pecho,
      brazoS: e.brazo,
      pelvisS: e.cadera,
      musloS: e.muslo,
    };
  }
  let actual=objetivos(medHoy);
  let target=actual;

  function aplicar(o){
    partes.torso.scale.x=o.torsoX; partes.torso.scale.z=o.torsoZ;
    partes.pecho.scale.set(1.05*o.pechoS,0.55,0.7*o.pechoS);
    partes.hombros.forEach((sh,i)=>{ sh.scale.setScalar(o.hombroS); sh.position.x=(i===0?-1:1)*0.72*(0.85+0.15*o.pechoS); });
    partes.brazosSup.forEach(b=>{ b.scale.x=o.brazoS; b.scale.z=o.brazoS; });
    partes.brazosInf.forEach(b=>{ b.scale.x=0.8+0.2*o.brazoS; b.scale.z=0.8+0.2*o.brazoS; });
    partes.pelvis.scale.set(1.15*o.pelvisS,0.62,0.8*o.pelvisS);
    partes.muslos.forEach(m=>{ m.scale.x=o.musloS; m.scale.z=o.musloS; });
    partes.pantorrillas.forEach(m=>{ m.scale.x=0.85+0.15*o.musloS; m.scale.z=0.85+0.15*o.musloS; });
  }
  aplicar(actual);

  // ── Morph INICIO ⇄ HOY ──
  window.av3dMorph=function(cual){
    const med = cual==='inicio' ? medInicio : medHoy;
    if(!med){ showToast('Aún no hay medidas de '+(cual==='inicio'?'inicio':'hoy')); return; }
    target=objetivos(med);
    document.getElementById('av3d-btn-hoy')?.classList.toggle('ac',cual==='hoy');
    document.getElementById('av3d-btn-inicio')?.classList.toggle('ac',cual==='inicio');
  };

  // ── Rotación con arrastre + auto-rotación (de tu prototipo) ──
  let rot={x:0,y:0}, tRot={x:0,y:0}, arrastrando=false;
  function puntero(e,rect){
    const p=e.touches?e.touches[0]:e;
    return { x:((p.clientX-rect.left)/rect.width)*2-1, y:-((p.clientY-rect.top)/rect.height)*2+1 };
  }
  const el=renderer.domElement;
  const onDown=()=>{arrastrando=true;};
  const onUp=()=>{arrastrando=false;};
  const onMove=e=>{
    if(!arrastrando) return;
    if(e.touches) e.preventDefault();
    const m=puntero(e,el.getBoundingClientRect());
    tRot.y=m.x*Math.PI; tRot.x=m.y*Math.PI*0.25;
  };
  el.addEventListener('mousedown',onDown); el.addEventListener('mouseup',onUp); el.addEventListener('mouseleave',onUp);
  el.addEventListener('mousemove',onMove);
  el.addEventListener('touchstart',onDown,{passive:true}); el.addEventListener('touchend',onUp);
  el.addEventListener('touchmove',onMove,{passive:false});

  const onResize=()=>{
    const w=zone.clientWidth||W;
    camera.aspect=w/H; camera.updateProjectionMatrix(); renderer.setSize(w,H);
  };
  window.addEventListener('resize',onResize);

  // ── Loop ──
  function lerp(a,b,t){return a+(b-a)*t;}
  let raf;
  function animate(){
    raf=requestAnimationFrame(animate);
    av3d.raf=raf;
    // morph suave entre medidas
    let cambio=false;
    Object.keys(actual).forEach(k=>{
      const nv=lerp(actual[k],target[k],0.08);
      if(Math.abs(nv-actual[k])>0.0005){actual[k]=nv;cambio=true;}
    });
    if(cambio) aplicar(actual);
    // rotación suave
    rot.y+=(tRot.y-rot.y)*0.08;
    rot.x+=(tRot.x-rot.x)*0.08;
    if(!arrastrando) tRot.y+=0.0035;
    g.rotation.y=rot.y; g.rotation.x=rot.x*0.4;
    renderer.render(scene,camera);
  }
  av3d={renderer,scene,camera,partes,raf:0,onResize};
  animate();
}

// Guardar medidas del día
function guardarMedidas(){ asegurarLogs(activeSocio);
  const s=activeSocio; if(!s) return;
  const med={fecha:fechaISO(new Date())};
  let alguna=false;
  MED_CAMPOS.forEach(c=>{
    const v=parseFloat(document.getElementById('med-'+c.id)?.value);
    if(v&&v>=c.min&&v<=c.max){ med[c.id]=v; alguna=true; }
  });
  if(!alguna){ showToast('⚠ Ingresa al menos una medida válida'); return; }
  if(!s.logs.medidas) s.logs.medidas=[];
  const hoy=med.fecha;
  const ex=s.logs.medidas.find(m=>m.fecha===hoy);
  if(ex) Object.assign(ex,med); else s.logs.medidas.push(med);
  dbSave(s.code);
  showToast('📏 Medidas registradas — tu avatar se actualizó');
  renderProgresoTab();
  refreshDash();
}

// Mini sparkline para el hero
function drawSpark(id, valores){
  const cv=document.getElementById(id); if(!cv||valores.length<2) return;
  const dpr=window.devicePixelRatio||1;
  const W=cv.clientWidth||140, H=cv.clientHeight||44;
  cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  const ACC=(getComputedStyle(document.documentElement).getPropertyValue('--chart1')||'#1e7a4b').trim();
  const xx=ACC.replace('#','');
  const rr=parseInt(xx.substr(0,2),16),gg=parseInt(xx.substr(2,2),16),bb=parseInt(xx.substr(4,2),16);
  let min=Math.min(...valores), max=Math.max(...valores);
  const rg=Math.max(0.5,max-min); min-=rg*0.2; max+=rg*0.2;
  const X=i=>4+(W-8)*(i/(valores.length-1));
  const Y=v=>4+(H-8)*(1-(v-min)/(max-min));
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,`rgba(${rr},${gg},${bb},0.22)`); grad.addColorStop(1,`rgba(${rr},${gg},${bb},0)`);
  ctx.beginPath(); ctx.moveTo(X(0),H);
  valores.forEach((v,i)=>ctx.lineTo(X(i),Y(v)));
  ctx.lineTo(X(valores.length-1),H); ctx.closePath();
  ctx.fillStyle=grad; ctx.fill();
  ctx.beginPath();
  valores.forEach((v,i)=>{i===0?ctx.moveTo(X(i),Y(v)):ctx.lineTo(X(i),Y(v));});
  ctx.strokeStyle=ACC; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.stroke();
  const last=valores.length-1;
  ctx.beginPath(); ctx.arc(X(last),Y(valores[last]),3,0,Math.PI*2);
  ctx.fillStyle=ACC; ctx.fill();
}

// Gráfica de medida seleccionada (reusa estilo de drawPesoChart)
let medChartSel='cintura';
function setMedChart(campo){
  medChartSel=campo;
  document.querySelectorAll('.chip-sel[data-med]').forEach(c=>c.classList.toggle('ac',c.dataset.med===campo));
  dibujarMedChart();
}
function dibujarMedChart(){
  const s=activeSocio; if(!s) return;
  const arr=(s.logs?.medidas||[]).filter(m=>m[medChartSel]!=null).map(m=>({fecha:m.fecha,kg:m[medChartSel]}));
  const cv=document.getElementById('chart-med'); if(!cv) return;
  drawSerieEnCanvas(cv, arr, ' cm');
}
// Generalización del dibujo de series (misma estética que peso)
function drawSerieEnCanvas(cv, serie, sufijo){
  const dpr=window.devicePixelRatio||1;
  const W=cv.clientWidth||320, H=cv.clientHeight||150;
  cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,H);
  const ACC=(getComputedStyle(document.documentElement).getPropertyValue('--chart1')||'#1e7a4b').trim();
  const TXC=(getComputedStyle(document.documentElement).getPropertyValue('--tx')||'#173527').trim();
  const hx=s=>{const x=s.replace('#','');return [parseInt(x.substr(0,2),16),parseInt(x.substr(2,2),16),parseInt(x.substr(4,2),16)];};
  const [ar,ag,ab]=hx(ACC), [tr,tg,tb]=hx(TXC);
  if(serie.length<2){
    ctx.fillStyle=`rgba(${tr},${tg},${tb},0.4)`; ctx.font='10px Figtree, sans-serif'; ctx.textAlign='center';
    ctx.fillText('Registra esta medida 2+ veces para ver la curva',W/2,H/2); return;
  }
  const pad={l:36,r:12,t:14,b:20};
  const vals=serie.map(p=>p.kg);
  let min=Math.min(...vals),max=Math.max(...vals);
  const rg=Math.max(1,max-min); min-=rg*0.15; max+=rg*0.15;
  const X=i=>pad.l+(W-pad.l-pad.r)*(i/(serie.length-1));
  const Y=v=>pad.t+(H-pad.t-pad.b)*(1-(v-min)/(max-min));
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.07)`; ctx.lineWidth=1;
  for(let g=0;g<=3;g++){
    const y=pad.t+(H-pad.t-pad.b)*g/3;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    ctx.fillStyle=`rgba(${tr},${tg},${tb},0.4)`; ctx.font='8px Figtree, sans-serif'; ctx.textAlign='right';
    ctx.fillText((max-(max-min)*g/3).toFixed(1),pad.l-5,y+3);
  }
  const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b);
  grad.addColorStop(0,`rgba(${ar},${ag},${ab},0.18)`); grad.addColorStop(1,`rgba(${ar},${ag},${ab},0)`);
  ctx.beginPath(); ctx.moveTo(X(0),H-pad.b);
  serie.forEach((p,i)=>ctx.lineTo(X(i),Y(p.kg)));
  ctx.lineTo(X(serie.length-1),H-pad.b); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
  ctx.beginPath();
  serie.forEach((p,i)=>{i===0?ctx.moveTo(X(i),Y(p.kg)):ctx.lineTo(X(i),Y(p.kg));});
  ctx.strokeStyle=ACC; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.stroke();
  serie.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(X(i),Y(p.kg),2.6,0,Math.PI*2);
    ctx.fillStyle=(getComputedStyle(document.documentElement).getPropertyValue('--dk3')||'#fff').trim(); ctx.fill();
    ctx.strokeStyle=ACC; ctx.lineWidth=1.5; ctx.stroke();
  });
  ctx.fillStyle=`rgba(${tr},${tg},${tb},0.45)`; ctx.font='8px Figtree, sans-serif';
  ctx.textAlign='left'; ctx.fillText(fmtFecha(serie[0].fecha),pad.l,H-6);
  ctx.textAlign='right'; ctx.fillText(fmtFecha(serie[serie.length-1].fecha)+(sufijo||''),W-pad.r,H-6);
}
