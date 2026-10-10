/* ═══ seed demo ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// SEED — datos demo con historial realista
// ═════════════════════════════════════════
function seedDB(){
  const hoy = new Date();
  function diasAtras(n, hora){ const d=new Date(hoy); d.setDate(d.getDate()-n); d.setHours(hora||18,30,0,0); return d; }

  function mkSesiones(diasEntreno, semanas, tipos){
    // diasEntreno: índices 0=lun..6=dom donde entrena
    const out=[];
    const lunes = inicioSemana(hoy);
    for(let w=semanas; w>=1; w--){
      diasEntreno.forEach((di,ix)=>{
        // pierde ~1 sesión cada 2 semanas para realismo
        if(w%2===0 && ix===diasEntreno.length-1) return;
        const d=new Date(lunes); d.setDate(lunes.getDate()-w*7+di); d.setHours(18,15,0,0);
        if(d>hoy) return;
        out.push({fecha:fechaISO(d), ts:d.getTime(), diaKey:DIAS_ORDER[di], tipo:tipos[ix%tipos.length], ejercicios:5, volumen:3200+Math.round(Math.random()*1200)});
      });
    }
    // semana actual: días ya pasados
    diasEntreno.forEach((di,ix)=>{
      const d=new Date(lunes); d.setDate(lunes.getDate()+di); d.setHours(18,15,0,0);
      if(d<hoy){
        out.push({fecha:fechaISO(d), ts:d.getTime(), diaKey:DIAS_ORDER[di], tipo:tipos[ix%tipos.length], ejercicios:5, volumen:3400+Math.round(Math.random()*1000)});
      }
    });
    return out.sort((a,b)=>a.ts-b.ts);
  }
  function mkPesos(inicial, delta, semanas){
    const out=[]; 
    for(let w=semanas; w>=0; w--){
      const d=diasAtras(w*7, 8);
      const kg=+(inicial + delta*((semanas-w)/semanas) + (Math.random()*0.6-0.3)).toFixed(1);
      out.push({fecha:fechaISO(d), kg});
    }
    return out;
  }

  const carlos = {
    code:'1234', nombre:'CARLOS MENDOZA', id:'#CC-1234',
    objetivo:'GANAR MÚSCULO', nivel:'INTERMEDIO', edad:31, genero:'HOMBRE',
    peso:80, estatura:178, dias:5,
    zonas:['PECHO / ESPALDA','PIERNAS'], limitaciones:[], cardio:'1 – 2 VECES POR SEMANA',
    status:'activo', asignado:'Beto R.', fechaRegistro:fechaISO(diasAtras(56)),
    prefs:{acento:'esmeralda',fondo:'carbon',letra:'claro',tarjeta:'cristal',radio:'suave',img:null,velo:0.82},
    rutina:{
      lun:{label:'LUNES',tipo:'PECHO + TRÍCEPS',color:'neon',ejercicios:[
        {nm:'Press Banca Plano',series:4,reps:'10 reps — hipertrofia',peso:'70 kg',ms:'Pecho Mayor',tip:'Al bajar, siente cómo se estira el pecho; al subir, dirige la contracción al centro del pectoral. Codos a 45°.'},
        {nm:'Press Inclinado Mancuernas',series:3,reps:'12 reps — hipertrofia',peso:'22 kg',ms:'Pecho Superior',tip:'Banco a 30–45°. Siente el estímulo en la parte alta del pecho, justo bajo la clavícula. Contrae arriba 1 seg.'},
        {nm:'Aperturas en Cable',series:3,reps:'15 reps — resistencia',peso:'12 kg',ms:'Pecho Interno',tip:'Movimiento en arco con codo semiflexionado. Siente el cierre del pecho hacia la línea media.'},
        {nm:'Press Francés',series:3,reps:'12 reps — hipertrofia',peso:'30 kg',ms:'Tríceps Largo',tip:'Codos fijos apuntando al techo. Siente el estiramiento de la cabeza larga del tríceps detrás de la cabeza.'},
        {nm:'Extensión Tríceps Polea',series:4,reps:'15 reps — resistencia',peso:'18 kg',ms:'Tríceps',tip:'Codos pegados al torso. Siente la contracción completa al extender, como si empujaras el suelo.'},
      ]},
      mar:{label:'MARTES',tipo:'ESPALDA + BÍCEPS',color:'red',ejercicios:[
        {nm:'Jalón al Pecho',series:4,reps:'10 reps — hipertrofia',peso:'60 kg',ms:'Dorsal Ancho',tip:'Lleva los codos hacia las caderas y siente la contracción del dorsal justo debajo de la axila. Varía el ángulo del tronco para sentir distinta zona del dorsal.'},
        {nm:'Remo con Barra',series:4,reps:'10 reps — hipertrofia',peso:'80 kg',ms:'Dorsal / Romboides',tip:'Torso a 45°. Al jalar al ombligo, siente cómo se juntan las escápulas en el centro de la espalda.'},
        {nm:'Curl Barra Z',series:4,reps:'10 reps — hipertrofia',peso:'35 kg',ms:'Bíceps',tip:'Codos fijos al costado. Siente el pico de contracción arriba sin balancear el torso.'},
        {nm:'Curl Martillo',series:3,reps:'12 reps — hipertrofia',peso:'18 kg',ms:'Braquial',tip:'Pulgar arriba. Siente el trabajo en el costado externo del brazo, entre bíceps y antebrazo.'},
      ]},
      mie:{label:'MIÉRCOLES',tipo:'PIERNA COMPLETA',color:'gold',ejercicios:[
        {nm:'Sentadilla Libre',series:5,reps:'8 reps — fuerza',peso:'90 kg',ms:'Cuádriceps · Glúteo',tip:'Desciende a 90° sintiendo la tensión repartida entre cuádriceps y glúteo. Empuja el suelo con todo el pie al subir.'},
        {nm:'Prensa de Piernas',series:4,reps:'12 reps — hipertrofia',peso:'180 kg',ms:'Cuádriceps · Glúteo',tip:'No bloquees rodillas arriba. Siente la carga en el muslo, no en la rodilla.'},
        {nm:'Extensión de Cuádriceps',series:3,reps:'15 reps — resistencia',peso:'55 kg',ms:'Cuádriceps',tip:'Pausa 1 seg en extensión completa sintiendo la contracción sobre la rodilla.'},
        {nm:'Curl Femoral Tumbado',series:4,reps:'12 reps — hipertrofia',peso:'40 kg',ms:'Femorales',tip:'Caderas pegadas al banco. Sube en 3 seg sintiendo la parte trasera del muslo.'},
        {nm:'Hip Thrust con Barra',series:4,reps:'10 reps — hipertrofia',peso:'100 kg',ms:'Glúteo Mayor',tip:'Aprieta el glúteo 2 seg arriba. La fuerza nace de la cadera, no de la lumbar.'},
        {nm:'Elevación de Talones',series:4,reps:'20 reps — resistencia',peso:'80 kg',ms:'Pantorrillas',tip:'Rango completo: estira abajo, pausa arriba sintiendo el gemelo contraído.'},
      ]},
      jue:{label:'JUEVES',tipo:'CARDIO + CORE',color:'red',ejercicios:[
        {nm:'Caminata Inclinada',series:1,reps:'15 min — zona 2',peso:'6 km/h · 10% incl.',ms:'Cardiovascular',tip:'Mantén 65–75% de tu FC máx. Debes poder hablar con frases cortas.'},
        {nm:'Plancha Frontal',series:4,reps:'45 seg — isométrico',peso:'Corporal',ms:'Core',tip:'Cuerpo en línea recta. Siente el abdomen "abrazando" la columna, sin subir caderas.'},
        {nm:'Crunch con Cable',series:3,reps:'20 reps — resistencia',peso:'25 kg',ms:'Recto Abdominal',tip:'Jala con el abdomen enrollando la columna, no con los brazos.'},
      ]},
      vie:{label:'VIERNES',tipo:'HOMBRO + TRAPECIO',color:'hombro',ejercicios:[
        {nm:'Press Militar',series:4,reps:'8 reps — fuerza',peso:'50 kg',ms:'Deltoides Anterior',tip:'Core activo, sin arquear la espalda. Siente el hombro frontal empujando la barra al cielo.'},
        {nm:'Elevaciones Laterales',series:4,reps:'15 reps — resistencia',peso:'12 kg',ms:'Deltoides Lateral',tip:'Sube hasta la altura del hombro liderando con el codo. Siente el costado del hombro, no el trapecio.'},
        {nm:'Encogimientos con Barra',series:4,reps:'12 reps — hipertrofia',peso:'80 kg',ms:'Trapecio',tip:'Hombros directo a las orejas sin rotar. Pausa arriba sintiendo el trapecio superior.'},
      ]},
      sab:{label:'SÁBADO',tipo:'DESCANSO ACTIVO',color:'descanso',ejercicios:[]},
      dom:{label:'DOMINGO',tipo:'DESCANSO TOTAL',color:'descanso',ejercicios:[]},
    },
    logs:{
      sesiones: mkSesiones([0,1,2,3,4], 6, ['PECHO + TRÍCEPS','ESPALDA + BÍCEPS','PIERNA COMPLETA','CARDIO + CORE','HOMBRO + TRAPECIO']),
      pesoCorporal: mkPesos(78.2, 1.8, 6),
      medidas: [
        {fecha:fechaISO(diasAtras(42)), pecho:98,  cintura:86, cadera:97, brazo:34,   muslo:57},
        {fecha:fechaISO(diasAtras(28)), pecho:99.5,cintura:85, cadera:97, brazo:35,   muslo:58},
        {fecha:fechaISO(diasAtras(14)), pecho:101, cintura:84.5,cadera:96.5,brazo:36, muslo:59},
        {fecha:fechaISO(diasAtras(3)),  pecho:102.5,cintura:84, cadera:96, brazo:37,  muslo:60},
      ],
      prs: {
        'Press Banca Plano':{kg:72.5,fecha:fechaISO(diasAtras(4))},
        'Sentadilla Libre':{kg:95,fecha:fechaISO(diasAtras(8))},
        'Remo con Barra':{kg:82.5,fecha:fechaISO(diasAtras(10))},
        'Hip Thrust con Barra':{kg:105,fecha:fechaISO(diasAtras(15))},
      },
      asistencia: []
    }
  };

  const ana = {
    code:'5678', nombre:'ANA LÓPEZ', id:'#CC-5678',
    objetivo:'PERDER PESO', nivel:'PRINCIPIANTE', edad:42, genero:'MUJER',
    peso:72, estatura:162, dias:3,
    zonas:['PIERNAS','CORE / ABDOMEN'], limitaciones:['Rodilla / menisco'], cardio:'1 – 2 VECES POR SEMANA',
    status:'activo', asignado:'Fer C.', fechaRegistro:fechaISO(diasAtras(42)),
    rutina:{
      lun:{label:'LUNES',tipo:'FULL BODY A',color:'verde',ejercicios:[
        {nm:'Prensa de Piernas (rango parcial)',series:3,reps:'15 reps — resistencia',peso:'60 kg',ms:'Cuádriceps · Glúteo',tip:'Rango cómodo para tu rodilla: siente el muslo trabajando, nunca dolor en la articulación.'},
        {nm:'Lagartijas Modificadas',series:3,reps:'10 reps — resistencia',peso:'Corporal',ms:'Pecho',tip:'Rodillas en el suelo si lo necesitas. Siente el pecho cerrándose al empujar.'},
        {nm:'Remo con Mancuerna',series:3,reps:'12 reps — resistencia',peso:'8 kg',ms:'Espalda',tip:'Torso paralelo al suelo. Lleva el codo a la cadera sintiendo el dorsal bajo la axila.'},
        {nm:'Isométrico de Cuádriceps',series:3,reps:'30 seg — isométrico',peso:'Sin carga',ms:'Cuádriceps',tip:'Sentada, extiende y sostén. Siente el muslo "encendido" sin mover la rodilla. Fortalece sin agravar el menisco.'},
      ]},
      mar:{label:'MARTES',tipo:'DESCANSO',color:'descanso',ejercicios:[]},
      mie:{label:'MIÉRCOLES',tipo:'CARDIO SUAVE + CORE',color:'red',ejercicios:[
        {nm:'Caminata / Elíptica',series:1,reps:'25 min — zona 1-2',peso:'Ritmo conversacional',ms:'Cardiovascular',tip:'La elíptica protege tu rodilla. Mantén ritmo donde puedas conversar.'},
        {nm:'Plancha Frontal',series:3,reps:'30 seg — isométrico',peso:'Corporal',ms:'Core',tip:'Abdomen firme abrazando la columna. Cuerpo en línea recta.'},
        {nm:'Puente de Glúteo',series:3,reps:'15 reps — resistencia',peso:'Corporal',ms:'Glúteo',tip:'Aprieta el glúteo arriba 2 seg. La cadera sube, la lumbar no se arquea.'},
      ]},
      jue:{label:'JUEVES',tipo:'DESCANSO',color:'descanso',ejercicios:[]},
      vie:{label:'VIERNES',tipo:'FULL BODY B',color:'neon',ejercicios:[
        {nm:'Hip Thrust con Banda',series:3,reps:'15 reps — resistencia',peso:'Banda media',ms:'Glúteo',tip:'Siente el glúteo empujando la cadera al cielo, sin molestia en rodilla.'},
        {nm:'Jalón Polea Alta',series:3,reps:'12 reps — resistencia',peso:'30 kg',ms:'Espalda',tip:'Codos hacia abajo y atrás. Siente la espalda ancha activarse.'},
        {nm:'Press Hombro Mancuernas Sentada',series:3,reps:'12 reps — resistencia',peso:'6 kg',ms:'Deltoides',tip:'Espalda apoyada. Siente el hombro empujando sin encoger el cuello.'},
      ]},
      sab:{label:'SÁBADO',tipo:'DESCANSO ACTIVO',color:'descanso',ejercicios:[]},
      dom:{label:'DOMINGO',tipo:'DESCANSO',color:'descanso',ejercicios:[]},
    },
    logs:{
      sesiones: mkSesiones([0,2,4], 5, ['FULL BODY A','CARDIO SUAVE + CORE','FULL BODY B']),
      pesoCorporal: mkPesos(74.5, -2.6, 5),
      medidas: [
        {fecha:fechaISO(diasAtras(35)), pecho:96, cintura:92, cadera:108, brazo:29, muslo:62},
        {fecha:fechaISO(diasAtras(21)), pecho:95, cintura:89.5,cadera:106, brazo:29, muslo:61},
        {fecha:fechaISO(diasAtras(7)),  pecho:94, cintura:87, cadera:104, brazo:29.5,muslo:60},
      ],
      prs: {
        'Prensa de Piernas (rango parcial)':{kg:65,fecha:fechaISO(diasAtras(6))},
        'Jalón Polea Alta':{kg:32.5,fecha:fechaISO(diasAtras(9))},
      },
      asistencia: [],
      lesiones: [
        {protoId:'osgood', faseActual:1, fechaInicio:fechaISO(diasAtras(18)),
         historial:[
           {fecha:fechaISO(diasAtras(4)), dolor:2},
           {fecha:fechaISO(diasAtras(3)), dolor:2},
           {fecha:fechaISO(diasAtras(2)), dolor:1},
           {fecha:fechaISO(diasAtras(1)), dolor:1},
         ]}
      ]
    }
  };

  const db = { socios: { '1234': carlos, '5678': ana }, version: 1 };
  try{ Object.values(db.socios).forEach(enriquecerSocio); }catch(e){}
  try{ localStorage.setItem(LS_KEY, JSON.stringify(db)); }catch(e){}
  return db;
}

// ═════════════════════════════════════════
// ENTRENADORES — perfiles con filosofía propia
// Cada uno construye SU método; el socio elige con quién entrenar
// y el sistema usa esa filosofía (no una genérica) al generar/ajustar rutinas.
// ═════════════════════════════════════════
function seedEntrenadores(){
  const ents = {
    entrenador1:{
      id:'entrenador1', rol:'entrenador', nombre:'Beto R.',
      especialidades:['Fuerza','Rendimiento deportivo','Gimnasia'],
      filosofia:{
        tagline:'Construyo fuerza real antes que estética — el físico llega solo.',
        priorities:{fuerza:5,hipertrofia:3,movilidad:3,rendimiento:4,funcional:2},
        progressStyle:'numeros',
        structure:{split:'Torso/Pierna con progresión lineal por bloques de 4 semanas.', periodization:'lineal', warmupRatio:2, method:'porcentajes'},
        exerciseStyle:{variety:2, restStyle:'fijo'},
        sampleRoutineNote:'',
        adjustmentPhilosophy:'Reviso técnica antes que cargas. Si el estancamiento pasa de 3 semanas, cambio el estímulo (tempo, ángulo o volumen) antes de tocar la intensidad.'
      }
    },
    entrenador2:{
      id:'entrenador2', rol:'entrenador', nombre:'Mariana G.',
      especialidades:['Funcional','Movilidad','Pádel','Fútbol'],
      filosofia:{
        tagline:'Cada sesión debe sentirse distinta — el cuerpo se adapta cuando lo sorprendes.',
        priorities:{fuerza:2,hipertrofia:4,movilidad:4,rendimiento:2,funcional:5},
        progressStyle:'calidad',
        structure:{split:'Full body variado 3-4x semana, con bloques temáticos rotativos.', periodization:'ondulante', warmupRatio:4, method:'rpe'},
        exerciseStyle:{variety:5, restStyle:'autorregulado'},
        sampleRoutineNote:'',
        adjustmentPhilosophy:'Si alguien deja de progresar, primero cambio el estímulo completo — otro patrón de movimiento, otro tempo, otro entorno — antes que subir peso.'
      }
    },
    entrenador3:{
      id:'entrenador3', rol:'entrenador', nombre:'Hugo T.',
      especialidades:['Rehabilitación','Natación','Tenis','Movilidad'],
      filosofia:{
        tagline:'Técnica impecable primero, cargas después. Sin atajos.',
        priorities:{fuerza:4,hipertrofia:3,movilidad:5,rendimiento:3,funcional:2},
        progressStyle:'calidad',
        structure:{split:'Full body técnico con énfasis en control articular.', periodization:'bloques', warmupRatio:5, method:'rir'},
        exerciseStyle:{variety:2, restStyle:'autorregulado'},
        sampleRoutineNote:'',
        adjustmentPhilosophy:'Antes de progresar cualquier carga, verifico rango de movimiento completo y ausencia de dolor. Si hay duda, retrocedo una fase.'
      }
    },
    coordinador1:{
      id:'coordinador1', rol:'coordinador', nombre:'Fer C.',
      especialidades:['Coordinación general'],
      filosofia:null
    }
  };
  DB.entrenadores = ents;
  guardarLocal();
  return ents;
}

function resetDemo(){
  if(staffRol!=='coordinador'){ showToast('Solo el director puede reiniciar datos'); return; }
  if(fbListo){ showToast('⛔ Desactivado con Firebase conectado: son datos reales. Usa 💾 RESPALDO.'); return; }
  uiPrompt('Modo local: se borrarán socios, sesiones y registros de ESTE dispositivo. Escribe BORRAR para confirmar','BORRAR',()=>{
    localStorage.removeItem(LS_KEY);
    const ses=leerSesion(); if(ses&&ses.tipo==='socio') borrarSesion();
    const seeded=seedDB();
    if(fbListo){
      fbDB.ref('/socios').set(seeded.socios)
        .then(()=>{ staffRenderList(); showToast('⟲ Datos demo reiniciados en Firebase'); })
        .catch(()=>{ showToast('⚠ Error al reiniciar en Firebase'); });
    } else {
      staffRenderList(); showToast('⟲ Datos demo reiniciados localmente');
    }
    document.getElementById('staff-content').innerHTML = '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--mu);font-family:var(--fb);font-size:var(--fs-2xs);">Reiniciando...</div>';
  },{label:'Borrar'});
}
