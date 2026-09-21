/* ════════════════════════════════════════════════════════════════════
   BASE DE CONOCIMIENTO — Fitness System Pro · Club Campestre Aguascalientes
   ────────────────────────────────────────────────────────────────────
   Es la "biblioteca" que consulta el sistema al crear rutinas:
   · PRINCIPIOS  → la metodología del club (va en cada prompt de IA)
   · METODOS     → métodos de intensidad con reglas de cuándo usarlos
   · EJERCICIOS  → catálogo con zona del gimnasio y ALTERNATIVAS por enfoque
                   (para cuando el área está ocupada en hora pico)
   Para agregar un ejercicio o método basta con editar este archivo.
   ════════════════════════════════════════════════════════════════════ */

const KB_PRINCIPIOS = [
  'Diagnóstico antes que rutina: las limitaciones son variables de diseño, no obstáculos.',
  'Secuencia de fases Fuerza → Resistencia → Hipertrofia. Tendones y articulaciones se adaptan antes que el volumen.',
  'Lesión = sustitución, nunca eliminación del grupo muscular.',
  'Cada ejercicio lleva nota propioceptiva: qué músculo, en qué ángulo, hacia dónde dirigir la sensación.',
  'Orden de la sesión: patrón principal (compuesto) primero con la mente fresca; accesorios y aislamiento después; métodos de alta fatiga al final.',
  'Los métodos de intensidad son herramientas con propósito, no decoración: cada sesión usa los que su nivel tolera y su objetivo necesita.',
  'Ningún método de alta fatiga (drop set, rest-pause, series gigantes) sobre la zona lesionada ni en ejercicios de alta demanda técnica en principiantes.',
  'Cada ejercicio tiene al menos una opción en OTRA zona del gimnasio que trabaje el mismo enfoque, para no detener la sesión en hora pico.',
  'El cardio es trabajo cardiovascular con propósito, no castigo al final.',
  'Ante estancamiento: técnica y estímulo (tempo, ángulo, método) antes que subir carga.',
];

/* ── ZONAS DEL GIMNASIO (para elegir alternativas en otra área) ── */
const KB_ZONAS = {
  rack:'Rack / barra libre', banco:'Bancos + barra', mancuernas:'Área de mancuernas',
  maquina:'Máquinas guiadas', polea:'Poleas / cables', corporal:'Peso corporal / tapete',
  cardio:'Equipos de cardio', funcional:'Zona funcional (kettlebell, TRX, cajón)'
};

/* ── MÉTODOS DE INTENSIDAD ──
   nivel: mínimo requerido (1 principiante · 2 intermedio · 3 avanzado)
   fatiga: 1 baja · 2 media · 3 alta     aplica: compuesto | aislamiento | ambos
   pareja: requiere 2+ ejercicios encadenados (se marca grupo A1/A2...)
   obj: objetivos donde más encaja (F fuerza · H hipertrofia · R resistencia/pérdida de peso)
   series/reps: formato sugerido que se escribe en la rutina                           */
const KB_METODOS = {
  tempo:       {nm:'Tempo excéntrico', nivel:1, fatiga:1, aplica:'ambos', obj:'FHR',
                reps:'10 reps · tempo 3-1-1', como:'Baja en 3 segundos, pausa 1 segundo abajo, sube en 1 segundo. Más tiempo bajo tensión sin subir el peso.'},
  pausa:       {nm:'Repeticiones con pausa', nivel:1, fatiga:1, aplica:'compuesto', obj:'FH',
                reps:'6-8 reps · pausa 2 s', como:'Sostén 2 segundos en el punto más difícil del recorrido sin rebotar. Elimina la inercia y fortalece el punto débil.'},
  superserie_ant:{nm:'Superserie antagonista', nivel:1, fatiga:2, aplica:'ambos', pareja:true, obj:'HR',
                como:'Haz este ejercicio e inmediatamente el siguiente del mismo grupo (músculos opuestos). Descansa solo al terminar ambos.'},
  circuito:    {nm:'Circuito', nivel:1, fatiga:2, aplica:'ambos', pareja:true, obj:'R',
                como:'Encadena los ejercicios del grupo uno tras otro con 15-20 s de transición. Descansa 90 s al terminar la vuelta.'},
  piramide_asc:{nm:'Pirámide ascendente', nivel:2, fatiga:2, aplica:'compuesto', obj:'FH', series:4,
                reps:'12-10-8-6', como:'Cada serie sube el peso y baja las repeticiones (12, 10, 8, 6). La última serie es la más pesada y técnica.'},
  piramide_desc:{nm:'Pirámide descendente', nivel:2, fatiga:2, aplica:'compuesto', obj:'FH', series:4,
                reps:'6-8-10-12', como:'Empiezas con la serie más pesada tras calentar bien; cada serie siguiente bajas peso y subes repeticiones (6, 8, 10, 12).'},
  drop_set:    {nm:'Drop set (series descendentes)', nivel:2, fatiga:3, aplica:'aislamiento', obj:'H',
                reps:'10 + drop + drop', como:'En la ÚLTIMA serie, al llegar cerca del fallo baja el peso 20-30% y sigue sin descanso; repite la bajada una vez más.'},
  rest_pause:  {nm:'Rest-pause', nivel:2, fatiga:3, aplica:'aislamiento', obj:'H',
                reps:'10 + 3 + 3', como:'Última serie: llega cerca del fallo, descansa 15 s y saca 2-4 reps más; repite una vez. Mismo peso.'},
  biserie:     {nm:'Biserie (mismo músculo)', nivel:2, fatiga:2, aplica:'ambos', pareja:true, obj:'H',
                como:'Dos ejercicios del MISMO músculo seguidos sin descanso: primero el pesado, luego el de aislamiento. Descansa al terminar.'},
  pre_agot:    {nm:'Pre-agotamiento', nivel:2, fatiga:2, aplica:'aislamiento', pareja:true, obj:'H',
                como:'Primero el aislamiento del músculo objetivo e inmediatamente el compuesto. Así el músculo objetivo, no los auxiliares, limita la serie.'},
  emom:        {nm:'EMOM', nivel:2, fatiga:2, aplica:'ambos', obj:'R', reps:'EMOM 10 min · 8 reps',
                como:'Al inicio de cada minuto haces las repeticiones indicadas; descansas lo que sobre del minuto. 10 minutos.'},
  escalera:    {nm:'Escalera ascendente-descendente', nivel:3, fatiga:3, aplica:'compuesto', obj:'FH', series:7,
                reps:'12-10-8-6-8-10-12', como:'Subes peso bajando reps hasta la cima (6) y después bajas peso subiendo reps de regreso. Mucho volumen efectivo en un solo ejercicio.'},
  cluster:     {nm:'Series cluster', nivel:3, fatiga:2, aplica:'compuesto', obj:'F', series:4,
                reps:'2+2+1 · 15 s entre bloques', como:'Serie partida: con un peso alto haces 2 reps, descansas 15 s, 2 más, 15 s, 1 más. Más reps de calidad con cargas altas.'},
  drop_mec:    {nm:'Drop set mecánico', nivel:3, fatiga:3, aplica:'ambos', obj:'H',
                como:'Al acercarte al fallo NO bajas el peso: cambias a una variante más fácil del mismo movimiento (p. ej. inclinado → plano) y sigues sin descanso.'},
  triserie:    {nm:'Triserie', nivel:3, fatiga:3, aplica:'ambos', pareja:true, obj:'HR',
                como:'Tres ejercicios encadenados sin descanso. Descansa 2 min al terminar los tres.'},
  serie_gigante:{nm:'Serie gigante', nivel:3, fatiga:3, aplica:'ambos', pareja:true, obj:'R',
                como:'Cuatro o más ejercicios encadenados sin descanso para un mismo bloque corporal.'},
  post_agot:   {nm:'Post-agotamiento', nivel:3, fatiga:3, aplica:'aislamiento', pareja:true, obj:'H',
                como:'Después del compuesto, sin descanso, un aislamiento del músculo objetivo para terminar de agotarlo.'},
  metodo21:    {nm:'Método 21', nivel:3, fatiga:3, aplica:'aislamiento', obj:'H', reps:'7+7+7',
                como:'7 reps en la mitad inferior del recorrido, 7 en la mitad superior y 7 completas, sin descanso.'},
  una_y_media: {nm:'1½ repeticiones', nivel:3, fatiga:2, aplica:'ambos', obj:'H', reps:'8 reps de 1½',
                como:'Cada repetición: recorrido completo + medio recorrido extra en la zona más difícil. Cuenta como 1.'},
  contraste:   {nm:'Contraste (fuerza + potencia)', nivel:3, fatiga:2, aplica:'compuesto', pareja:true, obj:'F',
                como:'Serie pesada de 3-5 reps y enseguida 5 saltos o lanzamientos explosivos del mismo patrón. Descansa 2-3 min.'},
};

/* Métodos que NO se usan con ciertas lesiones/condiciones (sobre la zona afectada) */
const KB_METODO_EVITAR = {
  cardiaca: ['drop_set','rest_pause','cluster','escalera','serie_gigante','triserie','metodo21','contraste','drop_mec','emom'],
  _lesion_zona: ['drop_set','rest_pause','cluster','escalera','drop_mec','metodo21','contraste'],
};

/* ── CATÁLOGO DE EJERCICIOS ──
   z: zona del gimnasio · t: c=compuesto a=aislamiento
   enf: enfoque por defecto · alt: alternativas POR ENFOQUE (ids del catálogo)
   ev: lesiones donde evitarlo (rodilla, lumbar, hombro, cadera, cuello)
   aka: otros nombres con los que puede aparecer                                  */
const KB_EJERCICIOS = [
  // ── PIERNA · CUÁDRICEPS / GLÚTEO ──
  {id:'sentadilla', nm:'Sentadilla libre', ms:'Cuádriceps · Glúteo', z:'rack', t:'c', enf:'cuadriceps', ev:['rodilla','lumbar'],
   alt:{cuadriceps:['prensa','hack','goblet','bulgara'], gluteo:['hip_thrust','bulgara']}, aka:['sentadilla trasera','back squat','sentadilla con barra']},
  {id:'goblet', nm:'Sentadilla goblet', ms:'Cuádriceps · Glúteo', z:'mancuernas', t:'c', enf:'cuadriceps', ev:['rodilla'],
   alt:{cuadriceps:['prensa','ext_cuad','hack'], gluteo:['hip_thrust','puente']}, aka:[]},
  {id:'frontal', nm:'Sentadilla frontal', ms:'Cuádriceps · Core', z:'rack', t:'c', enf:'cuadriceps', ev:['rodilla','lumbar'],
   alt:{cuadriceps:['hack','goblet','prensa_baja']}, aka:['front squat']},
  {id:'hack', nm:'Sentadilla hack', ms:'Cuádriceps', z:'maquina', t:'c', enf:'cuadriceps', ev:['rodilla'],
   alt:{cuadriceps:['prensa_baja','goblet','ext_cuad']}, aka:['hack squat']},
  {id:'prensa', nm:'Prensa de piernas', ms:'Cuádriceps · Glúteo', z:'maquina', t:'c', enf:'cuadriceps', ev:[],
   alt:{cuadriceps:['goblet','bulgara','ext_cuad'], gluteo:['hip_thrust','step_up']}, aka:['prensa','leg press','prensa de piernas (rango parcial)']},
  {id:'prensa_baja', nm:'Prensa con pies bajos', ms:'Cuádriceps', z:'maquina', t:'c', enf:'cuadriceps', ev:['rodilla'],
   alt:{cuadriceps:['goblet','ext_cuad','sissy']}, aka:[]},
  {id:'desplante', nm:'Desplante', ms:'Cuádriceps · Glúteo', z:'mancuernas', t:'c', enf:'cuadriceps', ev:['rodilla'],
   alt:{cuadriceps:['ext_cuad','prensa_baja','hack'], gluteo:['hip_thrust','patada_polea','step_up']}, aka:['zancadas','zancada','lunge','desplantes','zancadas caminando']},
  {id:'bulgara', nm:'Sentadilla búlgara', ms:'Cuádriceps · Glúteo', z:'mancuernas', t:'c', enf:'cuadriceps', ev:['rodilla'],
   alt:{cuadriceps:['ext_cuad','prensa_baja','goblet'], gluteo:['hip_thrust','step_up','patada_polea']}, aka:['split squat','bulgara']},
  {id:'step_up', nm:'Step-up al cajón', ms:'Glúteo · Cuádriceps', z:'funcional', t:'c', enf:'gluteo', ev:[],
   alt:{gluteo:['hip_thrust','patada_polea'], cuadriceps:['prensa','ext_cuad']}, aka:['step-up bajo','subida al cajón','step up']},
  {id:'ext_cuad', nm:'Extensión de cuádriceps', ms:'Cuádriceps', z:'maquina', t:'a', enf:'cuadriceps', ev:[],
   alt:{cuadriceps:['sissy','goblet','isom_cuad']}, aka:['extensión de rodilla','extension de piernas','leg extension']},
  {id:'sissy', nm:'Sentadilla sissy asistida', ms:'Cuádriceps', z:'corporal', t:'a', enf:'cuadriceps', ev:['rodilla'],
   alt:{cuadriceps:['ext_cuad','goblet']}, aka:[]},
  {id:'isom_cuad', nm:'Isométrico de cuádriceps', ms:'Cuádriceps', z:'corporal', t:'a', enf:'cuadriceps', ev:[],
   alt:{cuadriceps:['ext_cuad','sentadilla_pared']}, aka:['isométrico de cuádriceps']},
  {id:'sentadilla_pared', nm:'Sentadilla isométrica en pared', ms:'Cuádriceps', z:'corporal', t:'a', enf:'cuadriceps', ev:[],
   alt:{cuadriceps:['isom_cuad','ext_cuad']}, aka:['wall sit']},
  // ── PIERNA · CADENA POSTERIOR ──
  {id:'peso_muerto', nm:'Peso muerto convencional', ms:'Glúteo · Femorales · Espalda', z:'rack', t:'c', enf:'gluteo', ev:['lumbar'],
   alt:{gluteo:['hip_thrust','pm_rumano_mancuerna'], femoral:['pm_rumano_mancuerna','curl_fem']}, aka:['peso muerto','deadlift']},
  {id:'pm_rumano', nm:'Peso muerto rumano', ms:'Femorales · Glúteo', z:'rack', t:'c', enf:'femoral', ev:['lumbar'],
   alt:{femoral:['pm_rumano_mancuerna','curl_fem','curl_fem_sentado'], gluteo:['hip_thrust','hiperext']}, aka:['peso muerto rumano','rdl']},
  {id:'pm_rumano_mancuerna', nm:'Peso muerto rumano con mancuernas', ms:'Femorales · Glúteo', z:'mancuernas', t:'c', enf:'femoral', ev:['lumbar'],
   alt:{femoral:['curl_fem','curl_fem_sentado'], gluteo:['hip_thrust','patada_polea']}, aka:[]},
  {id:'hip_thrust', nm:'Hip thrust', ms:'Glúteo mayor', z:'banco', t:'c', enf:'gluteo', ev:[],
   alt:{gluteo:['puente','patada_polea','abduccion']}, aka:['empuje de cadera','hip thrust con barra']},
  {id:'puente', nm:'Puente de glúteo', ms:'Glúteo', z:'corporal', t:'a', enf:'gluteo', ev:[],
   alt:{gluteo:['hip_thrust','patada_polea']}, aka:['puente de gluteo','glute bridge']},
  {id:'patada_polea', nm:'Patada de glúteo en polea', ms:'Glúteo mayor', z:'polea', t:'a', enf:'gluteo', ev:[],
   alt:{gluteo:['puente','abduccion','hip_thrust']}, aka:['patada de gluteo']},
  {id:'abduccion', nm:'Abducción de cadera en máquina', ms:'Glúteo medio', z:'maquina', t:'a', enf:'gluteo', ev:[],
   alt:{gluteo:['monster_walk','patada_polea']}, aka:['abductores','abducción']},
  {id:'monster_walk', nm:'Caminata lateral con banda', ms:'Glúteo medio', z:'corporal', t:'a', enf:'gluteo', ev:[],
   alt:{gluteo:['abduccion','puente']}, aka:['monster walk']},
  {id:'curl_fem', nm:'Curl femoral acostado', ms:'Femorales', z:'maquina', t:'a', enf:'femoral', ev:[],
   alt:{femoral:['curl_fem_sentado','nordico','pm_rumano_mancuerna']}, aka:['curl femoral','leg curl']},
  {id:'curl_fem_sentado', nm:'Curl femoral sentado', ms:'Femorales', z:'maquina', t:'a', enf:'femoral', ev:[],
   alt:{femoral:['curl_fem','curl_fem_fitball']}, aka:[]},
  {id:'curl_fem_fitball', nm:'Curl femoral en fitball', ms:'Femorales', z:'corporal', t:'a', enf:'femoral', ev:[],
   alt:{femoral:['curl_fem','nordico']}, aka:[]},
  {id:'nordico', nm:'Curl nórdico asistido', ms:'Femorales', z:'corporal', t:'a', enf:'femoral', ev:['rodilla'],
   alt:{femoral:['curl_fem','curl_fem_fitball']}, aka:['nordic curl']},
  {id:'hiperext', nm:'Hiperextensión 45°', ms:'Erectores · Glúteo', z:'banco', t:'a', enf:'gluteo', ev:['lumbar'],
   alt:{gluteo:['puente','hip_thrust']}, aka:['extensiones lumbares','hiperextensiones']},
  {id:'pantorrilla', nm:'Elevación de talones de pie', ms:'Gemelos', z:'maquina', t:'a', enf:'pantorrilla', ev:[],
   alt:{pantorrilla:['pantorrilla_prensa','pantorrilla_escalon']}, aka:['elevación de talones','pantorrillas','calf raise']},
  {id:'pantorrilla_prensa', nm:'Pantorrilla en prensa', ms:'Gemelos', z:'maquina', t:'a', enf:'pantorrilla', ev:[],
   alt:{pantorrilla:['pantorrilla','pantorrilla_escalon']}, aka:[]},
  {id:'pantorrilla_escalon', nm:'Pantorrilla unilateral en escalón', ms:'Gemelos', z:'corporal', t:'a', enf:'pantorrilla', ev:[],
   alt:{pantorrilla:['pantorrilla','pantorrilla_prensa']}, aka:[]},

  // ── PECHO ──
  {id:'press_banca', nm:'Press banca plano', ms:'Pecho mayor · Tríceps', z:'banco', t:'c', enf:'pecho', ev:['hombro'],
   alt:{pecho:['press_mancuerna','press_maquina','lagartija']}, aka:['press de banca','bench press','press banca']},
  {id:'press_inclinado', nm:'Press inclinado con barra', ms:'Pecho superior', z:'banco', t:'c', enf:'pecho_sup', ev:['hombro'],
   alt:{pecho_sup:['press_incl_mancuerna','press_maquina_incl','cruce_bajo']}, aka:[]},
  {id:'press_incl_mancuerna', nm:'Press inclinado con mancuernas', ms:'Pecho superior', z:'mancuernas', t:'c', enf:'pecho_sup', ev:['hombro'],
   alt:{pecho_sup:['press_maquina_incl','cruce_bajo','press_inclinado']}, aka:['press inclinado mancuernas']},
  {id:'press_mancuerna', nm:'Press plano con mancuernas', ms:'Pecho mayor', z:'mancuernas', t:'c', enf:'pecho', ev:['hombro'],
   alt:{pecho:['press_maquina','press_banca','lagartija']}, aka:[]},
  {id:'press_maquina', nm:'Press de pecho en máquina', ms:'Pecho mayor', z:'maquina', t:'c', enf:'pecho', ev:[],
   alt:{pecho:['press_mancuerna','lagartija','cruce_poleas']}, aka:['press de pecho en maquina','chest press']},
  {id:'press_maquina_incl', nm:'Press inclinado en máquina', ms:'Pecho superior', z:'maquina', t:'c', enf:'pecho_sup', ev:[],
   alt:{pecho_sup:['press_incl_mancuerna','cruce_bajo']}, aka:[]},
  {id:'lagartija', nm:'Lagartijas', ms:'Pecho · Tríceps · Core', z:'corporal', t:'c', enf:'pecho', ev:['hombro'],
   alt:{pecho:['press_maquina','press_mancuerna']}, aka:['flexiones','push up','push-ups']},
  {id:'fondos', nm:'Fondos en paralelas', ms:'Pecho inferior · Tríceps', z:'funcional', t:'c', enf:'pecho', ev:['hombro'],
   alt:{pecho:['press_maquina','cruce_alto'], triceps:['ext_triceps','press_cerrado']}, aka:['dips']},
  {id:'cruce_poleas', nm:'Cruce de poleas', ms:'Pecho (porción media)', z:'polea', t:'a', enf:'pecho', ev:[],
   alt:{pecho:['pec_deck','aperturas_mancuerna']}, aka:['aperturas en cable','cruces en polea','crossover']},
  {id:'cruce_bajo', nm:'Cruce de poleas de abajo hacia arriba', ms:'Pecho superior', z:'polea', t:'a', enf:'pecho_sup', ev:[],
   alt:{pecho_sup:['press_incl_mancuerna','aperturas_mancuerna']}, aka:[]},
  {id:'cruce_alto', nm:'Cruce de poleas de arriba hacia abajo', ms:'Pecho inferior', z:'polea', t:'a', enf:'pecho', ev:[],
   alt:{pecho:['pec_deck','fondos']}, aka:[]},
  {id:'pec_deck', nm:'Pec deck (aperturas en máquina)', ms:'Pecho', z:'maquina', t:'a', enf:'pecho', ev:[],
   alt:{pecho:['cruce_poleas','aperturas_mancuerna']}, aka:['peck deck','aperturas en maquina']},
  {id:'aperturas_mancuerna', nm:'Aperturas con mancuernas', ms:'Pecho', z:'mancuernas', t:'a', enf:'pecho', ev:['hombro'],
   alt:{pecho:['pec_deck','cruce_poleas']}, aka:['aperturas']},

  // ── ESPALDA ──
  {id:'dominadas', nm:'Dominadas', ms:'Dorsal ancho · Bíceps', z:'funcional', t:'c', enf:'dorsal', ev:['hombro'],
   alt:{dorsal:['jalon','dominada_asistida','jalon_unilateral']}, aka:['pull up','dominada']},
  {id:'dominada_asistida', nm:'Dominada asistida en máquina', ms:'Dorsal ancho', z:'maquina', t:'c', enf:'dorsal', ev:[],
   alt:{dorsal:['jalon','jalon_unilateral']}, aka:[]},
  {id:'jalon', nm:'Jalón al pecho', ms:'Dorsal ancho', z:'polea', t:'c', enf:'dorsal', ev:[],
   alt:{dorsal:['dominada_asistida','pullover_polea','remo_mancuerna']}, aka:['jalon al pecho','lat pulldown','jalón']},
  {id:'jalon_unilateral', nm:'Jalón unilateral en polea', ms:'Dorsal ancho', z:'polea', t:'c', enf:'dorsal', ev:[],
   alt:{dorsal:['jalon','remo_mancuerna']}, aka:[]},
  {id:'pullover_polea', nm:'Pullover en polea alta', ms:'Dorsal ancho', z:'polea', t:'a', enf:'dorsal', ev:[],
   alt:{dorsal:['pullover_mancuerna','jalon']}, aka:['pullover']},
  {id:'pullover_mancuerna', nm:'Pullover con mancuerna', ms:'Dorsal · Pecho', z:'mancuernas', t:'a', enf:'dorsal', ev:['hombro'],
   alt:{dorsal:['pullover_polea','jalon']}, aka:[]},
  {id:'remo_barra', nm:'Remo con barra', ms:'Dorsal · Romboides', z:'rack', t:'c', enf:'espalda_media', ev:['lumbar'],
   alt:{espalda_media:['remo_apoyo','remo_polea','remo_mancuerna']}, aka:['remo inclinado con barra']},
  {id:'remo_mancuerna', nm:'Remo con mancuerna', ms:'Dorsal · Romboides', z:'mancuernas', t:'c', enf:'espalda_media', ev:[],
   alt:{espalda_media:['remo_polea','remo_apoyo','remo_trx']}, aka:['remo a una mano']},
  {id:'remo_polea', nm:'Remo en polea baja', ms:'Dorsal · Romboides', z:'polea', t:'c', enf:'espalda_media', ev:[],
   alt:{espalda_media:['remo_mancuerna','remo_apoyo','remo_trx']}, aka:['remo sentado','seated row','remo en polea']},
  {id:'remo_apoyo', nm:'Remo en máquina con apoyo de pecho', ms:'Dorsal · Romboides', z:'maquina', t:'c', enf:'espalda_media', ev:[],
   alt:{espalda_media:['remo_mancuerna','remo_polea']}, aka:['remo en maquina con apoyo','remo en maquina','t-bar']},
  {id:'remo_trx', nm:'Remo invertido en TRX', ms:'Espalda media · Core', z:'funcional', t:'c', enf:'espalda_media', ev:[],
   alt:{espalda_media:['remo_polea','remo_mancuerna']}, aka:['remo invertido']},
  {id:'face_pull', nm:'Face pull', ms:'Deltoides posterior · Manguito', z:'polea', t:'a', enf:'deltoide_post', ev:[],
   alt:{deltoide_post:['pajaro','reverse_pec','banda_rotacion']}, aka:['face pull en polea']},

  // ── HOMBRO ──
  {id:'press_militar', nm:'Press militar con barra', ms:'Deltoides anterior', z:'rack', t:'c', enf:'deltoide', ev:['hombro','lumbar','cuello'],
   alt:{deltoide:['press_hombro_mancuerna','press_hombro_maquina','landmine']}, aka:['press militar']},
  {id:'press_hombro_mancuerna', nm:'Press de hombro con mancuernas', ms:'Deltoides', z:'mancuernas', t:'c', enf:'deltoide', ev:['hombro'],
   alt:{deltoide:['press_hombro_maquina','landmine']}, aka:['press militar mancuernas','press arnold']},
  {id:'press_hombro_maquina', nm:'Press de hombro en máquina', ms:'Deltoides', z:'maquina', t:'c', enf:'deltoide', ev:[],
   alt:{deltoide:['press_hombro_mancuerna','landmine']}, aka:[]},
  {id:'landmine', nm:'Press landmine', ms:'Deltoides anterior · Pecho superior', z:'rack', t:'c', enf:'deltoide', ev:[],
   alt:{deltoide:['press_hombro_maquina','press_hombro_mancuerna']}, aka:[]},
  {id:'laterales', nm:'Elevaciones laterales', ms:'Deltoides lateral', z:'mancuernas', t:'a', enf:'deltoide_lat', ev:[],
   alt:{deltoide_lat:['lateral_polea','lateral_maquina']}, aka:['elevaciones laterales con mancuerna','vuelos laterales']},
  {id:'lateral_polea', nm:'Elevación lateral en polea', ms:'Deltoides lateral', z:'polea', t:'a', enf:'deltoide_lat', ev:[],
   alt:{deltoide_lat:['laterales','lateral_maquina']}, aka:[]},
  {id:'lateral_maquina', nm:'Elevación lateral en máquina', ms:'Deltoides lateral', z:'maquina', t:'a', enf:'deltoide_lat', ev:[],
   alt:{deltoide_lat:['laterales','lateral_polea']}, aka:[]},
  {id:'frontal_ligera', nm:'Elevación frontal ligera', ms:'Deltoides anterior', z:'mancuernas', t:'a', enf:'deltoide', ev:[],
   alt:{deltoide:['frontal_polea','landmine']}, aka:['elevacion frontal ligera','elevaciones frontales']},
  {id:'frontal_polea', nm:'Elevación frontal en polea', ms:'Deltoides anterior', z:'polea', t:'a', enf:'deltoide', ev:[],
   alt:{deltoide:['frontal_ligera']}, aka:[]},
  {id:'pajaro', nm:'Pájaros con mancuerna', ms:'Deltoides posterior', z:'mancuernas', t:'a', enf:'deltoide_post', ev:[],
   alt:{deltoide_post:['reverse_pec','face_pull']}, aka:['pajaros','elevaciones posteriores']},
  {id:'reverse_pec', nm:'Reverse pec deck', ms:'Deltoides posterior', z:'maquina', t:'a', enf:'deltoide_post', ev:[],
   alt:{deltoide_post:['pajaro','face_pull']}, aka:['aperturas invertidas']},
  {id:'banda_rotacion', nm:'Rotación externa con banda', ms:'Manguito rotador', z:'corporal', t:'a', enf:'manguito', ev:[],
   alt:{manguito:['rotacion_polea','face_pull']}, aka:['manguito rotador con banda','trabajo de manguito rotador']},
  {id:'rotacion_polea', nm:'Rotación externa en polea', ms:'Manguito rotador', z:'polea', t:'a', enf:'manguito', ev:[],
   alt:{manguito:['banda_rotacion']}, aka:[]},
  {id:'encogimientos', nm:'Encogimientos con mancuerna', ms:'Trapecio', z:'mancuernas', t:'a', enf:'trapecio', ev:['cuello'],
   alt:{trapecio:['encog_maquina','farmer']}, aka:['encogimientos','shrugs']},
  {id:'encog_maquina', nm:'Encogimientos en máquina', ms:'Trapecio', z:'maquina', t:'a', enf:'trapecio', ev:['cuello'],
   alt:{trapecio:['encogimientos','farmer']}, aka:[]},

  // ── BRAZOS ──
  {id:'curl_barra', nm:'Curl con barra Z', ms:'Bíceps', z:'mancuernas', t:'a', enf:'biceps', ev:[],
   alt:{biceps:['curl_polea','curl_mancuerna','curl_predicador']}, aka:['curl barra z','curl con barra']},
  {id:'curl_mancuerna', nm:'Curl alterno con mancuernas', ms:'Bíceps', z:'mancuernas', t:'a', enf:'biceps', ev:[],
   alt:{biceps:['curl_polea','curl_predicador']}, aka:['curl de biceps','curl de bíceps','curl biceps']},
  {id:'curl_polea', nm:'Curl en polea baja', ms:'Bíceps', z:'polea', t:'a', enf:'biceps', ev:[],
   alt:{biceps:['curl_mancuerna','curl_predicador']}, aka:[]},
  {id:'curl_predicador', nm:'Curl predicador en máquina', ms:'Bíceps (porción corta)', z:'maquina', t:'a', enf:'biceps', ev:[],
   alt:{biceps:['curl_polea','curl_mancuerna']}, aka:['curl scott','curl predicador']},
  {id:'curl_martillo', nm:'Curl martillo', ms:'Braquial · Braquiorradial', z:'mancuernas', t:'a', enf:'braquial', ev:[],
   alt:{braquial:['curl_cuerda']}, aka:['curl martillo con mancuernas']},
  {id:'curl_cuerda', nm:'Curl martillo en polea con cuerda', ms:'Braquial', z:'polea', t:'a', enf:'braquial', ev:[],
   alt:{braquial:['curl_martillo']}, aka:[]},
  {id:'ext_triceps', nm:'Extensión de tríceps en polea', ms:'Tríceps', z:'polea', t:'a', enf:'triceps', ev:[],
   alt:{triceps:['frances','fondos_banco','ext_triceps_mancuerna']}, aka:['extension de triceps polea','extensión tríceps polea','pushdown','jalón de tríceps']},
  {id:'frances', nm:'Press francés con barra Z', ms:'Tríceps (porción larga)', z:'banco', t:'a', enf:'triceps', ev:['hombro'],
   alt:{triceps:['ext_triceps_mancuerna','ext_triceps']}, aka:['press frances','skull crusher']},
  {id:'ext_triceps_mancuerna', nm:'Extensión de tríceps sobre la cabeza', ms:'Tríceps (porción larga)', z:'mancuernas', t:'a', enf:'triceps', ev:['hombro'],
   alt:{triceps:['ext_triceps','frances']}, aka:['extension overhead']},
  {id:'fondos_banco', nm:'Fondos en banco', ms:'Tríceps', z:'corporal', t:'a', enf:'triceps', ev:['hombro'],
   alt:{triceps:['ext_triceps']}, aka:[]},
  {id:'press_cerrado', nm:'Press banca agarre cerrado', ms:'Tríceps · Pecho', z:'banco', t:'c', enf:'triceps', ev:['hombro'],
   alt:{triceps:['fondos','ext_triceps']}, aka:[]},

  // ── CORE ──
  {id:'plancha', nm:'Plancha frontal', ms:'Core', z:'corporal', t:'a', enf:'core', ev:[],
   alt:{core:['dead_bug','pallof','rueda']}, aka:['plancha','plank']},
  {id:'plancha_lateral', nm:'Plancha lateral', ms:'Oblicuos', z:'corporal', t:'a', enf:'core', ev:['hombro'],
   alt:{core:['pallof','farmer_unilateral']}, aka:[]},
  {id:'dead_bug', nm:'Dead bug', ms:'Core profundo', z:'corporal', t:'a', enf:'core', ev:[],
   alt:{core:['bird_dog','plancha']}, aka:[]},
  {id:'bird_dog', nm:'Bird-dog', ms:'Core · Erectores', z:'corporal', t:'a', enf:'core', ev:[],
   alt:{core:['dead_bug','plancha']}, aka:['bird dog']},
  {id:'pallof', nm:'Press Pallof', ms:'Core antirrotación', z:'polea', t:'a', enf:'core', ev:[],
   alt:{core:['plancha_lateral','dead_bug']}, aka:[]},
  {id:'crunch_polea', nm:'Crunch en polea', ms:'Recto abdominal', z:'polea', t:'a', enf:'abdomen', ev:['cuello'],
   alt:{abdomen:['elev_piernas','rueda','crunch_maquina']}, aka:['crunch con cable','crunch en polea alta']},
  {id:'crunch_maquina', nm:'Crunch en máquina', ms:'Recto abdominal', z:'maquina', t:'a', enf:'abdomen', ev:[],
   alt:{abdomen:['crunch_polea','elev_piernas']}, aka:[]},
  {id:'elev_piernas', nm:'Elevación de piernas colgado', ms:'Abdomen inferior', z:'funcional', t:'a', enf:'abdomen', ev:['lumbar'],
   alt:{abdomen:['crunch_polea','dead_bug']}, aka:['elevaciones de piernas']},
  {id:'rueda', nm:'Rueda abdominal', ms:'Core anterior', z:'corporal', t:'a', enf:'abdomen', ev:['lumbar','hombro'],
   alt:{abdomen:['plancha','crunch_polea']}, aka:['ab wheel']},
  {id:'farmer', nm:'Farmer walk', ms:'Core · Agarre · Trapecio', z:'mancuernas', t:'c', enf:'core', ev:[],
   alt:{core:['farmer_unilateral','plancha']}, aka:['caminata del granjero']},
  {id:'farmer_unilateral', nm:'Caminata con peso unilateral', ms:'Oblicuos · Core', z:'mancuernas', t:'c', enf:'core', ev:[],
   alt:{core:['plancha_lateral','pallof']}, aka:['suitcase carry']},

  // ── CARDIO / METABÓLICO ──
  {id:'caminadora_incl', nm:'Caminata inclinada', ms:'Cardiovascular', z:'cardio', t:'c', enf:'cardio', ev:[],
   alt:{cardio:['eliptica','bici','remo_erg']}, aka:['caminata inclinada / eliptica','caminadora']},
  {id:'eliptica', nm:'Elíptica', ms:'Cardiovascular', z:'cardio', t:'c', enf:'cardio', ev:[],
   alt:{cardio:['bici','caminadora_incl']}, aka:['eliptica']},
  {id:'bici', nm:'Bicicleta estática', ms:'Cardiovascular', z:'cardio', t:'c', enf:'cardio', ev:[],
   alt:{cardio:['eliptica','remo_erg']}, aka:['bicicleta','spinning']},
  {id:'remo_erg', nm:'Remo ergómetro', ms:'Cardiovascular · Espalda', z:'cardio', t:'c', enf:'cardio', ev:['lumbar'],
   alt:{cardio:['bici','eliptica']}, aka:['remo ergometro','rower']},
  {id:'kb_swing', nm:'Swing con kettlebell', ms:'Glúteo · Cadena posterior', z:'funcional', t:'c', enf:'gluteo', ev:['lumbar'],
   alt:{gluteo:['hip_thrust','puente'], cardio:['bici']}, aka:['kettlebell swing']},
];

/* Utilidades de catálogo (sin dependencias) */
function kbNorm(t){ return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\(.*?\)/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(); }
const KB_IDX = {};
KB_EJERCICIOS.forEach(e=>{ KB_IDX[e.id]=e; });
function kbBuscar(nombre){
  const n=kbNorm(nombre); if(!n) return null;
  let m=KB_EJERCICIOS.find(e=>kbNorm(e.nm)===n || (e.aka||[]).some(a=>kbNorm(a)===n));
  if(m) return m;
  // coincidencia parcial: el nombre contiene el del catálogo (el más largo gana)
  const cands=KB_EJERCICIOS.flatMap(e=>[e.nm,...(e.aka||[])].map(x=>({e,k:kbNorm(x)})))
    .filter(o=>o.k.length>4 && (n.includes(o.k)||o.k.includes(n))).sort((a,b)=>b.k.length-a.k.length);
  return cands.length?cands[0].e:null;
}
const KB_ENFOQUES = {cuadriceps:'Cuádriceps',gluteo:'Glúteo',femoral:'Femorales',pantorrilla:'Pantorrilla',pecho:'Pecho',pecho_sup:'Pecho superior',
  dorsal:'Dorsal',espalda_media:'Espalda media',deltoide:'Hombro (frontal)',deltoide_lat:'Hombro lateral',deltoide_post:'Hombro posterior',
  manguito:'Manguito rotador',trapecio:'Trapecio',biceps:'Bíceps',braquial:'Braquial',triceps:'Tríceps',core:'Core',abdomen:'Abdomen',cardio:'Cardio'};
