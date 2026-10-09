/* ═══ rutinas ia fallback ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// GENERACIÓN DE RUTINA (IA + fallback)
// Filosofía del entrenador intacta
// ═════════════════════════════════════════
// ── Traduce la filosofía del entrenador elegido en instrucciones concretas para la IA ──
// Si el socio no eligió entrenador o ese entrenador aún no llenó su filosofía,
// se usa la base clínica del club (comportamiento histórico, sin cambios).
function detalleFilosofiaAvanzada(ph,objetivo){
  const L=[];
  const per={lineal:'lineal (subir carga bloque a bloque)',ondulante:'ondulante (días pesados, medios y ligeros en la misma semana)',bloques:'por bloques (acumulación → intensificación → descarga)',conjugada:'conjugada (fuerza máxima y velocidad en la misma semana)'}[ph.structure&&ph.structure.periodization];
  if(per) L.push('Periodización: '+per+'.');
  const d=ph.dosis||{};
  if(d.fuerza||d.hipertrofia||d.resistencia) L.push(`Rangos de reps del entrenador: fuerza ${d.fuerza||'3-6'}, hipertrofia ${d.hipertrofia||'8-12'}, resistencia ${d.resistencia||'15-20'}.`);
  const m=ph.metodos||{};
  if((m.favoritos||[]).length) L.push('Métodos FAVORITOS (úsalos con prioridad cuando el nivel lo permita): '+m.favoritos.map(id=>KB_METODOS[id]?KB_METODOS[id].nm:id).join(', ')+'.');
  if((m.evita||[]).length) L.push('Métodos que este entrenador NO usa: '+m.evita.map(id=>KB_METODOS[id]?KB_METODOS[id].nm:id).join(', ')+'.');
  if(m.frecuencia) L.push('Densidad de métodos: '+['','casi rutinas limpias','pocos métodos','moderada','muchos métodos','método en casi cada ejercicio'][m.frecuencia]+'.');
  if(m.principiantes) L.push('Con principiantes: '+{no:'sin métodos, técnica primero',basicos:'solo tempo, pausas y superserie antagonista',si:'también métodos intermedios si hay buena técnica'}[m.principiantes]+'.');
  const se=ph.seleccion||{};
  if(se.libreVsMaquina) L.push('Equipo preferido: '+(se.libreVsMaquina>=4?'peso libre':se.libreVsMaquina<=2?'máquinas y poleas':'mezcla de peso libre y máquinas')+'. Trabajo unilateral: '+(se.unilateral>=4?'mucho':se.unilateral<=2?'poco':'moderado')+'.');
  if(se.firma) L.push('Ejercicios firma (inclúyelos cuando encajen): '+se.firma);
  if(se.nunca) L.push('NUNCA programar: '+se.nunca);
  const ss=ph.sesion||{};
  const txt={calentamiento:{movilidad:'movilidad general + activación',aproximacion:'series de aproximación del primer ejercicio',especifico:'activación específica del músculo del día'},
    orden:{compuesto:'compuesto pesado primero y aislamiento al final',preagot:'a veces pre-agotamiento antes del compuesto',prioridad:'primero lo que el socio más necesita'},
    tempo:{controlado:'bajada lenta y controlada siempre',explosivo:'bajada controlada y subida explosiva',fase:'según la fase'},
    core:{diario:'algo de core en cada sesión',semanal:'2-3 bloques de core por semana',integrado:'core integrado en los compuestos'},
    cardio:{dias:'días propios de cardio',final:'bloque corto de zona 2 al final',intervalos:'intervalos y circuitos metabólicos',objetivo:'según el objetivo del socio'}};
  const ses=Object.keys(txt).filter(k=>ss[k]&&txt[k][ss[k]]).map(k=>k+': '+txt[k][ss[k]]);
  if(ses.length) L.push('Estructura de sesión — '+ses.join('; ')+'.');
  const hp=ph.horaPico||{};
  if(hp.sustitucion) L.push('Opciones por área ocupada: prefiere '+{maquina:'máquina o polea con el mismo enfoque',mancuernas:'mancuernas o zona funcional',corporal:'peso corporal y bandas',metodo:'cambiar el método con el equipo disponible'}[hp.sustitucion]+'.'+(hp.nota?' Mensaje al socio: '+hp.nota:''));
  if(ph.sampleRoutineNote) L.push('SESIÓN TÍPICA DE ESTE ENTRENADOR (imita su estilo): '+ph.sampleRoutineNote);
  if(typeof filoModeloIA==='function'){ const mi=filoModeloIA(ph,objetivo); if(mi) L.push(mi.replace(/^   - /,'')); }   // su rutina modelo para el objetivo de este socio
  return L.map(x=>'   - '+x).join('\n');
}
function construirFilosofiaEntrenador(){
  const ent = qAnswers.entrenadorId ? getEntrenador(qAnswers.entrenadorId) : null;
  const ph = ent && ent.filosofia;
  const BASE = `1. DIAGNÓSTICO ANTES QUE RUTINA
   Leer el perfil completo antes de prescribir cualquier ejercicio. Las limitaciones físicas no son obstáculos, son variables de diseño.

2. PROPIOCEPCIÓN NEUROSENSITIVA
   Cada ejercicio DEBE incluir una nota de dónde sentir el estímulo: qué músculo, en qué ángulo, hacia dónde dirigir la sensación. No es solo "haz el movimiento", es "siente este músculo en esta dirección". El campo "tip" de cada ejercicio DEBE ser una instrucción propioceptiva, no solo técnica genérica.
   Ejemplo correcto: "En el jalón al pecho, lleva los codos hacia las caderas mientras sientes la contracción del dorsal ancho justo debajo de la axila. Varía el ángulo del tronco para sentir diferente zona del dorsal."
   Ejemplo incorrecto: "Mantén la espalda recta."

3. SECUENCIA DE FASES (RESPETAR SIEMPRE)
   Fuerza → Resistencia → Hipertrofia
   No saltarse fases. El músculo debe poder aguantar antes de crecer. Los tendones y ligamentos necesitan adaptarse antes de trabajar en volumen.

4. LESIONES = SUSTITUCIÓN, NO ELIMINACIÓN
   Si hay lesión en rodilla: no sentadilla, PERO sí trabajar cuádriceps con prensa en rango parcial, extensión de rodilla controlada, isométricos de cuádriceps en camilla, step-ups bajos. Nunca eliminar el grupo muscular.
   Si hay lesión en hombro: no press militar, PERO sí elevaciones frontales con mancuerna ligera, trabajo de manguito rotador, cables en ángulos bajos.
   Si hay lesión lumbar: no peso muerto convencional, PERO sí peso muerto rumano con poco peso, extensiones en máquina, bird-dog, puentes de glúteo.

5. CARDIO = FUNCIÓN CARDIOVASCULAR
   El cardio no va al final como "quema de grasa". Es trabajo cardiovascular-respiratorio integrado. El déficit calórico se genera incrementando la actividad total, no con cardio de castigo. Las sesiones de cardio son sesiones de entrenamiento cardiovascular con propósito.

6. CRITERIO DE AJUSTE ANTE ESTANCAMIENTO
   Reevaluar técnica y estímulo antes de aumentar cargas.`;

  if(!ph || !ph.tagline) return BASE;

  const NOMBRES_PRIORIDAD={fuerza:'fuerza máxima',hipertrofia:'hipertrofia / estética',movilidad:'movilidad y prevención',rendimiento:'rendimiento deportivo',funcional:'entrenamiento funcional'};
  const pr = ph.priorities||{};
  const top = Object.entries(pr).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>NOMBRES_PRIORIDAD[k]||k);
  const metodoTxt = {rpe:'RPE (esfuerzo percibido)',rir:'RIR (repeticiones en reserva)',porcentajes:'porcentajes de 1RM',fallo:'series al fallo'}[ph.structure?.method] || 'el criterio del entrenador según la sesión';
  const progresoTxt = {numeros:'números concretos: peso, reps y cargas',calidad:'calidad de movimiento antes que números',mixto:'una mezcla de números y calidad de movimiento'}[ph.progressStyle] || 'una combinación de números y técnica';
  const variedadAlta = (ph.exerciseStyle && ph.exerciseStyle.variety || 3) >= 4;
  const variedadTxt = variedadAlta
    ? 'Prioriza ALTA VARIEDAD de ejercicios — evita repetir los mismos movimientos semana a semana, busca estímulos distintos que mantengan al cuerpo adaptándose.'
    : 'Prioriza POCOS MOVIMIENTOS DOMINADOS — repite los ejercicios base de la semana y progresa sobre ellos en vez de rotar constantemente.';
  const descansoTxt = (ph.exerciseStyle && ph.exerciseStyle.restStyle==='autorregulado')
    ? 'El descanso entre series es autorregulado (según sensación de recuperación del socio), no un tiempo fijo.'
    : 'El descanso entre series es un tiempo fijo y consistente entre sets.';

  return `1. ESTA ES LA FILOSOFÍA PERSONAL DEL ENTRENADOR ELEGIDO — NO USES UN ENFOQUE GENÉRICO
   Frase que la resume: "${ph.tagline}"
   Prioriza especialmente: ${top.join(' y ')}.
   Mide el progreso del socio principalmente con: ${progresoTxt}.

2. ESTRUCTURA Y MÉTODO DE ESTE ENTRENADOR
   ${ph.structure && ph.structure.split ? 'Forma de organizar la semana que suele usar: '+ph.structure.split : 'Organiza la semana según el split recomendado más abajo.'}
   Dosifica la intensidad con: ${metodoTxt}.
   ${variedadTxt}
   ${descansoTxt}

2b. DETALLE DEL ESTILO DE ESTE ENTRENADOR
${detalleFilosofiaAvanzada(ph,qAnswers.objetivo)||'   (sin detalle adicional)'}

3. PROPIOCEPCIÓN NEUROSENSITIVA (se mantiene siempre, sin importar el entrenador)
   Cada ejercicio DEBE incluir una nota de dónde sentir el estímulo: qué músculo, en qué ángulo, hacia dónde dirigir la sensación. El campo "tip" DEBE ser instrucción propioceptiva específica, no técnica genérica.

4. LESIONES = SUSTITUCIÓN, NO ELIMINACIÓN
   Si hay lesión en rodilla: no sentadilla, PERO sí prensa en rango parcial, extensión controlada, isométricos, step-ups bajos. Nunca eliminar el grupo muscular.
   Si hay lesión en hombro: no press militar, PERO sí elevaciones frontales ligeras, manguito rotador, cables en ángulos bajos.
   Si hay lesión lumbar: no peso muerto convencional, PERO sí peso muerto rumano ligero, extensiones en máquina, bird-dog, puentes de glúteo.

5. CARDIO = FUNCIÓN CARDIOVASCULAR
   El cardio no es "quema de grasa" al final. Es entrenamiento cardiovascular con propósito propio, integrado a la semana.

6. CRITERIO DE ESTE ENTRENADOR ANTE UN ESTANCAMIENTO
   ${ph.adjustmentPhilosophy || 'Reevaluar técnica y estímulo antes de aumentar cargas.'}`;
}

// ── Endpoint del proxy de IA (Cloudflare Worker). Vacío = usar plantillas. ──
const AI_ENDPOINT = ''; // p.ej. 'https://rutinas-ia.TU-CUENTA.workers.dev'

async function generarRutina(){
  qAnswers.dias = parseInt(document.getElementById('qr-dias').value);
  qAnswers.edad = parseInt(document.getElementById('qr-edad').value);
  qAnswers.peso = parseInt(document.getElementById('qr-peso').value);
  qAnswers.estatura = parseInt(document.getElementById('qr-est').value);
  const q11sel=document.querySelector('#qq11 .opt.sel');
  if(q11sel) qAnswers.cardio=q11sel.querySelector('.ol').textContent.trim();

  go('s-loading');

  // Rehabilitación, rendimiento deportivo y flexibilidad usan planes estructurados
  // (no dependen del modelo de IA para garantizar la base clínica/deportiva)
  if(['REHABILITACIÓN','RENDIMIENTO DEPORTIVO','FLEXIBILIDAD'].includes(qAnswers.objetivo)){
    setTimeout(()=>mostrarPreview(buildFallback()), 600);
    return;
  }

  try{
    const edad=qAnswers.edad;
    const limitaciones=qAnswers.limitaciones.join(', ')||'Ninguna';
    const zonas=qAnswers.zonas.join(', ')||'General';
    const dias=qAnswers.dias, nivel=qAnswers.nivel, objetivo=qAnswers.objetivo;
    const tieneEdadJoven = edad<=35;
    const tieneLesion = limitaciones!=='Ninguna' && !limitaciones.includes('Sin limitaciones');

    // Cruce días × clases grupales: solo estos días "puro" llevan el split completo de abajo
    const deriv=derivarDiasEntrenamiento();
    const nFull=deriv.puro.length;
    const splitMap={
      0:'Sin sesión completa de gimnasio esta semana — toda la carga fuerte la cubren sus clases grupales; solo agrega sesiones ligeras en los días marcados como complemento en el mapa de abajo.',
      1:'Full Body (1 sesión completa a la semana)',
      2:'Full Body A / Full Body B',
      3:'Full Body (3 sesiones variadas)',
      4:'Torso / Pierna (2+2)',
      5:'Torso / Pierna + 1 sesión de accesorios',
      6:'División por grupos musculares (Push/Pull/Legs o similar)',
    };
    const splitRecomendado=splitMap[nFull]!==undefined?splitMap[nFull]:splitMap[4];

    let faseInicial='';
    if(tieneLesion){
      faseInicial='FASE 1 — REHABILITACIÓN Y FUERZA BASE: El socio tiene limitación física. OBLIGATORIO: iniciar con ejercicios isométricos de baja carga en la zona afectada, sustituir movimientos que impliquen carga directa sobre la lesión (NO eliminar el grupo muscular, SUSTITUIR con ejercicios alternativos que trabajen los mismos músculos sin agravar la zona). Secuencia: Fuerza isométrica → Resistencia → Hipertrofia.';
    } else if(objetivo==='GANAR MÚSCULO' && tieneEdadJoven){
      faseInicial='FASE INICIAL — HIPERTROFIA CON BASE DE FUERZA: Socio joven sin lesiones. Tendones y articulaciones en buen estado. Puede entrar directamente a rangos de hipertrofia (8-12 reps) combinando con trabajo de fuerza (4-6 reps en ejercicios compuestos). Recuperación rápida permite mayor volumen. Nutrición: superávit calórico natural, sin restricción, aumentar ingesta conforme aumente el gasto.';
    } else if(objetivo==='GANAR MÚSCULO' && !tieneEdadJoven){
      faseInicial='FASE INICIAL — FUERZA PRIMERO: Socio adulto (+35 años). Las fibras musculares existen pero están subutilizadas. Empezar con rangos de fuerza (5-6 reps, peso moderado-alto, buena técnica) para activar fibras sin sobrecargar articulaciones. Progresar a resistencia y luego hipertrofia. Recuperación más lenta: respetar descansos entre sesiones.';
    } else if(objetivo==='PERDER PESO'){
      faseInicial='FASE INICIAL — FUERZA Y ACTIVIDAD: El cardio NO es para quemar calorías al final: es trabajo cardiovascular-respiratorio. El déficit calórico se genera incrementando la actividad física total. Aumentar el gasto calórico progresivamente mediante el entrenamiento. Indicar al socio que sentirá más hambre: debe controlarla sin restricción extrema. Empezar con fuerza base y resistencia muscular para preservar masa magra.';
    } else if(objetivo==='FUERZA PURA'){
      faseInicial='FASE INICIAL — FUERZA MÁXIMA: Trabajo en rangos de 3-6 reps con pesos altos. Movimientos compuestos como eje. Si el socio ya tiene experiencia, romper el patrón anterior cambiando el split o la metodología (si venía haciendo por grupos musculares → pasar a torso/pierna o full body, y viceversa). Introducir métodos como piramidal o series descendentes si el socio ya los conoce.';
    } else {
      faseInicial='FASE INICIAL — RESISTENCIA Y BASE FUNCIONAL: Mezcla de trabajo funcional y pesos libres. Progresión desde estímulos básicos hacia mayor intensidad.';
    }

    const cambioMetodologia = nivel==='AVANZADO'
      ? 'IMPORTANTE — SOCIO EXPERIMENTADO: Sacar al socio de su rutina habitual para crear nuevo estímulo. Si venía haciendo por grupos musculares → usar Torso/Pierna o Full Body. Si venía haciendo Full Body → dividir en grupos. El objetivo es que el cuerpo reciba un estímulo diferente al que estaba acostumbrado. Puedes introducir métodos avanzados: piramidal, series descendentes, rest-pause, superseries.'
      : '';

    const filosofiaEntBlock = construirFilosofiaEntrenador();
    const conocimientoBlock = bloqueConocimientoIA(ctxQuiz());
    const diasSemanaTexto = (qAnswers.diasSemana&&qAnswers.diasSemana.length===dias)
      ? qAnswers.diasSemana.map(k=>DIAS_NAMES[k]).join(', ')
      : '';
    const mapaDiasBlock = bloqueMapaDias();
    const clasesBlock = bloqueClasesGrupales();

    const prompt = `Eres el sistema de generación de rutinas del Director de Fitness del Club Campestre Aguascalientes. Tu trabajo es generar rutinas que reflejen EXACTAMENTE la filosofía y metodología del entrenador a cargo — NO una plantilla genérica.

═══════════════════════════════════════════
FILOSOFÍA DEL ENTRENADOR (SEGUIR AL PIE DE LA LETRA)
═══════════════════════════════════════════

${filosofiaEntBlock}

7. SPLIT POR DÍAS DE ENTRENAMIENTO
   ${splitRecomendado}
   Este split se reparte ÚNICAMENTE entre los días marcados "GIMNASIO COMPLETO" en el mapa de días de abajo. NO lo repartas en los demás días.

7b. MAPA DE DÍAS DE LA SEMANA (obligatorio — cruza los días que el socio puede entrenar con sus clases grupales; no lo cambies ni lo reinterpretes)
${mapaDiasBlock}
   Regla de carga: en los días de GIMNASIO LIGERO / COMPLEMENTARIO la sesión debe ser notablemente MÁS CORTA (2-4 ejercicios, series bajas, lejos del fallo) que en un día de GIMNASIO COMPLETO — el socio ya entrenó fuerte en su clase ese día; la meta es complementar, nunca sumar dos entrenamientos completos en un solo día.

8. FASE INICIAL PARA ESTE PERFIL
   ${faseInicial}

${cambioMetodologia ? '9. '+cambioMetodologia : ''}
${clasesBlock}
═══════════════════════════════════════════
BASE DE CONOCIMIENTO DEL CLUB (CONSULTAR SIEMPRE)
═══════════════════════════════════════════
${conocimientoBlock}

═══════════════════════════════════════════
PERFIL DEL SOCIO
═══════════════════════════════════════════
- Nombre: ${qAnswers.nombre}
- Objetivo: ${objetivo}
- Nivel: ${nivel}
- Edad: ${edad} años
- Género: ${qAnswers.genero}
- Peso: ${qAnswers.peso} kg
- Estatura: ${qAnswers.estatura} cm
- Días disponibles: ${dias} días/semana${diasSemanaTexto ? ' — específicamente: '+diasSemanaTexto : ''}
- Zonas a priorizar: ${zonas}
- Limitaciones físicas: ${limitaciones}
- Frecuencia de cardio actual: ${qAnswers.cardio}

═══════════════════════════════════════════
INSTRUCCIONES DE FORMATO
═══════════════════════════════════════════
Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin backticks, sin comentarios.
El campo "tip" de cada ejercicio DEBE ser una instrucción propioceptiva específica (dónde sentir, en qué ángulo, qué músculo exacto).
El campo "peso" debe ser descriptivo: "Ligero — 40% 1RM", "Moderado — 60% 1RM", "Isométrico — sin carga", etc.
El campo "reps" debe incluir el rango y el propósito: "6 reps — fuerza", "15 reps — resistencia", "45 seg — isométrico". Los ejercicios isométricos (plancha, sentadilla isométrica, aguantes) SIEMPRE se prescriben por TIEMPO: "series" = rondas y "reps" = segundos por ronda (ej. 3 rondas × "30 seg — isométrico", "por lado" si es unilateral); el tiempo sube con el nivel del socio y nunca se expresa en repeticiones.

{
  "perfil": {
    "nivel": "",
    "objetivo": "",
    "split": "",
    "fase": "",
    "nota": "",
    "consejos": ["solo si el socio toma clases grupales, ver sección 10"]
  },
  "semana": [
    {
      "dia": "LUNES",
      "tipo": "",
      "color": "verde|neon|gold|red|hombro|descanso",
      "ejercicios": [
        {
          "nombre": "",
          "series": 4,
          "reps": "",
          "peso": "",
          "musculo": "",
          "enfoque": "cuadriceps|gluteo|femoral|pecho|dorsal|... (clave del catálogo)",
          "tip": "",
          "metodo": {"id": "id del método o vacío", "detalle": "cómo aplicarlo en ESTE ejercicio"},
          "grupo": "A1 si va encadenado con el siguiente (A2); vacío si no",
          "descanso": "90 s",
          "alternativas": [
            {"nombre": "", "musculo": "", "nota": "por qué sirve si el área está ocupada"}
          ]
        }
      ]
    }
  ]
}

Genera los 7 días de la semana, en orden LUNES a DOMINGO, exactamente como indica el MAPA DE DÍAS de la sección 7b (gimnasio completo, gimnasio ligero, descanso por clase, o descanso total según corresponda a cada día).
Respeta la filosofía del entrenador en cada ejercicio, no solo en la estructura general.
La rutina NO debe verse genérica: varía los métodos entre días, usa los favoritos del entrenador y da 5-7 ejercicios por sesión de fuerza.`;

    // La API de Anthropic NO se puede llamar directo desde el navegador en GitHub Pages
    // (requiere API key secreta). Se usa un proxy propio (ver worker-ia.js).
    if(!AI_ENDPOINT) throw new Error('sin-endpoint');
    const ctrl = new AbortController(); const to=setTimeout(()=>ctrl.abort(), 45000);
    const res = await fetch(AI_ENDPOINT,{
      method:'POST',headers:{'Content-Type':'application/json'}, signal:ctrl.signal,
      body:JSON.stringify({prompt})
    });
    clearTimeout(to);
    if(!res.ok) throw new Error('http '+res.status);
    const data = await res.json();
    const raw = (data.content||[]).map(b=>b.text||'').join('');
    const parsed = JSON.parse(raw.replace(/```json|```/g,'').trim());
    if(!parsed.semana || !parsed.perfil) throw new Error('formato');
    parsed.origen='ia';
    mostrarPreview(parsed);
  }catch(e){
    console.warn('Rutina con plantilla (IA no disponible):', e && e.message);
    const fb=buildFallback(); fb.origen='plantilla';
    mostrarPreview(fb);
  }
}

// ── Mapa de días: cruza días de entrenamiento × clases grupales, sin ambigüedad ──
function bloqueMapaDias(){
  const deriv=derivarDiasEntrenamiento();
  const li=(arr,f)=>arr.map(f).join(', ');
  const lineas=[];
  if(deriv.puro.length) lineas.push(`   - GIMNASIO COMPLETO (sigue el split de la sección 7): ${li(deriv.puro,d=>DIAS_NAMES[d])}`);
  if(deriv.conClase.length) lineas.push(`   - GIMNASIO LIGERO / COMPLEMENTARIO (también hay clase ese día — sesión corta, evita el enfoque muscular de la clase): ${li(deriv.conClase,d=>`${DIAS_NAMES[d]} (clase: ${deriv.infoClasePorDia[d].clase})`)}`);
  if(deriv.soloClase.length) lineas.push(`   - SIN GIMNASIO — descanso a nivel gym, ya tiene su clase (${li(deriv.soloClase,d=>`${DIAS_NAMES[d]}: ${deriv.infoClasePorDia[d].clase}`)})`);
  const usados=[...deriv.puro,...deriv.conClase,...deriv.soloClase];
  const descanso=DIAS_ORDER.filter(d=>!usados.includes(d));
  if(descanso.length) lineas.push(`   - DESCANSO TOTAL: ${li(descanso,d=>DIAS_NAMES[d])}`);
  return lineas.join('\n')||'   (el socio no marcó días — usa un split estándar de 4 días)';
}

// ── Bloque de clases grupales del socio para el prompt de IA (contexto de cada clase) ──
function bloqueClasesGrupales(){
  const lista=(qAnswers.clasesGrupales||[]).filter(c=>c.dias&&c.dias.length);
  if(!lista.length) return '';
  const filas=lista.map(c=>{
    const kb=KB_CLASES_IDX[c.clase];
    const detalle=kb?`Tipo: ${kb.tipo}. Enfoque muscular: ${kb.enfoque.map(e=>KB_ENFOQUES[e]||e).join(', ')}. ${kb.desc}`:'';
    return `   - ${c.clase}: ${detalle}`;
  }).join('\n');
  return `
10. CLASES GRUPALES QUE EL SOCIO YA TOMA (contexto — el mapa de días de la sección 7b ya dice qué hacer cada día, no lo repitas ni lo contradigas)
${filas}
   - En el día INMEDIATAMENTE ANTERIOR y el día INMEDIATAMENTE POSTERIOR a cada clase (esté o no marcado como "con gym" ese mismo día): evita programar fuerte el mismo enfoque muscular que esa clase trabaja, para no acumular fatiga sobre el mismo tejido (ej. si Body Pump es martes y es fuerte en pierna, no pongas pierna pesada lunes ni miércoles).
   - Agrega el campo "perfil.consejos": arreglo de 2 a 4 frases cortas y prácticas para combinar estas clases con el plan de gimnasio (hidratación, priorizar técnica sobre peso/ritmo en la clase, avisar a su entrenador si hay dolor muscular importante, no buscar igualar el volumen de un día completo en un día ligero).
`;
}

function ctxQuiz(){
  const ent=qAnswers.entrenadorId?getEntrenador(qAnswers.entrenadorId):null;
  return ctxDesdePerfil({nivel:qAnswers.nivel,objetivo:qAnswers.objetivo,limitaciones:qAnswers.limitaciones}, ent&&ent.filosofia);
}
function mostrarPreview(data){
  try{
    normalizarRutinaIA(data);
    const ctxP=ctxQuiz(), entP=qAnswers.entrenadorId?getEntrenador(qAnswers.entrenadorId):null;
    const semillaP=(qAnswers.nombre||'')+Date.now();
    if(data.origen==='plantilla') diversificarSemana(data.semana, ctxP, entP&&entP.filosofia, semillaP);
    ajustarIsometricos(data.semana, ctxP);
    ajustarCardioRondas(data.semana, {edad:qAnswers.edad, objetivo:qAnswers.objetivo, nivel:qAnswers.nivel});
    enriquecerSemana(data.semana, ctxP, semillaP);
  }
  catch(e){ console.warn('No se pudo enriquecer la rutina',e); }
  window._rutinaTemp = data;
  renderPreview(data);
  go('s-preview');
}

function renderPreview(rutina){
  const iconMap={'GANAR MÚSCULO':'💪','PERDER PESO':'🔥','FUERZA PURA':'⚡','RESISTENCIA':'🏃','FLEXIBILIDAD':'🧘','RENDIMIENTO DEPORTIVO':'🏅','REHABILITACIÓN':'🏥'};
  document.getElementById('pv-icon').textContent=iconMap[qAnswers.objetivo]||'🏋️';
  document.getElementById('pv-nombre').textContent=qAnswers.nombre.toUpperCase();
  document.getElementById('pv-meta').textContent=`${rutina.perfil.nivel} · ${qAnswers.edad} años · ${qAnswers.peso} kg · ${qAnswers.dias} días/sem · ${rutina.perfil.split}`;

  const badgeColors={
    'GANAR MÚSCULO':'color:var(--v);border-color:color-mix(in srgb, var(--v) 30%, transparent);background:color-mix(in srgb, var(--v) 7%, transparent)',
    'PERDER PESO':'color:var(--r);border-color:color-mix(in srgb,var(--r) 30%,transparent);background:color-mix(in srgb,var(--r) 7%,transparent)',
    'FUERZA PURA':'color:var(--g);border-color:color-mix(in srgb,var(--g) 30%,transparent);background:color-mix(in srgb,var(--g) 7%,transparent)',
    'RESISTENCIA':'color:var(--n);border-color:color-mix(in srgb,var(--n) 30%,transparent);background:color-mix(in srgb,var(--n) 7%,transparent)',
  };
  const bc=badgeColors[qAnswers.objetivo]||badgeColors['GANAR MÚSCULO'];
  document.getElementById('pv-badges').innerHTML=`
    <div class="badge" style="${bc}">${qAnswers.objetivo}</div>
    <div class="badge bn">${rutina.perfil.nivel}</div>
    <div class="badge" style="color:var(--mu);border-color:color-mix(in srgb,var(--tx) 10%,transparent)">${rutina.perfil.fase||rutina.perfil.split}</div>
  `;
  document.getElementById('pv-nota').textContent='💡 '+(rutina.perfil.nota||'Plan generado según tu perfil.');

  const pvCons=document.getElementById('pv-consejos');
  const consejos=Array.isArray(rutina.perfil.consejos)?rutina.perfil.consejos.filter(Boolean):[];
  if(consejos.length){
    pvCons.style.display='block';
    pvCons.innerHTML='<b>🧘 Consejos para combinar tus clases con el gym</b><br>'+consejos.map(c=>'• '+esc(c)).join('<br>');
  } else { pvCons.style.display='none'; pvCons.innerHTML=''; }

  // ── Preview de nutrición calculada ──
  const tmpSocio={peso:qAnswers.peso,estatura:qAnswers.estatura,edad:qAnswers.edad,genero:qAnswers.genero,dias:qAnswers.dias,objetivo:qAnswers.objetivo,logs:{pesoCorporal:[]}};
  const nut=calcNutricion(tmpSocio);
  document.getElementById('pv-nutri').innerHTML=`
    <div style="font-family:var(--fb);font-size:var(--fs-xs);letter-spacing:0;color:var(--mu);margin-bottom:10px;display:flex;align-items:center;gap:10px;">
      TU PLAN DE NUTRICIÓN
      <div style="flex:1;height:1px;background:var(--b)"></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
      <div class="mi" style="padding:10px 8px;background:var(--gl);border:1px solid var(--b);border-radius:9px;text-align:center;"><div style="font-family:var(--fd);font-size:var(--fs-2xl);color:var(--v)">${nut.kcal}</div><div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb)">KCAL/DÍA</div></div>
      <div class="mi" style="padding:10px 8px;background:var(--gl);border:1px solid var(--b);border-radius:9px;text-align:center;"><div style="font-family:var(--fd);font-size:var(--fs-2xl);color:var(--n)">${nut.prot}g</div><div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb)">PROTEÍNA</div></div>
      <div class="mi" style="padding:10px 8px;background:var(--gl);border:1px solid var(--b);border-radius:9px;text-align:center;"><div style="font-family:var(--fd);font-size:var(--fs-2xl);color:var(--g)">${nut.carbs}g</div><div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb)">CARBS</div></div>
      <div class="mi" style="padding:10px 8px;background:var(--gl);border:1px solid var(--b);border-radius:9px;text-align:center;"><div style="font-family:var(--fd);font-size:var(--fs-2xl);color:var(--p)">${nut.grasas}g</div><div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb)">GRASAS</div></div>
    </div>
    <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);margin-top:7px;">Mifflin-St Jeor · BMR ${nut.bmr} kcal × ${nut.factor} actividad = ${nut.tdee} kcal · ${nut.ajusteTxt}</div>
  `;

  const chipColors={
    verde:'background:color-mix(in srgb, var(--v) 10%, transparent);color:var(--v);border:1px solid color-mix(in srgb, var(--v) 20%, transparent)',
    neon:'background:color-mix(in srgb,var(--n) 10%,transparent);color:var(--n);border:1px solid color-mix(in srgb,var(--n) 20%,transparent)',
    gold:'background:color-mix(in srgb,var(--g) 10%,transparent);color:var(--g);border:1px solid color-mix(in srgb,var(--g) 20%,transparent)',
    red:'background:color-mix(in srgb,var(--r) 10%,transparent);color:var(--r);border:1px solid color-mix(in srgb,var(--r) 20%,transparent)',
    hombro:'background:color-mix(in srgb,var(--p) 10%,transparent);color:#b464ff;border:1px solid color-mix(in srgb,var(--p) 20%,transparent)',
    descanso:'background:color-mix(in srgb,var(--tx) 4%,transparent);color:var(--mu);border:1px solid color-mix(in srgb,var(--tx) 7%,transparent)',
  };
  const cont=document.getElementById('pv-semana');
  cont.innerHTML='';
  rutina.semana.forEach(dia=>{
    const cc=chipColors[dia.color]||chipColors.verde;
    const isRest=!dia.ejercicios||dia.ejercicios.length===0;
    const ejHTML=isRest
      ? `<div style="padding:8px 14px 10px;font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb)">Recuperación activa · descanso</div>`
      : dia.ejercicios.map((e,ei)=>`
          <div style="display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:start;padding:8px 10px;background:var(--in-bg2);border-radius:7px;margin-bottom:5px;">
            <div style="font-family:var(--fd);font-size:var(--fs-base);color:var(--v)">${String(ei+1).padStart(2,'0')}</div>
            <div>
              <div style="font-size:var(--fs-xs);font-weight:600">${esc(e.nm||e.nombre)}</div>
              <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb)">${esc(rxTexto(e,qAnswers).sr)} · ${esc(rxTexto(e,qAnswers).carga)}</div>
              <div style="font-size:var(--fs-xs);color:var(--v);margin-top:2px">${e.ms||e.musculo||''}${e.descanso?' · descanso '+esc(e.descanso):''}</div>
              ${e.metodo?`<div style="font-size:var(--fs-xs);margin-top:3px;color:var(--p)">${e.grupo?'<b>'+esc(e.grupo)+'</b> · ':''}⚡ ${esc(e.metodo.nm)}${e.metodo.detalle?' — '+esc(e.metodo.detalle):''}</div>`:''}
              ${(e.alternativas||[]).length?`<div style="font-size:var(--fs-xs);margin-top:3px;color:var(--mu)">⇄ Si está ocupado: ${e.alternativas.map(a=>esc(a.nm)).join(' · ')}</div>`:''}
              ${e.tip?`<div style="font-size:var(--fs-xs);color:var(--n);margin-top:4px;font-family:var(--fb);line-height:1.5;padding:6px 8px;background:color-mix(in srgb,var(--n) 4%,transparent);border-radius:5px;border-left:2px solid color-mix(in srgb,var(--n) 30%,transparent)">💡 ${e.tip}</div>`:''}
            </div>
          </div>`).join('');
    cont.innerHTML+=`
      <div style="background:var(--gl);border:1px solid var(--b);border-radius:11px;overflow:hidden;">
        <div style="display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:9px;padding:11px 14px;cursor:pointer;"
             onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
          <div style="font-family:var(--fd);font-size:var(--fs-xl);color:var(--mu)">${dia.dia.substring(0,3)}</div>
          <div>
            <div style="font-size:var(--fs-xs);font-weight:600">${dia.tipo}</div>
            <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb)">${isRest?'Descanso':dia.ejercicios.length+' ejercicios'}</div>
          </div>
          <div class="chip" style="${cc}">${dia.color.toUpperCase()}</div>
        </div>
        <div style="display:none;padding:0 10px 8px;">${ejHTML}</div>
      </div>`;
  });
}

// ── Confirmar: crea socio persistente con código único ──
async function fbCodigoLibre(){
  for(let i=0;i<15;i++){
    const c=String(Math.floor(1000+Math.random()*9000));
    if(DB.socios[c]) continue;
    if(fbListo && fbAuth && navigator.onLine){
      try{ if(await fbConUsuario(4000)){ const sn=await fbDB.ref('/socios/'+c).once('value'); if(sn.exists()) continue; } }catch(e){}
    }
    return c;
  }
  return String(Math.floor(1000+Math.random()*9000));
}
async function confirmarRutina(){
  const rutina=window._rutinaTemp;
  if(!rutina){ go('s-inicio'); return; }

  const code=await fbCodigoLibre();
  document.getElementById('pend-code').textContent=code;

  const keys=['lun','mar','mie','jue','vie','sab','dom'];
  const rutinaConvertida={};
  rutina.semana.forEach((d,i)=>{
    const k=keys[i]||keys[6];
    rutinaConvertida[k]={
      label:DIAS_NAMES[k], tipo:d.tipo, color:d.color||'verde',
      ejercicios:(d.ejercicios||[]).map(e=>({
        nm:e.nm||e.nombre, series:e.series, reps:e.reps, peso:e.peso,
        ms:e.ms||e.musculo, tip:e.tip||'Siente este músculo durante el movimiento.',
        enf:e.enf||e.enfoque||'', metodo:e.metodo||null, grupo:e.grupo||'', descanso:e.descanso||'',
        alternativas:e.alternativas||[]
      }))
    };
  });
  keys.forEach(k=>{
    if(!rutinaConvertida[k]) rutinaConvertida[k]={label:DIAS_NAMES[k],tipo:'DESCANSO',color:'descanso',ejercicios:[]};
  });

  const nuevo={
    code, nombre:limpiarTexto(qAnswers.nombre).toUpperCase(), id:'#CC-'+code,
    objetivo:qAnswers.objetivo, nivel:qAnswers.nivel,
    edad:qAnswers.edad, genero:qAnswers.genero,
    peso:qAnswers.peso, estatura:qAnswers.estatura, dias:qAnswers.dias,
    diasSemana:[...(qAnswers.diasSemana||[])],
    clasesGrupales:(qAnswers.clasesGrupales||[]).filter(c=>c.dias&&c.dias.length).map(c=>({clase:c.clase,dias:[...c.dias],entrenaMismoDia:!!c.entrenaMismoDia})),
    zonas:[...qAnswers.zonas],
    limitaciones:qAnswers.limitaciones.filter(l=>l!=='Sin limitaciones'),
    cardio:qAnswers.cardio,
    disciplina:qAnswers.disciplina||'', lesionRehab:qAnswers.lesionRehab||'', entorno:qAnswers.entorno||'',
    origenRutina:(rutina.origen||'plantilla'),
    status:'pendiente', asignado:qAnswers.entrenadorNombre||'—', entrenadorId:qAnswers.entrenadorId||'', fechaRegistro:fechaISO(new Date()),
    rutina:rutinaConvertida,
    logs:{ sesiones:[], pesoCorporal:[{fecha:fechaISO(new Date()),kg:qAnswers.peso}], prs:{}, asistencia:[], medidas:[], lesiones:[] }
  };
  // Datos clínicos de rehabilitación (si aplica)
  if(qAnswers.objetivo==='REHABILITACIÓN'){
    nuevo.gimnasta={
      edad:qAnswers.gimEdad, inicioDolor:qAnswers.gimInicioDolor,
      cuando:[...(qAnswers.gimCuando||[])], dolorInicial:qAnswers.gimDolor,
      clases:[...(qAnswers.gimClases||[])], sigue:qAnswers.gimSigue,
      diagnostico:qAnswers.gimDiagnostico, diagTexto:qAnswers.gimDiagTexto||'',
      medicoAutoriza:qAnswers.gimMedicoAutoriza||'',
      rehabTotal: (window._rutinaTemp && window._rutinaTemp.rehabTotal)||false
    };
  }
  // Si es rehabilitación, activar el protocolo por fases automáticamente
  if(qAnswers.objetivo==='REHABILITACIÓN' && qAnswers.lesionRehab){
    const faseIni = (window._rutinaTemp && window._rutinaTemp.perfil && /FASE 2/.test(window._rutinaTemp.perfil.fase)) ? 1 : 0;
    nuevo.logs.lesiones.push({protoId:qAnswers.lesionRehab, faseActual:faseIni, fechaInicio:fechaISO(new Date()),
      historial: qAnswers.gimDolor ? [{fecha:fechaISO(new Date()), dolor: qAnswers.gimDolor<=2?1:qAnswers.gimDolor<=5?2:3}] : []});
  }
  DB.socios[code]=nuevo;
  dbSave(code);

  window._rutinaTemp=null;
  // limpiar quiz
  Object.assign(qAnswers,{nombre:'',objetivo:'',nivel:'',zonas:[],limitaciones:[],cardio:'',disciplina:'',lesionRehab:'',entorno:'',gimCuando:[],gimClases:[],gimInicioDolor:'',gimSigue:'',gimDiagnostico:'',gimDiagTexto:'',gimMedicoAutoriza:'',gimGenero:'',gimPeso:0,gimEstatura:0,gimSoloTerapia:'',entrenadorId:'',entrenadorNombre:'',diasSemana:[],tomaClases:'',clasesSel:[],clasesGrupales:[]});
  document.getElementById('qi-nom').value='';
  document.querySelectorAll('.q-sc .opt').forEach(o=>o.classList.remove('sel'));
  document.querySelectorAll('.q-sc .chk').forEach(c=>c.classList.remove('ck'));
  ['qb2','qb3','qb6','qb11','qbT'].forEach(id=>{const b=document.getElementById(id); if(b) b.disabled=true;});
  go('s-pending');
}

// ═════════════════════════════════════════
// FALLBACK — rutinas base con filosofía Fer
// ═════════════════════════════════════════
function buildFallback(){
  const dias=qAnswers.dias, objetivo=qAnswers.objetivo, edad=qAnswers.edad;
  const tieneLesion=qAnswers.limitaciones.length>0 && !qAnswers.limitaciones.includes('Sin limitaciones');
  const lesiones=qAnswers.limitaciones.join(', ');
  const joven=edad<=35;

  // ══ RAMA REHABILITACIÓN ══
  if(objetivo==='REHABILITACIÓN' && qAnswers.lesionRehab){
    return buildFallbackRehab(qAnswers.lesionRehab, dias);
  }
  // ══ RAMA RENDIMIENTO DEPORTIVO ══
  if(objetivo==='RENDIMIENTO DEPORTIVO' && qAnswers.disciplina){
    return buildFallbackDeporte(qAnswers.disciplina, dias, qAnswers.nivel);
  }
  // ══ RAMA FLEXIBILIDAD ══
  if(objetivo==='FLEXIBILIDAD'){
    return buildFallbackFlex(dias);
  }

  // Tipo/color de cada sesión COMPLETA, en el orden en que se asignan a los días "puros" de gym
  const TIPOS_SPLIT={
    1:[['Full Body','verde']],
    2:[['Full Body A','verde'],['Full Body B','neon']],
    3:[['Full Body A','verde'],['Full Body B','neon'],['Full Body C','gold']],
    4:[['Torso A','verde'],['Pierna A','gold'],['Torso B','neon'],['Pierna B','gold']],
    5:[['Torso A','verde'],['Pierna A','gold'],['Torso B','neon'],['Pierna B','gold'],['Accesorios + Core','hombro']],
    6:[['Pecho + Tríceps','verde'],['Espalda + Bíceps','neon'],['Pierna','gold'],['Hombro + Core','hombro'],['Full Body Funcional','red'],['Cardiovascular','red']],
  };
  // Cruce días elegidos × clases grupales: solo los días "puro" llevan sesión completa;
  // los días "conClase" llevan sesión ligera que evita el enfoque de la clase; "soloClase" queda en descanso de gym.
  const deriv=derivarDiasEntrenamiento();
  const nFull=deriv.puro.length;
  const tiposSesion=TIPOS_SPLIT[nFull]||TIPOS_SPLIT[Math.max(1,Math.min(6,nFull))]||TIPOS_SPLIT[4];
  const mapaDias={};
  deriv.puro.forEach((d,i)=>{ mapaDias[d]={tipo:(tiposSesion[i]||tiposSesion[tiposSesion.length-1])[0], color:(tiposSesion[i]||tiposSesion[tiposSesion.length-1])[1]}; });
  deriv.conClase.forEach(d=>{ mapaDias[d]={tipo:'Complemento — '+deriv.infoClasePorDia[d].clase, color:'hombro', complemento:deriv.infoClasePorDia[d]}; });
  deriv.soloClase.forEach(d=>{ mapaDias[d]={tipo:'Descanso (clase: '+deriv.infoClasePorDia[d].clase+')', color:'descanso'}; });
  const split=DIAS_ORDER.map(d=> mapaDias[d] ? [DIAS_NAMES[d],mapaDias[d].tipo,mapaDias[d].color,mapaDias[d].complemento] : [DIAS_NAMES[d],'Descanso','descanso',null]);
  const lesRodilla=lesiones.includes('Rodilla'), lesHombro=lesiones.includes('Hombro'), lesLumbar=lesiones.includes('lumbar')||lesiones.includes('Espalda');
  // Semilla de variedad: sin esto, "Torso A" de CUALQUIER socio siempre elegía la opción 0 de cada
  // lista de ejercicios alternativos (ver elegir() más abajo), así que dos socios con el mismo split
  // terminaban con exactamente los mismos ejercicios, solo con reps/series distintas por nivel.
  // Con esta semilla (nueva en cada generación), el punto de partida de la rotación cambia por socio,
  // y sigue siendo consistente entre los días de su propia semana (Torso A distinto de Torso B).
  const varSeed = Math.floor(Math.random()*997);

  function ejs(tipo){
    if(tipo.includes('Descanso')) return [];
    const fuerza = objetivo==='FUERZA PURA' || (!joven && objetivo==='GANAR MÚSCULO');
    const repsBase = fuerza ? '6 reps — fuerza' : objetivo==='PERDER PESO'||objetivo==='RESISTENCIA' ? '15 reps — resistencia' : '10 reps — hipertrofia';
    const t=tipo.toLowerCase();
    const L=[];
    function add(nm,series,reps,peso,ms,tip){ L.push({nombre:nm,series,reps,peso,musculo:ms,tip}); }
    // Variante A/B/C del mismo tipo de sesión (ej. "Full Body A" vs "Full Body B") → usamos un
    // ejercicio distinto por hueco muscular en cada una, para que la semana no se sienta repetida.
    const variante = {A:0,B:1,C:2}[(tipo.trim().match(/([ABC])$/)||[])[1]] ?? 0;
    function elegir(v,i){ return v[(i+varSeed) % v.length]; }

    if(t.includes('full body')||t.includes('funcional')){
      if(lesRodilla) add('Prensa de Piernas (rango parcial)',3,repsBase,'Moderado — 50% 1RM','Cuádriceps · Glúteo','Rango donde no haya molestia: siente el muslo cargando, nunca la rodilla.');
      else { const op=elegir([
          ['Sentadilla Goblet','Desciende sintiendo la tensión repartida en muslo y glúteo; empuja el suelo con todo el pie.'],
          ['Zancadas Caminando','Tronco erguido; siente el glúteo de la pierna delantera al bajar y subir.'],
          ['Step-up con Mancuernas','Empuja con el talón del pie de arriba; siente el glúteo cerrar el movimiento.'],
        ],variante); add(op[0],3,repsBase,'Moderado — 50% 1RM','Cuádriceps · Glúteo',op[1]); }
      if(lesHombro) add('Elevación Frontal Ligera',3,'12 reps — resistencia','Ligero — 30% 1RM','Deltoides Anterior','Sube solo hasta donde no haya molestia, sintiendo el frente del hombro.');
      else { const op=elegir([
          ['Press de Pecho en Máquina','Al empujar, dirige la sensación al centro del pectoral, no a los hombros.'],
          ['Press Banca con Mancuernas','Baja sintiendo el estiramiento del pecho; sube dirigiendo la contracción al centro.'],
          ['Fondos en Banco','Codos cerca del cuerpo; siente el pecho y tríceps al subir.'],
        ],variante); add(op[0],3,repsBase,'Moderado — 55% 1RM','Pecho Mayor',op[1]); }
      { const op=elegir([
          ['Remo en Polea Baja','Lleva los codos a las caderas sintiendo el dorsal bajo la axila y el cierre de escápulas.'],
          ['Remo con Mancuerna','Codo a la cadera; siente cómo se junta la escápula al centro.'],
          ['Jalón al Pecho','Codos hacia las caderas; siente el dorsal justo debajo de la axila.'],
        ],variante); add(op[0],3,repsBase,'Moderado — 55% 1RM','Dorsal · Romboides',op[1]); }
      if(lesLumbar) add('Puente de Glúteo',3,'15 reps — resistencia','Corporal','Glúteo','Sube la cadera apretando glúteo 2 seg arriba; la lumbar se mantiene neutra.');
      else { const op=elegir([
          ['Peso Muerto Rumano','Siente el estiramiento del femoral al bajar con espalda neutra; sube con la cadera.'],
          ['Hip Thrust','Aprieta glúteo 2 seg arriba; la fuerza nace de la cadera, no de la espalda baja.'],
          ['Curl Femoral en Máquina','Sube en 3 segundos sintiendo la parte trasera del muslo contraerse.'],
        ],variante); add(op[0],3,repsBase,'Moderado — 50% 1RM','Femorales · Glúteo',op[1]); }
      { const op=elegir([
          ['Plancha Frontal','Abdomen abrazando la columna; cuerpo en línea recta sin subir caderas.'],
          ['Dead Bug','Espalda pegada al piso; baja brazo y pierna contrarios sin perder el contacto lumbar.'],
          ['Pallof Press','Controla la rotación del tronco sin dejar que el cable te gane.'],
        ],variante); add(op[0],3,'30 seg — isométrico','Corporal','Core',op[1]); }
    }
    else if(t.includes('torso')){
      if(lesHombro){ add('Elevación Frontal Ligera',3,'12 reps — resistencia','Ligero — 30% 1RM','Deltoides Anterior','Movimiento controlado hasta donde no haya molestia, sintiendo el frente del hombro.');
        add('Trabajo de Manguito Rotador',3,'15 reps — resistencia','Banda ligera','Manguito Rotador','Codo pegado al costado; siente la rotación profunda dentro del hombro.'); }
      else { const op=elegir([
          [['Press Banca Plano','Baja sintiendo el estiramiento del pecho; sube dirigiendo la contracción al centro del pectoral.'],['Press Militar Mancuernas','Core firme; siente el hombro empujando sin encoger el cuello.']],
          [['Press Inclinado Mancuernas','Siente el estímulo bajo la clavícula; contrae arriba 1 seg.'],['Elevaciones Laterales','Lidera con el codo hasta la altura del hombro; siente el costado.']],
          [['Press con Máquina Convergente','Al empujar, junta el movimiento hacia el centro sintiendo el pectoral cerrar.'],['Press Arnold','Rota la muñeca al subir; siente el hombro trabajar en todo el recorrido.']],
        ],variante); op.forEach(([nm,tip])=>add(nm,3,repsBase,'Moderado — 55-60% 1RM',nm.includes('Press Banca')||nm.includes('Inclinado')||nm.includes('Convergente')?'Pecho Mayor':'Deltoides',tip)); }
      { const op=elegir([
          ['Jalón al Pecho','Lleva los codos hacia las caderas sintiendo el dorsal justo debajo de la axila. Varía el ángulo del tronco para sentir distinta zona.'],
          ['Remo con Barra','Torso a 45°; al jalar al ombligo siente cómo se juntan las escápulas.'],
          ['Jalón Tras Nuca en Polea','Codos hacia abajo y atrás; siente el dorsal ancho abrirse en la parte alta de la espalda.'],
        ],variante); add(op[0],4,repsBase,'Moderado — 60% 1RM','Dorsal Ancho',op[1]); }
      { const op=elegir([
          ['Remo con Mancuerna','Codo a la cadera; siente cómo se junta la escápula al centro.'],
          ['Remo en Polea Baja','Codos a las caderas sintiendo el dorsal bajo la axila y el cierre de escápulas.'],
          ['Remo en Máquina con Apoyo','El pecho apoyado protege la lumbar; siente el cierre de escápulas en cada jalón.'],
        ],variante); add(op[0],3,repsBase,'Moderado — 55% 1RM','Dorsal · Romboides',op[1]); }
      { const op=elegir([
          ['Curl de Bíceps','Codos fijos; siente el pico de contracción arriba sin balanceo.'],
          ['Curl Martillo','Pulgar arriba; siente el costado externo del brazo.'],
          ['Curl Barra Z','Codos fijos al costado; pico de contracción arriba sin balancear el torso.'],
        ],variante); add(op[0],3,'12 reps — hipertrofia','Moderado — 50% 1RM',op[0].includes('Martillo')?'Braquial':'Bíceps',op[1]); }
      { const op=elegir([
          ['Extensión de Tríceps Polea','Codos al costado; siente la extensión completa como si empujaras el suelo.'],
          ['Fondos en Banco','Codos cerca del cuerpo; baja hasta sentir el estiramiento del tríceps.'],
          ['Press Francés','Codos apuntando al techo, fijos; siente el tríceps estirarse detrás de la cabeza.'],
        ],variante); add(op[0],3,'12 reps — hipertrofia','Moderado — 50% 1RM','Tríceps',op[1]); }
    }
    else if(t.includes('pierna')){
      if(lesRodilla){ add('Prensa de Piernas (rango parcial)',4,repsBase,'Moderado — 50% 1RM','Cuádriceps · Glúteo','Rango sin molestia: la carga la siente el muslo, no la articulación.');
        add('Isométrico de Cuádriceps',3,'30 seg — isométrico','Sin carga','Cuádriceps','Extiende y sostén sintiendo el muslo activo sin mover la rodilla.');
        add('Step-up Bajo',3,'12 reps — resistencia','Corporal','Cuádriceps · Glúteo','Cajón bajo; empuja con el talón sintiendo glúteo y muslo del lado que sube.'); }
      else { const op=elegir([
          [['Sentadilla Libre','Desciende a 90° con tensión repartida en muslo y glúteo; empuja el suelo al subir.'],['Prensa de Piernas','Sin bloquear rodillas; siente el muslo durante todo el recorrido.'],['Zancadas','Tronco erguido; siente el glúteo de la pierna delantera al subir.']],
          [['Sentadilla Búlgara','Peso en el talón de la pierna de adelante; siente el cuádriceps y glúteo trabajar juntos.'],['Peso Muerto Sumo','Rodillas hacia afuera; siente el interior del muslo y el glúteo al subir.'],['Step-up con Mancuernas','Empuja con el talón del pie de arriba; siente el glúteo cerrar el movimiento.']],
        ],variante); op.forEach(([nm,tip])=>add(nm,4,repsBase,'Moderado — 55-65% 1RM','Cuádriceps · Glúteo',tip)); }
      { const op=elegir([
          ['Curl Femoral','Sube en 3 segundos sintiendo la parte trasera del muslo contraerse.'],
          ['Peso Muerto Rumano','Siente el estiramiento del femoral al bajar con espalda neutra; sube con la cadera.'],
          ['Buenos Días con Barra','Cadera atrás con rodilla suave; siente el femoral estirarse antes de volver.'],
        ],variante); add(op[0],3,'12 reps — hipertrofia','Moderado — 55% 1RM','Femorales',op[1]); }
      { const op=elegir([
          ['Hip Thrust','Aprieta glúteo 2 seg arriba; la fuerza nace de la cadera.'],
          ['Puente de Glúteo a una Pierna','Aprieta glúteo arriba, una pierna a la vez; evita que la cadera rote.'],
          ['Patada de Glúteo en Polea','Empuja hacia atrás y arriba sintiendo el glúteo apretar al final del recorrido.'],
        ],variante); add(op[0],3,repsBase,'Moderado — 60% 1RM','Glúteo Mayor',op[1]); }
      add('Elevación de Talones',3,'20 reps — resistencia','Moderado','Pantorrillas','Rango completo: estiramiento abajo, pausa arriba sintiendo el gemelo.');
    }
    else if(t.includes('pecho')){
      add('Press Banca Plano',4,repsBase,'Moderado — 60% 1RM','Pecho Mayor','Al subir, dirige la contracción al centro del pectoral; codos a 45°.');
      add('Press Inclinado Mancuernas',3,'12 reps — hipertrofia','Moderado — 55% 1RM','Pecho Superior','Siente el estímulo bajo la clavícula; contrae arriba 1 seg.');
      add('Aperturas en Cable',3,'15 reps — resistencia','Ligero — 40% 1RM','Pecho Interno','Arco con codo semiflexionado; siente el cierre hacia la línea media.');
      add('Extensión Tríceps Polea',4,'15 reps — resistencia','Ligero — 45% 1RM','Tríceps','Codos pegados; siente la contracción al extender por completo.');
    }
    else if(t.includes('espalda')){
      add('Jalón al Pecho',4,repsBase,'Moderado — 60% 1RM','Dorsal Ancho','Codos a las caderas; siente el dorsal bajo la axila. Varía el ángulo del tronco.');
      if(lesLumbar) add('Remo en Máquina con Apoyo',4,repsBase,'Moderado — 55% 1RM','Dorsal · Romboides','El pecho apoyado protege tu lumbar; siente el cierre de escápulas.');
      else add('Remo con Barra',4,repsBase,'Moderado — 60% 1RM','Dorsal · Romboides','Torso a 45°; al jalar al ombligo siente cómo se juntan las escápulas.');
      add('Curl Barra Z',4,'10 reps — hipertrofia','Moderado — 55% 1RM','Bíceps','Codos fijos; pico de contracción arriba sin balanceo.');
      add('Curl Martillo',3,'12 reps — hipertrofia','Moderado — 50% 1RM','Braquial','Pulgar arriba; siente el costado externo del brazo.');
    }
    else if(t.includes('hombro')){
      if(lesHombro){ add('Elevación Frontal Ligera',4,'12 reps — resistencia','Ligero — 30% 1RM','Deltoides Anterior','Hasta donde no haya molestia, sintiendo el frente del hombro.');
        add('Manguito Rotador con Banda',3,'15 reps — resistencia','Banda ligera','Manguito Rotador','Codo al costado; rotación lenta sintiendo dentro del hombro.'); }
      else { add('Press Militar',4,repsBase,'Moderado — 60% 1RM','Deltoides Anterior','Core activo, sin arquear; el hombro frontal empuja la barra al cielo.');
        add('Elevaciones Laterales',4,'15 reps — resistencia','Ligero — 35% 1RM','Deltoides Lateral','Lidera con el codo hasta la altura del hombro; siente el costado, no el trapecio.'); }
      add('Encogimientos',4,'12 reps — hipertrofia','Moderado — 60% 1RM','Trapecio','Hombros a las orejas sin rotar; pausa arriba.');
      add('Plancha Frontal',3,'40 seg — isométrico','Corporal','Core','Abdomen firme, cuerpo en línea.');
    }
    else if(t.includes('cardio')||t.includes('accesorios')){
      add('Caminata Inclinada / Elíptica',1,'20 min — zona 2','65–75% FCmáx','Cardiovascular','Ritmo donde puedas hablar con frases cortas; trabajo cardiovascular con propósito.');
      add('Plancha Frontal',4,'40 seg — isométrico','Corporal','Core','Abdomen abrazando la columna.');
      add('Crunch con Cable',3,'20 reps — resistencia','Ligero — 40% 1RM','Recto Abdominal','Enrolla la columna jalando con el abdomen, no con los brazos.');
      add('Farmer Walk',3,'30 m — resistencia','Moderado','Core · Antebrazo','Camina erguido sintiendo el core estabilizar cada paso.');
    }
    else if(t.includes('cardiovascular')){
      add('Cardio Continuo',1,'30 min — zona 2','65–75% FCmáx','Cardiovascular','Sesión cardiovascular con propósito: ritmo conversacional sostenido.');
      add('Movilidad y Estiramiento',1,'10 min','Sin carga','General','Respira profundo en cada posición sintiendo el músculo ceder.');
    }
    L.push(...kbExtrasParaDia(t, L, qAnswers.nombre||''));
    return L;
  }

  // ── Sesión LIGERA para días donde el socio también toma una clase grupal ──
  // Evita a propósito el enfoque muscular de esa clase y usa bajo volumen para no sumar demasiada carga al día.
  function ejsComplemento(info){
    const kb=info?KB_CLASES_IDX[info.clase]:null;
    const evitar=kb?kb.enfoque:[];
    const evitaPierna=evitar.some(e=>['cuadriceps','gluteo','femoral'].includes(e));
    const evitaSuperior=evitar.some(e=>['pecho','dorsal','deltoide'].includes(e));
    const L=[];
    function add(nm,series,reps,peso,ms,tip){ L.push({nombre:nm,series,reps,peso,musculo:ms,tip}); }
    add('Plancha Frontal',3,'30 seg — isométrico','Corporal','Core',`Sesión ligera — hoy ya tuviste ${kb?kb.nm:'tu clase'}, así que solo complementamos sin sumar más carga. Abdomen abrazando la columna.`);
    add('Pallof Press',3,'12 reps — resistencia','Ligero','Core antirrotación','Controla la rotación del tronco sin dejar que el cable te gane; movimiento lento.');
    if(!evitaSuperior) add('Face Pull',3,'15 reps — resistencia','Ligero','Deltoides posterior','Codos altos; siente el trabajo entre los omóplatos, sin cargar el cuello.');
    if(!evitaPierna) add('Elevación de Talones',2,'15 reps — resistencia','Ligero','Pantorrillas','Rango completo, ritmo controlado, sin prisa.');
    if(!evitaSuperior && !evitaPierna) add('Movilidad de Cadera y Hombro',1,'8 min','Sin carga','General','Respira profundo en cada posición; el objetivo es soltar, no fatigar.');
    return L;
  }

  const fase = tieneLesion ? 'Fase 1 — Rehabilitación y fuerza base'
    : objetivo==='GANAR MÚSCULO' && joven ? 'Hipertrofia con base de fuerza'
    : objetivo==='GANAR MÚSCULO' ? 'Fuerza primero (+35)'
    : objetivo==='PERDER PESO' ? 'Fuerza y actividad total'
    : objetivo==='FUERZA PURA' ? 'Fuerza máxima' : 'Resistencia y base funcional';

  const clasesLista=(qAnswers.clasesGrupales||[]).filter(c=>c.dias&&c.dias.length);
  let notaClases='';
  if(clasesLista.length){
    notaClases=' Además toma: '+clasesLista.map(c=>`${c.clase} (${c.dias.map(d=>DIAS_NAMES[d]).join('/')}${c.entrenaMismoDia?', + gym ese día':''})`).join(', ')+'.';
    if(deriv.conClase.length) notaClases+=` Los días que combinas clase + gym (${deriv.conClase.map(d=>DIAS_NAMES[d]).join(', ')}) llevan una sesión LIGERA de complemento — no una sesión completa — para no sobrecargar en un solo día.`;
    if(deriv.soloClase.length) notaClases+=` Los días de clase sin gym aparte (${deriv.soloClase.map(d=>DIAS_NAMES[d]).join(', ')}) quedan como descanso de gimnasio: la clase ya es el estímulo de ese día.`;
  }

  const splitLabelBase={1:'Full Body 1x',2:'Full Body 2x',3:'Full Body 3x',4:'Torso/Pierna',5:'Torso/Pierna + Accesorios',6:'Por grupos musculares'}[nFull]||(nFull>6?'Por grupos musculares':'Sin sesión completa esta semana');
  const splitLabel = splitLabelBase + (deriv.conClase.length?' + complemento en días de clase':'');

  return {
    perfil:{
      nivel:qAnswers.nivel, objetivo,
      split: splitLabel,
      fase,
      nota: (tieneLesion
        ? `Detectamos: ${lesiones}. Sustituimos ejercicios de impacto directo por alternativas seguras — nunca eliminamos el grupo muscular. Secuencia: fuerza isométrica → resistencia → hipertrofia.`
        : `Plan ${fase.toLowerCase()} siguiendo la secuencia Fuerza → Resistencia → Hipertrofia. Cada ejercicio incluye su nota propioceptiva: dónde y cómo sentir el estímulo.`) + notaClases,
      consejos: clasesLista.length ? [
        'Hidrátate bien en los días que combinas clase y gym.',
        'En la clase grupal prioriza la técnica sobre el peso o el ritmo.',
        deriv.conClase.length ? 'Los días de clase + gym son sesiones cortas a propósito — no busques igualar el volumen de tus días completos.' : 'Si sientes dolor muscular importante, avisa a tu entrenador antes de la siguiente sesión.'
      ] : []
    },
    semana: split.map(([dia,tipo,color,complemento])=>({dia,tipo,color,ejercicios: complemento ? ejsComplemento(complemento) : ejs(tipo)}))
  };
}

// ══ BUILDER: RENDIMIENTO DEPORTIVO ══
function buildFallbackDeporte(discId, dias, nivel){
  const dep=deporteById(discId)||DEPORTES[0];
  const entorno=qAnswers.entorno||'funcional';
  // Adaptación al entorno: en gimnasio, sustituimos por versiones con aparato/carga cuando aplica
  const GYM_SWAP={
    'Rotación de tronco en polea/banda':{nm:'Rotación de tronco en polea (cable)',ms:'Core rotacional',tip:'De pie junto a la polea alta, gira el tronco llevando el cable en diagonal. Carga progresiva para la potencia del golpe.'},
    'Desplazamiento lateral con banda':{nm:'Sentadilla lateral en máquina Smith',ms:'Cadera · Glúteo',tip:'Pasos laterales con barra guiada o carga. Fortalece el desplazamiento lateral.'},
    'Zancada lateral':{nm:'Zancada lateral con mancuernas',ms:'Cuádriceps · Aductores',tip:'Con mancuernas en las manos, paso amplio al lado. Añade carga al gesto de salida.'},
    'Rotación externa de hombro (banda)':{nm:'Rotación externa en polea baja',ms:'Manguito rotador',tip:'Codo al costado, gira el antebrazo con el cable. Carga controlada para el hombro.'},
    'Salto al cajón':{nm:'Sentadilla con barra + salto al cajón',ms:'Potencia de pierna',tip:'Combina fuerza con barra y salto pliométrico. Potencia máxima del primer paso.'},
    'Swing con balón medicinal':{nm:'Swing con mancuerna / kettlebell',ms:'Core rotacional · Cadera',tip:'Impulso de cadera con kettlebell. Potencia el gesto del swing con carga.'},
    'Puente de glúteo':{nm:'Hip thrust con barra',ms:'Glúteo · Cadera',tip:'Espalda apoyada en banco, empuja la barra con el glúteo. Máxima activación de cadera.'},
    'Jalón dorsal / Pull-up asistido':{nm:'Jalón al pecho en polea',ms:'Dorsal ancho',tip:'Codos abajo y atrás, siente la espalda ancha. Ajusta la carga a tu nivel.'},
    'Remo en banda o polea':{nm:'Remo sentado en polea',ms:'Espalda media',tip:'Junta las escápulas jalando el cable al abdomen. Carga progresiva.'},
    'Sentadilla':{nm:'Sentadilla con barra',ms:'Cuádriceps · Glúteo',tip:'Barra en la espalda alta, baja con control. Base de fuerza con carga.'},
    'Sentadilla con peso corporal':{nm:'Sentadilla con barra o goblet',ms:'Piernas · Glúteo',tip:'Añade carga con mancuerna al pecho o barra. Progresión de fuerza.'},
    'Zancada con salto':{nm:'Zancada con mancuernas',ms:'Potencia unilateral',tip:'Con mancuernas, alterna piernas. Fuerza unilateral con carga.'},
    'Nórdico de isquiotibiales':{nm:'Curl femoral en máquina',ms:'Isquiotibiales',tip:'Flexiona la rodilla contra la resistencia de la máquina. Aísla el femoral.'},
    'Elevación de talones':{nm:'Elevación de talones en máquina',ms:'Tobillo · Pantorrilla',tip:'Con carga en hombros o máquina, sube a puntas lento.'},
    'Flexiones (push-ups)':{nm:'Press de banca / mancuernas',ms:'Pecho · Hombro',tip:'Empuja la carga controlando la bajada. Fuerza de empuje con progresión.'},
    'Remo con banda':{nm:'Remo con mancuerna',ms:'Espalda',tip:'Apoyado en banco, jala la mancuerna al costado juntando la escápula.'},
    'Zancada búlgara':{nm:'Zancada búlgara con mancuernas',ms:'Pierna unilateral',tip:'Pie atrás en banco, mancuernas en mano. Fuerza unilateral con carga.'},
    'Elevación de rodilla explosiva':{nm:'Rodilla a la polea (cable)',ms:'Flexores de cadera',tip:'Con tobillera de cable, sube la rodilla explosiva. Carga la base de la patada.'},
  };
  const banco=dep.banco.map(b=>{
    if(entorno==='gimnasio' && GYM_SWAP[b.nm]){
      const g=GYM_SWAP[b.nm]; return {nm:g.nm, ms:g.ms, tip:g.tip};
    }
    return b;
  });
  const nombresSesion = {
    2:['Acondicionamiento A','Acondicionamiento B'],
    3:['Fuerza específica','Potencia y agilidad','Core y prevención'],
    4:['Fuerza específica','Potencia y agilidad','Resistencia','Core y prevención'],
    5:['Fuerza específica','Potencia y agilidad','Resistencia','Core y prevención','Movilidad y técnica'],
    6:['Fuerza específica','Potencia y agilidad','Resistencia','Core y prevención','Movilidad','Circuito integral'],
  };
  const nombres=nombresSesion[dias]||nombresSesion[4];
  const colores=['verde','neon','gold','hombro','red','verde'];
  const patron={
    2:['S','D','D','S','D','D','D'], 3:['S','D','S','D','S','D','D'],
    4:['S','S','D','S','S','D','D'], 5:['S','S','S','D','S','D','S'],
    6:['S','S','S','D','S','S','S'],
  }[dias]||['S','S','D','S','S','D','D'];
  const diasNom=['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'];
  // Enfoque muscular por tema del día, para completar cada sesión con el catálogo general
  // y así no repetir casi los mismos 6 ejercicios del banco de la disciplina toda la semana.
  const TEMA_ENFOQUES={
    'Fuerza específica':['cuadriceps','gluteo','dorsal','pecho','femoral'],
    'Acondicionamiento A':['cuadriceps','gluteo','dorsal','core'],
    'Potencia y agilidad':['gluteo','femoral','cuadriceps','pantorrilla'],
    'Acondicionamiento B':['pecho','espalda_media','core','cardio'],
    'Resistencia':['cardio','core','pantorrilla','abdomen'],
    'Core y prevención':['core','abdomen','manguito','deltoide_post'],
    'Movilidad y técnica':['manguito','deltoide_post','core','gluteo'],
    'Movilidad':['manguito','deltoide_post','core'],
    'Circuito integral':['cuadriceps','core','dorsal','cardio'],
  };
  const usadosSemana=new Set(); // nombres de ejercicios del catálogo general ya usados esta semana (evita repetir)
  let si=0;
  const semana=patron.map((tipo,i)=>{
    if(tipo==='D') return {dia:diasNom[i], tipo:'Descanso / recuperación', color:'descanso', ejercicios:[]};
    const nombreSesion=nombres[si % nombres.length];
    const reps = nivel==='PRINCIPIANTE' ? '10-12 reps · control' : nivel==='AVANZADO' ? '8 reps · potencia' : '10 reps';
    const peso = entorno==='gimnasio' ? 'Carga progresiva' : 'Peso corporal / banda';
    const ejerc=[];
    // 2 movimientos firma de la disciplina, rotando cada día para usar los 6-7 del banco a lo largo de la semana
    const startFirma=(si*2)%banco.length;
    for(let k=0;k<Math.min(2,banco.length);k++){
      const b=banco[(startFirma+k)%banco.length];
      ejerc.push({nombre:b.nm, series:3, reps, peso, musculo:b.ms, tip:b.tip});
    }
    // 3 ejercicios del catálogo general según el enfoque del día, sin repetir los ya usados esta semana
    const enfoques=TEMA_ENFOQUES[nombreSesion]||['core','cuadriceps','gluteo'];
    const rnd=prng('deporte|'+dep.id+'|'+i+'|'+nombreSesion);
    enfoques.forEach(enf=>{
      if(ejerc.length>=5) return;
      const cands=KB_EJERCICIOS.filter(e=>e.enf===enf && !usadosSemana.has(e.nm) && !ejerc.some(x=>x.nombre===e.nm));
      if(!cands.length) return;
      const pick=cands[Math.floor(rnd()*cands.length)];
      usadosSemana.add(pick.nm);
      const repsG = nivel==='PRINCIPIANTE' ? '12 reps — control' : nivel==='AVANZADO' ? '8 reps — potencia' : '10 reps — hipertrofia';
      ejerc.push({nombre:pick.nm, series:3, reps:repsG, peso: entorno==='gimnasio'?'Moderado — 55% 1RM':'Peso corporal / banda', musculo:pick.ms, tip:'Siente el músculo objetivo ('+pick.ms+') durante todo el recorrido.'});
    });
    si++;
    return {dia:diasNom[i], tipo:nombreSesion, color:colores[i%colores.length], ejercicios:ejerc.slice(0,5)};
  });
  const entTxt = entorno==='gimnasio' ? '🏋️ Adaptado a GIMNASIO (aparatos y carga progresiva).' : '🤸 Adaptado a entrenamiento FUNCIONAL (peso corporal y bandas, sin equipo).';
  return {
    perfil:{
      nivel:qAnswers.nivel, objetivo:'RENDIMIENTO · '+dep.nm,
      split:dep.emoji+' Plan específico de '+dep.nm,
      fase:'Acondicionamiento para '+dep.nm,
      nota:`${dep.emoji} Plan orientado a ${dep.nm}. ${entTxt} ${dep.resumen} Focos: ${dep.focos.join(', ')}. Combínalo siempre con tu práctica técnica de la disciplina.`
    },
    semana
  };
}

// ══ BUILDER: REHABILITACIÓN (protocolo por fases como rutina) ══
// ══ QUÉ PUEDE ENTRENAR CON SEGURIDAD SEGÚN LA LESIÓN ══
// En rehabilitación: los otros días puede fortalecer zonas que NO cargan la lesión.
const GIM_SEGURO = {
  osgood:{
    puede:['Core y abdomen (planchas, hollow)','Tren superior (brazos, hombros)','Flexibilidad de cadera y espalda','Equilibrio en un pie (sin dolor)'],
    evitar:['Saltos e impacto','Sentadillas profundas','Arrodillarse','Aterrizajes fuertes'],
    banco:[
      {nombre:'Hollow hold',series:3,reps:'15-20 seg',musculo:'Core',tip:'Boca arriba, brazos y piernas elevados, espalda pegada al piso. No carga la rodilla.'},
      {nombre:'Plancha frontal',series:3,reps:'20-30 seg',musculo:'Core',tip:'Cuerpo en línea, abdomen firme. Fortalece sin impacto en la rodilla.'},
      {nombre:'Fortalecimiento de hombros (banda)',series:3,reps:'12 reps',musculo:'Hombro',tip:'Trabaja el tren superior mientras la rodilla descansa.'},
      {nombre:'Movilidad de columna (gato-camello)',series:3,reps:'10 reps',musculo:'Columna',tip:'Mantén la flexibilidad de espalda sin cargar la pierna.'},
      {nombre:'Estiramiento suave de cuádriceps',series:3,reps:'30 seg',musculo:'Cuádriceps',tip:'Reduce la tensión sobre la rodilla, sin forzar.'},
    ]
  },
  tobillo:{
    puede:['Core y abdomen','Tren superior completo','Fuerza de cadera y muslo (sentada)','Flexibilidad de espalda'],
    evitar:['Saltos y aterrizajes','Giros sobre el pie','Trabajo en puntas','Correr'],
    banco:[
      {nombre:'Plancha frontal',series:3,reps:'20-30 seg',musculo:'Core',tip:'Estabilidad sin apoyar el peso en el tobillo.'},
      {nombre:'Puente de glúteo',series:3,reps:'12 reps',musculo:'Glúteo',tip:'Fortalece cadera sin cargar el tobillo.'},
      {nombre:'Fortalecimiento de brazos y hombros',series:3,reps:'12 reps',musculo:'Tren superior',tip:'Trabaja arriba mientras el tobillo sana.'},
      {nombre:'Hollow hold',series:3,reps:'15 seg',musculo:'Core',tip:'Control de core sin impacto.'},
    ]
  },
  plantar:{
    puede:['Core','Tren superior','Fuerza de cadera y pierna sin impacto','Flexibilidad'],
    evitar:['Saltos','Trabajo en puntas y media punta','Correr','Impacto en el talón'],
    banco:[
      {nombre:'Plancha frontal',series:3,reps:'20-30 seg',musculo:'Core',tip:'Sin cargar el pie.'},
      {nombre:'Puente de glúteo',series:3,reps:'12 reps',musculo:'Glúteo',tip:'Fuerza de cadera sin apoyar el pie con impacto.'},
      {nombre:'Fortalecimiento de tren superior',series:3,reps:'12 reps',musculo:'Brazos · Hombros',tip:'Trabaja arriba mientras el pie descansa.'},
      {nombre:'Rodar pelota bajo el arco',series:2,reps:'1-2 min',musculo:'Pie',tip:'Masaje suave que relaja la fascia, sin impacto.'},
    ]
  },
  muneca:{
    puede:['Piernas y core completo','Cardio de piernas','Flexibilidad de cadera y espalda','Equilibrio'],
    evitar:['Apoyos de manos (pino, rueda, vuelta)','Cargar peso en muñeca','Empujar con la muñeca'],
    banco:[
      {nombre:'Sentadilla con peso corporal',series:3,reps:'12 reps',musculo:'Piernas',tip:'Fortalece piernas sin usar las manos.'},
      {nombre:'Puente de glúteo',series:3,reps:'12 reps',musculo:'Glúteo',tip:'Cadera fuerte sin apoyar la muñeca.'},
      {nombre:'Plancha sobre antebrazos',series:3,reps:'20-30 seg',musculo:'Core',tip:'Apoya el antebrazo, NO la muñeca. Core sin cargar la articulación.'},
      {nombre:'Split activo',series:3,reps:'20-30 seg',musculo:'Flexibilidad',tip:'Trabaja la flexibilidad mientras la muñeca sana.'},
    ]
  },
  cadera:{
    puede:['Core y abdomen','Tren superior','Fortalecimiento de glúteo controlado','Trabajo de tobillo y pie'],
    evitar:['Splits forzados','Patadas altas','Rangos extremos de cadera','Aperturas con dolor'],
    banco:[
      {nombre:'Plancha frontal y lateral',series:3,reps:'20-30 seg',musculo:'Core',tip:'Un core fuerte protege la cadera.'},
      {nombre:'Almeja (clamshell) con banda',series:3,reps:'12-15 reps',musculo:'Glúteo',tip:'Fortalece el glúteo en rango cómodo, sin forzar la apertura.'},
      {nombre:'Fortalecimiento de tren superior',series:3,reps:'12 reps',musculo:'Brazos · Hombros',tip:'Trabaja arriba mientras la cadera descansa.'},
      {nombre:'Elevación de talones',series:3,reps:'15 reps',musculo:'Tobillo',tip:'Fortalece el tobillo sin cargar la cadera.'},
    ]
  },
  espalda:{
    puede:['Core anti-extensión (planchas)','Tren superior','Fuerza de pierna sin arco','Flexibilidad de cadera'],
    evitar:['Puentes y arcos','Hiperextensiones','Inclinarse hacia atrás','Torsiones forzadas'],
    banco:[
      {nombre:'Plancha frontal',series:3,reps:'20-40 seg',musculo:'Core',tip:'Fortalece el core en posición neutra, sin arquear la espalda.'},
      {nombre:'Bird-dog',series:3,reps:'8 por lado',musculo:'Core · Espalda',tip:'Control de columna sin hiperextensión.'},
      {nombre:'Puente de glúteo',series:3,reps:'12 reps',musculo:'Glúteo',tip:'Sube con el glúteo, no con la lumbar.'},
      {nombre:'Fortalecimiento de tren superior',series:3,reps:'12 reps',musculo:'Brazos · Hombros',tip:'Trabaja arriba manteniendo la espalda neutra.'},
    ]
  },
  hombro:{
    puede:['Piernas completo','Core','Cardio de piernas','Movilidad de cuello y cadera'],
    evitar:['Empujes por encima de la cabeza','Cargar peso con el brazo extendido','Colgarte de una barra','Dormir de ese lado con peso'],
    banco:[
      {nombre:'Sentadilla con peso corporal',series:3,reps:'12 reps',musculo:'Piernas',tip:'Fortalece piernas sin cargar el hombro.'},
      {nombre:'Puente de glúteo',series:3,reps:'12 reps',musculo:'Glúteo',tip:'Trabaja cadera y piernas mientras el hombro descansa.'},
      {nombre:'Plancha frontal',series:3,reps:'20-30 seg',musculo:'Core',tip:'Apoyo en antebrazos, no en la muñeca ni el hombro extendido.'},
      {nombre:'Zancadas',series:3,reps:'10 por lado',musculo:'Piernas',tip:'Sin cargar mancuernas si eso irrita el hombro; usa solo tu peso.'},
    ]
  },
  cuello:{
    puede:['Piernas completo','Core anti-extensión','Cardio de piernas','Movilidad de cadera'],
    evitar:['Carga por encima de la cabeza','Encogimientos de hombro con peso','Posturas prolongadas con el cuello adelantado','Impacto directo o contacto'],
    banco:[
      {nombre:'Sentadilla con peso corporal',series:3,reps:'12 reps',musculo:'Piernas',tip:'Fortalece piernas sin involucrar el cuello.'},
      {nombre:'Puente de glúteo',series:3,reps:'12 reps',musculo:'Glúteo',tip:'Cadera fuerte sin tensionar el cuello.'},
      {nombre:'Plancha frontal (cuello neutro)',series:3,reps:'20-30 seg',musculo:'Core',tip:'Mira al piso, cuello alineado con la columna, sin dejarlo caer.'},
      {nombre:'Zancadas',series:3,reps:'10 por lado',musculo:'Piernas',tip:'Mantén la mirada al frente, sin adelantar la cabeza.'},
    ]
  },
};

// ══ GENERADOR DE PLAN DE REHABILITACIÓN (cualquier socio, no solo gimnastas) ══
function generarRutinaGim(){
  go('s-loading');
  setTimeout(()=>{
    const p=protoById(qAnswers.lesionRehab)||REHAB_PROTOCOLOS[0];
    let faseIdx=0;
    if(qAnswers.gimDolor<=2 && qAnswers.gimInicioDolor==='Desde hace meses') faseIdx=1;
    const fase=p.fases[faseIdx];
    const seguro=GIM_SEGURO[qAnswers.lesionRehab]||GIM_SEGURO.osgood;
    const soloTerapia = qAnswers.gimSoloTerapia==='si';
    const terapiaEj = p.fases[0].ejercicios; // Fase 1 (Calmar): la más suave, enfocada en la propia zona
    const colores={red:'red',gold:'gold',neon:'neon'};
    const diasNom=['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'];
    const diasKey=['lun','mar','mie','jue','vie','sab','dom'];
    const clases=qAnswers.gimClases||[];

    // ── DECISIÓN CLAVE: ¿modo rehabilitación total? ──
    // Se activa si: NO hay diagnóstico Y hay dolor (≥3), O el médico indicó pausa.
    const sinDiag = qAnswers.gimDiagnostico==='no';
    const medicoPausa = qAnswers.gimDiagnostico==='si' && qAnswers.gimMedicoAutoriza==='No, indicó pausa';
    const conDolor = qAnswers.gimDolor>=3;
    const rehabTotal = (sinDiag && conDolor) || medicoPausa;

    let semana;
    if(rehabTotal){
      // TODOS los días son rehabilitación / fortalecimiento seguro suave. Las clases se BLOQUEAN.
      let toggle=true;
      semana=diasKey.map((k,i)=>{
        const tieneClase=clases.includes(k);
        // Un día de descanso real a mitad de semana y domingo
        if(i===3 || i===6){
          return {dia:diasNom[i], tipo:'DESCANSO / RECUPERACIÓN', color:'descanso',
            ejercicios:[{nombre:'Descanso activo',series:'—',reps:'Reposo',peso:'',musculo:'',tip:'Día de recuperación. Aplica hielo si hay molestia y evita el impacto.'}]};
        }
        if(toggle){
          toggle=false;
          return {dia:diasNom[i], tipo:p.zona+' · REHABILITACIÓN', color:colores[fase.color]||'red',
            ejercicios: fase.ejercicios.map(e=>({nombre:e.nm,series:e.series,reps:e.reps,peso:'Sin dolor',musculo:p.zona,
              tip:e.tip+(tieneClase?' · (Hoy tocaba entrenamiento, pero está en pausa hasta la valoración médica.)':'')}))};
        } else {
          toggle=true;
          return soloTerapia
            ? {dia:diasNom[i], tipo:'TERAPIA Y MOVILIDAD ('+p.zona+')', color:'neon',
                ejercicios: terapiaEj.map(e=>({nombre:e.nm,series:e.series,reps:e.reps,peso:'Sin dolor',musculo:p.zona,
                  tip:e.tip+(tieneClase?' · (Día de entrenamiento en pausa por ahora.)':'')}))}
            : {dia:diasNom[i], tipo:'FORTALECIMIENTO SEGURO (suave)', color:'verde',
                ejercicios: seguro.banco.map(e=>({...e, peso:'Muy ligero · sin dolor',
                  tip:e.tip+(tieneClase?' · (Día de entrenamiento en pausa por ahora.)':'')}))};
        }
      });
    } else {
      // Modo normal: alterna rehab + seguro, respeta días de entrenamiento
      let toggleRehab=true;
      semana=diasKey.map((k,i)=>{
        const tieneClase=clases.includes(k);
        if(tieneClase){
          return {dia:diasNom[i], tipo:'ENTRENAMIENTO REGULAR', color:'descanso',
            ejercicios:[{nombre:'Día de tu disciplina',series:'—',reps:qAnswers.gimSigue==='No, está en pausa'?'En pausa por la lesión':'Con adaptaciones',peso:'',musculo:'',
              tip: qAnswers.gimSigue==='No, está en pausa'
                ? 'Está en pausa. Cuando regreses, evita: '+seguro.evitar.slice(0,3).join(', ')+'.'
                : 'Puedes asistir evitando lo que te duele: '+seguro.evitar.slice(0,3).join(', ')+'. Avisa a tu entrenador(a) de la molestia.'}]};
        }
        if(toggleRehab){
          toggleRehab=false;
          return {dia:diasNom[i], tipo:p.zona+' · REHABILITACIÓN', color:colores[fase.color]||'red',
            ejercicios: fase.ejercicios.map(e=>({nombre:e.nm,series:e.series,reps:e.reps,peso:'Sin dolor',musculo:p.zona,tip:e.tip}))};
        } else {
          toggleRehab=true;
          return soloTerapia
            ? {dia:diasNom[i], tipo:'TERAPIA Y MOVILIDAD ('+p.zona+')', color:'neon',
                ejercicios: terapiaEj.map(e=>({nombre:e.nm,series:e.series,reps:e.reps,peso:'Sin dolor',musculo:p.zona,tip:e.tip}))}
            : {dia:diasNom[i], tipo:'FORTALECIMIENTO SEGURO', color:'verde',
                ejercicios: seguro.banco.map(e=>({...e, peso:'Ligero · sin dolor'}))};
        }
      });
      const hayRehab=semana.some(d=>d.tipo.includes('REHABILITACIÓN'));
      if(!hayRehab){
        semana[0]={dia:diasNom[0],tipo:p.zona+' · REHABILITACIÓN',color:colores[fase.color]||'red',
          ejercicios:fase.ejercicios.map(e=>({nombre:e.nm,series:e.series,reps:e.reps,peso:'Sin dolor',musculo:p.zona,tip:e.tip}))};
      }
    }

    const cuandoTxt=qAnswers.gimCuando.length?qAnswers.gimCuando.join(', '):'No especificado';
    let nota;
    if(rehabTotal){
      nota=`${p.emoji} ${p.nombre} · Socio de ${qAnswers.gimEdad} años. Dolor ${qAnswers.gimDolor}/10, ${qAnswers.gimInicioDolor.toLowerCase()}. Le molesta: ${cuandoTxt}. `+
        `🚫 MODO REHABILITACIÓN TOTAL: `+
        (medicoPausa
          ? `el médico indicó pausar el entrenamiento. `
          : `no hay diagnóstico médico y hay dolor, por lo que se pausa el entrenamiento hasta que un doctor o fisioterapeuta lo valore. Entrenar con dolor sin diagnóstico puede empeorar la lesión. `)+
        `El plan se enfoca solo en recuperar la zona y en fortalecimiento muy suave de lo que NO duele. `+
        `✅ Puede trabajar: ${seguro.puede.join(', ')}. ⛔ Evita: ${seguro.evitar.join(', ')}. `+
        `⚠️ Guía de apoyo, NO diagnóstico. En cuanto tenga el diagnóstico, actualiza el registro para reactivar el plan completo. Todo SIN dolor.`;
    } else {
      const conDiag = qAnswers.gimDiagnostico==='si';
      nota=`${p.emoji} ${p.nombre} · Socio de ${qAnswers.gimEdad} años. Dolor ${qAnswers.gimDolor}/10, ${qAnswers.gimInicioDolor.toLowerCase()}. Le molesta: ${cuandoTxt}. `+
        (conDiag && qAnswers.gimDiagTexto ? `📋 Diagnóstico médico: "${qAnswers.gimDiagTexto}". ` : conDiag ? `📋 Valorado por médico, autorizado para entrenar con cuidado. ` : ``)+
        `Este plan alterna días de REHABILITACIÓN con días de FORTALECIMIENTO SEGURO (lo que SÍ puede entrenar sin afectar la lesión), respetando sus días de entrenamiento habitual. `+
        `✅ Puede trabajar: ${seguro.puede.join(', ')}. ⛔ Debe evitar por ahora: ${seguro.evitar.join(', ')}. `+
        `⚠️ Guía de apoyo, NO diagnóstico médico. Todo SIN dolor. `+
        (qAnswers.gimDolor>=6 ? 'Con este nivel de dolor, vigila de cerca y consulta si no mejora.' : 'Si el dolor aumenta o no mejora en 2-3 semanas, acude al médico.');
    }

    const plan={
      perfil:{
        nivel:qAnswers.gimEdad+' años',
        objetivo:'REHABILITACIÓN · '+p.zona,
        split:p.emoji+(rehabTotal?' Rehabilitación total':' Plan de rehabilitación'),
        fase:fase.f,
        nota
      },
      semana,
      esRehab:true, protoId:p.id, rehabTotal,
      gimSeguro:seguro
    };
    mostrarPreview(plan);
  }, 700);
}

function buildFallbackRehab(protoId, dias){
  const p=protoById(protoId)||REHAB_PROTOCOLOS[0];
  // La rutina refleja la FASE 1 del protocolo repartida en la semana; el socio avanza fases desde el plan
  const fase=p.fases[0];
  const colores={red:'red',gold:'gold',neon:'neon'};
  const patron={
    2:['S','D','D','S','D','D','D'], 3:['S','D','S','D','S','D','D'],
    4:['S','D','S','D','S','D','D'], 5:['S','S','D','S','S','D','D'],
    6:['S','S','D','S','S','S','D'],
  }[dias]||['S','D','S','D','S','D','D'];
  const diasNom=['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'];
  const semana=patron.map((t,i)=>{
    if(t==='D') return {dia:diasNom[i], tipo:'Descanso / recuperación', color:'descanso', ejercicios:[]};
    return {
      dia:diasNom[i], tipo:p.zona+' · '+fase.f.split('·')[1]?.trim()||'Rehabilitación', color:colores[fase.color]||'red',
      ejercicios: fase.ejercicios.map(e=>({nombre:e.nm, series:e.series, reps:e.reps, peso:'Sin dolor', musculo:p.zona, tip:e.tip}))
    };
  });
  return {
    perfil:{
      nivel:qAnswers.nivel, objetivo:'REHABILITACIÓN · '+p.zona,
      split:p.emoji+' Protocolo de recuperación',
      fase:fase.f,
      nota:`${p.emoji} ${p.nombre}. ${p.contexto} ⚠️ Esta es una guía de apoyo, NO un diagnóstico médico. Todos los ejercicios se hacen SIN dolor. Si el dolor persiste, hincha o hay señales de alerta, acude al médico o fisioterapeuta.`
    },
    semana,
    esRehab:true, protoId:p.id
  };
}

// ══ BUILDER: FLEXIBILIDAD ══
function buildFallbackFlex(dias){
  const bloques=[
    {nombre:'Movilidad de cadera',ms:'Cadera',tip:'Aperturas y círculos de cadera con control. Gana rango de forma activa, sin rebotes.'},
    {nombre:'Estiramiento de isquiotibiales',ms:'Femorales',tip:'Sentada o de pie, lleva el pecho al muslo con espalda recta. Sostén sin dolor.'},
    {nombre:'Movilidad de columna torácica',ms:'Espalda alta',tip:'Rotaciones de la espalda alta en cuadrupedia. Libera el giro del tronco.'},
    {nombre:'Estiramiento de flexores de cadera',ms:'Psoas',tip:'En zancada baja, empuja la cadera al frente. Estira el frente de la cadera.'},
    {nombre:'Movilidad de hombro con banda',ms:'Hombro',tip:'Pasa la banda por encima con brazos rectos. Amplía el rango del hombro.'},
    {nombre:'Estiramiento de aductores',ms:'Aductores',tip:'Abre las piernas con control buscando rango. Base para splits.'},
    {nombre:'Gato-camello',ms:'Columna',tip:'Redondea y arquea la espalda lento. Moviliza toda la columna.'},
    {nombre:'Estiramiento activo de tobillo',ms:'Tobillo',tip:'Flexiona y extiende el tobillo en rango completo. Movilidad para el apoyo.'},
  ];
  const patron={2:['S','D','D','S','D','D','D'],3:['S','D','S','D','S','D','D'],4:['S','D','S','D','S','D','D'],5:['S','S','D','S','S','D','D'],6:['S','S','D','S','S','S','D']}[dias]||['S','D','S','D','S','D','D'];
  const diasNom=['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'];
  let idx=0;
  const semana=patron.map((t,i)=>{
    if(t==='D') return {dia:diasNom[i],tipo:'Descanso',color:'descanso',ejercicios:[]};
    const ej=[];
    for(let k=0;k<5;k++){ const b=bloques[(idx*2+k)%bloques.length]; ej.push({nombre:b.nombre,series:3,reps:'30 seg sostenido',peso:'Rango indoloro',musculo:b.ms,tip:b.tip}); }
    idx++;
    return {dia:diasNom[i],tipo:'Movilidad y flexibilidad',color:'neon',ejercicios:ej};
  });
  return {
    perfil:{nivel:qAnswers.nivel,objetivo:'FLEXIBILIDAD',split:'🧘 Plan de movilidad y elasticidad',fase:'Flexibilidad activa',
      nota:'🧘 Plan de movilidad. Trabaja el rango de forma ACTIVA (con control muscular), no forzando con el peso. Nunca estires hasta el dolor: busca tensión moderada. La flexibilidad mejora con constancia.'},
    semana
  };
}

// ═════════════════════════════════════════
const COLOR_CHIP = {verde:'cp',neon:'cp',gold:'cpi',red:'cc',hombro:'ch',descanso:'cd'};

// Ayudas de presentación: los datos se guardan en MAYÚSCULAS, aquí se muestran legibles
function sc(s){ s=String(s==null?'':s); if(s!==s.toUpperCase()) return s; s=s.toLowerCase(); return s.charAt(0).toUpperCase()+s.slice(1); }
function tc(s){ return String(s==null?'':s).toLowerCase().replace(/(^|[\s\-'])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase()); }
function ico(n,cls){ return `<svg class="ico ${cls||''}" aria-hidden="true"><use href="#i-${n}"/></svg>`; }
function it(n,cls){ return `<span class="it ${cls||''}">${ico(n)}</span>`; }
function contarHasta(el,to,dur){
  if(!el) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!isFinite(to)){ el.textContent=to; return; }
  const t0=performance.now();
  (function paso(t){ const p=Math.min(1,(t-t0)/dur); el.textContent=Math.round(to*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(paso); })(t0);
}

// ── Banco de imágenes ──────────────────────────────────────────
// Las fotos viven en la carpeta /img (ver img/LEEME.md). Si un archivo no existe,
// se muestra un fondo con ícono; nunca queda un hueco roto.
const IMG_BASE='img/', IMG_EXT=['webp','jpg'];
function slugImg(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
function imgCands(bases){ const o=[]; bases.filter(Boolean).forEach(b=>IMG_EXT.forEach(x=>o.push(b+'.'+x))); return o; }
function imgSrc(p){ const D=window.IMG_DATA; return (D&&D.k[p]!=null)?D.u[D.k[p]]:IMG_BASE+p; }
function pic(bases,icon,cls){
  const c=imgCands(bases);
  return `<div class="pic ${cls||''}"><span class="pic-ph">${ico(icon||'dumbbell')}</span>${c.length?`<img alt="" loading="lazy" decoding="async" src="${imgSrc(c[0])}" data-c="${c.slice(1).join('|')}" onerror="imgErr(this)">`:''}</div>`;
}
function imgErr(el){
  const r=(el.dataset.c||'').split('|').filter(Boolean);
  if(r.length){ el.dataset.c=r.slice(1).join('|'); el.src=imgSrc(r[0]); } else { el.remove(); }
}
function iconoTipo(t){ t=slugImg(t); if(/cardio|hiit|resist/.test(t)) return 'heart'; if(/movil|yoga|flex|estir|core/.test(t)) return 'stretch'; if(/descanso|recuper/.test(t)) return 'moon'; return 'dumbbell'; }
function basesSesion(tipo){ const t=slugImg(tipo), p=t.split('-')[0]; return ['sesiones/'+t,'sesiones/'+p,'sesiones/general']; }
function basesEjercicio(ej){ const n=slugImg(ej.nm), g=slugImg(ej.ms||''), g1=g.split('-')[0]; return ['ejercicios/'+n,'grupos/'+g,'grupos/'+g1]; }
// Miniatura de la lista: si subes 'ejercicios/mini-<nombre>' la usa ahí; si no existe,
// usa la misma foto grande del ejercicio (y si tampoco existe, la del grupo muscular).
function basesEjercicioMini(ej){ const n=slugImg(ej.nm); return ['ejercicios/mini-'+n, ...basesEjercicio(ej)]; }
// ── Recuadro de imagen del ejercicio (reemplaza el muñeco de silueta) ──
// Busca en img/ejercicios/<nombre>.webp|jpg; si no existe aún esa foto, cae a la
// foto del grupo muscular (img/grupos/...) y, si tampoco existe, muestra un ícono neutro.
// Foto de ancho completo, sin fondo propio (se ve el fondo del modal detrás), con el tip
// del entrenador sobrepuesto como etiqueta discreta abajo. Sin nombre del ejercicio junto
// a la foto: ya está arriba, en el título de la ficha.
// Funciona igual en cualquier pantalla que use este mismo bloque.
function ejImagenHTML(ejMostrado, tipEsc){
  if(!ejMostrado) return '';
  return `<div class="m-ejimg"><div class="m-ejimg-fig">${pic(basesEjercicio(ejMostrado),'dumbbell')}${tipEsc?`<div class="m-ejimg-tip" id="m-tip">${tipEsc}</div>`:''}</div><div class="m-ejimg-cap">Así se ve este movimiento.</div></div>`;
}

function appHead(titulo,sub){
  return `<div class="app-h"><div><div class="app-t">${titulo}</div>${sub?`<div class="app-sub">${sub}</div>`:''}</div></div>`;
}
function iniciales(nombre){ return tc(nombre).split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
const NAV_TABS=['inicio','rutina','progreso','nutricion','perfil'];
function tabActiva(){ return NAV_TABS.find(x=>document.getElementById('dsec-'+x).classList.contains('on'))||'inicio'; }

function dashTab(t){
  if(!NAV_TABS.includes(t)) t='inicio';
  if(t!=='progreso') av3dDestruir();
  NAV_TABS.forEach(x=>{
    document.getElementById('dtab-'+x).classList.toggle('ac', x===t);
    document.getElementById('dtab-'+x).setAttribute('aria-selected', String(x===t));
    document.getElementById('dsec-'+x).classList.toggle('on', x===t);
  });
  if(t==='inicio') refreshDash();
  if(t==='rutina') renderRutinaTab();
  if(t==='progreso') renderProgresoTab();
  if(t==='nutricion') renderNutricionTab();
  if(t==='perfil') renderPerfilTab();
  window.scrollTo(0,0);
}

// ── INICIO ──
function fechasSemana(){
  const d=new Date(); const dia=(d.getDay()+6)%7; d.setDate(d.getDate()-dia);
  return DIAS_ORDER.map((k,i)=>{ const x=new Date(d); x.setDate(d.getDate()+i); return x.getDate(); });
}
function refreshDash(){
  actualizarHoy();
  const s=activeSocio; if(!s) return;
  if(membBloqueoSocio(s)){ logoutSocio(); showToast(MEMB_MSG_INACTIVO); return; }
  { const av=document.getElementById('memb-aviso-socio'); if(av) av.innerHTML=membAvisoSocioHTML(s); }
  asegurarLogs(s);
  const cont=document.getElementById('dsec-inicio');
  const primer=tc(s.nombre).split(' ')[0];
  const ev=calcEvolucion(s);
  const hoy=s.rutina[HOY_KEY];
  const esDescanso=!hoy||!hoy.ejercicios||hoy.ejercicios.length===0;
  const hechoHoy=(s.logs?.sesiones||[]).some(x=>x.fecha===fechaISO(new Date()));
  const meta=Math.max(1,s.dias||1);
  const pct=Math.min(1,ev.estaSemana/meta);
  const sem=sesionesSemana(s);
  const fechas=fechasSemana();

  const reg=s._asistHoy;
  const geoClase = reg?.ubicacion==='gym'?'ab-gym':reg?.ubicacion==='outside'?'ab-home':'ab-uk';
  const geoMsg = reg?.ubicacion==='gym' ? `Check-in en el gimnasio · ${reg.hora}`
    : reg?.ubicacion==='outside' ? `Acceso fuera del gimnasio · ${reg.hora}`
    : `Ubicación no registrada · ${reg?.hora||''}`;
  const asist = reg ? `<div class="asist-badge ${geoClase}"><span class="ab-dot"></span>${geoMsg}</div>` : '';

  const diaTxt=sc(DIAS_NAMES[HOY_KEY]).toLowerCase();
  let titulo,detalle,cta,icoT='dumbbell';
  if(esDescanso){
    titulo='Día de recuperación'; detalle='El músculo crece cuando descansa.'; icoT='moon';
    cta=`<button type="button" class="btn-go soft" onclick="dashTab('progreso')">Ver mi progreso</button>`;
  } else if(hechoHoy){
    titulo=esc(sc(hoy.tipo)); detalle='Sesión completada. ¡Buen trabajo!'; icoT='check';
    cta=`<button type="button" class="btn-go soft" onclick="dashTab('progreso')">Ver resumen</button>`;
  } else {
    titulo=esc(sc(hoy.tipo)); detalle=hoy.ejercicios.length+' ejercicios · '+esc(sc(s.nivel)); icoT=iconoTipo(hoy.tipo);
    cta=`<button type="button" class="btn-go" onclick="openDay('${HOY_KEY}')">${ico('play')}Iniciar entrenamiento</button>`;
  }
  const semana=DIAS_ORDER.map((k,i)=>{
    const d=s.rutina[k]; const rest=!d||!d.ejercicios||!d.ejercicios.length;
    const esHoy=k===HOY_KEY;
    return `<button type="button" class="wk${esHoy?' hoy':''}${sem[i]?' ok':''}${rest?' rest':''}" ${rest?'':`onclick="openDay('${k}')"`} aria-label="${esc(DIAS_NAMES[k])}">
      <span class="wk-d">${esc(sc(DIAS_NAMES[k]).substring(0,3))}</span><span class="wk-n">${fechas[i]}</span><i class="wk-m">${sem[i]?ico('check'):''}</i></button>`;
  }).join('');

  cont.innerHTML=`
    <div class="app-h home">
      <div>
        <div class="app-t">Hola, ${esc(primer)}</div>
        <div class="app-sub">Tu mejor versión, cada día.</div>
      </div>
      <div class="app-act">
        <button type="button" class="ib" onclick="temaToque()" aria-label="Cambiar tema. Toca para claro u oscuro; doble toque desde oscuro para el tema nuevo en prueba">${ico(temaActual()==='dark'?'sun':'moon')}</button>
        <button type="button" class="av" onclick="dashTab('perfil')" aria-label="Mi perfil">${esc(iniciales(s.nombre))}</button>
      </div>
    </div>
    ${asist?`<div class="asist-w">${asist}</div>`:''}
    ${pqCardSocio(s)}
    ${rmAvisoHTML(s)}

    <div class="hero-card">
      ${pic(['hero/inicio'],'bolt','fill')}
      <div class="hero-ov"></div>
      <div class="hero-tx"><b>Disciplina hoy,</b><b>resultados mañana.</b></div>
    </div>

    <div class="today-c${hechoHoy?' done':''}">
      <div class="today-l">
        <div class="today-k">${ico('bolt')}Entrenamiento de hoy</div>
        <div class="today-t">${titulo}</div>
        <div class="today-m">${detalle}</div>
      </div>
      <div class="ring-wrap">
        <svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-track" cx="60" cy="60" r="50"/><circle class="ring-fill" id="ring-fill" cx="60" cy="60" r="50"/></svg>
        <div class="ring-c"><b id="ring-num">0</b><span>de ${meta}<br>esta semana</span></div>
      </div>
      <div class="today-cta">${cta}</div>
    </div>

    <div class="stats3">
      <div class="st">${it('calendar')}<div class="st-l">Sesiones totales</div><div class="st-v" id="dash-k1">0</div></div>
      <div class="st heat">${it('flame')}<div class="st-l">Racha</div><div class="st-v"><span id="dash-k3">0</span><small> sem</small></div></div>
      <div class="st">${it('target')}<div class="st-l">Adherencia</div><div class="st-v"><span id="hero-adh-v">0</span><small>%</small></div></div>
    </div>

    <div class="sec-row"><div class="sec-t">Tu semana</div><button type="button" class="sec-link" onclick="dashTab('rutina')">Ver plan${ico('chev')}</button></div>
    <div class="wk-strip">${semana}</div>`;

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const rf=document.getElementById('ring-fill'); if(rf) rf.style.strokeDashoffset=String(314.16*(1-pct));
    contarHasta(document.getElementById('ring-num'),ev.estaSemana,900);
  }));
  contarHasta(document.getElementById('dash-k1'),ev.total,800);
  contarHasta(document.getElementById('dash-k3'),ev.racha,800);
  contarHasta(document.getElementById('hero-adh-v'),ev.adherencia,800);
}

// ── RUTINA (Mi plan) ──
function renderRutinaTab(){
  const s=activeSocio; if(!s) return;
  const cont=document.getElementById('dsec-rutina');
  const fechas=fechasSemana(), sem=sesionesSemana(s);
  const pendBanner = s.status==='pendiente'
    ? `<div class="pend-banner">${ico('clock')}<div>Tu plan está pendiente de revisión por tu entrenador. Puedes consultarlo, pero podría tener ajustes.</div></div>` : '';
  const filas=DIAS_ORDER.map((k,i)=>{
    const d=s.rutina[k]; if(!d) return '';
    const rest=!d.ejercicios||!d.ejercicios.length;
    const esHoy=k===HOY_KEY;
    const grupos=[...new Set((d.ejercicios||[]).map(e=>sc(String(e.ms||'').split(' ')[0])).filter(Boolean))].slice(0,3).join(' · ');
    return `<div class="plan-r${esHoy?' hoy':''}${rest?' rest':''}" ${rest?'':`onclick="openDay('${k}')" role="button" tabindex="0"`}>
      ${pic(basesSesion(d.tipo),iconoTipo(d.tipo),'thumb')}
      <div class="plan-tx">
        <div class="plan-d">${esc(sc(d.label))} · ${fechas[i]}${esHoy?' <em>Hoy</em>':''}${sem[i]?` <i class="plan-ok">${ico('check')}</i>`:''}</div>
        <div class="plan-n">${esc(sc(d.tipo))}</div>
        <div class="plan-s">${rest?'Recuperación':d.ejercicios.length+' ejercicios'+(grupos?' · '+esc(grupos):'')}</div>
      </div>
      ${rest?'':`<span class="plan-c">${ico('chev')}</span>`}
    </div>`;
  }).join('');
  cont.innerHTML=`
    ${appHead('Mi plan','Tu semana de entrenamiento.')}
    ${pendBanner}
    <div class="goal-c">
      ${it('target')}
      <div><div class="goal-k">Objetivo principal</div><div class="goal-t">${esc(sc(s.objetivo||'Entrenar'))}</div></div>
    </div>
    ${pqPlanChip(s)}
    ${casaChipSocio(s)}
    <div class="chips3">
      <div class="ch3">${ico('calendar')}<b>${s.dias}</b><span>días por semana</span></div>
      <div class="ch3">${ico('layers')}<b>${esc(sc(s.nivel))}</b><span>nivel</span></div>
      <div class="ch3">${ico('user')}<b>${esc(String(s.asignado||'—').split(' ')[0])}</b><span>entrenador</span></div>
    </div>
    <div class="sec-row"><div class="sec-t">Plan semanal</div></div>
    <div class="plan-l">${filas}</div>
    <div class="note-card card">${ico('info')}<div><b style="color:var(--tx)">Notas de tu entrenador.</b> Cada ejercicio incluye su nota propioceptiva: dónde sentir el estímulo, en qué ángulo y hacia qué músculo dirigirlo. Tócalo para abrir el detalle, registrar tus kg y marcar series.</div></div>`;
}

// ── PERFIL ──
function temaSegHTML(){
  return `<div class="seg2" role="group" aria-label="Tema de color">
    <button type="button" data-t="light" onclick="setTema('light')">${ico('sun')}Claro</button>
    <button type="button" data-t="dark" onclick="setTema('dark')">${ico('moon')}Oscuro</button>
  </div>`;
}
function rmAvisoHTML(s){
  if(s.avisoRMVisto || s.status!=='activo') return '';
  if(!rmListaSocio(s).length) return '';
  return `<div class="pg-home soft" style="cursor:pointer" onclick="dashTab('perfil');abrirModalRM()">
    <div class="pg-home-m">💪 <b>¿Ya conoces tu peso máximo en algún ejercicio?</b> Anótalo en tu Perfil → Tus RM, y tu peso de entrenamiento se calcula desde hoy en vez de esperar a que se vaya calculando solo.
    <span style="display:block;margin-top:6px;color:var(--v);font-weight:700">Ir a Tus RM →</span></div>
  </div>`;
}
function rmListaSocio(s){
  const vistos=new Set(), lista=[];
  DIAS_ORDER.forEach(k=>{
    comoArray(s.rutina[k]&&s.rutina[k].ejercicios).forEach(e=>{
      if(!e||!e.nm||vistos.has(e.nm)) return;
      if(pct1RM(e.peso) && !esEjCardio(e)){ vistos.add(e.nm); lista.push(e.nm); }
    });
  });
  return lista;
}
function setRMPerfil(key,v){
  const s=activeSocio; if(!s) return;
  asegurarLogs(s);
  if(!s.logs.rm) s.logs.rm={};
  const kg=v===''?null:displayToKg(+v);
  if(kg==null) delete s.logs.rm[key]; else s.logs.rm[key]=kg;
  dbSave(s.code);
}
function abrirModalRM(){
  const s=activeSocio; if(!s) return;
  asegurarLogs(s);
  const rmLista=rmListaSocio(s);
  document.getElementById('rm-perfil-body').innerHTML = rmLista.map(nm=>{
    const key=prKey(nm), val=s.logs.rm&&s.logs.rm[key];
    return `<div class="pf-dato pf-rm-row"><span>${esc(nm)}</span><div class="pf-rm-in"><input type="number" inputmode="decimal" step="0.5" value="${val!=null?kgToDisplay(val):''}" placeholder="${unidadPeso}" onchange="setRMPerfil('${esc(key)}',this.value)"></div></div>`;
  }).join('');
  document.getElementById('modal-rm-perfil').classList.add('open');
}
function cerrarModalRM(){ document.getElementById('modal-rm-perfil').classList.remove('open'); }
function renderPerfilTab(){
  const s=activeSocio; if(!s) return;
  asegurarLogs(s);
  if(!s.avisoRMVisto){ s.avisoRMVisto=true; dbSave(s.code); }
  const ev=calcEvolucion(s);
  const prsN=Object.keys(s.logs.prs||{}).length;
  const logros=[
    {i:'flame',t:'Constancia',s:ev.racha+' sem de racha',on:ev.racha>=2},
    {i:'dumbbell',t:'Fuerza',s:prsN+' récords',on:prsN>=3},
    {i:'star',t:'Disciplina',s:ev.total+' sesiones',on:ev.total>=10},
    {i:'target',t:'Adherencia',s:ev.adherencia+'%',on:ev.adherencia>=80},
  ];
  const datos=[
    ['Objetivo',sc(s.objetivo)],['Nivel',sc(s.nivel)],['Edad',s.edad+' años'],['Estatura',s.estatura+' cm'],
    ['Peso actual',pesoActual(s)+' kg'],['Frecuencia',s.dias+' días por semana'],['Entrenador',s.asignado||'Sin asignar'],
  ];
  const pend=s.status==='pendiente';
  const rmLista=rmListaSocio(s);
  document.getElementById('dsec-perfil').innerHTML=`
    <div class="pf-h">
      <div class="pf-av">${esc(iniciales(s.nombre))}</div>
      <div><div class="app-t">${esc(tc(s.nombre))}</div><div class="app-sub">Tu progreso, nuestra meta.</div></div>
    </div>
    <div class="memb-c">
      ${it('shield')}
      <div class="memb-tx"><div class="memb-k">Membresía · ${esc(s.id)}${(s.membresia&&s.membresia.vence)?' · renueva '+esc(fmtFC(s.membresia.vence)):''}</div><div class="memb-t">Socio Club Campestre</div></div>
      <span class="sl-st ${pend?'pend':(membEstado(s).estado==='tolerancia'?'tol':'ok')}">${pend?'En revisión':(membEstado(s).estado==='tolerancia'?'Por renovar':'Activa')}</span>
    </div>
    <div class="stats3 flat">
      <div class="st"><div class="st-l">Sesiones</div><div class="st-v">${ev.total}</div></div>
      <div class="st"><div class="st-l">Racha</div><div class="st-v">${ev.racha}<small> sem</small></div></div>
      <div class="st"><div class="st-l">Adherencia</div><div class="st-v">${ev.adherencia}<small>%</small></div></div>
    </div>
    <div class="sec-row"><div class="sec-t">Logros</div></div>
    <div class="logros">${logros.map(l=>`<div class="lg${l.on?' on':''}">${it(l.i)}<b>${l.t}</b><span>${esc(l.s)}</span></div>`).join('')}</div>
    <div class="sec-row"><div class="sec-t">Apariencia</div></div>
    <div class="card pf-card">${temaSegHTML()}</div>
    <div class="sec-row"><div class="sec-t">Mis datos</div></div>
    <div class="card pf-card">${datos.map(([k,v])=>`<div class="pf-dato"><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
    ${rmLista.length?`<div class="sec-row"><div class="sec-t">Rendimiento</div></div>
    <div class="card pf-card">
      <button type="button" class="pf-row" onclick="abrirModalRM()">${it('dumbbell','sm')}<span>Tus RM (opcional)</span>${ico('chev')}</button>
    </div>`:''}
    <div class="sec-row"><div class="sec-t">Cuenta</div></div>
    <div class="card pf-card">
      ${s.status==='activo'?`<button type="button" class="pf-row" onclick="generarPDFRutina()">${it('file','sm')}<span id="btn-pdf-rutina">Descargar mi rutina en PDF</span>${ico('chev')}</button>`:''}
      <button type="button" class="pf-row danger" onclick="logoutSocio()">${it('logout','sm')}<span>Cerrar sesión</span>${ico('chev')}</button>
    </div>`;
  pintarSelectorTema();
}
