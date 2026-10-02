/* ═══ estadisticas ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// ESTADÍSTICAS DE EVOLUCIÓN
// ═════════════════════════════════════════
function inicioSemana(d){
  const x = new Date(d);
  const day = x.getDay(); // 0=dom
  const diff = (day===0 ? 6 : day-1); // lunes como inicio
  x.setDate(x.getDate()-diff); x.setHours(0,0,0,0);
  return x;
}
function calcEvolucion(s){
  const ses = s.logs?.sesiones || [];
  const total = ses.length;
  const iniSem = inicioSemana(new Date()).getTime();
  const estaSemana = ses.filter(x=>x.ts>=iniSem).length;

  // Adherencia últimas 4 semanas: sesiones reales / objetivo
  const hace4 = new Date(); hace4.setDate(hace4.getDate()-28);
  const ult4 = ses.filter(x=>x.ts>=hace4.getTime()).length;
  const objetivo4 = s.dias*4;
  const adherencia = objetivo4>0 ? Math.min(100, Math.round((ult4/objetivo4)*100)) : 0;

  // Racha: semanas consecutivas (hacia atrás) con ≥1 sesión
  let racha = 0;
  let cursor = inicioSemana(new Date());
  for(let i=0;i<52;i++){
    const ini = cursor.getTime();
    const fin = ini + 7*86400000;
    const hubo = ses.some(x=>x.ts>=ini && x.ts<fin);
    if(hubo){ racha++; cursor = new Date(ini - 7*86400000); }
    else { if(i===0){ cursor = new Date(ini - 7*86400000); continue; } break; }
  }

  // Cambio de peso
  const pesos = s.logs?.pesoCorporal || [];
  let deltaPeso = null;
  if(pesos.length>=2) deltaPeso = +(pesos[pesos.length-1].kg - pesos[0].kg).toFixed(1);

  // Volumen total esta semana (kg levantados aprox)
  const volSemana = ses.filter(x=>x.ts>=iniSem).reduce((a,x)=>a+(x.volumen||0),0);
  const tutSemana = ses.filter(x=>x.ts>=iniSem).reduce((a,x)=>a+(x.tut||0),0);

  return { total, estaSemana, adherencia, racha, deltaPeso, volSemana, tutSemana, ult4 };
}

// ── Mapa de rendimiento: fuerza, resistencia, constancia, volumen y nivel del socio ──
// No depende de medidas corporales — usa datos reales que ya se registran en la app (PRs, sesiones, cardio, nivel).
function calcularRendimiento(s){
  const ev=calcEvolucion(s);
  const prs=Object.values(s.logs?.prs||{});
  let fuerza=0;
  if(prs.length && s.peso){
    const ratios=prs.map(p=>p.kg/s.peso);
    const avgRatio=ratios.reduce((a,b)=>a+b,0)/ratios.length;
    fuerza=Math.max(0,Math.min(100,Math.round(avgRatio*55)));
  }
  const cardioMap={'NUNCA O CASI NUNCA':20,'1 – 2 VECES POR SEMANA':55,'3 O MÁS VECES':90};
  const resistencia = cardioMap[(s.cardio||'').toUpperCase()] ?? 40;
  const constancia = ev.adherencia;
  const volObjetivo=(s.dias||3)*1800;
  const volumen = volObjetivo>0 ? Math.max(0,Math.min(100,Math.round((ev.volSemana/volObjetivo)*100))) : 0;
  const nivelMap={'PRINCIPIANTE':30,'INTERMEDIO':62,'AVANZADO':92};
  const nivel = nivelMap[s.nivel] ?? 40;
  return {'Fuerza':fuerza,'Resistencia':resistencia,'Constancia':constancia,'Volumen':volumen,'Nivel':nivel};
}

// ── Mapa de equilibrio corporal: qué tan pareja es la progresión entre pecho, cintura, cadera, brazo, muslo y peso.
// 50 = sin cambio todavía; sube hacia 100 conforme esa zona progresa en la dirección deseada, baja si retrocede.
// Así, si una zona se queda atrás mientras las demás avanzan, el polígono se nota "hundido" justo ahí — el desequilibrio.
function calcularEquilibrioCorporal(s){
  const {primera,ultima}=getMedidas(s);
  const crece=['pecho','brazo','muslo']; // estas suman si crecen; cintura/cadera suman si bajan
  const stats={};
  const sinDatos = !primera || !ultima || primera===ultima;
  MED_CAMPOS.forEach(c=>{
    if(sinDatos){ stats[c.nm]=50; return; }
    const a=primera[c.id], b=ultima[c.id];
    if(a==null||b==null||!a){ stats[c.nm]=50; return; }
    const pct=((b-a)/a)*100;
    const bueno = crece.includes(c.id) ? pct : -pct;
    stats[c.nm]=Math.max(0,Math.min(100,Math.round(50+bueno*(50/8)))); // ±8% de cambio = rango completo
  });
  // Peso: dirección deseada según objetivo
  const pesos=s.logs?.pesoCorporal||[];
  if(pesos.length>=2){
    const a=pesos[0].kg, b=pesos[pesos.length-1].kg;
    const pct=a?((b-a)/a)*100:0;
    const bajarEsBueno = s.objetivo==='PERDER PESO';
    const subirEsBueno = s.objetivo==='GANAR MÚSCULO';
    const bueno = bajarEsBueno ? -pct : subirEsBueno ? pct : -Math.abs(pct)*0.5;
    stats['PESO']=Math.max(0,Math.min(100,Math.round(50+bueno*(50/6))));
  } else stats['PESO']=50;
  return stats;
}

// ── Gráfica de radar (malla de rendimiento) genérica: recibe {etiqueta: valor 0-100} ──
let _radarIdSeq=0;
function radarChartSVG(stats, opts){
  const o=Object.assign({size:200,color:'var(--v)',color2:null,glow:false},opts||{});
  const labels=Object.keys(stats);
  const n=labels.length||1;
  const cx=110,cy=100,R=74;
  const uid='rad'+(_radarIdSeq++);
  const ang=i=>-Math.PI/2 + i*(2*Math.PI/n);
  const pt=(i,r)=>[cx+r*Math.cos(ang(i)), cy+r*Math.sin(ang(i))];
  const rings=[0.25,0.5,0.75,1].map(f=>{
    const pts=labels.map((_,i)=>pt(i,R*f).join(',')).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="var(--b)" stroke-width="1"/>`;
  }).join('');
  const fillRef = o.color2 ? `url(#${uid}-g)` : o.color;
  const axes=labels.map((lb,i)=>{
    const [x,y]=pt(i,R);
    const [lx,ly]=pt(i,R+18);
    const val=Math.max(0,Math.min(100,Math.round(stats[lb]||0)));
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--b)" stroke-width="1"/>
      <text x="${lx}" y="${ly}" font-size="9" fill="var(--mu)" font-family="var(--fb)" text-anchor="middle" dominant-baseline="middle">${esc(lb)}</text>
      <text x="${lx}" y="${ly+11}" font-size="9" font-weight="700" fill="${o.color}" font-family="var(--fb)" text-anchor="middle" dominant-baseline="middle">${val}</text>`;
  }).join('');
  const dataPts=labels.map((lb,i)=>{ const v=Math.max(0,Math.min(100,stats[lb]||0)); return pt(i,R*(v/100)).join(','); }).join(' ');
  const dots=labels.map((lb,i)=>{ const v=Math.max(0,Math.min(100,stats[lb]||0)); const [x,y]=pt(i,R*(v/100));
    return `<circle cx="${x}" cy="${y}" r="3.4" fill="${fillRef}" ${o.glow?`filter="url(#${uid}-glow)"`:''}/>`; }).join('');
  const defs=`<defs>
      ${o.color2?`<radialGradient id="${uid}-g" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="${o.color2}"/><stop offset="100%" stop-color="${o.color}"/>
      </radialGradient>`:''}
      ${o.glow?`<filter id="${uid}-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`:''}
    </defs>`;
  return `<svg viewBox="0 0 220 225" width="${o.size}" height="${Math.round(o.size*1.02)}">
    ${defs}
    ${rings}
    ${axes}
    <polygon points="${dataPts}" fill="${fillRef}" fill-opacity="${o.glow?.4:.28}" stroke="${fillRef}" stroke-width="${o.glow?2.6:2}" ${o.glow?`filter="url(#${uid}-glow)"`:''}/>
    ${dots}
  </svg>`;
}

// Sesiones por día de la semana actual → barras
function sesionesSemana(s){
  const ses = s.logs?.sesiones || [];
  const ini = inicioSemana(new Date());
  return DIAS_ORDER.map((k,i)=>{
    const dIni = new Date(ini); dIni.setDate(ini.getDate()+i);
    const dFin = new Date(dIni); dFin.setDate(dIni.getDate()+1);
    return ses.some(x=>x.ts>=dIni.getTime() && x.ts<dFin.getTime());
  });
}
