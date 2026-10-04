/* ═══ Rutinas en casa · catálogo ═══
   Fitness System Pro · módulo cargado por index.html después de 29-privacidad.js (script clásico: ámbito global).
   Repertorio de ejercicios para entrenar en casa. Es APARTE de KB_EJERCICIOS para que las rutinas de gimnasio
   no cambien: ningún ejercicio de aquí aparece en una rutina de gimnasio. kbBuscar() sí los reconoce, así que la
   ficha del ejercicio, la foto, el tip y el registro de sesión funcionan igual que con los del gimnasio.
   Para agregar uno basta con sumar una línea H(...) abajo. ═══ */

/* ── Equipo que el entrenador puede marcar como disponible en casa ──
   (peso corporal, pared, piso y tapete se dan por hechos: no se preguntan) */
const CASA_EQUIPO = {
  silla:      {nm:'Silla firme o sillón',            ic:'🪑'},
  escalon:    {nm:'Escalón, banco o cajón bajo',     ic:'🪜'},
  toalla:     {nm:'Toalla o paño (para deslizar)',   ic:'🧺'},
  mochila:    {nm:'Mochila con peso o garrafón',     ic:'🎒'},
  mancuernas: {nm:'Mancuernas',                      ic:'🏋️'},
  ligas:      {nm:'Ligas o bandas elásticas',        ic:'➰'},
  kettlebell: {nm:'Kettlebell (pesa rusa)',          ic:'🔔'},
  barra_dom:  {nm:'Barra de dominadas',              ic:'🤸'},
  trx:        {nm:'TRX o cintas de suspensión',      ic:'⛓️'},
  cuerda:     {nm:'Cuerda para saltar',              ic:'🪢'},
  pelota:     {nm:'Pelota de pilates (fitball)',     ic:'⚽'},
};
/* Paquetes rápidos para el entrenador */
const CASA_PAQUETES = {
  nada:   {nm:'Solo peso corporal',        eq:[]},
  basico: {nm:'Básico (silla, mochila, toalla)', eq:['silla','mochila','toalla']},
  ligas:  {nm:'Ligas y mancuernas',        eq:['silla','ligas','mancuernas']},
  casa_gym:{nm:'Mini gimnasio en casa',    eq:['silla','escalon','mancuernas','ligas','kettlebell','barra_dom','cuerda','toalla']},
};

const KB_CASA = [];
const KB_CASA_IDX = {};
/* H(id, nombre, músculos, enfoque, tipo c|a, equipo[], tip, extras)
   extras: ev (lesiones donde evitarlo) · nv (nivel mínimo 1-3) · iso+tt (isométrico, segundos por nivel) · lado
           rondas+rx (rondas con FC) · aka (otros nombres) · imp (impacto: true si salta)                      */
function H(id,nm,ms,enf,t,eq,tip,x){
  x=x||{};
  const z = eq.includes('trx')?'trx' : eq.includes('ligas')?'liga' : eq.includes('mancuernas')?'mancuernas'
          : eq.some(q=>['kettlebell','silla','escalon','mochila','toalla','barra_dom','pelota'].includes(q))?'funcional' : 'corporal';
  const o={id:'h_'+id, nm, ms, z, t, enf, ev:x.ev||[], eq, tip, aka:x.aka||[], casa:true, nv:x.nv||1};
  if(x.iso){ o.iso=true; o.tt=x.tt||[20,30,45]; }
  if(x.lado) o.lado=true;
  if(x.rondas){ o.rondas=true; o.rx=x.rx||{u:'seg',v:[30,40,50]}; }
  if(x.imp) o.imp=true;
  if(x.cont) o.cont=true;           // cardio continuo (minutos fijos + FC objetivo)
  o.alt={}; // las alternativas se calculan al generar (mismo enfoque + equipo disponible)
  KB_CASA.push(o); KB_CASA_IDX[o.id]=o; return o;
}

/* ── Ejercicios del gimnasio que también sirven en casa (con el equipo que piden) ── */
const CASA_REUSO = {
  // peso corporal / pared / piso
  sissy:[], isom_cuad:[], sentadilla_pared:[], puente:[], lagartija:[], lagartija_diamante:[], lagartija_isom:[], pecho_iso_palmas:[],
  plancha:[], plancha_lateral:[], plancha_alta:[], plancha_lateral_elev:[], plancha_toque:[], dead_bug:[], bird_dog:[], hollow:[],
  superman:[], superman_isom:[], crunch:[], crunch_bicicleta:[], tijeras_abd:[], escaladores:[], burpee:[], jumping_jacks:[],
  sentadilla_salto:[], split_isom:[], puente_isom:[], puente_fem_isom:[], pantorrilla_iso:[],
  // con silla / escalón / pelota / cuerda
  lagartija_inclinada:['silla'], lagartija_declinada:['silla'], fondos_banco:['silla'], elev_rodillas_banco:['silla'],
  pantorrilla_escalon:['escalon'], step_up:['escalon'], curl_fem_fitball:['pelota'], cuerda_salto:['cuerda'],
  // ligas
  sentadilla_liga:['ligas'], ext_rodilla_liga:['ligas'], puente_liga:['ligas'], patada_liga:['ligas'], clamshell:['ligas'], curl_fem_liga:['ligas'],
  pantorrilla_liga:['ligas'], lagartija_liga:['ligas'], press_liga:['ligas'], aperturas_liga:['ligas'], jalon_liga:['ligas'], remo_liga:['ligas'],
  face_pull_liga:['ligas'], elev_lateral_liga:['ligas'], rot_int_liga:['ligas'], curl_liga:['ligas'], ext_triceps_liga:['ligas'],
  pallof_liga:['ligas'], woodchop_liga:['ligas'], monster_walk:['ligas'], banda_rotacion:['ligas'],
  // mancuernas
  goblet:['mancuernas'], desplante:['mancuernas'], bulgara:['mancuernas','silla'], pm_rumano_mancuerna:['mancuernas'], remo_mancuerna:['mancuernas','silla'],
  press_hombro_mancuerna:['mancuernas'], laterales:['mancuernas'], frontal_ligera:['mancuernas'], pajaro:['mancuernas'], encogimientos:['mancuernas'],
  curl_mancuerna:['mancuernas'], curl_martillo:['mancuernas'], ext_triceps_mancuerna:['mancuernas'], farmer:['mancuernas'], farmer_unilateral:['mancuernas'],
  zancada_reversa:['mancuernas'], sentadilla_isom_goblet:['mancuernas'], sumo_mancuerna:['mancuernas'], desplante_lateral:['mancuernas'],
  pm_unilateral:['mancuernas'], pm_rigido_mancuerna:['mancuernas'], pantorrilla_mancuerna:['mancuernas'], press_suelo:['mancuernas'],
  remo_menton:['mancuernas'], rot_ext_mancuerna:['mancuernas'], curl_concentrado:['mancuernas','silla'], patada_triceps:['mancuernas'],
  frances_mancuerna:['mancuernas'], pullover_mancuerna:['mancuernas'], curl_isom:['mancuernas'], hombro_iso_lateral:['mancuernas'],
  // kettlebell, barra, TRX
  kb_swing:['kettlebell'], dominadas:['barra_dom'], dominada_neutra:['barra_dom'], dominada_negativa:['barra_dom'], dominada_isom:['barra_dom'],
  elev_piernas:['barra_dom'], l_sit:['silla'],
  sentadilla_trx:['trx'], pistol_trx:['trx'], zancada_trx:['trx'], curl_fem_trx:['trx'], lagartija_trx:['trx'], aperturas_trx:['trx'],
  pajaro_trx:['trx'], curl_trx:['trx'], ext_triceps_trx:['trx'], plancha_trx:['trx'], plancha_lateral_trx:['trx'], rodillas_trx:['trx'],
  rollout_trx:['trx'], remo_trx:['trx'],
};

/* ═══════════ CATÁLOGO NUEVO ═══════════ */
// ── CUÁDRICEPS · PIERNA ──
H('sentadilla_peso','Sentadilla con peso corporal','Cuádriceps · Glúteo','cuadriceps','c',[],'Pies al ancho de hombros, pecho arriba; baja sintiendo el muslo y empuja el piso con todo el pie al subir.',{ev:['rodilla'],aka:['sentadilla libre en casa','air squat']});
H('sentadilla_silla','Sentadilla a la silla','Cuádriceps · Glúteo','cuadriceps','c',['silla'],'Siéntate hacia atrás rozando la silla sin soltar la tensión; sube empujando el piso, sin impulso con las manos.',{aka:['sit to stand']});
H('sentadilla_mochila','Sentadilla con mochila al pecho','Cuádriceps · Glúteo','cuadriceps','c',['mochila'],'Abraza la mochila al pecho; el peso al frente mantiene el torso erguido y el muslo trabajando.',{ev:['rodilla'],nv:2});
H('sentadilla_pausa','Sentadilla con pausa abajo','Cuádriceps · Glúteo','cuadriceps','c',[],'Baja controlado y aguanta 2-3 segundos abajo sin relajar; sube con fuerza sintiendo el muslo.',{ev:['rodilla'],nv:2});
H('sentadilla_sumo_peso','Sentadilla sumo','Glúteo · Aductores','gluteo','c',[],'Pies abiertos y puntas hacia afuera; baja entre las piernas sintiendo glúteo y parte interna del muslo.',{ev:['rodilla']});
H('sentadilla_cossack','Sentadilla cosaca','Aductores · Glúteo · Cuádriceps','gluteo','c',[],'Baja hacia un lado con la otra pierna estirada y el pie plano; siente la ingle y el glúteo de la pierna que flexiona.',{ev:['rodilla','cadera'],nv:3,lado:true});
H('desplante_peso','Desplante hacia atrás','Cuádriceps · Glúteo','cuadriceps','c',[],'Da el paso atrás y baja recto; el peso va en el talón de adelante y el glúteo cierra el movimiento.',{ev:['rodilla'],lado:true,aka:['zancada atrás sin peso']});
H('desplante_caminando','Zancadas caminando','Cuádriceps · Glúteo','cuadriceps','c',[],'Pasos largos con el torso erguido; baja sintiendo el glúteo de la pierna de adelante.',{ev:['rodilla'],nv:2});
H('desplante_lateral_peso','Zancada lateral en casa','Glúteo · Aductores','gluteo','c',[],'Da un paso largo al lado y siéntate sobre esa pierna manteniendo la otra estirada; empuja para regresar.',{ev:['rodilla','cadera'],lado:true});
H('bulgara_silla','Sentadilla búlgara con apoyo en silla','Cuádriceps · Glúteo','cuadriceps','c',['silla'],'Pie de atrás apoyado en la silla; baja recto con el peso en el talón de adelante.',{ev:['rodilla'],nv:2,lado:true,aka:['búlgara en casa']});
H('bulgara_mochila','Sentadilla búlgara con mochila','Cuádriceps · Glúteo','cuadriceps','c',['silla','mochila'],'Mochila al pecho y pie atrás sobre la silla; torso firme y control en la bajada.',{ev:['rodilla'],nv:3,lado:true});
H('step_up_silla','Subida a la silla','Glúteo · Cuádriceps','gluteo','c',['silla'],'Pisa toda la planta sobre la silla firme y empuja con el talón; baja lento sin dejarte caer.',{ev:['rodilla'],lado:true,aka:['step-up en casa']});
H('step_up_mochila','Subida al escalón con mochila','Glúteo · Cuádriceps','gluteo','c',['escalon','mochila'],'Mochila al pecho; empuja con el talón de la pierna de arriba y sube sin impulso del pie de abajo.',{ev:['rodilla'],nv:2,lado:true});
H('bajada_escalon','Bajada lenta desde el escalón','Cuádriceps','cuadriceps','a',['escalon'],'Baja el talón al piso en 4 segundos controlando con el muslo; sube con ayuda de la otra pierna.',{ev:[],lado:true,nv:1});
H('sentadilla_1pierna_silla','Sentadilla a una pierna a la silla','Cuádriceps · Glúteo','cuadriceps','c',['silla'],'Siéntate sobre una pierna hacia la silla y levántate sin impulso; la otra pierna va adelante.',{ev:['rodilla'],nv:3,lado:true,aka:['pistol a la silla']});
H('sentadilla_toalla','Desplante deslizado con toalla','Glúteo · Cuádriceps','gluteo','c',['toalla'],'Pie de atrás sobre la toalla en piso liso; desliza hacia atrás y regresa con el glúteo de la pierna de adelante.',{ev:['rodilla'],nv:2,lado:true});
H('salto_pared_isom','Sentadilla en pared con mochila','Cuádriceps','cuadriceps','a',['mochila'],'Espalda pegada a la pared, muslos paralelos al piso y la mochila sobre las piernas; aguanta sin apoyar las manos.',{iso:true,tt:[20,30,45],ev:['rodilla']});
H('talones_pared','Elevación de talones','Pantorrillas','pantorrilla','a',[],'Sube lo más alto que puedas, pausa 1 segundo arriba y baja lento sintiendo el gemelo estirarse.',{aka:['pantorrillas de pie']});
H('talones_unilateral','Elevación de talones a una pierna','Pantorrillas','pantorrilla','a',[],'Apoya una mano en la pared solo para equilibrio; rango completo y pausa arriba.',{nv:2,lado:true});
H('talones_mochila','Elevación de talones con mochila','Pantorrillas','pantorrilla','a',['mochila'],'Mochila al pecho; sube en punta de pies con pausa arriba y baja en 3 segundos.',{nv:2});
H('talones_sentado','Elevación de talones sentado','Pantorrillas (sóleo)','pantorrilla','a',['silla','mochila'],'Sentado con la mochila sobre los muslos; sube los talones despacio y siente la parte baja de la pantorrilla.',{});
H('pantorrilla_caminata','Caminata en puntas','Pantorrillas','pantorrilla','a',[],'Camina sobre la punta de los pies, talones lo más altos posible, tobillos firmes.',{});
// ── GLÚTEO · FEMORAL ──
H('puente_unilateral','Puente de glúteo a una pierna','Glúteo','gluteo','a',[],'Aprieta el glúteo arriba 2 segundos; evita que la cadera rote hacia un lado.',{nv:2,lado:true});
H('puente_pies_silla','Puente de glúteo con pies en la silla','Glúteo · Femorales','gluteo','a',['silla'],'Talones sobre la silla; sube la cadera apretando glúteo y siente el trasero del muslo trabajar.',{nv:2});
H('hip_thrust_silla','Hip thrust con espalda en la silla','Glúteo mayor','gluteo','c',['silla'],'Omóplatos apoyados en el borde de la silla; sube la cadera hasta alinear tronco y muslos apretando el glúteo.',{aka:['hip thrust en casa']});
H('hip_thrust_mochila','Hip thrust con mochila','Glúteo mayor','gluteo','c',['silla','mochila'],'Mochila sobre la cadera; sube con fuerza apretando glúteo 2 segundos y baja controlado.',{nv:2});
H('hip_thrust_unilateral','Hip thrust unilateral en silla','Glúteo mayor','gluteo','c',['silla'],'Una pierna extendida al frente; empuja con el talón de la otra y mantén la pelvis nivelada.',{nv:3,lado:true});
H('puente_marcha','Puente con marcha','Glúteo · Core','gluteo','a',[],'Cadera arriba y alterna levantar un pie del piso sin que la pelvis se mueva.',{nv:2});
H('patada_cuadrupedia','Patada de glúteo en cuatro apoyos','Glúteo mayor','gluteo','a',[],'Empuja el talón al techo con la rodilla a 90° sin arquear la espalda baja; aprieta arriba.',{lado:true});
H('patada_cuadrupedia_liga','Patada de glúteo con liga','Glúteo mayor','gluteo','a',['ligas'],'Liga en los pies; extiende la pierna hacia atrás y arriba sintiendo el glúteo vencer la banda.',{nv:2,lado:true});
H('hidrante','Hidrante (círculo de cadera)','Glúteo medio','gluteo','a',[],'En cuatro apoyos, abre la rodilla al costado sin girar la pelvis; aprieta el glúteo del lado que trabaja.',{lado:true});
H('hidrante_liga','Hidrante con liga','Glúteo medio','gluteo','a',['ligas'],'Liga sobre las rodillas; abre la pierna contra la banda y regresa lento.',{nv:2,lado:true});
H('abduccion_lateral','Elevación lateral de pierna acostado','Glúteo medio','gluteo','a',[],'Acostado de lado con el cuerpo en línea; sube la pierna sin rotar la cadera hacia atrás.',{lado:true});
H('caminata_lateral_liga','Caminata lateral con liga','Glúteo medio','gluteo','a',['ligas'],'Liga sobre las rodillas o tobillos; pasos laterales cortos con tensión constante y rodillas hacia afuera.',{});
H('buenos_dias_peso','Buenos días con peso corporal','Femorales · Glúteo','femoral','a',[],'Manos en la nuca; lleva la cadera atrás con rodillas suaves y espalda larga hasta sentir el femoral estirarse.',{ev:['lumbar']});
H('pm_mochila','Peso muerto rumano con mochila','Femorales · Glúteo','femoral','c',['mochila'],'Mochila pegada al cuerpo; cadera atrás con espalda neutra y sube apretando el glúteo.',{ev:['lumbar'],nv:2});
H('pm_1pierna','Peso muerto a una pierna','Femorales · Glúteo','femoral','c',[],'Inclina el torso llevando la otra pierna atrás como una palanca; cadera cuadrada y espalda larga.',{ev:['lumbar'],nv:2,lado:true,aka:['bisagra a una pierna']});
H('pm_kettlebell','Peso muerto con kettlebell','Femorales · Glúteo','femoral','c',['kettlebell'],'Kettlebell entre los pies; bisagra de cadera con espalda neutra y sube empujando el piso.',{ev:['lumbar'],nv:2});
H('buenos_dias_ligas','Bisagra de cadera con liga','Femorales · Glúteo','femoral','c',['ligas'],'Pisa la liga y sujétala; lleva la cadera atrás y sube apretando el glúteo vencer la banda.',{ev:['lumbar']});
H('curl_fem_toalla','Curl de femoral con toalla','Femorales','femoral','a',['toalla'],'Acostado, talones sobre la toalla en piso liso; sube la cadera y jala los talones hacia ti, regresa en 3 segundos.',{nv:2,aka:['curl femoral deslizando']});
H('curl_fem_silla','Curl de femoral con silla','Femorales','femoral','a',['silla'],'Talones sobre la silla; sube la cadera y flexiona rodillas llevando los talones hacia el glúteo.',{nv:2});
H('puente_toalla_unilateral','Puente deslizado a una pierna','Femorales · Glúteo','femoral','a',['toalla'],'Un talón sobre la toalla; extiende y regresa la pierna sin bajar la cadera.',{nv:3,lado:true});
H('swing_mochila','Balanceo de cadera con mochila','Glúteo · Femorales','gluteo','c',['mochila'],'Mochila sujeta con ambas manos; empuja la cadera adelante apretando el glúteo, sin levantarla con los brazos.',{ev:['lumbar'],nv:2});
H('swing_kb2','Swing con kettlebell a una mano','Glúteo · Femorales','gluteo','c',['kettlebell'],'Un solo brazo; la fuerza nace de la cadera y el brazo solo guía. Core firme al final.',{ev:['lumbar'],nv:3,lado:true});
H('goblet_kb','Sentadilla goblet con kettlebell','Cuádriceps · Glúteo','cuadriceps','c',['kettlebell'],'Kettlebell al pecho con los codos hacia adentro; baja entre las rodillas y sube empujando el piso.',{ev:['rodilla']});
// ── PECHO · TRÍCEPS ──
H('lagartija_rodillas','Lagartija con rodillas apoyadas','Pecho · Tríceps','pecho','c',[],'Cuerpo en línea desde rodillas a cabeza; baja el pecho entre las manos con codos a 45°.',{ev:['hombro'],aka:['push up en rodillas']});
H('lagartija_pared','Lagartija en pared','Pecho · Tríceps','pecho','c',[],'Manos en la pared a la altura del pecho; cuerpo recto y baja controlando con el pecho.',{});
H('lagartija_lenta','Lagartija con bajada lenta','Pecho · Tríceps','pecho','c',[],'Baja en 4 segundos sin perder la línea del cuerpo y sube con fuerza.',{ev:['hombro'],nv:2});
H('lagartija_pausa','Lagartija con pausa abajo','Pecho · Tríceps','pecho','c',[],'Aguanta 2 segundos con el pecho cerca del piso; sube sin rebotar.',{nv:2,ev:['hombro']});
H('lagartija_archer','Lagartija arquero','Pecho · Tríceps','pecho','c',[],'Una mano hace casi todo el trabajo mientras el otro brazo se estira al lado.',{nv:3,ev:['hombro']});
H('lagartija_pies_elevados','Lagartija con pies elevados','Pecho superior · Hombro','pecho_sup','c',['silla'],'Pies sobre la silla; baja con codos a 45° sintiendo la parte alta del pecho.',{nv:2,ev:['hombro'],aka:['lagartija declinada en casa']});
H('lagartija_asimetrica','Lagartija con una mano elevada','Pecho · Core','pecho','c',['mochila'],'Una mano sobre la mochila y otra en el piso; alterna lados entre series.',{nv:3,ev:['hombro'],lado:true});
H('lagartija_toalla','Aperturas deslizadas con toalla','Pecho','pecho','a',['toalla'],'En posición de lagartija con las manos sobre toallas en piso liso; abre y cierra los brazos con control.',{nv:3,ev:['hombro']});
H('press_suelo_mochila','Press de pecho en el piso con mochilas','Pecho · Tríceps','pecho','c',['mochila'],'Acostado, empuja la mochila hacia el techo sintiendo el pecho; baja hasta que los codos toquen el piso.',{ev:['hombro'],nv:1});
H('aperturas_suelo_mochila','Aperturas en el piso con mochila','Pecho','pecho','a',['mochila'],'Brazos casi rectos y codos suaves; abre y cierra como un abrazo sintiendo el pecho.',{nv:2,ev:['hombro']});
H('aperturas_suelo','Aperturas en el piso con mancuernas','Pecho','pecho','a',['mancuernas'],'Codos semiflexionados; baja hasta tocar el piso con los codos y cierra apretando el pecho.',{nv:1,ev:['hombro']});
H('press_inclinado_silla','Lagartija inclinada en el borde de la silla','Pecho','pecho','c',['silla'],'Manos en el asiento firme y cuerpo recto; baja el pecho al borde y sube empujando.',{ev:['hombro'],aka:['lagartija con manos elevadas']});
H('press_cerrado_suelo','Press cerrado en el piso con mancuernas','Tríceps · Pecho','triceps','c',['mancuernas'],'Mancuernas juntas, codos pegados al cuerpo; empuja al techo sintiendo el tríceps.',{ev:['hombro']});
H('fondos_silla_rodillas','Fondos en silla con rodillas dobladas','Tríceps','triceps','a',['silla'],'Rodillas a 90° y codos hacia atrás; baja hasta sentir el estiramiento del tríceps y sube sin encoger los hombros.',{ev:['hombro'],nv:1});
H('ext_triceps_peso','Extensión de tríceps en el piso con peso corporal','Tríceps','triceps','a',[],'Manos sobre el piso o una silla; baja la frente hacia las manos y sube extendiendo los codos.',{ev:['hombro'],nv:3,aka:['skull crusher corporal']});
H('ext_triceps_mochila','Extensión de tríceps con mochila','Tríceps','triceps','a',['mochila'],'Mochila sujeta con ambas manos detrás de la cabeza; codos fijos al techo y extiende por completo.',{nv:1});
H('lagartija_triceps','Lagartija con codos pegados','Tríceps · Pecho','triceps','c',[],'Manos bajo los hombros y codos rozando las costillas; sube sintiendo el tríceps.',{ev:['hombro'],nv:2});
H('press_tripode_liga','Press de pecho con liga a la espalda','Pecho · Tríceps','pecho','c',['ligas'],'Liga cruzada por la espalda; empuja hacia adelante sin encoger los hombros.',{ev:['hombro'],nv:1});
// ── ESPALDA · BÍCEPS ──
H('remo_mochila','Remo inclinado con mochila','Dorsal · Espalda media','espalda_media','c',['mochila'],'Torso a 45° y espalda larga; lleva los codos hacia las caderas y junta las escápulas.',{ev:['lumbar'],nv:1});
H('remo_toalla','Remo en puerta con toalla','Dorsal · Espalda media','espalda_media','c',['toalla'],'Toalla amarrada a una manija firme; inclínate hacia atrás y jala los codos a las costillas. Verifica que el anclaje sea seguro.',{nv:2});
H('remo_mesa','Remo invertido bajo una mesa firme','Dorsal · Espalda media','espalda_media','c',[],'Acostado bajo una mesa pesada y estable; jala el pecho hacia el borde con el cuerpo recto. Confirma que la mesa no se mueva.',{nv:3,aka:['remo australiano']});
H('remo_unilateral_silla','Remo a una mano apoyado en la silla','Dorsal · Espalda media','espalda_media','c',['mancuernas','silla'],'Mano libre apoyada en la silla; lleva el codo a la cadera sintiendo el dorsal.',{ev:['lumbar'],lado:true});
H('remo_toalla_piso','Remo deslizado en el piso con toalla','Dorsal · Espalda media','dorsal','a',['toalla'],'Boca abajo con las manos sobre toallas; desliza los codos hacia las costillas arrastrando el cuerpo.',{nv:2});
H('jalon_toalla_pie','Jalón con toalla en puerta','Dorsal','dorsal','c',['toalla'],'Toalla amarrada arriba de una puerta cerrada y firme; jala hacia abajo llevando los codos a las costillas.',{nv:2});
H('pullover_mochila','Pullover con mochila','Dorsal · Pecho','dorsal','a',['mochila'],'Acostado, lleva la mochila detrás de la cabeza con brazos casi rectos y regresa sintiendo el dorsal.',{ev:['hombro'],nv:2});
H('remo_kb','Remo con kettlebell','Dorsal · Espalda media','espalda_media','c',['kettlebell'],'Bisagra de cadera, kettlebell colgando; jala el codo hacia la cadera sin girar el torso.',{ev:['lumbar'],lado:true});
H('superman_alterno','Superman alterno','Erectores · Glúteo','espalda_media','a',[],'Boca abajo, levanta brazo y pierna contrarios sin arquear la zona lumbar; mirada al piso.',{});
H('y_t_w','Elevaciones Y-T-W boca abajo','Espalda alta · Hombro posterior','deltoide_post','a',[],'Boca abajo, forma Y, T y W con los brazos subiendo desde la espalda alta, no desde el cuello.',{nv:1});
H('pajaro_mochila','Pájaro con mochila','Hombro posterior','deltoide_post','a',['mochila'],'Inclinado al frente y espalda larga; abre los brazos como alas llevando los codos atrás.',{ev:['lumbar'],nv:1});
H('face_pull_toalla','Jalón a la cara con toalla','Hombro posterior · Trapecio','deltoide_post','a',['toalla'],'Toalla firme en una manija; jala hacia la frente abriendo los codos, sin encoger los hombros.',{});
H('dominada_supina_liga','Dominada con liga de asistencia','Dorsal · Bíceps','dorsal','c',['barra_dom','ligas'],'La liga ayuda en el fondo del movimiento; sube el pecho a la barra con los codos hacia las costillas.',{nv:2});
H('colgarse','Colgado activo en barra','Dorsal · Agarre','dorsal','a',['barra_dom'],'Cuélgate con hombros hacia abajo y lejos de las orejas; aprieta suave el dorsal.',{iso:true,tt:[20,30,45]});
H('curl_mochila','Curl de bíceps con mochila','Bíceps','biceps','a',['mochila'],'Sujeta la mochila por el asa con ambas manos; codos pegados y sube controlado.',{nv:1});
H('curl_toalla','Curl isométrico con toalla','Bíceps','biceps','a',['toalla'],'Pisa la toalla y jala hacia arriba con las manos tensándola; la resistencia la pones tú.',{iso:true,tt:[10,15,20]});
H('curl_isometrico_mochila','Curl con pausa en 90°','Bíceps','biceps','a',['mochila'],'Sube hasta 90° y aguanta; baja lento sintiendo el bíceps trabajar todo el recorrido.',{nv:2});
H('curl_martillo_mochila','Curl martillo con garrafón o mochila','Braquial','braquial','a',['mochila'],'Agarre neutro y codos fijos; sube sintiendo el costado externo del brazo.',{});
H('curl_kb','Curl con kettlebell','Bíceps','biceps','a',['kettlebell'],'Sujeta el cuerpo de la kettlebell con ambas manos y sube con los codos pegados.',{nv:1});
H('curl_ligas_pisando','Curl con liga pisada','Bíceps','biceps','a',['ligas'],'Pisa la liga y sube con los codos al costado; sostén 1 segundo arriba.',{});
// ── REFUERZO: zonas con pocas opciones (pecho superior, trapecio, braquial) ──
H('press_inclinado_liga','Press inclinado con liga','Pecho superior · Hombro','pecho_sup','c',['ligas'],'Liga cruzada por la espalda; empuja hacia arriba y adelante sintiendo la parte alta del pecho.',{ev:['hombro']});
H('lagartija_pies_pared','Lagartija con pies en la pared','Pecho superior · Hombro','pecho_sup','c',[],'Pies apoyados en la pared a la altura de la cadera; baja el pecho controlando y sube sin arquear.',{ev:['hombro'],nv:2});
H('aperturas_bajo_alto_liga','Aperturas de abajo hacia arriba con liga','Pecho superior','pecho_sup','a',['ligas'],'Liga pisada; lleva las manos hacia arriba al frente de la cara como un abrazo, sintiendo el pecho alto.',{ev:['hombro']});
H('encogimiento_liga','Encogimientos con liga pisada','Trapecio','trapecio','a',['ligas'],'Pisa la liga; sube los hombros hacia las orejas sin rotar y pausa arriba.',{ev:['cuello']});
H('remo_menton_liga','Remo al mentón con liga','Trapecio · Hombro lateral','trapecio','a',['ligas'],'Pisa la liga y sube las manos hasta el pecho con los codos más altos que las muñecas; sin llegar al cuello.',{ev:['hombro']});
H('curl_martillo_liga','Curl martillo con liga','Braquial','braquial','a',['ligas'],'Pisa la liga con agarre neutro; sube con los codos fijos sintiendo el costado externo del brazo.',{});
H('curl_inverso_mochila','Curl inverso con mochila','Braquial · Antebrazo','braquial','a',['mochila'],'Agarre por encima; sube lento con los codos fijos y baja en 3 segundos.',{nv:2});
// ── HOMBRO ──
H('pike','Lagartija en V (pike)','Hombro · Tríceps','deltoide','c',[],'Cadera alta formando una V; baja la cabeza entre las manos y empuja sintiendo el hombro.',{ev:['hombro'],nv:2});
H('pike_elevado','Pike con pies elevados','Hombro · Tríceps','deltoide','c',['silla'],'Pies sobre la silla y cadera alta; baja la cabeza entre las manos y sube empujando.',{ev:['hombro'],nv:3});
H('press_hombro_mochila','Press de hombro con mochila','Hombro · Tríceps','deltoide','c',['mochila'],'Mochila al frente a la altura de los hombros; empuja arriba sin arquear la espalda baja.',{ev:['hombro'],nv:1});
H('press_hombro_kb','Press de hombro con kettlebell','Hombro · Tríceps','deltoide','c',['kettlebell'],'Kettlebell en posición rack; empuja arriba cerrando el glúteo y el abdomen para no arquear.',{ev:['hombro'],nv:2,lado:true});
H('press_hombro_liga','Press de hombro con liga pisada','Hombro · Tríceps','deltoide','c',['ligas'],'Pisa la liga y empuja arriba; la resistencia crece al subir.',{ev:['hombro']});
H('laterales_mochila','Elevaciones laterales con botellas o garrafones','Hombro lateral','deltoide_lat','a',['mochila'],'Codos ligeramente flexionados; sube hasta la altura del hombro sintiendo el costado.',{nv:1,aka:['laterales con botellas']});
H('frontal_toalla','Elevación frontal con toalla tensa','Hombro frontal','deltoide','a',['toalla'],'Toalla tensa entre las manos; sube los brazos al frente sin encoger el cuello.',{});
H('laterales_isom_pared','Elevación lateral isométrica contra pared','Hombro lateral','deltoide_lat','a',[],'De lado a la pared, empuja el dorso de la mano contra ella y mantén la tensión.',{iso:true,tt:[15,25,35],lado:true});
H('circulos_brazos','Círculos de brazos con control','Hombro · Manguito','manguito','a',[],'Brazos extendidos haciendo círculos pequeños; mantén los hombros bajos y el abdomen firme.',{nv:1});
H('rot_ext_toalla','Rotación externa con toalla','Manguito rotador','manguito','a',['toalla'],'Codo pegado al costado y toalla tensa entre las manos; abre el antebrazo hacia afuera.',{});
H('rot_ext_ligas','Rotación externa con liga','Manguito rotador','manguito','a',['ligas'],'Codo pegado al costado con una toalla enrollada; rota el antebrazo hacia afuera lento.',{});
H('encogimiento_mochila','Encogimientos con mochila','Trapecio','trapecio','a',['mochila'],'Hombros hacia las orejas sin rotar; pausa 1 segundo arriba.',{ev:['cuello']});
H('wall_slide','Deslizamiento en pared','Hombro · Espalda alta','manguito','a',[],'Espalda y antebrazos pegados a la pared; sube y baja los brazos sin despegar nada.',{nv:1});
// ── CORE · ABDOMEN ──
H('plancha_rodillas','Plancha con rodillas apoyadas','Core','core','a',[],'Cuerpo en línea de rodillas a cabeza; abdomen firme abrazando la columna.',{iso:true,tt:[20,30,40]});
H('plancha_antebrazos','Plancha en antebrazos','Core','core','a',[],'Codos bajo los hombros y glúteo apretado; no dejes caer la cadera.',{iso:true,tt:[20,30,45],aka:['plancha frontal en casa']});
H('plancha_toalla','Plancha con deslizamiento de toalla','Core','core','a',['toalla'],'Pies sobre la toalla en piso liso; desliza los pies hacia atrás y adelante sin mover la cadera.',{nv:3});
H('plancha_mochila','Plancha con mochila en la espalda','Core','core','a',['mochila'],'Mochila entre los omóplatos; mantén la línea y la respiración continua.',{iso:true,tt:[20,30,45],nv:2});
H('plancha_hombro','Plancha con toque al hombro contrario','Core · Hombro','core','a',[],'Toca el hombro contrario sin que la cadera se balancee.',{nv:2});
H('plancha_silla','Plancha inclinada en la silla','Core','core','a',['silla'],'Manos sobre el asiento firme; una opción más ligera con el cuerpo en línea.',{iso:true,tt:[20,30,40]});
H('pallof_mochila','Press anti-rotación con liga','Core antirrotación','core','a',['ligas'],'Liga firme a un costado; empuja al frente y resiste el giro con el abdomen.',{nv:1});
H('caminata_maleta','Caminata de maleta','Core · Oblicuos','core','c',['mochila'],'Mochila en una mano; camina erguido sin inclinarte hacia el peso.',{nv:1,lado:true});
H('hollow_rock','Balanceo hollow','Abdomen','abdomen','a',[],'Lumbar pegada al piso y brazos y piernas largos; balancea sin perder la forma de banana.',{nv:3});
H('bicho_muerto_liga','Dead bug con liga','Core','core','a',['ligas'],'Liga en las manos; alarga brazo y pierna contrarios sin despegar la lumbar.',{nv:2});
H('elev_piernas_suelo','Elevación de piernas en el piso','Abdomen bajo','abdomen','a',[],'Lumbar pegada al piso; baja las piernas lento hasta donde la espalda siga pegada.',{ev:['lumbar'],nv:2});
H('crunch_inverso','Crunch inverso','Abdomen bajo','abdomen','a',[],'Lleva las rodillas al pecho enrollando la pelvis; no uses el impulso de las piernas.',{});
H('crunch_toalla','Crunch con toalla en las manos','Abdomen','abdomen','a',['toalla'],'Toalla tensa entre las manos; enrolla el abdomen llevando las costillas a la cadera.',{});
H('sit_up_mochila','Abdominal con mochila al pecho','Abdomen','abdomen','a',['mochila'],'Mochila al pecho; sube enrollando la columna y baja controlado.',{ev:['cuello','lumbar'],nv:2});
H('twist_ruso','Giro ruso','Oblicuos','core','a',[],'Pies elevados o apoyados; gira el torso llevando las manos de un lado a otro con la espalda larga.',{ev:['lumbar'],nv:2});
H('twist_ruso_mochila','Giro ruso con mochila','Oblicuos','core','a',['mochila'],'Mochila entre las manos; gira desde las costillas, no solo los brazos.',{ev:['lumbar'],nv:2});
H('oblicuo_lateral','Crunch lateral','Oblicuos','core','a',[],'Acostado de lado, sube el codo hacia la cadera enrollando el costado.',{lado:true});
H('toque_talon','Toque de talón alterno','Oblicuos','core','a',[],'Acostado con rodillas dobladas; lleva la mano al talón de cada lado flexionando el costado.',{});
H('pliegue_silla','Elevación de rodillas sentado en la silla','Abdomen bajo','abdomen','a',['silla'],'Sentado en el borde y manos a los lados; sube las rodillas al pecho sin inclinar la espalda atrás.',{});
H('pata_perro','Pata de perro (bird dog con pausa)','Core · Espalda baja','core','a',[],'Cuatro apoyos; extiende brazo y pierna contrarios y aguanta 3 segundos sin que la cadera gire.',{nv:1});
H('rueda_toalla','Rodillo con toalla','Abdomen','abdomen','a',['toalla'],'De rodillas con las manos sobre toalla; desliza al frente y regresa con el abdomen.',{nv:3,ev:['lumbar','hombro']});
H('v_sit','V-sit alterno','Abdomen','abdomen','a',[],'Sentado con el torso inclinado y pies elevados; alterna extender cada pierna.',{nv:3});
// ── CARDIO EN CASA (por rondas con FC) ──
H('marcha_rodillas_altas','Rodillas altas en el lugar','Cardiovascular','cardio','c',[],'Sube las rodillas a la cadera con ritmo y brazos activos; aterriza suave sobre el antepié.',{rondas:true,rx:{u:'seg',v:[30,40,50]},imp:true});
H('talones_gluteo','Talones al glúteo en el lugar','Cardiovascular','cardio','c',[],'Trote en el lugar llevando los talones al glúteo; torso erguido.',{rondas:true,rx:{u:'seg',v:[30,40,50]},imp:true});
H('patinador','Saltos de patinador','Cardiovascular · Glúteo','cardio','c',[],'Salta lateralmente aterrizando en una pierna y cruza la otra detrás; control en cada aterrizaje.',{rondas:true,rx:{u:'seg',v:[30,40,50]},imp:true,ev:['rodilla'],nv:2});
H('paso_lateral_brazos','Paso lateral con brazos','Cardiovascular','cardio','c',[],'Pasos laterales de bajo impacto llevando los brazos al frente y arriba al ritmo.',{rondas:true,rx:{u:'seg',v:[40,50,60]}});
H('marcha_lugar','Marcha rápida en el lugar','Cardiovascular','cardio','c',[],'Marcha enérgica balanceando los brazos; una opción sin impacto para entrar en calor o hacer ronda ligera.',{rondas:true,rx:{u:'seg',v:[45,60,75]}});
H('sombra_boxeo','Sombra de box','Cardiovascular · Hombro · Core','cardio','c',[],'Combinaciones de golpes con rotación de cadera y pies ágiles; mantén las manos arriba.',{rondas:true,rx:{u:'seg',v:[40,50,60]}});
H('salto_tijera','Saltos de tijera con zancada','Cardiovascular · Pierna','cardio','c',[],'Alterna piernas en el aire cayendo en zancada; aterriza suave.',{rondas:true,rx:{u:'reps',v:[10,14,18]},imp:true,ev:['rodilla'],nv:2});
H('sentadilla_salto_casa','Sentadillas con salto','Cardiovascular · Cuádriceps','cardio','c',[],'Baja a sentadilla y salta con fuerza; aterriza suave con rodillas alineadas.',{rondas:true,rx:{u:'reps',v:[8,12,15]},imp:true,ev:['rodilla'],nv:2});
H('escalador_cruzado','Escaladores cruzados','Cardiovascular · Core','cardio','c',[],'Posición de plancha alta; lleva cada rodilla al codo contrario con ritmo.',{rondas:true,rx:{u:'seg',v:[30,40,50]}});
H('burpee_sin_salto','Burpee sin salto','Cardiovascular · Cuerpo completo','cardio','c',[],'Baja a lagartija y regresa de pie sin salto; ritmo parejo y core firme.',{rondas:true,rx:{u:'reps',v:[6,8,10]},nv:1});
H('shuffle','Desplazamientos laterales en cuclillas','Cardiovascular · Glúteo','cardio','c',[],'En media sentadilla, desplázate de lado a lado con pasos rápidos; el pecho al frente.',{rondas:true,rx:{u:'seg',v:[20,30,40]},ev:['rodilla']});
H('sombra_sprint','Sprint en el lugar','Cardiovascular','cardio','c',[],'Carrera intensa en el lugar con brazos coordinados; descansa completo entre rondas.',{rondas:true,rx:{u:'seg',v:[15,20,25]},imp:true,nv:2});
H('bailar_cardio','Baile cardio libre','Cardiovascular','cardio','c',[],'Música que te guste y movimiento continuo de todo el cuerpo; sube el ritmo en cada ronda.',{rondas:true,rx:{u:'seg',v:[60,75,90]}});
// ── CARDIO EN CASA (continuo: minutos fijos + FC objetivo) ──
H('caminata_rapida','Caminata rápida','Cardiovascular','cardio','c',[],'Ritmo en el que puedas hablar con frases cortas; paso firme y brazos relajados. Puede ser dentro o fuera de casa.',{cont:true});
H('trote_suave','Trote suave','Cardiovascular','cardio','c',[],'Trote conversacional y respiración controlada; si no puedes hablar, baja el ritmo.',{cont:true,ev:['rodilla'],nv:2,imp:true});
H('escaleras','Subir y bajar escaleras','Cardiovascular · Glúteo · Cuádriceps','cardio','c',[],'Sube a ritmo estable apoyando todo el pie y baja con control; usa el barandal solo para seguridad.',{cont:true,ev:['rodilla'],nv:2});
H('marcha_continua','Marcha continua en casa','Cardiovascular','cardio','c',[],'Marcha enérgica en el lugar o por la casa, brazos activos y ritmo constante.',{cont:true});
H('baile_continuo','Baile continuo','Cardiovascular','cardio','c',[],'Tres o cuatro canciones seguidas manteniendo movimiento constante.',{cont:true});
H('combo_cuerda','Salto de cuerda continuo','Cardiovascular','cardio','c',['cuerda'],'Saltos cortos con el antepié y las muñecas dando el giro; ritmo parejo.',{cont:true,imp:true,ev:['rodilla'],nv:2});
H('boxeo_continuo','Boxeo de sombra continuo','Cardiovascular','cardio','c',[],'Rondas largas de combinaciones suaves con desplazamiento; mantén el ritmo cardíaco estable.',{cont:true});
// ── KETTLEBELL · MOCHILA · MOVIMIENTOS COMPLETOS ──
H('thruster_mochila','Thruster con mochila','Cuerpo completo','cuadriceps','c',['mochila'],'Sentadilla con la mochila al pecho y empuje arriba al subir; un solo movimiento fluido.',{ev:['rodilla','hombro'],nv:2});
H('clean_press_kb','Cargada y press con kettlebell','Cuerpo completo','deltoide','c',['kettlebell'],'Lleva la kettlebell al hombro con la cadera y empuja arriba; control en cada fase.',{ev:['hombro','lumbar'],nv:3,lado:true});
H('halo_kb','Halo con kettlebell','Hombro · Core','manguito','a',['kettlebell'],'Círculos alrededor de la cabeza pegados al cuerpo; costillas abajo y hombros relajados.',{nv:2});
H('windmill_kb','Molino con kettlebell','Core · Oblicuos','core','a',['kettlebell'],'Brazo arriba con la kettlebell; baja la mano libre por la pierna llevando la cadera atrás.',{ev:['lumbar'],nv:3,lado:true});
H('get_up_peso','Levantada turca sin peso','Cuerpo completo','core','c',[],'Sin carga: del piso a de pie en pasos lentos, mirando la mano arriba.',{nv:2,lado:true});
H('caminata_oso','Caminata del oso','Core · Hombro · Cuádriceps','core','c',[],'Rodillas a un dedo del piso y espalda plana; avanza con pasos cortos y cadera nivelada.',{nv:2});
H('gusano','Gusano (inchworm)','Core · Femorales · Hombro','core','c',[],'Camina con las manos hasta plancha, aguanta 1 segundo y regresa manteniendo las piernas casi rectas.',{nv:2});
H('arrastre_toalla','Arrastre del oso con toallas','Core · Hombro','core','c',['toalla'],'Manos sobre toallas en piso liso; desliza una mano y luego la otra manteniendo la cadera estable.',{nv:3});
// ── MOVILIDAD / CALENTAMIENTO ──
H('mov_gato_camello','Gato–camello','Columna','abdomen','a',[],'Redondea y arquea la espalda lento, vértebra por vértebra, respirando.',{});
H('mov_cadera_90','Cadera 90/90','Cadera','gluteo','a',[],'Gira las piernas de un lado a otro sentado con rodillas a 90°, sin ayudarte con las manos.',{lado:true});
H('mov_flexor_cadera','Flexor de cadera en zancada baja','Flexores de cadera','cuadriceps','a',[],'Rodilla trasera al piso, glúteo apretado y cadera al frente; la tensión va al frente de la cadera.',{iso:true,tt:[20,30,45],lado:true});
H('mov_isquios','Estiramiento de isquiotibiales','Femorales','femoral','a',[],'Una pierna estirada y espalda larga; inclínate desde la cadera sin redondear.',{iso:true,tt:[20,30,45],lado:true});
H('mov_pecho_marco','Apertura de pecho en marco de puerta','Pecho','pecho','a',[],'Antebrazo en el marco y paso adelante; siente el frente del hombro y el pecho.',{iso:true,tt:[20,30,40],lado:true});
H('mov_nino','Postura del niño','Dorsal · Espalda baja','dorsal','a',[],'Cadera hacia los talones y brazos largos; respira hacia la espalda.',{iso:true,tt:[30,45,60]});
H('mov_gluteo_4','Figura 4 acostado','Glúteo','gluteo','a',[],'Cruza el tobillo sobre la rodilla contraria y acerca el muslo al pecho.',{iso:true,tt:[20,30,45],lado:true});
H('mov_sentadilla_profunda','Sentadilla profunda con pausa','Cadera · Tobillo','cuadriceps','a',[],'Pies un poco abiertos; empuja las rodillas hacia afuera con los codos y mantén los talones en el piso.',{});

/* ═══════════ INTEGRACIÓN ═══════════ */
// Equipo que pide un ejercicio (nuevo o reutilizado del gimnasio)
function casaEquipoDe(kb){
  if(!kb) return null;
  if(kb.casa) return kb.eq||[];
  if(Object.prototype.hasOwnProperty.call(CASA_REUSO,kb.id)) return CASA_REUSO[kb.id];
  return null;   // no sirve en casa
}
// Pool de ejercicios de casa (nuevos + reutilizados). Se arma una vez; se recalcula si cambia el catálogo.
let _casaPool=null, _casaPoolN=-1;
function casaPool(){
  if(_casaPool && _casaPoolN===KB_EJERCICIOS.length) return _casaPool;
  const reuso=KB_EJERCICIOS.filter(e=>Object.prototype.hasOwnProperty.call(CASA_REUSO,e.id)).map(e=>Object.assign({},e,{eq:CASA_REUSO[e.id],casaReuso:true}));
  _casaPool=KB_CASA.concat(reuso); _casaPoolN=KB_EJERCICIOS.length; return _casaPool;
}
// Pool filtrado por el equipo que el socio SÍ tiene
function casaDisponibles(equipo,les){
  const tiene=new Set(equipo||[]);
  return casaPool().filter(x=>(x.eq||[]).every(q=>tiene.has(q)) && !(les||[]).some(l=>(x.ev||[]).includes(l)));
}
// kbBuscar reconoce también los ejercicios de casa (ficha, foto, tip, registro) sin tocar KB_EJERCICIOS
(function(){
  const orig=kbBuscar;
  kbBuscar=function(nombre){
    const r=orig(nombre); if(r) return r;
    const n=kbNorm(nombre); if(!n) return null;
    return KB_CASA.find(e=>kbNorm(e.nm)===n || (e.aka||[]).some(a=>kbNorm(a)===n)) || null;
  };
})();
// Los de casa también se encuentran por id en KB_IDX (alternativas, fichas)
KB_CASA.forEach(e=>{ KB_IDX[e.id]=e; });
