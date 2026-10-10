/* ═══ deportes club ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// BIBLIOTECA DE DEPORTES DEL CLUB
// Ejercicios de acondicionamiento específicos
// por disciplina. Base: principio de
// especificidad + prevención de lesiones.
// Cada deporte define sus focos y un banco de
// ejercicios que la IA/fallback prioriza.
// ═════════════════════════════════════════
const DEPORTES = [
  {
    id:'tenis', nm:'TENIS', emoji:'🎾',
    focos:['Potencia rotacional','Velocidad lateral','Hombro y core','Zancada explosiva'],
    resumen:'El tenis exige potencia rotacional del tronco, desplazamientos laterales explosivos y un hombro estable para el servicio. Se cuida el desequilibrio del brazo dominante.',
    banco:[
      {nm:'Rotación de tronco en polea/banda',ms:'Core rotacional',tip:'De lado a la polea, gira desde la cadera y el tronco (no los brazos), core firme. Genera la potencia del golpe.'},
      {nm:'Desplazamiento lateral con banda',ms:'Cadera · Glúteo medio',tip:'Pasos laterales resistidos, en semisentadilla. Siente el glúteo lateral que te lleva a la bola.'},
      {nm:'Zancada lateral',ms:'Cuádriceps · Aductores',tip:'Paso amplio al lado, flexiona esa rodilla sobre el pie, tronco erguido. Simula la salida al golpe.'},
      {nm:'Rotación externa de hombro (banda)',ms:'Manguito rotador',tip:'Codo al costado, gira el antebrazo hacia afuera. Protege el hombro del servicio.'},
      {nm:'Plancha con toque de hombro',ms:'Core anti-rotación',tip:'En plancha, toca el hombro opuesto sin girar la cadera. Estabilidad para el golpe.'},
      {nm:'Salto al cajón',ms:'Potencia de pierna',tip:'Salto explosivo con aterrizaje suave. Explosividad para el primer paso.'},
    ]
  },
  {
    id:'golf', nm:'GOLF', emoji:'⛳',
    focos:['Rotación de tronco','Movilidad de cadera y hombro','Estabilidad de core','Equilibrio'],
    resumen:'El golf vive de la rotación controlada del swing: movilidad de cadera y columna torácica, core estable y equilibrio. Se protege la espalda baja.',
    banco:[
      {nm:'Rotación torácica en cuadrupedia',ms:'Columna torácica',tip:'En 4 apoyos, mano en la nuca, abre el codo al techo rotando la espalda alta. Da amplitud al swing sin cargar la lumbar.'},
      {nm:'Press Pallof (anti-rotación)',ms:'Core',tip:'De lado a la banda, empuja al frente resistiendo el giro. Enseña a controlar la rotación.'},
      {nm:'Swing con balón medicinal',ms:'Core rotacional',tip:'Imita el swing lanzando el balón contra la pared desde la cadera. Potencia específica.'},
      {nm:'Puente de glúteo',ms:'Glúteo · Cadera',tip:'Cadera fuerte = base estable del swing. Aprieta el glúteo arriba.'},
      {nm:'Equilibrio en un pie',ms:'Estabilidad',tip:'Párate en un pie, luego cierra los ojos. Control del apoyo durante el golpe.'},
      {nm:'Movilidad de cadera 90/90',ms:'Cadera',tip:'Sentado, rota ambas rodillas de lado a lado. Libera la cadera para el giro.'},
    ]
  },
  {
    id:'natacion', nm:'NATACIÓN', emoji:'🏊',
    focos:['Fuerza de tren superior','Estabilidad de core','Movilidad de hombro','Resistencia'],
    resumen:'La natación se apoya en la espalda, hombros y core para la propulsión y en una gran movilidad de hombro. El trabajo en seco (dryland) refuerza el estilo sin cargar la articulación.',
    banco:[
      {nm:'Jalón dorsal / Pull-up asistido',ms:'Dorsal ancho',tip:'Lleva los codos abajo y atrás sintiendo la espalda ancha. Es tu motor de brazada.'},
      {nm:'Remo en banda o polea',ms:'Espalda media',tip:'Junta las escápulas. Equilibra el hombro frente al empuje del agua.'},
      {nm:'Rotación externa de hombro',ms:'Manguito rotador',tip:'Protege el hombro del nadador, muy expuesto a sobrecarga.'},
      {nm:'Plancha frontal',ms:'Core',tip:'Un core firme transmite fuerza entre brazos y piernas y mantiene la línea en el agua.'},
      {nm:'Superman (extensión dorsal)',ms:'Espalda baja',tip:'Boca abajo, eleva brazos y piernas. Fortalece la cadena posterior del deslizamiento.'},
      {nm:'Movilidad de hombro con banda',ms:'Hombro',tip:'Pasa la banda por encima de la cabeza con brazos rectos. Amplía el rango de brazada.'},
    ]
  },
  {
    id:'gimnasia', nm:'GIMNASIA', emoji:'🤸',
    focos:['Fuerza-flexibilidad','Control del core','Equilibrio','Fuerza relativa'],
    resumen:'La gimnasia combina fuerza en rangos amplios, control absoluto del core, equilibrio y flexibilidad activa. Se prioriza la fuerza relativa (dominar el propio cuerpo) y la protección de muñecas, espalda y tobillos.',
    banco:[
      {nm:'Hollow hold',ms:'Core',tip:'Boca arriba, brazos y piernas elevados, espalda baja pegada al piso. La base de todo control gimnástico.'},
      {nm:'Plancha lateral con elevación',ms:'Oblicuos',tip:'Estabilidad lateral para giros y equilibrios.'},
      {nm:'Puente de glúteo a una pierna',ms:'Glúteo · Cadera',tip:'Cadera fuerte para saltos y aterrizajes controlados.'},
      {nm:'Sentadilla profunda con control',ms:'Piernas · Movilidad',tip:'Baja lento manteniendo talones en el piso. Fuerza en rango completo.'},
      {nm:'Equilibrio en relevé (media punta)',ms:'Tobillo · Pie',tip:'Sube a media punta y sostén. Fortalece el tobillo, tan expuesto en gimnasia.'},
      {nm:'Fortalecimiento de muñeca',ms:'Muñeca',tip:'Apoyos progresivos y flexo-extensión con poco peso. Previene la sobrecarga de muñeca.'},
      {nm:'Split activo',ms:'Flexibilidad de cadera',tip:'Baja al split usando el control, sin forzar con el peso. Flexibilidad con fuerza.'},
    ]
  },
  {
    id:'futbol', nm:'FÚTBOL', emoji:'⚽',
    focos:['Potencia de pierna','Agilidad y cambios de dirección','Resistencia','Prevención de rodilla'],
    resumen:'El fútbol demanda potencia y resistencia de piernas, aceleraciones con cambios de dirección y una fuerte prevención de lesiones de rodilla (LCA) y de isquiotibiales.',
    banco:[
      {nm:'Sentadilla',ms:'Cuádriceps · Glúteo',tip:'Base de fuerza para sprint, salto y disparo. Rodillas alineadas con los pies.'},
      {nm:'Nórdico de isquiotibiales',ms:'Isquiotibiales',tip:'Baja el tronco frenando con los femorales. La mejor prevención de tirón de isquios.'},
      {nm:'Zancada con salto',ms:'Potencia unilateral',tip:'Cambia de pierna en el aire. Explosividad para la arrancada.'},
      {nm:'Aterrizaje controlado (drop jump)',ms:'Prevención LCA',tip:'Cae del cajón amortiguando con rodillas alineadas, nunca hacia dentro. Protege el ligamento cruzado.'},
      {nm:'Escalera de agilidad',ms:'Coordinación de pie',tip:'Pisadas rápidas y precisas. Mejora el cambio de dirección.'},
      {nm:'Plancha y anti-rotación',ms:'Core',tip:'Estabilidad para proteger, girar y disparar con equilibrio.'},
    ]
  },
  {
    id:'padel', nm:'PÁDEL', emoji:'🎾',
    focos:['Potencia rotacional','Velocidad lateral','Reacción','Fuerza de hombro'],
    resumen:'El pádel es explosivo en espacio reducido: potencia rotacional para el remate, desplazamientos laterales, split-step reactivo y hombro fuerte para golpes por encima de la cabeza.',
    banco:[
      {nm:'Rotación explosiva con balón',ms:'Core rotacional',tip:'Lanza el balón a la pared girando desde la cadera. Potencia del remate y la volea.'},
      {nm:'Split-step reactivo',ms:'Reacción',tip:'Pequeño rebote sobre las puntas entre golpes. Te deja listo para salir a cualquier lado.'},
      {nm:'Desplazamiento lateral en cono',ms:'Agilidad lateral',tip:'Shuffle rápido tocando conos a los lados. La bola rebota en las paredes: hay que reaccionar.'},
      {nm:'Zancada búlgara',ms:'Pierna unilateral',tip:'Pie de atrás en banco, baja con control. Fuerza para salir del golpe bajo.'},
      {nm:'Rotación externa de hombro',ms:'Manguito rotador',tip:'Protege el hombro de los golpes por encima de la cabeza.'},
      {nm:'Plancha lateral',ms:'Core lateral',tip:'Estabilidad para golpear en equilibrio tras un desplazamiento.'},
    ]
  },
  {
    id:'frontenis', nm:'FRONTENIS', emoji:'🥎',
    focos:['Potencia de brazo y hombro','Rotación','Reacción rápida','Muñeca estable'],
    resumen:'El frontenis exige golpes potentes contra el frontón, gran velocidad de reacción, rotación de tronco y muñeca/antebrazo fuertes por el impacto repetido.',
    banco:[
      {nm:'Rotación de tronco con banda',ms:'Core rotacional',tip:'Gira desde la cadera generando la potencia del golpe al frontón.'},
      {nm:'Fortalecimiento de antebrazo y muñeca',ms:'Antebrazo · Muñeca',tip:'Flexo-extensión de muñeca con peso ligero. Absorbe el impacto repetido de la pelota.'},
      {nm:'Rotación externa de hombro',ms:'Manguito rotador',tip:'Estabiliza el hombro del brazo ejecutor.'},
      {nm:'Ejercicio de reacción (pelota)',ms:'Reacción',tip:'Un compañero suelta una pelota y la atrapas antes del segundo bote. Reflejos para el rebote.'},
      {nm:'Desplazamiento lateral',ms:'Agilidad',tip:'Shuffle rápido para colocarte ante el rebote del frontón.'},
      {nm:'Plancha con toque de hombro',ms:'Core anti-rotación',tip:'Estabilidad del tronco durante el golpe.'},
    ]
  },
  {
    id:'basquet', nm:'BÁSQUETBOL', emoji:'🏀',
    focos:['Salto y potencia','Agilidad','Fuerza de core','Prevención tobillo/rodilla'],
    resumen:'El básquetbol se basa en el salto explosivo, cambios de ritmo y dirección, y una fuerte prevención de esguinces de tobillo y lesiones de rodilla por los aterrizajes.',
    banco:[
      {nm:'Salto al cajón',ms:'Potencia de salto',tip:'Explota hacia arriba y aterriza suave. Mejora el rebote y el tiro en suspensión.'},
      {nm:'Sentadilla',ms:'Cuádriceps · Glúteo',tip:'Base de fuerza para el salto y el contacto.'},
      {nm:'Aterrizaje controlado (drop jump)',ms:'Prevención rodilla/tobillo',tip:'Cae amortiguando, rodillas alineadas. Reduce el riesgo en cada caída.'},
      {nm:'Equilibrio en un pie',ms:'Tobillo',tip:'Fortalece el tobillo, la lesión más común en la cancha.'},
      {nm:'Escalera de agilidad',ms:'Coordinación',tip:'Pies rápidos para el cambio de dirección y la defensa.'},
      {nm:'Plancha frontal y lateral',ms:'Core',tip:'Estabilidad para el contacto y el equilibrio en el aire.'},
    ]
  },
  {
    id:'taekwondo', nm:'TAEKWONDO', emoji:'🥋',
    focos:['Potencia de patada','Flexibilidad de cadera','Velocidad','Core y equilibrio'],
    resumen:'El taekwondo requiere patadas altas y explosivas: flexibilidad de cadera, potencia de pierna, velocidad y un core que estabilice el equilibrio sobre una pierna.',
    banco:[
      {nm:'Elevación de rodilla explosiva',ms:'Flexores de cadera',tip:'Sube la rodilla rápido a la altura del pecho. Base de la patada.'},
      {nm:'Patada controlada con banda',ms:'Cadera · Pierna',tip:'Extiende la pierna al frente/lado con banda, control total. Potencia sin latigazo.'},
      {nm:'Movilidad de cadera activa',ms:'Cadera',tip:'Círculos y aperturas de cadera. Da altura a la patada con seguridad.'},
      {nm:'Equilibrio en un pie',ms:'Estabilidad',tip:'Sostente en un pie mientras la otra pierna se mueve. Control durante la patada.'},
      {nm:'Salto con giro controlado',ms:'Potencia · Coordinación',tip:'Salto con media vuelta y aterrizaje firme. Para patadas giradas.'},
      {nm:'Plancha y anti-rotación',ms:'Core',tip:'El core sostiene el equilibrio en cada técnica.'},
      {nm:'Estiramiento activo de aductores',ms:'Flexibilidad',tip:'Abre las piernas con control buscando rango para las patadas altas.'},
    ]
  },
  {
    id:'squash', nm:'SQUASH', emoji:'🎾',
    focos:['Resistencia (HIIT)','Agilidad multidireccional','Potencia de pierna','Zancada profunda'],
    resumen:'El squash es de los deportes más intensos: gran resistencia cardiovascular (HIIT), agilidad en todas direcciones, zancadas profundas para llegar a la bola y un core estable.',
    banco:[
      {nm:'Intervalos HIIT (sprint/descanso)',ms:'Cardiovascular',tip:'30 seg fuerte, 30 seg suave. Imita la intensidad de los puntos largos.'},
      {nm:'Zancada profunda',ms:'Cuádriceps · Cadera',tip:'Paso largo y bajo llegando a la bola, tronco erguido. El gesto clave del squash.'},
      {nm:'Desplazamiento en estrella',ms:'Agilidad multidireccional',tip:'Sal del centro a distintos puntos y regresa. Cubre toda la cancha.'},
      {nm:'Sentadilla con salto',ms:'Potencia',tip:'Explosividad para salir del centro hacia cualquier esquina.'},
      {nm:'Plancha lateral',ms:'Core',tip:'Estabilidad al golpear en zancada y desequilibrio.'},
      {nm:'Elevación de talones',ms:'Tobillo · Pantorrilla',tip:'Fortalece el tobillo para los frenados y arranques constantes.'},
    ]
  },
  {
    id:'fitness', nm:'CLASES FITNESS', emoji:'🔥',
    focos:['Acondicionamiento general','Fuerza funcional','Resistencia','Movilidad'],
    resumen:'Las clases fitness buscan un acondicionamiento integral: fuerza funcional de cuerpo completo, resistencia cardiovascular, core y movilidad, con trabajo variado y dinámico.',
    banco:[
      {nm:'Sentadilla con peso corporal',ms:'Piernas · Glúteo',tip:'Movimiento base funcional. Rodillas alineadas, baja con control.'},
      {nm:'Flexiones (push-ups)',ms:'Pecho · Hombro · Core',tip:'Cuerpo en línea, baja el pecho controlado. Fuerza de empuje funcional.'},
      {nm:'Remo con banda',ms:'Espalda',tip:'Junta las escápulas. Equilibra el empuje con trabajo de tracción.'},
      {nm:'Plancha frontal',ms:'Core',tip:'Abdomen firme, cuerpo en línea. Base de todo movimiento funcional.'},
      {nm:'Burpee (a tu ritmo)',ms:'Cuerpo completo · Cardio',tip:'Combina fuerza y cardio. Regula la intensidad a tu nivel.'},
      {nm:'Zancadas alternas',ms:'Piernas',tip:'Tronco erguido, rodilla sobre el tobillo. Fuerza funcional de pierna.'},
      {nm:'Movilidad articular dinámica',ms:'Movilidad',tip:'Círculos de hombro, cadera y tobillo. Prepara el cuerpo y previene lesiones.'},
    ]
  },
];
function deporteById(id){ return DEPORTES.find(d=>d.id===id); }

const REHAB_PROTOCOLOS = [
  {
    id:'osgood', zona:'RODILLA', emoji:'🦵',
    nombre:'Dolor de rodilla anterior (Osgood-Schlatter)',
    subtitulo:'Dolor y bolita bajo la rótula, sobre la espinilla',
    contexto:'Muy común en preadolescentes de 8-13 años en fase de crecimiento. El cuádriceps jala del tendón rotuliano sobre la placa de crecimiento. Se agrava con saltos, sentadillas profundas y arrodillarse.',
    banderas:['Dolor que cojea o despierta por la noche','Hinchazón marcada o enrojecimiento con calor','Dolor que no baja tras 2-3 semanas de manejo','Bloqueo o inestabilidad de la rodilla'],
    fases:[
      {
        f:'FASE 1 · CALMAR (agudo)', color:'red', dias:'7-14 días',
        meta:'Bajar el dolor sin reposo total. El objetivo es mantener movilidad sin traccionar la placa.',
        ejercicios:[
          {nm:'Isométrico de cuádriceps (pierna recta)',series:3,reps:'6 seg sostenido × 8',tip:'Sentada, pierna estirada: aprieta el muslo empujando la rodilla contra el suelo. Siente el cuádriceps firme SIN mover la articulación. Debe ser indoloro.'},
          {nm:'Elevación de pierna recta',series:3,reps:'8-12 reps lentas',tip:'Acostada, sube la pierna estirada 20-30 cm con el muslo apretado. Baja despacio. Si duele el frente de la rodilla, reduce el rango.'},
          {nm:'Estiramiento suave de cuádriceps',series:3,reps:'30 seg',tip:'De pie o acostada boca abajo, lleva el talón al glúteo sintiendo el estiramiento en el frente del muslo, no en la rodilla. Sin rebotes.'},
          {nm:'Activación de glúteo medio (banda)',series:3,reps:'12 por lado',tip:'De lado con banda sobre las rodillas, abre la pierna de arriba sin rotar la cadera. Un glúteo fuerte descarga la rodilla.'},
        ]
      },
      {
        f:'FASE 2 · FORTALECER', color:'gold', dias:'2-4 semanas',
        meta:'Fortalecer cuádriceps, isquios y cadera para descargar la rodilla. Rango indoloro.',
        ejercicios:[
          {nm:'Sentadilla a media altura (silla)',series:3,reps:'10-12 reps',tip:'Baja hasta rozar la silla, sin pasar de 90° si molesta. Rodillas alineadas con los pies. Siente glúteo y muslo repartiendo la carga.'},
          {nm:'Puente de glúteo',series:3,reps:'12-15 reps',tip:'Boca arriba, sube la cadera apretando los glúteos 2 seg arriba. Fortalece cadera para proteger la rodilla.'},
          {nm:'Step-up a escalón bajo',series:3,reps:'8 por pierna',tip:'Sube a un escalón bajo empujando con el talón, control total. Siente el glúteo y muslo de la pierna que sube.'},
          {nm:'Estiramiento de isquiotibiales',series:3,reps:'30 seg',tip:'Sentada, pierna estirada, lleva el pecho al muslo con espalda recta. Reduce tensión sobre la rodilla.'},
          {nm:'Sentadilla búlgara asistida (rango parcial)',series:3,reps:'8 por lado',tip:'Pie trasero elevado, baja solo hasta donde no duela, apoyándote si necesitas. Fuerza unilateral progresiva.'},
        ]
      },
      {
        f:'FASE 3 · RETORNO', color:'neon', dias:'según tolerancia',
        meta:'Reintroducir salto e impacto de forma gradual. Solo si no hay dolor durante ni después.',
        ejercicios:[
          {nm:'Sentadilla completa controlada',series:3,reps:'12 reps',tip:'Progresa el rango solo si sigue indoloro. Técnica impecable antes que profundidad.'},
          {nm:'Saltos de bajo impacto (aterrizaje suave)',series:3,reps:'6-8 reps',tip:'Salto pequeño con aterrizaje amortiguado, rodillas flexionadas suaves. Introduce impacto poco a poco.'},
          {nm:'Zancadas controladas',series:3,reps:'8 por pierna',tip:'Paso largo con tronco erguido, rodilla delantera sobre el tobillo. Siente el glúteo trabajar.'},
          {nm:'Aterrizaje controlado (drop landing)',series:3,reps:'6 reps',tip:'Baja de un escalón bajo y aterriza suave, absorbiendo con la rodilla flexionada. Prepara la rodilla para el impacto real.'},
        ]
      },
    ]
  },
  {
    id:'tobillo', zona:'TOBILLO', emoji:'🦶',
    nombre:'Esguince / dolor de tobillo',
    subtitulo:'Una de las lesiones más comunes al entrenar',
    contexto:'El tobillo es una de las zonas que más se lesiona al entrenar. Tras un esguince, la clave es recuperar movilidad, fuerza y sobre todo PROPIOCEPCIÓN (equilibrio) para evitar recaídas.',
    banderas:['No puede apoyar peso ni dar 4 pasos','Hinchazón inmediata y grande','Dolor sobre el hueso (no el ligamento)','Deformidad visible'],
    fases:[
      {
        f:'FASE 1 · PROTEGER (agudo)', color:'red', dias:'3-7 días',
        meta:'Controlar inflamación y recuperar movilidad suave. Principio POLICE: carga óptima, no reposo absoluto.',
        ejercicios:[
          {nm:'Movilidad: dibujar el abecedario',series:2,reps:'A-J con el pie',tip:'Sentada, dibuja letras en el aire con el dedo gordo. Movilidad suave del tobillo sin dolor.'},
          {nm:'Bombeo de tobillo (punta-talón)',series:3,reps:'15 reps',tip:'Estira la punta y súbela hacia ti, lento. Activa circulación y movilidad.'},
          {nm:'Isométrico de eversión (banda ligera)',series:3,reps:'6 seg × 8',tip:'Empuja el pie hacia afuera contra una banda o tu mano, sin mover. Reactiva los estabilizadores.'},
          {nm:'Isométrico de inversión (banda ligera)',series:3,reps:'6 seg × 8',tip:'Empuja el pie hacia adentro contra la banda, sin mover. Complementa el trabajo de eversión.'},
        ]
      },
      {
        f:'FASE 2 · FORTALECER + EQUILIBRIO', color:'gold', dias:'1-3 semanas',
        meta:'Fuerza en las 4 direcciones y reeducación del equilibrio. Aquí se previene la recaída.',
        ejercicios:[
          {nm:'Elevación de talones (gemelos)',series:3,reps:'12-15 reps',tip:'De pie, sube a puntas y baja despacio. Empieza con dos pies, progresa a uno.'},
          {nm:'Equilibrio en un pie',series:3,reps:'20-30 seg',tip:'Párate en el pie lesionado. Cuando sea fácil, cierra los ojos. Reeduca la propiocepción, clave para evitar recaídas.'},
          {nm:'Banda en 4 direcciones',series:2,reps:'12 cada dirección',tip:'Con banda elástica: empuja el pie adentro, afuera, arriba y abajo. Fortalece todo el tobillo.'},
          {nm:'Caminar en puntas y talones',series:3,reps:'10 m cada uno',tip:'Camina de puntas, luego de talones. Fuerza y control del pie completo.'},
          {nm:'Sentadilla a una pierna asistida (mini)',series:3,reps:'8 por lado',tip:'Apoyándote en una pared o silla, baja un poco en una pierna. Fuerza y equilibrio del tobillo bajo carga.'},
        ]
      },
      {
        f:'FASE 3 · RETORNO', color:'neon', dias:'según tolerancia',
        meta:'Saltos, giros y aterrizajes progresivos. Volver al tapiz solo con equilibrio y fuerza recuperados.',
        ejercicios:[
          {nm:'Saltos en un pie (control)',series:3,reps:'8 reps',tip:'Salta y aterriza en el mismo pie con estabilidad. Sin bamboleo del tobillo.'},
          {nm:'Equilibrio en superficie inestable',series:3,reps:'30 seg',tip:'Párate en un cojín o colchoneta doblada. Simula superficies inestables del día a día.'},
          {nm:'Giros con aterrizaje controlado',series:3,reps:'6 reps',tip:'Media vuelta con aterrizaje firme. Reintroduce el gesto deportivo poco a poco.'},
          {nm:'Desplazamiento lateral controlado',series:3,reps:'20 seg',tip:'Pasos laterales rápidos pero controlados. Prepara el tobillo para cambios de dirección.'},
        ]
      },
    ]
  },
  {
    id:'plantar', zona:'PIE', emoji:'👣',
    nombre:'Dolor en la planta del pie (fascitis / Sever)',
    subtitulo:'Dolor en talón o arco',
    contexto:'Es común por sobrecarga al caminar, correr o saltar. En preadolescentes suele ser Sever (dolor en el talón por la placa de crecimiento); en adultos, sobrecarga de la fascia plantar.',
    banderas:['Cojera marcada al caminar','Dolor intenso al primer paso de la mañana que no mejora','Hinchazón o enrojecimiento del talón','Dolor que persiste semanas'],
    fases:[
      {
        f:'FASE 1 · CALMAR', color:'red', dias:'1-2 semanas',
        meta:'Descargar la zona y estirar la cadena posterior sin impacto.',
        ejercicios:[
          {nm:'Rodar pelota bajo el arco',series:3,reps:'1-2 min',tip:'Sentada, rueda una pelota pequeña bajo la planta. Masaje suave que relaja la fascia.'},
          {nm:'Estiramiento de gemelo y sóleo',series:3,reps:'30 seg',tip:'De pie frente a la pared, una pierna atrás estirada, siente el estiramiento en la pantorrilla. Repite con rodilla flexionada para el sóleo.'},
          {nm:'Estiramiento de fascia plantar',series:3,reps:'20 seg × 3',tip:'Sentada, jala los dedos del pie hacia ti sintiendo el estiramiento en el arco. Suave.'},
          {nm:'Movilidad de tobillo en pared (dorsiflexión)',series:3,reps:'10 reps',tip:'De frente a la pared, lleva la rodilla hacia adelante sin despegar el talón. Libera tensión que sube desde el tobillo.'},
        ]
      },
      {
        f:'FASE 2 · FORTALECER', color:'gold', dias:'2-4 semanas',
        meta:'Fortalecer los músculos intrínsecos del pie y la pantorrilla.',
        ejercicios:[
          {nm:'Agarrar toalla con los dedos',series:3,reps:'12 reps',tip:'Sentada, arruga una toalla en el piso usando solo los dedos del pie. Fortalece el arco.'},
          {nm:'Elevación de talones lenta',series:3,reps:'12 reps',tip:'Sube a puntas y baja en 3 segundos. Fortalece la pantorrilla que sostiene el arco.'},
          {nm:'Doming (arco corto)',series:3,reps:'10 × 5 seg',tip:'Sin doblar los dedos, "acorta" el pie levantando el arco. Activa la musculatura profunda.'},
          {nm:'Elevación de talón a una pierna',series:3,reps:'10 por lado',tip:'Sube a punta apoyado en un solo pie. Fuerza específica que sostiene el arco al caminar y correr.'},
        ]
      },
      {
        f:'FASE 3 · RETORNO', color:'neon', dias:'según tolerancia',
        meta:'Reintroducir saltos y trabajo de puntas gradualmente.',
        ejercicios:[
          {nm:'Saltos suaves en el sitio',series:3,reps:'10 reps',tip:'Saltos pequeños con aterrizaje amortiguado por el antepié. Progresa el volumen.'},
          {nm:'Elevación a media punta',series:3,reps:'10 reps',tip:'Sube a media punta con control, baja lento. Sin dolor.'},
          {nm:'Trote suave en superficie blanda',series:2,reps:'2-3 min',tip:'Pasto o tapete, ritmo cómodo. Reintroduce el impacto de forma progresiva antes de volver a piso duro.'},
        ]
      },
    ]
  },
  {
    id:'muneca', zona:'MUÑECA', emoji:'✋',
    nombre:'Dolor de muñeca',
    subtitulo:'Por carga y apoyos repetidos',
    contexto:'Frecuente por apoyos repetidos (flexiones, planchas, levantamiento de peso). En crecimiento hay que cuidar la placa de crecimiento del radio. La rehabilitación busca movilidad y fuerza de agarre sin cargar en extensión dolorosa.',
    banderas:['Dolor sobre el hueso al presionar','Hinchazón o pérdida de fuerza notable','Hormigueo en los dedos','Dolor que persiste con el reposo'],
    fases:[
      {
        f:'FASE 1 · CALMAR', color:'red', dias:'1-2 semanas',
        meta:'Movilidad suave sin cargar en apoyo.',
        ejercicios:[
          {nm:'Movilidad de muñeca (flexo-extensión)',series:3,reps:'10 reps',tip:'Antebrazo apoyado, mueve la muñeca arriba y abajo lento, en rango indoloro.'},
          {nm:'Círculos de muñeca',series:2,reps:'10 cada lado',tip:'Giros suaves en ambos sentidos. Mantén el movimiento libre.'},
          {nm:'Estiramiento suave de antebrazo',series:3,reps:'20 seg',tip:'Brazo estirado, con la otra mano lleva los dedos hacia atrás suave. Siente el antebrazo, sin dolor articular.'},
          {nm:'Movilidad de dedos con banda',series:2,reps:'10 reps',tip:'Banda elástica alrededor de los dedos, ábrelos contra la resistencia. Complementa la movilidad de muñeca.'},
        ]
      },
      {
        f:'FASE 2 · FORTALECER', color:'gold', dias:'2-4 semanas',
        meta:'Fuerza de agarre y de muñeca en todas direcciones.',
        ejercicios:[
          {nm:'Apretar pelota blanda',series:3,reps:'12 reps',tip:'Aprieta una pelota de espuma 3 seg y suelta. Fuerza de agarre sin cargar la articulación.'},
          {nm:'Flexo-extensión con peso ligero',series:3,reps:'12 reps',tip:'Antebrazo apoyado, con una botellita de agua sube y baja la muñeca lento.'},
          {nm:'Desviación radial/cubital',series:2,reps:'10 cada lado',tip:'Muñeca en el borde de la mesa, muévela hacia el pulgar y hacia el meñique con poco peso.'},
          {nm:'Plancha sobre puños (apoyo neutro)',series:3,reps:'15-20 seg',tip:'Apoya sobre los puños en vez de la palma abierta, muñeca en posición neutra. Alternativa de bajo estrés articular.'},
        ]
      },
      {
        f:'FASE 3 · RETORNO', color:'neon', dias:'según tolerancia',
        meta:'Reintroducir apoyos progresivos y manejo de aparato.',
        ejercicios:[
          {nm:'Apoyo progresivo en pared',series:3,reps:'20 seg',tip:'Apoya las manos en la pared cargando poco peso. Progresa hacia apoyos más horizontales solo sin dolor.'},
          {nm:'Retorno gradual a tu actividad',series:2,reps:'2-3 min',tip:'Retoma tu actividad con movimientos suaves antes de volver a la carga completa.'},
          {nm:'Carga progresiva en press (rango parcial)',series:3,reps:'10 reps',tip:'Peso ligero, rango parcial sin dolor, progresando poco a poco hacia el rango completo.'},
        ]
      },
    ]
  },
  {
    id:'cadera', zona:'CADERA', emoji:'🩰',
    nombre:'Dolor de cadera / ingle',
    subtitulo:'Por flexibilidad extrema y splits',
    contexto:'Las aperturas, splits y patadas altas cargan mucho la cadera. El dolor suele venir de sobrecarga de flexores o tendones por buscar rangos extremos sin suficiente fuerza que los controle.',
    banderas:['Chasquido doloroso (no solo ruido)','Dolor que irradia o cojera','Pérdida de rango repentina','Dolor profundo en la ingle que no cede'],
    fases:[
      {
        f:'FASE 1 · CALMAR', color:'red', dias:'1-2 semanas',
        meta:'Reducir irritación de flexores. Movilidad controlada, no forzar el split.',
        ejercicios:[
          {nm:'Estiramiento suave de flexor de cadera',series:3,reps:'30 seg',tip:'En posición de zancada baja, empuja la cadera adelante sintiendo el estiramiento en el frente de la cadera de atrás. Suave.'},
          {nm:'Movilidad de cadera (rodilla al pecho)',series:3,reps:'10 reps',tip:'Acostada, lleva la rodilla al pecho lento y suelta. Movilidad indolora.'},
          {nm:'Basculación pélvica',series:3,reps:'12 reps',tip:'Boca arriba, aplana la espalda baja apretando el abdomen. Enseña control del centro.'},
          {nm:'Movilidad de cadera en figura 4',series:2,reps:'8 por lado',tip:'Acostada, cruza el tobillo sobre la rodilla contraria y mece suave. Moviliza rotación de cadera sin forzar.'},
        ]
      },
      {
        f:'FASE 2 · FORTALECER', color:'gold', dias:'2-4 semanas',
        meta:'Fortalecer glúteos y core para controlar los rangos amplios de la cadera.',
        ejercicios:[
          {nm:'Almeja (clamshell) con banda',series:3,reps:'12-15 reps',tip:'De lado, rodillas dobladas, abre la rodilla de arriba contra la banda. Siente el glúteo lateral.'},
          {nm:'Abducción de cadera acostada',series:3,reps:'12 reps',tip:'De lado, sube la pierna estirada con control. Fortalece el lateral de la cadera.'},
          {nm:'Puente de glúteo a una pierna',series:3,reps:'8 por lado',tip:'Puente apoyando solo un pie. Fuerza y estabilidad de cadera.'},
          {nm:'Plancha frontal',series:3,reps:'20-30 seg',tip:'Core firme, cuerpo en línea. Un centro fuerte protege la cadera en los splits.'},
          {nm:'Peso muerto rumano a una pierna (asistido)',series:3,reps:'8 por lado',tip:'Apoyándote si necesitas, bisagra de cadera en una pierna. Fuerza de cadena posterior que estabiliza la cadera.'},
        ]
      },
      {
        f:'FASE 3 · RETORNO', color:'neon', dias:'según tolerancia',
        meta:'Recuperar el rango de split y patadas de forma activa y controlada.',
        ejercicios:[
          {nm:'Split progresivo activo',series:3,reps:'20-30 seg',tip:'Baja al split solo hasta donde tengas control, sin dolor. Usa la fuerza, no el peso del cuerpo.'},
          {nm:'Patadas controladas al frente',series:3,reps:'8 por pierna',tip:'Patada alta con control, sin latigazo. La altura llega con fuerza, no forzando.'},
          {nm:'Extensión de pierna controlada',series:2,reps:'6 por pierna',tip:'Extiende la pierna al frente/lado con control total desde la cadera.'},
          {nm:'Zancada lateral controlada',series:3,reps:'8 por lado',tip:'Paso amplio hacia el lado, cadera atrás, rodilla sobre el pie. Reintroduce movimiento multidireccional de cadera.'},
        ]
      },
    ]
  },
  {
    id:'espalda', zona:'ESPALDA BAJA', emoji:'🤸',
    nombre:'Dolor de espalda baja',
    subtitulo:'Por hiperextensiones repetidas',
    contexto:'Las hiperextensiones repetidas (peso muerto, buenas mañanas, arcos de espalda) cargan la zona lumbar. El dolor suele ser por sobreuso de los extensores y falta de control del core. Requiere fortalecer el centro y cuidar la técnica de extensión.',
    banderas:['Dolor que baja por la pierna (ciática)','Hormigueo o debilidad en las piernas','Dolor tras una caída o golpe','Dolor nocturno que no cede con reposo'],
    fases:[
      {
        f:'FASE 1 · CALMAR', color:'red', dias:'1-2 semanas',
        meta:'Reducir irritación y aprender posición neutra. Evitar hiperextensiones.',
        ejercicios:[
          {nm:'Basculación pélvica',series:3,reps:'12 reps',tip:'Boca arriba, aplana suavemente la espalda apretando el abdomen. Enseña la posición neutra.'},
          {nm:'Gato-camello suave',series:3,reps:'10 reps',tip:'En 4 apoyos, redondea y arquea la espalda lento, en rango cómodo. Movilidad suave.'},
          {nm:'Rodillas al pecho',series:3,reps:'20 seg',tip:'Acostada, abraza ambas rodillas al pecho. Relaja la zona lumbar.'},
        ]
      },
      {
        f:'FASE 2 · FORTALECER (core)', color:'gold', dias:'2-4 semanas',
        meta:'Construir un core que estabilice la columna en los arcos y extensiones.',
        ejercicios:[
          {nm:'Plancha frontal',series:3,reps:'20-40 seg',tip:'Abdomen abrazando la columna, cuerpo en línea recta. Base del control lumbar.'},
          {nm:'Bird-dog (perro de muestra)',series:3,reps:'8 por lado',tip:'En 4 apoyos, extiende brazo y pierna opuestos manteniendo la espalda quieta. Control antirotación.'},
          {nm:'Plancha lateral',series:3,reps:'15-25 seg',tip:'De lado, cuerpo en línea. Fortalece los oblicuos que protegen la columna.'},
          {nm:'Puente de glúteo',series:3,reps:'12-15 reps',tip:'Sube la cadera con el glúteo, no con la lumbar. Descarga la espalda baja.'},
        ]
      },
      {
        f:'FASE 3 · RETORNO', color:'neon', dias:'según tolerancia',
        meta:'Reintroducir extensiones y puentes con control y buena técnica.',
        ejercicios:[
          {nm:'Extensión lumbar controlada',series:3,reps:'10 reps',tip:'Boca abajo, eleva el pecho poco a poco usando la espalda alta, sin forzar la lumbar.'},
          {nm:'Puente progresivo',series:3,reps:'20 seg',tip:'Retoma el puente solo si no hay dolor. Reparte el arco en toda la columna, no solo la lumbar.'},
          {nm:'Extensiones de pie (arco activo)',series:2,reps:'8 reps',tip:'Arco de pie controlado, abriendo pecho, con el core activo protegiendo la zona baja.'},
          {nm:'Peso muerto rumano ligero',series:3,reps:'10 reps',tip:'Bisagra de cadera con espalda neutra y poco peso, solo si no hay dolor. Reintroduce el patrón de carga de forma controlada.'},
        ]
      },
    ]
  },
  {
    id:'hombro', zona:'HOMBRO', emoji:'💪',
    nombre:'Dolor de hombro (manguito rotador / pinzamiento)',
    subtitulo:'Dolor al levantar el brazo o cargar peso arriba',
    contexto:'Muy común por sobrecarga en press, jalones y trabajo por encima de la cabeza. Suele ser tendinopatía del manguito rotador o pinzamiento subacromial: los tendones se irritan al perder el control de la escápula y la cabeza del húmero se descentra en el movimiento. La clave es recuperar movilidad indolora, luego reeducar el control escapular antes de volver a cargar por encima de la cabeza.',
    banderas:['Dolor nocturno que no te deja dormir de ese lado','Debilidad marcada para levantar el brazo (no solo dolor)','Hormigueo o pérdida de fuerza en la mano','Dolor tras un golpe directo o caída con el brazo extendido'],
    fases:[
      {
        f:'FASE 1 · CALMAR (agudo)', color:'red', dias:'7-14 días',
        meta:'Bajar la irritación y mantener movilidad indolora, sin cargar por encima de la cabeza.',
        ejercicios:[
          {nm:'Péndulos de Codman',series:3,reps:'20-30 seg',tip:'Inclinado hacia adelante, deja el brazo colgar y hazlo oscilar suave en círculos pequeños. Moviliza sin activar el manguito.'},
          {nm:'Rotación externa con toalla (isométrico)',series:3,reps:'6 seg × 8',tip:'Codo pegado al cuerpo a 90°, empuja hacia afuera contra tu otra mano o una toalla, sin mover el brazo. Activa el manguito sin dolor.'},
          {nm:'Deslizamiento escapular en pared',series:3,reps:'10 reps',tip:'Antebrazos en la pared, desliza los brazos arriba solo hasta donde no duela. Reeduca el ritmo escapulohumeral.'},
          {nm:'Movilidad de cuello y trapecio',series:2,reps:'8 por lado',tip:'Inclina la cabeza suave a cada lado. El trapecio suele compensar y tensarse cuando el hombro duele.'},
        ]
      },
      {
        f:'FASE 2 · FORTALECER', color:'gold', dias:'2-4 semanas',
        meta:'Fuerza del manguito rotador y control escapular en rangos medios, siempre indoloro.',
        ejercicios:[
          {nm:'Rotación externa con banda (codo fijo)',series:3,reps:'12-15 reps',tip:'Codo pegado al cuerpo a 90°, banda elástica, rota el antebrazo hacia afuera con control. Ejercicio clave del manguito rotador.'},
          {nm:'Remo con banda a la cara',series:3,reps:'12 reps',tip:'Jala la banda hacia la cara separando los codos, apretando omóplatos. Fortalece los estabilizadores de la escápula.'},
          {nm:'Elevación lateral hasta 90°',series:3,reps:'10-12 reps',tip:'Sube el brazo hacia el lado solo hasta la altura del hombro, con poco peso. No subas más si sientes pinzamiento.'},
          {nm:'Plancha con protracción escapular',series:2,reps:'8 reps',tip:'En plancha, empuja el piso separando los omóplatos. Activa el serrato, clave para estabilizar el hombro.'},
        ]
      },
      {
        f:'FASE 3 · RETORNO', color:'neon', dias:'según tolerancia',
        meta:'Reintroducir carga por encima de la cabeza de forma progresiva y sin dolor.',
        ejercicios:[
          {nm:'Press militar parcial con banda',series:3,reps:'10 reps',tip:'Empuja hacia arriba solo en el rango indoloro, progresando poco a poco hacia arriba completo.'},
          {nm:'Jalón al pecho controlado',series:3,reps:'10-12 reps',tip:'Técnica limpia, sin encoger los hombros. Reintroduce el jalón antes de volver a cargas pesadas.'},
          {nm:'Press con mancuerna ligera',series:3,reps:'8-10 reps',tip:'Progresa la carga solo si el rango completo sigue indoloro. Técnica antes que peso.'},
        ]
      },
    ]
  },
  {
    id:'cuello', zona:'CUELLO', emoji:'🦒',
    nombre:'Dolor de cuello / cervical',
    subtitulo:'Tensión, rigidez o dolor al girar la cabeza',
    contexto:'Frecuente por posturas sostenidas (celular, escritorio), sobrecarga en press y jalones con mala alineación, o tensión que sube desde los trapecios. Rara vez es algo estructural grave: casi siempre es rigidez muscular y falta de control postural. El objetivo es recuperar movilidad libre de dolor y luego fortalecer los estabilizadores profundos del cuello.',
    banderas:['Dolor que baja por el brazo con hormigueo o debilidad','Dolor tras un golpe, caída o accidente','Dolor de cabeza intenso junto con rigidez de nuca y fiebre','Mareo o pérdida de equilibrio al mover el cuello'],
    fases:[
      {
        f:'FASE 1 · CALMAR (agudo)', color:'red', dias:'5-10 días',
        meta:'Bajar la tensión y recuperar movilidad suave, sin forzar rangos dolorosos.',
        ejercicios:[
          {nm:'Retracción cervical (doble mentón)',series:3,reps:'10 reps',tip:'Lleva la barbilla hacia atrás como haciendo doble mentón, sin inclinar la cabeza. Descomprime la parte alta del cuello.'},
          {nm:'Rotación suave de cuello',series:2,reps:'8 por lado',tip:'Gira la cabeza lento hacia cada lado hasta donde sea cómodo. Sin forzar el rango.'},
          {nm:'Inclinación lateral suave',series:2,reps:'8 por lado',tip:'Lleva la oreja hacia el hombro sin subir el hombro. Estiramiento suave del lateral del cuello.'},
          {nm:'Relajación de trapecio (auto-masaje)',series:1,reps:'1-2 min',tip:'Con los dedos, masajea suavemente la parte alta del trapecio de ambos lados. Baja la tensión acumulada.'},
        ]
      },
      {
        f:'FASE 2 · FORTALECER', color:'gold', dias:'2-3 semanas',
        meta:'Fuerza de los flexores profundos del cuello y control postural de la escápula.',
        ejercicios:[
          {nm:'Flexión cráneo-cervical isométrica',series:3,reps:'6 seg × 8',tip:'Acostada, doble mentón suave sin despegar la cabeza del piso. Activa los músculos profundos que estabilizan el cuello.'},
          {nm:'Remo con banda (postura)',series:3,reps:'12 reps',tip:'Aprieta omóplatos al jalar. Un tren superior con buena postura descarga el cuello.'},
          {nm:'Plancha con doble mentón activo',series:3,reps:'20-30 seg',tip:'Mantén el cuello en posición neutra, sin dejar caer la cabeza. Enseña el control postural bajo carga.'},
          {nm:'Estiramiento de trapecio y elevador de escápula',series:2,reps:'20-30 seg por lado',tip:'Suave, sin rebotes. Libera la tensión que suele acumularse por compensación.'},
        ]
      },
      {
        f:'FASE 3 · RETORNO', color:'neon', dias:'según tolerancia',
        meta:'Reintroducir carga sobre hombros y tren superior con buena alineación cervical.',
        ejercicios:[
          {nm:'Press por encima de la cabeza controlado',series:3,reps:'10 reps',tip:'Sin adelantar la cabeza al empujar. Progresa peso solo si la técnica y el rango siguen indoloros.'},
          {nm:'Peso muerto o carga con técnica revisada',series:3,reps:'8-10 reps',tip:'Cuello alineado con la columna, sin mirar arriba ni abajo. Reintroduce cargas con buena postura.'},
          {nm:'Movilidad activa completa',series:2,reps:'10 reps por dirección',tip:'Rango completo e indoloro en todas direcciones antes de volver a tu entrenamiento normal.'},
        ]
      },
    ]
  },
];

// ── Estado del socio: lesiones activas ──
function getLesiones(s){ return (s.logs && s.logs.lesiones) || []; }
function protoById(id){ return REHAB_PROTOCOLOS.find(p=>p.id===id); }

function rehabActivar(protoId){
  const s=activeSocio; if(!s) return;
  if(!s.logs.lesiones) s.logs.lesiones=[];
  if(s.logs.lesiones.find(l=>l.protoId===protoId)){ showToast('Ya tienes esa rehabilitación activa'); return; }
  s.logs.lesiones.push({protoId, faseActual:0, fechaInicio:fechaISO(new Date()), historial:[]});
  dbSave(s.code);
  showToast('✓ Rehabilitación activada — aparece en tu plan');
  renderRehabTab();
}
function rehabQuitar(protoId){
  const s=activeSocio; if(!s) return;
  uiConfirm('¿Marcar esta rehabilitación como terminada? Se quitará de tu plan.',()=>{
  s.logs.lesiones=(s.logs.lesiones||[]).filter(l=>l.protoId!==protoId);
  dbSave(s.code);
  showToast('Rehabilitación finalizada — ¡bien hecho!');
  renderRehabTab();
  });
}
function rehabAvanzarFase(protoId){
  const s=activeSocio; if(!s) return;
  const les=(s.logs.lesiones||[]).find(l=>l.protoId===protoId); if(!les) return;
  const proto=protoById(protoId);
  if(les.faseActual < proto.fases.length-1){
    les.faseActual++;
    dbSave(s.code);
    showToast('➜ Avanzaste a '+proto.fases[les.faseActual].f);
    renderRehabTab();
  }
}
function rehabRetrocederFase(protoId){
  const s=activeSocio; if(!s) return;
  const les=(s.logs.lesiones||[]).find(l=>l.protoId===protoId); if(!les) return;
  if(les.faseActual>0){ les.faseActual--; dbSave(s.code); renderRehabTab(); }
}
function rehabRegistrarDolor(protoId, nivel){
  const s=activeSocio; if(!s) return;
  const les=(s.logs.lesiones||[]).find(l=>l.protoId===protoId); if(!les) return;
  if(!les.historial) les.historial=[];
  const hoy=fechaISO(new Date());
  const ex=les.historial.find(x=>x.fecha===hoy);
  if(ex) ex.dolor=nivel; else les.historial.push({fecha:hoy, dolor:nivel});
  dbSave(s.code);
  const msg = nivel<=1?'💚 Registrado — vas muy bien':nivel<=2?'💛 Registrado — sigue con cuidado':'❤️ Registrado — no fuerces, si sigue alto avisa a tu entrenador o médico';
  showToast(msg);
  renderRehabTab();
}

function renderRehabTab(){
  av3dDestruir();
  const s=activeSocio; if(!s) return;
  const cont=document.getElementById('dsec-rehab'); if(!cont) return;
  const lesiones=getLesiones(s);

  // ── Bloque de rehabilitaciones activas ──
  let activasHTML='';
  if(lesiones.length){
    activasHTML = lesiones.map(les=>{
      const p=protoById(les.protoId); if(!p) return '';
      const fase=p.fases[les.faseActual];
      const chipColor={red:'cc',gold:'cpi',neon:'cp'}[fase.color]||'cp';
      const ejsHTML=fase.ejercicios.map((e,i)=>`
        <div style="background:var(--in-bg2);border-radius:9px;padding:10px 12px;margin-bottom:6px;">
          <div style="display:flex;gap:8px;align-items:start;">
            <div style="font-family:var(--fd);font-size:var(--fs-base);color:var(--v);min-width:22px">${String(i+1).padStart(2,'0')}</div>
            <div style="flex:1">
              <div style="font-size:var(--fs-sm);font-weight:600;color:var(--tx)">${e.nm}</div>
              <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);margin-top:1px">${e.series} series · ${e.reps}</div>
              <div style="font-size:var(--fs-xs);color:var(--n);margin-top:4px;font-family:var(--fb);line-height:1.5;padding:6px 8px;background:color-mix(in srgb, var(--n) 5%, transparent);border-radius:5px;border-left:2px solid color-mix(in srgb, var(--n) 30%, transparent)">💡 ${e.tip}</div>
            </div>
          </div>
        </div>`).join('');

      // Semáforo de dolor de hoy
      const hoy=fechaISO(new Date());
      const dolorHoy=(les.historial||[]).find(x=>x.fecha===hoy);
      const dolorHist=(les.historial||[]).slice(-7);

      return `
      <div class="card" style="border-color:color-mix(in srgb, var(--v) 30%, transparent)">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:10px;margin-bottom:10px;">
          <div>
            <div style="font-family:var(--fb);font-size:var(--fs-xs);letter-spacing:.02em;color:var(--v)">${p.emoji} ${p.zona} · EN REHABILITACIÓN</div>
            <div style="font-family:var(--fd);font-size:var(--fs-2xl);line-height:1.1;margin-top:2px">${p.nombre}</div>
          </div>
          <div class="chip ${chipColor}" style="white-space:nowrap">FASE ${les.faseActual+1}/${p.fases.length}</div>
        </div>

        <div style="padding:10px 12px;background:var(--gl2);border-radius:10px;margin-bottom:12px;">
          <div style="font-family:var(--fd);font-size:var(--fs-base);color:var(--v)">${fase.f}</div>
          <div style="font-size:var(--fs-2xs);color:var(--mu);font-family:var(--fb);margin-top:3px;line-height:1.5">${fase.meta}</div>
          <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);margin-top:4px;opacity:.7">⏱ Duración orientativa: ${fase.dias}</div>
        </div>

        <div class="esp-lbl" style="margin-bottom:8px">EJERCICIOS DE ESTA FASE</div>
        ${ejsHTML}

        <div class="esp-lbl" style="margin:14px 0 8px">¿CÓMO SENTISTE LA ZONA HOY?</div>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <div onclick="rehabRegistrarDolor('${p.id}',1)" style="flex:1;text-align:center;padding:10px 4px;border-radius:9px;cursor:pointer;border:1px solid ${dolorHoy&&dolorHoy.dolor<=1?'#16a34a':'var(--b)'};background:${dolorHoy&&dolorHoy.dolor<=1?'color-mix(in srgb,#16a34a 12%,transparent)':'var(--gl)'};font-size:var(--fs-xs);font-family:var(--fb);color:${dolorHoy&&dolorHoy.dolor<=1?'#16a34a':'var(--mu)'}">💚<br>SIN DOLOR</div>
          <div onclick="rehabRegistrarDolor('${p.id}',2)" style="flex:1;text-align:center;padding:10px 4px;border-radius:9px;cursor:pointer;border:1px solid ${dolorHoy&&dolorHoy.dolor===2?'var(--g)':'var(--b)'};background:${dolorHoy&&dolorHoy.dolor===2?'color-mix(in srgb,var(--g) 12%,transparent)':'var(--gl)'};font-size:var(--fs-xs);font-family:var(--fb);color:${dolorHoy&&dolorHoy.dolor===2?'var(--g)':'var(--mu)'}">💛<br>MOLESTIA LEVE</div>
          <div onclick="rehabRegistrarDolor('${p.id}',3)" style="flex:1;text-align:center;padding:10px 4px;border-radius:9px;cursor:pointer;border:1px solid ${dolorHoy&&dolorHoy.dolor>=3?'var(--r)':'var(--b)'};background:${dolorHoy&&dolorHoy.dolor>=3?'color-mix(in srgb,var(--r) 12%,transparent)':'var(--gl)'};font-size:var(--fs-xs);font-family:var(--fb);color:${dolorHoy&&dolorHoy.dolor>=3?'var(--r)':'var(--mu)'}">❤️<br>DOLOR</div>
        </div>
        ${dolorHist.length?`<div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);margin-top:4px">Últimos días: ${dolorHist.map(x=>x.dolor<=1?'💚':x.dolor===2?'💛':'❤️').join(' ')}</div>`:''}

        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
          ${les.faseActual>0?`<div class="btn-mini" style="border-color:var(--b);color:var(--mu)" onclick="rehabRetrocederFase('${p.id}')">‹ Fase anterior</div>`:''}
          ${les.faseActual<p.fases.length-1?`<div class="btn-mini" onclick="rehabAvanzarFase('${p.id}')">Avanzar de fase ›</div>`:'<div class="btn-mini" style="border-color:color-mix(in srgb,#16a34a 40%,transparent);color:#16a34a">✓ Fase final</div>'}
          <div class="btn-mini" style="border-color:color-mix(in srgb,var(--r) 30%,transparent);color:var(--r);margin-left:auto" onclick="rehabQuitar('${p.id}')">Terminar</div>
        </div>

        <div style="margin-top:12px;padding:9px 12px;background:color-mix(in srgb,var(--r) 5%,transparent);border:1px solid color-mix(in srgb,var(--r) 20%,transparent);border-radius:9px">
          <div style="font-size:var(--fs-xs);font-family:var(--fb);color:var(--r);letter-spacing:.02em;margin-bottom:4px">⚠ CONSULTA AL MÉDICO SI:</div>
          <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);line-height:1.6">${p.banderas.map(b=>'• '+b).join('<br>')}</div>
        </div>
      </div>`;
    }).join('');
  }

  // ── Catálogo de protocolos disponibles ──
  const activasIds=lesiones.map(l=>l.protoId);
  const catalogoHTML=REHAB_PROTOCOLOS.filter(p=>!activasIds.includes(p.id)).map(p=>`
    <div class="card" style="cursor:pointer" onclick="rehabVerDetalle('${p.id}')">
      <div style="display:flex;gap:12px;align-items:center">
        <div style="font-size:var(--fs-5xl)">${p.emoji}</div>
        <div style="flex:1;min-width:0">
          <div style="font-family:var(--fb);font-size:var(--fs-xs);letter-spacing:.02em;color:var(--v)">${p.zona}</div>
          <div style="font-size:var(--fs-md);font-weight:600;color:var(--tx);line-height:1.2">${p.nombre}</div>
          <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);margin-top:2px">${p.subtitulo}</div>
        </div>
        <div style="font-size:var(--fs-xl);color:var(--mu)">›</div>
      </div>
    </div>`).join('');

  cont.innerHTML=`
    <div style="padding:12px 14px;border-radius:12px;margin-bottom:16px;background:color-mix(in srgb,var(--n) 5%,transparent);border:1px solid color-mix(in srgb,var(--n) 15%,transparent)">
      <div style="font-family:var(--fd);font-size:var(--fs-xl);color:var(--n)">🏥 CENTRO DE REHABILITACIÓN</div>
      <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);line-height:1.6;margin-top:4px">
        Protocolos de recuperación por fases para las lesiones más comunes al entrenar. Diseñados con la metodología del club: isométricos primero, progresión fuerza → retorno, y el dolor como semáforo.
      </div>
    </div>

    ${lesiones.length?`<div class="esp-lbl" style="margin-bottom:10px">TUS REHABILITACIONES ACTIVAS</div>${activasHTML}`:''}

    <div class="esp-lbl" style="margin:${lesiones.length?'18px':'0'} 0 10px">${lesiones.length?'AGREGAR OTRA ZONA':'ELIGE LA ZONA A RECUPERAR'}</div>
    ${catalogoHTML||'<div class="empty-msg">Tienes protocolos activos para todas las zonas disponibles.</div>'}

    <div style="margin-top:16px;padding:11px 14px;background:var(--gl);border:1px solid var(--b);border-radius:10px">
      <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);line-height:1.7">
        ⚕️ <b style="color:var(--tx)">Importante:</b> este módulo es una guía de ejercicios de apoyo, no un diagnóstico médico. Ante dolor persistente, hinchazón o cualquier señal de alerta, acude con el médico o fisioterapeuta antes de continuar. Todos los ejercicios deben hacerse SIN dolor.
      </div>
    </div>`;
}

// Detalle de un protocolo antes de activarlo
function rehabVerDetalle(protoId){
  const p=protoById(protoId); if(!p) return;
  const fasesHTML=p.fases.map((fase,i)=>`
    <div style="padding:10px 12px;background:var(--in-bg2);border-radius:9px;margin-bottom:6px">
      <div style="font-family:var(--fd);font-size:var(--fs-md);color:var(--v)">${fase.f}</div>
      <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);margin-top:2px">${fase.meta}</div>
      <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);margin-top:3px;opacity:.7">${fase.ejercicios.length} ejercicios · ${fase.dias}</div>
    </div>`).join('');
  document.getElementById('rehab-modal-body').innerHTML=`
    <div style="text-align:center;margin-bottom:14px">
      <div style="font-size:40px">${p.emoji}</div>
      <div style="font-family:var(--fd);font-size:var(--fs-4xl);line-height:1.1;margin-top:4px">${p.nombre}</div>
      <div style="font-size:var(--fs-2xs);color:var(--mu);font-family:var(--fb);margin-top:4px">${p.zona} · ${p.subtitulo}</div>
    </div>
    <div style="font-size:var(--fs-2xs);color:var(--tx);font-family:var(--fb);line-height:1.7;padding:11px 13px;background:var(--gl2);border-radius:10px;margin-bottom:14px">${p.contexto}</div>
    <div class="esp-lbl" style="margin-bottom:8px">EL PROTOCOLO TIENE ${p.fases.length} FASES</div>
    ${fasesHTML}
    <button class="btn-main" style="margin-top:14px" onclick="rehabActivar('${p.id}');cerrarRehabModal();">Comenzar esta rehabilitación</button>
    <div style="font-size:var(--fs-xs);color:var(--mu);font-family:var(--fb);line-height:1.6;margin-top:12px;text-align:center">
      ⚕️ Guía de apoyo, no diagnóstico. Ante dolor persistente o señales de alerta, consulta al médico.
    </div>`;
  document.getElementById('rehab-modal').classList.add('open');
}
function cerrarRehabModal(){ document.getElementById('rehab-modal').classList.remove('open'); }
