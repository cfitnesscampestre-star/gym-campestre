/* ═══ composicion rehab ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// COMPOSICIÓN CORPORAL — avatar paramétrico
// El avatar escala según las medidas en cm
// ═════════════════════════════════════════
const MED_CAMPOS=[
  {id:'pecho',  nm:'PECHO',  base:95, min:60, max:160},
  {id:'cintura',nm:'CINTURA',base:85, min:50, max:160},
  {id:'cadera', nm:'CADERA', base:95, min:60, max:160},
  {id:'brazo',  nm:'BRAZO',  base:32, min:18, max:60},
  {id:'muslo',  nm:'MUSLO',  base:55, min:35, max:90},
];
function medEscala(med,campo){
  const c=MED_CAMPOS.find(x=>x.id===campo);
  const v=med&&med[campo];
  if(!v||!c) return 1;
  return Math.max(0.72, Math.min(1.38, v/c.base));
}
function getMedidas(s){
  const arr=s.logs?.medidas||[];
  return { primera: arr[0]||null, ultima: arr[arr.length-1]||null, todas: arr };
}

// Avatar SVG frontal — escala hombros/pecho, cintura, cadera, brazos y muslos
let _avatarIdSeq=0;
function avatarSVG(med, opts){
  const o=Object.assign({h:170, color:'var(--v)', opacidad:1}, opts||{});
  const sP=medEscala(med,'pecho');   // pecho → hombros + torso alto
  const sW=medEscala(med,'cintura'); // cintura
  const sH=medEscala(med,'cadera');  // cadera
  const sB=medEscala(med,'brazo');   // grosor de brazo
  const sM=medEscala(med,'muslo');   // grosor de muslo
  const uid='av'+(_avatarIdSeq++);

  const cx=60;
  const hombro=19*sP, pechoW=16*sP, cintW=10.5*sW, cadW=13*sH;
  const yHombro=34, yPecho=50, yCint=74, yCad=88;

  // Torso con curvas suaves
  const torso=`M ${cx-hombro} ${yHombro}
    C ${cx-pechoW-2} ${yPecho-4}, ${cx-pechoW} ${yPecho+4}, ${cx-cintW} ${yCint}
    C ${cx-cintW-1} ${yCint+6}, ${cx-cadW} ${yCad-4}, ${cx-cadW} ${yCad}
    L ${cx+cadW} ${yCad}
    C ${cx+cadW} ${yCad-4}, ${cx+cintW+1} ${yCint+6}, ${cx+cintW} ${yCint}
    C ${cx+pechoW} ${yPecho+4}, ${cx+pechoW+2} ${yPecho-4}, ${cx+hombro} ${yHombro}
    Q ${cx} ${yHombro-7} ${cx-hombro} ${yHombro} Z`;

  const armW=10*sB, thighW=13.5*sM;
  const armX=hombro+3;

  // Líneas de definición muscular (pecho, abdomen, oblicuos) — puramente decorativas,
  // se dibujan por ENCIMA del relleno con opacidad baja para dar look anatómico sin volverse ilustración realista.
  const musculo=`
    <path d="M ${cx-pechoW*0.55} ${yPecho-2} Q ${cx} ${yPecho+3} ${cx+pechoW*0.55} ${yPecho-2}" fill="none" stroke="url(#${uid}-ln)" stroke-width="1.3" opacity=".55"/>
    <path d="M ${cx} ${yPecho+6} L ${cx} ${yCint+2}" fill="none" stroke="url(#${uid}-ln)" stroke-width="1.1" opacity=".5"/>
    ${[0,1,2].map(i=>`<path d="M ${cx-cintW*0.5} ${yPecho+10+i*6} Q ${cx} ${yPecho+12+i*6} ${cx+cintW*0.5} ${yPecho+10+i*6}" fill="none" stroke="url(#${uid}-ln)" stroke-width="1" opacity=".4"/>`).join('')}
    <path d="M ${cx-hombro*0.6} ${yHombro+2} Q ${cx-cintW*0.9} ${yPecho+8} ${cx-cintW*0.75} ${yCint-2}" fill="none" stroke="url(#${uid}-ln)" stroke-width="1" opacity=".4"/>
    <path d="M ${cx+hombro*0.6} ${yHombro+2} Q ${cx+cintW*0.9} ${yPecho+8} ${cx+cintW*0.75} ${yCint-2}" fill="none" stroke="url(#${uid}-ln)" stroke-width="1" opacity=".4"/>`;

  return `<svg viewBox="0 0 120 175" height="${o.h}" style="opacity:${o.opacidad};overflow:visible">
    <defs>
      <linearGradient id="${uid}-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${o.color==='var(--v)'?'var(--v2)':o.color}"/>
        <stop offset="100%" stop-color="${o.color}"/>
      </linearGradient>
      <linearGradient id="${uid}-ln" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${o.color}" stop-opacity=".9"/>
        <stop offset="100%" stop-color="${o.color}" stop-opacity=".3"/>
      </linearGradient>
      <filter id="${uid}-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g fill="url(#${uid}-fill)" stroke="none" stroke-linecap="round" filter="url(#${uid}-glow)">
      <!-- cabeza -->
      <circle cx="${cx}" cy="14" r="9"/>
      <rect x="${cx-3.5}" y="21" width="7" height="8" rx="2"/>
      <!-- torso -->
      <path d="${torso}"/>
      <!-- brazos -->
      <line x1="${cx-armX}" y1="${yHombro+4}" x2="${cx-armX-5}" y2="60" stroke="url(#${uid}-fill)" stroke-width="${armW}"/>
      <line x1="${cx-armX-5}" y1="60" x2="${cx-armX-7}" y2="84" stroke="url(#${uid}-fill)" stroke-width="${armW*0.72}"/>
      <line x1="${cx+armX}" y1="${yHombro+4}" x2="${cx+armX+5}" y2="60" stroke="url(#${uid}-fill)" stroke-width="${armW}"/>
      <line x1="${cx+armX+5}" y1="60" x2="${cx+armX+7}" y2="84" stroke="url(#${uid}-fill)" stroke-width="${armW*0.72}"/>
      <!-- piernas -->
      <line x1="${cx-7}" y1="${yCad+2}" x2="${cx-8}" y2="124" stroke="url(#${uid}-fill)" stroke-width="${thighW}"/>
      <line x1="${cx-8}" y1="124" x2="${cx-8}" y2="158" stroke="url(#${uid}-fill)" stroke-width="${thighW*0.62}"/>
      <line x1="${cx+7}" y1="${yCad+2}" x2="${cx+8}" y2="124" stroke="url(#${uid}-fill)" stroke-width="${thighW}"/>
      <line x1="${cx+8}" y1="124" x2="${cx+8}" y2="158" stroke="url(#${uid}-fill)" stroke-width="${thighW*0.62}"/>
    </g>
    <g>${musculo}</g>
  </svg>`;
}



// ═════════════════════════════════════════
// MÓDULO DE REHABILITACIÓN — REHAB CENTER
// Base clínica de los protocolos de rehabilitación (aplicable a cualquier socio)
// (pie/tobillo/rodilla/espalda baja/cadera/muñeca)
// Predominio de lesiones por SOBREUSO.
// Filosofía: fases (agudo→fuerza→retorno),
// dolor como semáforo, isométricos primero,
// nunca sustituye valoración médica.
// ═════════════════════════════════════════
