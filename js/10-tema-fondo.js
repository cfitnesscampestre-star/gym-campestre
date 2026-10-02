/* ═══ tema fondo ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// TEMA — claro / oscuro (se recuerda en el dispositivo)
// ═════════════════════════════════════════
const LS_TEMA='fitkiosk_theme';
function temaActual(){ const t=document.documentElement.getAttribute('data-theme'); return (t==='dark'||t==='light2')?t:'light'; }
function pintarSelectorTema(){
  const t=temaActual();
  document.querySelectorAll('.theme-seg button,.seg2 button').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.t===t)));
  const m=document.querySelector('meta[name="theme-color"]');
  if(m) m.setAttribute('content', t==='dark'?'#0A0E13':(t==='light2'?'#F3EEFC':'#EEF1F4'));
}
function setTema(t){
  if(t!=='light'&&t!=='dark'&&t!=='light2') return;
  document.documentElement.setAttribute('data-theme',t);
  try{ localStorage.setItem(LS_TEMA,t); }catch(e){}
  pintarSelectorTema();
  if(window.florRedibujar) window.florRedibujar();
  // los gráficos se dibujan en canvas: se vuelven a pintar con los colores del tema
  if(activeSocio && document.getElementById('s-dash').classList.contains('on')){
    const on=tabActiva();
    dashTab(on);
  }
}
// Botón rápido (sol/luna) de la pantalla de inicio del socio:
// oscuro -> 1 toque = claro (verde, el de siempre); 2 toques seguidos = tema nuevo (prueba).
// desde cualquier tema claro, 1 toque siempre regresa a oscuro (sin cambios).
let _temaTapT=0;
function temaToque(){
  const t=temaActual();
  if(t!=='dark'){ setTema('dark'); return; }
  const ahora=Date.now();
  if(ahora-_temaTapT<380){
    _temaTapT=0;
    setTema('light2');
  }else{
    _temaTapT=ahora;
    setTimeout(()=>{ if(_temaTapT===ahora) setTema('light'); },380);
  }
}
(function initTema(){
  const html=`<div class="theme-seg" role="group" aria-label="Tema de color">
    <button type="button" data-t="light" aria-label="Tema claro (verde)" onclick="setTema('light')"><svg class="ico" aria-hidden="true"><use href="#i-sun"/></svg></button>
    <button type="button" data-t="light2" aria-label="Tema claro nuevo (prueba)" onclick="setTema('light2')"><svg class="ico" aria-hidden="true"><use href="#i-spark"/></svg></button>
    <button type="button" data-t="dark" aria-label="Tema oscuro" onclick="setTema('dark')"><svg class="ico" aria-hidden="true"><use href="#i-moon"/></svg></button>
  </div>`;
  document.querySelectorAll('.theme-slot').forEach(el=>{ el.innerHTML=html; });
  pintarSelectorTema();
})();

// ═════════════════════════════════════════
// FONDO DE INICIO — destellos + latido con anillos difuminados
// ═════════════════════════════════════════
(function destellosInicio(){
  const cv=document.getElementById('destellos'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU=Math.PI*2;
  let W=0,H=0,dpr=1,diag=1,rayos=[],anillos=[],ult=0,acum=0,flash=0,prox=1.0,dub=-1;
  function size(){
    dpr=Math.min(1.5,window.devicePixelRatio||1);
    W=window.innerWidth; H=window.innerHeight; diag=Math.hypot(W,H);
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
    if(reduce) estatico();
  }
  function pal(){
    return temaActual()==='dark'
      ? {linea:[255,255,255,.17], puntos:[[255,255,255],[255,255,255],[150,236,240],[255,190,196]], glow:[190,255,240], base:.30, anillo:[170,255,225], aa:.42}
      : {linea:[11,110,84,.21],   puntos:[[11,122,82],[6,140,163],[214,84,108],[11,122,82]],       glow:[16,181,122], base:.22, anillo:[16,170,115], aa:.42};
  }
  function crear(edad,rapido){
    const u=Math.random();
    return {
      a:Math.random()*TAU,
      max:diag*(0.04+0.62*Math.pow(u,1.7)+(Math.random()<0.06?0.25:0)),
      k:rapido?6+Math.random()*4:1.7+Math.random()*3,
      dr:diag*0.014*(0.4+Math.random()),
      vida:rapido?3+Math.random()*2.5:4+Math.random()*4,
      edad:edad||0, tam:0.7+Math.random()*1.7, tw:Math.random()*6.28, tf:2+Math.random()*3.5,
      c:Math.floor(Math.random()*4)
    };
  }
  // el impulso sale del centro de la pantalla; en escritorio, del espacio de la derecha
  function centro(){
    if(W>=760){
      const f=document.querySelector('#s-inicio .ancla');
      if(f){ const b=f.getBoundingClientRect(); if(b.width>0) return [b.left+b.width/2,b.top+b.height/2]; }
    }
    return [W/2,H*0.5];
  }
  function dibujar(t,estat){
    const P=pal(), [cx,cy]=centro();
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    // anillos difuminados del latido
    for(const q of anillos){
      if(q.age<0) continue;
      const p=q.age/q.life, r=diag*0.85*(1-Math.pow(1-p,2.2)), w=diag*(0.035+0.07*p);
      const a=q.s*Math.pow(1-p,1.4)*P.aa; if(a<=0.005) continue;
      const g=ctx.createRadialGradient(cx,cy,Math.max(0,r-w),cx,cy,r+w), c=P.anillo;
      g.addColorStop(0,'rgba('+c[0]+','+c[1]+','+c[2]+',0)');
      g.addColorStop(0.55,'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')');
      g.addColorStop(1,'rgba('+c[0]+','+c[1]+','+c[2]+',0)');
      ctx.beginPath(); ctx.arc(cx,cy,r,0,TAU); ctx.lineWidth=2*w; ctx.strokeStyle=g; ctx.stroke();
    }
    for(const r of rayos){
      const L=r.max*(estat?1:(1-Math.exp(-r.k*r.edad)))+(estat?0:r.dr*r.edad);
      const p=r.edad/r.vida;
      const env=estat?1:Math.min(1,r.edad/0.2)*(p>0.6?Math.max(0,1-(p-0.6)/0.4):1);
      if(env<=0.01) continue;
      const x=cx+Math.cos(r.a)*L, y=cy+Math.sin(r.a)*L;
      ctx.strokeStyle='rgba('+P.linea[0]+','+P.linea[1]+','+P.linea[2]+','+(P.linea[3]*env*(0.6+0.8*flash)).toFixed(3)+')';
      ctx.lineWidth=0.7; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.stroke();
      const c=P.puntos[r.c], tw=0.55+0.45*Math.sin(t*r.tf+r.tw);
      ctx.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+Math.min(1,env*tw*(0.75+0.5*flash)).toFixed(3)+')';
      ctx.beginPath(); ctx.arc(x,y,r.tam,0,TAU); ctx.fill();
    }
    // resplandor central que "late"
    const rad=diag*(0.09+0.42*flash), g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
    const q=P.glow, a0=Math.min(.85,P.base+0.5*flash);
    g.addColorStop(0,'rgba('+q[0]+','+q[1]+','+q[2]+','+a0.toFixed(3)+')');
    g.addColorStop(.25,'rgba('+q[0]+','+q[1]+','+q[2]+','+(a0*0.28).toFixed(3)+')');
    g.addColorStop(1,'rgba('+q[0]+','+q[1]+','+q[2]+',0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  }
  function estatico(){ rayos=[]; anillos=[{age:0.5,life:2.6,s:0.8}]; const n=W<600?220:380; for(let i=0;i<n;i++) rayos.push(crear(0,false)); dibujar(1.2,true); }
  // un latido: ráfaga de rayos + destello + anillo
  function latido(f){
    flash=Math.max(flash,f);
    const n=Math.round((W<600?55:95)*f); for(let i=0;i<n;i++) rayos.push(crear(0,true));
    anillos.push({age:0,life:2.6,s:f});
    anillos.push({age:-0.14,life:2.9,s:f*0.55});
  }
  window.__destello=()=>latido(1);
  function frame(ms){
    requestAnimationFrame(frame);
    const t=ms/1000, dt=Math.min(0.05,ult?t-ult:0.016); ult=t;
    if(!document.getElementById('s-inicio').classList.contains('on')||document.hidden) return;
    acum+=dt*(W<600?60:100);
    while(acum>=1){ rayos.push(crear(0,false)); acum--; }
    prox-=dt; if(prox<=0){ latido(1); dub=0.24; prox=2.4+Math.random()*1.2; }   // "lub"
    if(dub>=0){ dub-=dt; if(dub<0){ latido(0.6); dub=-1; } }                     // "dub"
    flash=Math.max(0,flash-dt*2.1);
    for(const r of rayos) r.edad+=dt;
    for(const q of anillos) q.age+=dt;
    rayos=rayos.filter(r=>r.edad<r.vida); anillos=anillos.filter(q=>q.age<q.life);
    dibujar(t,false);
  }
  size();
  window.addEventListener('resize',size);
  if(reduce) estatico();
  else { for(let i=0;i<(W<600?170:300);i++) rayos.push(crear(Math.random()*3,false)); requestAnimationFrame(frame); }
  const _rd=window.florRedibujar; window.florRedibujar=()=>{ if(_rd) _rd(); if(reduce) estatico(); };
})();
