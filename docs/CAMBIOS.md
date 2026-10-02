# Cambios — v8.3 · Proyecto separado en módulos
- `index.html` pasó de ~800 KB a ~70 KB: los estilos viven en `css/estilos.css` y el código en 30 archivos dentro de `js/` (ver `docs/ESTRUCTURA.md`).
- **No cambia nada de lo que hace la app**: es el mismo código reorganizado. Se verificó contra la versión anterior: las 640 funciones y variables globales son idénticas (mismo código) y la página queda igual; el login de socio, director y coach se probó de nuevo.
- Un bloque que ajusta funciones del panel (vista de detalle en celular) se movió a `js/99-arranque.js` porque depende de módulos posteriores.
- `sw.js`: guarda `css/` y `js/` para el modo sin conexión; esos archivos van ahora "red primero" (siempre la misma versión que `index.html`). Service worker: `fitnesspro-v31`.
- Se eliminó `conocimiento.js` de la raíz: estaba desactualizado (le faltaba la clase Fit Mom) y la app no lo usaba; el catálogo vigente es `js/00-conocimiento.js`.
- Guías, reglas y bitácora quedaron en `docs/`; `worker-ia.js` en `servidor/`.

---

# Cambios — v8.2.1 · Panel limpio al cambiar de sesión
- Al cerrar sesión o entrar al panel, se limpia la ficha/lista que había abierta: un entrenador ya no ve la pantalla de Entrenadores (Editar / Eliminar) que dejó abierta el director.
- Editar, guardar y eliminar entrenadores ahora exigen ser director (antes solo estaba protegido el botón de abrir la sección).
- Reglas: un entrenador solo puede modificar SU propio registro en `/entrenadores` (por ejemplo su filosofía) y no puede cambiar su `uid` ni su `rol`. Service worker: `fitnesspro-v30`.

---

# Cambios — v8.2 · Seguridad con Firebase Authentication

## Qué cambia
- **Staff (director y entrenadores):** entran con usuario y contraseña de Firebase Authentication (el usuario se convierte en `usuario@staff.fitnesspro.app`). Ya no hay contraseñas en el código ni guardadas en la base; las antiguas se borran al entrar el director.
- **Roles:** viven en `/roles/<uid>` ("coordinador" o "entrenador"). Solo el director los crea.
- **Socios:** su teléfono ya no descarga la lista completa; al poner su código se consulta solo `/socios/<código>`. Los teléfonos con datos viejos se depuran al abrir la app.
- **Alta de entrenadores:** crea su cuenta en Firebase (contraseña mínimo 6). Los entrenadores existentes sin acceso seguro aparecen con un aviso: Entrenadores → Editar → escribir contraseña.
- **Eliminar entrenador:** también le quita el rol (la cuenta queda en Authentication, sin permisos).
- **Contador de socios** del inicio: lo publica el staff en `/config/totalSocios`.
- **Código de socio nuevo:** se verifica en Firebase que no exista.
- Reglas nuevas en `firebase-rules.json` (las anteriores quedaron en `firebase-rules-ANTERIOR.json`). Service worker: `fitnesspro-v29`.

## Límites conocidos
- Con códigos de 4 dígitos, alguien podría probar códigos uno por uno; no se puede limitar sin un servidor.
- Un socio con el código de otro podría modificar su registro (incluidos estado y mensualidad). Pendiente: reglas por campo.
- El director no puede cambiar la contraseña de un entrenador desde la app (Firebase → Authentication).
- El panel del staff necesita internet para iniciar sesión.

---

# Cambios — v8.0 · Mensualidad, estado del socio y tolerancia

## Botón de estado (solo director)
- El "Activo" de la ficha ahora es un botón. Abre un submenú con: **Registrar pago**, **Fecha de renovación**, **Activo / Inactivo**, **Recordatorio por WhatsApp**, últimos pagos (con "Deshacer el último pago") y, hasta abajo, **Eliminar socio** (con la misma confirmación doble). Se quitó la "Zona de peligro" del final de la ficha.
- Los entrenadores ven el estado pero no pueden cambiarlo.

## Cómo funciona la mensualidad
- Cada socio tiene una **fecha de renovación** (mismo día cada mes; si el mes no tiene ese día, se usa el último: 31 ene → 28 feb → 31 mar).
- Mientras no llega esa fecha: **Activo**. Desde el día de renovación hay **3 días de tolerancia** (ej. renueva 1 nov: tolerancia 1, 2 y 3 nov). El socio puede seguir entrando y ve un aviso: "tienes N días para renovar y continuar con tu programa".
- Pasada la tolerancia queda **Inactivo** solo: al poner su código ve "Usuario inactivo…" y no entra (tampoco con la sesión ya abierta). No se borra nada.
- **Registrar pago:** si paga a tiempo o dentro de la tolerancia, sigue su ciclo (1 nov → 1 dic). Si ya estaba inactivo, el ciclo empieza el día del pago. Se guarda fecha, monto (opcional), forma de pago y nota.
- **Inactivo a mano** nunca se reactiva solo; **Activar** a un socio vencido abre el registro de pago.
- Los socios que ya existían **no tienen fecha de renovación y no se bloquean nunca** hasta que les pongas una en "Fecha de renovación". Al aprobar el plan de un socio nuevo se abre el registro de pago para empezar su mensualidad.

## Avisos para el director
- En la lista: filtros **⏳ Tolerancia** e **Inactivos**, insignias de color (Activo / Tolerancia · N d / Inactivo), los de tolerancia arriba y un resumen "🔔 Mensualidades" que además avisa a los que renuevan en 3 días o menos.
- Aviso al abrir el panel cuando hay socios en tolerancia o que se inactivaron.
- Botón de **WhatsApp** con el mensaje listo según el estado (guarda el número del socio).
- Nota: no hay servidor, así que los avisos y la inactivación se calculan al abrir la app con la fecha del dispositivo; no se mandan mensajes solos.
- "Editar datos" ahora también permite el estado Inactivo.
- Service worker: `fitnesspro-v27`.

---

# Cambios — v7.9 · Panel del director / entrenador reorganizado

## Ficha del socio en pestañas
- Arriba queda el nombre, edad, peso, nivel, limitaciones y quién lo lleva; abajo cuatro botones: **Evolución · Nutrición · Rutina · Progresión**.
- **Evolución:** sesiones, días a la semana, adherencia, cambio de peso corporal, días sin entrenar, volumen de la semana, ejercicios que suben carga o están estancados y las últimas sesiones (con tiempo isométrico y minutos de cardio).
- **Nutrición:** quién lo lleva, calorías y macros, menú, personalizar o restablecer.
- **Rutina:** los días de la semana (cada día se queda abierto aunque cambies de pestaña o edites).
- **Progresión:** botones "Progresión 1, 2, 3…" (la última es la actual). Al elegir uno se ve la rutina de ese bloque, fechas, sesiones, adherencia, las respuestas del socio y lo que logró en cada ejercicio (kg, FC o segundos). "Usar esta rutina como base" la carga en el editor (no se guarda hasta Guardar cambios y se puede deshacer).
- Un punto rojo en Progresión avisa cuando toca actuar. Si el plan está pendiente de aprobar, la ficha abre directo en Rutina.
- La asignación de entrenador/nutriólogo (solo director) pasa a un desplegable en el encabezado ("Cambiar ›").

## Editar la rutina más fácil
- **Elegir el ejercicio del catálogo:** se toca el nombre y se abre un selector con buscador y filtros por grupo muscular (sugeridos según el tipo de día) y por equipo (máquinas, poleas, mancuernas, barra, peso corporal, ligas, TRX, discos). Avisa con ⚠ si el ejercicio se debe evitar por una limitación del socio.
- **Se prellena solo** según el tipo de ejercicio, el nivel y el objetivo del socio: series, repeticiones, carga, descanso, nota propioceptiva y opciones por área ocupada. También cardio (minutos y FC), rondas, isométricos y movilidad.
- **Se ajusta con un toque:** series, repeticiones o segundos o minutos, y descanso con botones; la carga con una lista; el método con un menú que además ajusta series y repeticiones al método y explica cómo se hace. Todo se puede seguir escribiendo a mano.
- **Si no está en la lista:** "Crear ejercicio nuevo" (nombre, músculos, enfoque, equipo, tipo, si es isométrico, nota y lesiones a evitar). Se guarda en el catálogo para todos los entrenadores y se agrega al día con los datos prellenados.
- También se puede **cambiar** un ejercicio por otro y **subir o bajar** el orden con ▲▼.
- Service worker: `fitnesspro-v26`.

---

# Cambios — v7.8 · Movilidad explicada

## Cada ejercicio de movilidad ahora le explica al socio:
- **¿Qué es?** movilidad dinámica (se mueve) o estiramiento (postura sostenida).
- **¿Por qué está en tu plan?** y **qué trabajas** (qué músculo o articulación se suelta).
- **Cuándo** hacerla (antes de cargar o al final / día de descanso).
- **Movimientos o posturas** con su dosis y cómo hacerlos (solo en las rutinas completas).
- Se puede prescribir por **rondas** o por **tiempo**: "2 rondas · 6 movimientos" o "10 min · 7 movimientos". Las filas de registro dicen "Ronda completa" o "Secuencia completa · ~10 min".
- Tres rutinas completas en el catálogo (`KB_MOVILIDAD` en conocimiento.js): Movilidad articular dinámica (2 rondas, 6 movimientos; el texto se ajusta si el día es de pierna o de tren superior), Movilidad de cadera y hombro (~8 min) y Movilidad y estiramiento (~10 min, 7 posturas de 30–45 s).
- Los demás (estiramientos sueltos, protocolos de rehabilitación, plan de flexibilidad) se explican automáticamente según la zona: cuádriceps, femorales, flexores de cadera, aductores, pantorrilla/tobillo, hombro, cuello/trapecio, espalda alta, columna, cadera, muñeca.
- El coordinador puede escribir su propia explicación en el campo **"Para qué es esta movilidad"** del editor (vacío = automática) y esa tiene prioridad.
- Para agregar otra rutina de movilidad basta con sumar una entrada a `KB_MOVILIDAD`.
- Service worker: `fitnesspro-v25`.

---

# Cambios — v7.7 · Cardio por minutos fijos, rondas con frecuencia cardíaca y movilidad sin peso

## Cardio continuo (caminadora, bici, elíptica, remo ergómetro...)
- El **tiempo ya viene en el plan** (ej. 12 min) y se quitó el campo "Tiempo" que llenaba el socio. Solo registra su frecuencia cardíaca promedio y marca completado.
- La **FC objetivo** se calcula con la edad (FC máx = 208 − 0.7 × edad) y el objetivo del socio: perder peso 65–75%, resistencia/rendimiento 70–82%, ganar músculo/fuerza 60–70%. Si el coordinador escribe su propio rango (ej. "70–80% FCmáx") se respeta.
- Si el plan no trae minutos, se asignan por objetivo y nivel (10–25 min). Se acabó el texto "8 reps — potencia · Moderado 55% 1RM" en el cardio.
- Las alternativas por área ocupada (bici, elíptica...) siguen igual.

## Cardio por rondas (burpees, jumping jacks, escaladores, cuerdas de batalla, trineo, cuerda de salto)
- Se prescriben como **rondas × repeticiones** (o segundos / metros) y en lugar del peso se anota la **FC al terminar cada ronda**.
- Zonas más altas que en cardio continuo (perder peso 75–88%, resistencia 78–90%, ganar músculo 70–85%).
- **Progresión automática**: al guardar la sesión se compara el promedio de FC con la meta. La siguiente vez, si quedó abajo, la ficha propone subir repeticiones (+2, o +5 seg/m); si quedó arriba, bajar; si estuvo en zona, mantener. No modifica la rutina guardada, solo lo que se pide ese día.
- La sesión guarda los minutos de cardio del día.

## Movilidad / calentamiento
- Ya no pide kg ni lleva método de intensidad: solo rondas con palomita.
- Los métodos de intensidad (tempo, pirámide, etc.) ya no se asignan a cardio, rondas ni movilidad, y se ocultan en rutinas ya existentes.

## Editor del coordinador
- Cardio continuo y por rondas tienen su propia etiqueta; el campo de peso pasa a "FC objetivo" (vacío = automático).
- Service worker: `fitnesspro-v24`.

---

# Cambios — v7.6 · Catálogo ampliado, isométricos por tiempo y carga del día

## Catálogo de ejercicios: de 96 a 226
- 130 ejercicios nuevos: máquinas, peso libre, mancuernas, poleas, **ligas**, **TRX** y **discos / landmine**. Cada uno trae su nota propioceptiva, lesiones donde evitarlo, nivel mínimo y alternativas por área ocupada (en otra zona del gimnasio).
- Zonas nuevas en el catálogo: Ligas / bandas, TRX / suspensión, Discos / landmine.
- La plantilla local ahora **reparte ejercicios de todo el catálogo** (antes rotaba solo 3 opciones fijas por hueco muscular). Respeta lesiones, nivel y evita repetir ejercicios en la misma semana.
- Las fotos nuevas se nombran según `img/ejercicios/LEEME.md` (ya trae las filas de los 130 nuevos).

## Filosofía del entrenador en la plantilla local
- Con el catálogo ampliado, ahora el entrenador elegido sí cambia los ejercicios de la plantilla local: equipo preferido (libre vs máquina), trabajo unilateral, nivel de variedad, ejercicios firma y ejercicios que NUNCA programa.

## Isométricos por tiempo
- Plancha, sentadilla isométrica, aguantes, etc. se prescriben como **rondas × segundos**, nunca repeticiones. El tiempo sube con el nivel (ej. plancha: 20 → 30 → 45 s; 3 rondas, 4 en avanzado). Los unilaterales dicen "por lado".
- En la ficha, cada ronda tiene campo de **segundos sostenidos** y de **carga extra opcional** (disco, mancuerna). Si solo marcas ✓, cuenta la meta.
- El editor del coordinador muestra "Rondas / Tiempo por ronda" en los isométricos.

## Carga total del día
- Prescrita: la pantalla del día muestra los minutos isométricos programados junto a ejercicios y series.
- Real: cada sesión guarda su **tiempo bajo tensión isométrico**. Con carga extra, 3 s de tensión ≈ 1 repetición (kg × segundos ÷ 3 entra al volumen). Sin carga solo cuenta tiempo. Se ve al guardar, en el historial de sesiones y en el resumen semanal.
- Service worker: `fitnesspro-v23`.

---

# Cambios — v7.5 · Foto del ejercicio en vez del muñeco de silueta

## Recuadro de foto en la ficha del ejercicio
- En la ficha de cada ejercicio (donde antes salía el muñeco de silueta señalando el músculo), ahora hay un recuadro de imagen que le muestra al socio cómo se hace el movimiento.
- Foto de ancho completo, sin marco ni fondo propio — se ve el fondo del modal detrás, en vez de una tarjeta sólida. El tip del entrenador (el del foquito 💡) va sobrepuesto como etiqueta discreta y translúcida en la parte de abajo de la foto, en vez de un bloque de color aparte arriba. Ya no repite el nombre del ejercicio junto a la foto (ese nombre ya está arriba, en el título de la ficha).
- La foto ya no se recorta (antes se cortaban los lados para rellenar el recuadro y a veces se colaba algo de otra parte de la foto, como pasó con una de las fotos de prueba); ahora se ve completa, sin cortes, dentro de un recuadro más alto (cuadrado).
- En tema claro, el recuadro de la foto ya tiene su propio fondo oscuro (igual que las fotos del inicio), para que no se vea "flotando" sobre el blanco — en tema oscuro no hizo falta, ahí ya se veía bien.
- La miniatura del ejercicio en la lista del día (antes de entrar a la ficha) también se ve completa ahora, sin recortarse.
- Foto distinta para la miniatura (opcional): si quieres que la miniatura de la lista se vea diferente a la foto grande de la ficha, sube `img/ejercicios/mini-<nombre>.webp` — si no la subes, la miniatura usa la misma foto grande. Ver `img/ejercicios/LEEME.md`.
- El texto justo debajo del nombre del ejercicio ya no repite "X reps — potencia" (esa parte ya se ve en cada fila de abajo); ahora solo dice series, esfuerzo/peso objetivo y descanso, para ahorrar espacio arriba.
- Funciona igual en cualquier pantalla donde se abra un ejercicio — es un solo componente reutilizado en toda la app.
- Usa el mismo banco de imágenes que ya existe en `img/` (el que jala las fotos del repositorio de GitHub): si aún no hay una foto propia de ese ejercicio, muestra automáticamente la foto del grupo muscular (`img/grupos/...`), y si tampoco existe, un ícono neutro — nunca queda un espacio roto.
- Para agregar la foto real de un ejercicio: sube el archivo a `img/ejercicios/` en el repo de GitHub, nombrado igual que el ejercicio (ver `img/ejercicios/LEEME.md` para el detalle de nombres). En cuanto subes el archivo con el nombre correcto, aparece solo — no hay que tocar código.

---

# Cambios — v7.4 · Cardio por tiempo/FC y peso calculado con tu RM

## Ejercicios cardiovasculares (elíptica, remo, bici, caminadora...)
- Ya no se registran como "series × repeticiones × peso". El editor del entrenador muestra "Bloques / Tiempo / Frecuencia cardíaca", y el socio, al entrenar, ve un campo de minutos y de frecuencia cardíaca (lpm) en vez del teclado de peso.

## Peso calculado con tu RM (repetición máxima)
- Los ejercicios de fuerza que antes mostraban un porcentaje fijo ("Moderado — 55-60% 1RM") ya no lo muestran — ahora dicen "Esfuerzo moderado — deja 2 reps en reserva" en las cuatro pantallas donde aparecía (lista del día, ficha del ejercicio, vista previa de la rutina y el PDF).
- El peso real se calcula solo, con el progreso del socio: cada serie registrada estima su 1RM (fórmula de Epley) y, a partir de ahí, el sistema calcula el peso según las repeticiones que pida cada ejercicio, dejando 2 en reserva — ya no un porcentaje fijo desconectado de las repeticiones, que antes podía sugerir menos peso del que el socio ya había levantado.
- Si el socio ya conoce su RM, puede anotarlo él mismo: en su Perfil hay un botón "Tus RM (opcional)" que abre una ventana flotante para capturarlo por ejercicio, sin tener que esperar a que el sistema lo calcule solo. A los socios nuevos les aparece un aviso en Inicio invitándolos a hacerlo, que desaparece en cuanto visitan su Perfil.
- Corregido: si ya había una sesión guardada ese día, un segundo registro se descartaba en silencio (sin PR ni RM). Ahora se pregunta si se quiere reemplazar la sesión del día con los datos nuevos.
- Campo de peso más ancho, para números de 3-4 dígitos (kg o lb).

## Nutriólogos, progresión, lugares y ajustes de rutina (de una entrega anterior)
- Alta de nutriólogos, asignación interna de entrenador/nutriólogo con balanceo de carga, personalización de macros y menú, reparto automático de comidas, progresión por bloques, reporte de lugares visitados, intercambio de días completos de rutina.

---

# Cambios — v7.1 · Nutriólogos, progresión, lugares y ajustes de rutina

## Nutrición y equipo
- **Nutriólogos**: se dan de alta igual que un entrenador, marcando si da entrenamiento, nutrición, o ambos. Un entrenador que ya sabe de nutrición puede tener las dos funciones.
- **Asignación de staff** (solo coordinador, decisión interna — el socio nunca la ve ni la elige): en la ficha de cada socio, dos selectores rápidos para elegir quién lleva su entrenamiento y quién su nutrición. El de entrenador muestra cuántos socios activos tiene cada quien, para balancear carga de trabajo. Reasignar solo cambia quién ve y edita la ficha — la rutina, historial y datos del socio se quedan intactos.
- **Personalizar nutrición**: quien tenga la función asignada puede ajustar manualmente calorías/macros/agua y armar un menú por comidas para un socio. El socio lo ve reflejado al instante, con el cálculo automático como referencia.
- **Reparto de comidas** (automático, sin que nadie lo escriba): el socio elige en cuántas comidas divide su día (3 a 6) y el sistema arma, según sus propios requerimientos, cuánto pesa cada comida y una guía general de plato (verduras/proteína/carbohidratos/grasas) — no es un menú ni una receta, solo una proporción de referencia.
- Filtro "📈 Progresión" y el resto del sistema de bloques de progresión (evaluación al socio, propuesta automática de siguiente bloque, aprobación e historial) de una entrega anterior.
- Corregido: un nutriólogo sin función de entrenamiento ya no aparece como opción al elegir entrenador en el alta de un socio nuevo.
- Corregido: cada entrenador y nutriólogo ve solo a los socios que tiene asignados — ya no ve a todos los que están sin asignar.

## Ubicación
- Se quitó el aviso de "dentro/fuera del gimnasio" que se mostraba al socio al entrar — la app ya no da esa impresión de estar limitada a un solo lugar.
- Nueva sección **📍 Lugares** (menú del coordinador): agrupa los check-ins por zona (~55 m) y muestra cuántas veces y en cuántos días distintos se ha abierto la app desde cada lugar, separando "Club Campestre" de "otros lugares" — con un enlace directo a Google Maps para cada uno. Pensado para detectar otros gimnasios donde ya conocen la app.

## Rutinas
- **Intercambiar día completo**: al abrir cualquier día de la rutina de un socio, se puede intercambiar todo su contenido (tipo de sesión + todos los ejercicios) con el de otro día — útil cuando un socio cambia su disponibilidad y hay que reacomodar sin recapturar nada a mano.

## Modo sin conexión (de una entrega anterior)
- Bandeja de cambios pendientes, fusión segura al sincronizar, service worker con todo precargado (fotos, PDF, 3D, tipografías, Firebase SDK) e indicador de estado.

---

# Cambios — v6.7 · Progresión por bloques

## Nuevo
- **Evaluación de progresión**: al terminar un bloque (4-6 semanas), el coordinador o entrenador manda un botón "📋 Enviar evaluación" desde la ficha del socio. Le aparece al socio en su Inicio.
- **Cuestionario del socio** (11 preguntas, ~2 min): intensidad, reps en reserva, asistencia, recuperación, molestias articulares, técnica, avance percibido, preferencia (más carga / variedad / sesiones cortas / enfocar una zona), disponibilidad, ejercicios que quiere cambiar y comentario libre.
- **Propuesta automática**: el sistema cruza las respuestas con lo que el socio realmente registró (peso máximo y series completadas por ejercicio durante el bloque) y arma la siguiente rutina: sube cargas donde hay margen, cambia ejercicios con molestia o que no le gustaron, ajusta series por recuperación o enfoque de zona, sube reps/tiempo en flexibilidad y rehabilitación. Cada cambio muestra su motivo.
- **Revisión del entrenador**: la propuesta se puede regenerar, descartar o aprobar (con duración del nuevo bloque, 4-6 semanas). Al aprobar, la rutina anterior se guarda en el historial del socio (hasta 12 bloques) y la nueva queda activa al instante.
- **El socio ve su progresión**: tarjeta "Nuevo bloque" con lo que cambió (peso anterior vs nuevo, ejercicios nuevos), y un botón "Mi progresión" en Mi plan con la línea de tiempo de todos sus bloques.
- Funciona sin conexión: se apoya en la misma bandeja de cambios pendientes de la v6.6.
- Filtro "📈 Progresión" en la lista de socios del panel: quiénes tienen evaluación contestada, propuesta por aprobar, o ya les toca progresar.

# Cambios — v6.6 · Modo sin conexión

## Qué cambió
- **Bandeja de cambios pendientes**: todo lo que se guarda (sesiones, pesos, medidas, ediciones del staff, conocimiento, entrenadores, bajas) queda en el dispositivo y en una bandeja que **sobrevive aunque se cierre la app**. Al volver internet se sube solo.
- **Fusión segura al sincronizar**: las sesiones, pesos, medidas, asistencias y récords se **unen** con lo que ya hay en Firebase (transacción). Si el coordinador cambió la rutina mientras el socio estaba sin señal, se respeta el cambio del coordinador.
- **Socios dados de baja** desde otro dispositivo no "reviven" al sincronizar.
- **Indicador superior**: "Sin conexión · N cambios por subir", "Sincronizando…" y "✓ Todo sincronizado".
- **Service worker `fitnesspro-v13`**: guarda desde la instalación las fotos, íconos, Firebase SDK, PDF (jsPDF), 3D (three.js) y tipografías. La app abre en máximo 4 s aunque la señal sea mala.
- Si la app abrió sin internet, al volver la señal carga Firebase sola (sin recargar).

## Límites
- La primera vez en cada dispositivo se necesita internet (para descargar la app).
- Sin internet no hay sincronización entre dispositivos ni rutinas con IA.

---

# Cambios — versión revisada

## Correcciones
- **Pérdida de datos al sincronizar**: tras cada actualización de Firebase, la app seguía usando la copia vieja del socio y el siguiente guardado borraba el cambio (peso, medidas, sesiones). Corregido (`aplicarSnapshotSocios`).
- **Ediciones del entrenador**: ya no se pierden si otro dispositivo guarda mientras editas; al guardar solo se escriben rutina/estado/asignación, sin pisar lo que el socio registró.
- **Fecha en UTC**: después de las 6 pm las sesiones y check-ins quedaban con la fecha del día siguiente. Ahora se usa la fecha local.
- **RESET DATOS**: solo coordinador y solo en modo local. Con Firebase conectado está bloqueado.
- **Siembra demo**: si la base queda vacía ya no se rellenan socios demo en producción.
- **Entrenador**: ahora ve solo sus socios (y los sin asignar), como promete la pantalla de login.
- **Login staff**: se quitaron las credenciales demo visibles y precargadas.
- **Nombres**: se escapan/limpian para evitar inyección de código en el panel.
- **Campos temporales** (`_asistHoy`) ya no se suben a Firebase.
- Service worker: `fitnesspro-v2` para forzar actualización.

## IA
- La llamada directa a `api.anthropic.com` no funciona desde GitHub Pages (requiere API key secreta), así que todas las rutinas salían de la plantilla. Ahora usa `AI_ENDPOINT` + `worker-ia.js` (Cloudflare Worker gratuito).
- Cada socio guarda `origenRutina` (`ia` / `plantilla`) y el panel avisa cuando fue plantilla.

## Nuevo
- **📊 RESUMEN**: KPIs de la semana, planes por aprobar con días de espera, socios en riesgo de abandono (14+ días sin actividad), carga y adherencia por entrenador.
- **Exportar CSV** de socios (abre en Excel) y **💾 Respaldo JSON** completo (coordinador).

## Reglas de Firebase (pegar `firebase-rules.json`)
- Ya no se puede sobrescribir ni borrar toda la rama `/socios` o `/entrenadores` de un golpe, ni eliminar socios.
- **Pendiente**: la base sigue siendo legible por cualquiera. Requiere Firebase Authentication (siguiente fase).

## Configurar antes de usar
- `GEO_CENTER` en index.html: coordenadas reales del gimnasio.
- Contraseña del coordinador (`STAFF_USERS`) y de los entrenadores demo (1234).

---

# Versión 3 — Rutinas elaboradas

## Base de conocimiento (`conocimiento.js`)
- Principios del club, 21 métodos de intensidad con reglas (nivel mínimo, fatiga, dónde aplican) y 96 ejercicios organizados por zona del gimnasio, cada uno con opciones por enfoque muscular.
- La IA la recibe filtrada para cada socio (sin ejercicios contraindicados por su lesión, solo métodos que su nivel tolera).
- Botón **📚 CONOCIMIENTO** en el panel: todo el staff la consulta; el coordinador escribe **lineamientos del club** que se aplican a todas las rutinas (se guardan en `/config`; pega las reglas nuevas).

## Métodos de intensidad automáticos
- Pirámide ascendente/descendente, escalera ascendente-descendente, drop set, drop set mecánico, rest-pause, cluster, superseries, biseries, triseries, pre/post-agotamiento, tempo, pausas, 1½, método 21, EMOM, circuitos y contraste.
- Cantidad según nivel (principiante 1, intermedio 2, avanzado 3 por sesión) y la filosofía del entrenador (favoritos, los que evita, qué tanto los usa).
- Sobre una zona lesionada solo métodos de baja carga (tempo, pausa, superseries).
- Aplica tanto a rutinas de IA como de plantilla. Para socios existentes: botón **✨ MÉTODOS Y OPCIONES** en su ficha (solo agrega lo que falta; revisas y guardas).

## Opciones por área ocupada
- Cada ejercicio trae 2-3 opciones del mismo enfoque en otra zona (desplante → extensión de cuádriceps / prensa pies bajos).
- El socio la elige solo por ese día; la rutina original no cambia. El récord se guarda con el ejercicio que realmente hizo.
- El **Resumen** muestra qué ejercicios se cambian más y a qué hora: te dice qué equipo se satura.

## Filosofía del entrenador: de 4 a 9 pasos
Periodización, rangos de reps por objetivo, métodos favoritos/evitados, peso libre vs máquinas, unilateral, ejercicios firma y prohibidos, calentamiento, orden, tempo, core, cardio, preferencia en hora pico y una sesión típica descrita por el propio entrenador. Todo entra al prompt de la IA. Las filosofías existentes se conservan.

## Vista del socio y PDF
Chip del método, grupo (A1/A2), descanso, explicación de cómo ejecutar el método, reps por serie en pirámides y escaleras. El PDF incluye método, descanso y opciones.

---

# Corrección — entrenador nuevo no aparecía

- El archivo de conocimiento (`conocimiento.js`) estaba referenciado como script aparte; en la vista de prueba (un solo archivo publicado) no cargaba, y eso rompía tanto "📚 CONOCIMIENTO" como el paso 4 del cuestionario de filosofía. Ya va incrustado dentro de `index.html`.
- El selector de entrenador (al registrar un socio) solo mostraba entrenadores que ya habían llenado su filosofía. Un entrenador recién creado se quedaba invisible hasta que iniciaba sesión y completaba el cuestionario de 9 pasos. Ahora aparece de inmediato, marcado como "Aún sin filosofía propia — seguirá el enfoque general del club", y sube a la lista en cuanto la define.

---

# Nuevo — sección Entrenadores

Botón **👥 ENTRENADORES** (coordinador) para ver a todos: filosofía, especialidades y cuántos socios (activos/pendientes) tiene cada uno.
- **✎ Editar**: nombre, contraseña y especialidades. El usuario (login) no se puede cambiar desde ahí. Las especialidades que no están en la lista fija (ej. "Rendimiento deportivo") se conservan en un campo de texto aparte — nada se pierde al guardar sin tocar nada.
- **🗑 Eliminar**: pide doble confirmación. Si tiene socios asignados, quedan como "Sin asignar" (su rutina no se borra, solo pierden entrenador).
- La filosofía sigue editándose únicamente desde la sesión del propio entrenador (🧬 MI FILOSOFÍA), no desde aquí.

---

# Corrección importante — control del coordinador y por qué no se guardaba

## La causa real
La "vista de prueba" (el link que publico aquí para que la revises) corre dentro de un entorno de Claude que **no puede cargar Firebase** — el navegador bloquea el script de Firebase por política de seguridad de ese entorno, sin importar qué tan bien esté configurado tu proyecto real. Mientras pruebas ahí, la app funciona 100% en modo local (📦 LOCAL, nunca 🔥 FIREBASE), y cada sesión/pestaña nueva puede partir de datos distintos. **Esto no pasará en tu sitio real** (GitHub Pages u otro hosting), donde Firebase si se conecta.
Para confirmar esto mientras pruebas: fíjate en el badge junto al logo — si dice 📦 LOCAL, Firebase no está conectado en ese momento.

## Cambios de fondo
- **El coordinador ahora puede llenar o editar la filosofía de cualquier entrenador** directamente desde 👥 ENTRENADORES → 🧬 Llenar/Editar filosofía — ya no depende de que el entrenador inicie sesión y complete el cuestionario por su cuenta.
- **El cuestionario de filosofía se autoguarda en cada paso** (no solo al final). Si se cierra a medias, lo que ya se llenó no se pierde.
- **📊 RESUMEN y 🔥 FIREBASE ahora son solo para coordinación.** Un entrenador ya no ve datos agregados de otros entrenadores ni puede tocar la configuración de Firebase. Solo ve: sus propios socios, sus rutinas, 🧬 su filosofía y 📚 Conocimiento (en modo lectura).
- Reglas de Firebase actualizadas para permitir borrar entrenadores individuales (antes lo bloqueaban sin avisar).

---

# Dos bugs reales encontrados y corregidos

## 1. La lista de Entrenadores no se refrescaba al crear uno nuevo
Al crear un entrenador, se guardaba correctamente, pero la tarjeta no aparecía hasta salir de la sección y volver a entrar. Eso probablemente causó los entrenadores duplicados que viste (varios "Luis Fernando Jaime" repetidos) — parecía que no se había creado, así que se volvía a intentar. Ya se refresca de inmediato. También ahora avisa si ya existe un entrenador con el mismo nombre, para evitar crear duplicados sin querer.

## 2. Poca variedad en rutinas de disciplina deportiva (tenis, fútbol, pádel, etc.)
Cada disciplina solo tenía 6-7 ejercicios en su banco propio, y el generador tomaba una ventana de 5 de esos 6-7 cada día — matemáticamente, cualquier par de días compartía mínimo 4 de 5 ejercicios. Por eso lunes y martes se veían casi idénticos, solo reordenados.
Ahora cada día combina 2 movimientos firma de la disciplina (rotando cuáles, para usar los 6-7 a lo largo de la semana) con 3 ejercicios del catálogo general elegidos según el enfoque del día (fuerza, potencia, resistencia, core, movilidad), sin repetir ninguno ya usado esa semana. Probado con una rutina de tenis a 4 días: 0 ejercicios repetidos entre la mayoría de los días, máximo 2 compartidos entre dos de ellos.

Esto aplica a las 11 disciplinas del catálogo (tenis, golf, natación, gimnasia, fútbol, pádel, frontenis, básquet, taekwondo, squash, fitness grupal).


---

# Versión 4 — Diseño nuevo, sesiones, socios y conocimiento

## Diseño
- Nuevo aspecto (vidrio, degradados, tipografía Bricolage + Figtree) con **solo dos temas: claro y oscuro** (selector sol/luna). Se quitó **Mi Espacio**.
- Inicio con fondo de destellos y latido; panel del socio con anillo semanal, tira de la semana y barra de navegación flotante.

## Corrección: las sesiones no se guardaban
- **Causa**: Firebase no guarda listas ni objetos vacíos. Un socio nuevo se guardaba con `sesiones: []`, y al volver de Firebase ese campo ya no existía; al pulsar *Finalizar sesión* el código fallaba en silencio (`s.logs.sesiones.push` sobre `undefined`) y no se guardaba nada.
- **Segunda causa**: los récords se guardaban con el nombre del ejercicio como llave. Si el nombre llevaba `/`, `.`, `#`, `$`, `[` o `]` (p. ej. "Caminata Inclinada / Elíptica") Firebase rechazaba TODO el guardado.
- **Arreglo**: se restauran los campos faltantes al cargar y antes de guardar, las llaves de récords se limpian, y cualquier error ahora se muestra en pantalla en lugar de fallar en silencio. Al terminar aparece "Sesión guardada".
- También: la configuración (lineamientos, conocimiento) ya no se pierde en modo local; y si la app queda abierta pasada la medianoche, el "hoy" se actualiza.

## Coordinador: editar y eliminar socios
- En la ficha del socio (solo coordinador): **Editar datos** (nombre, edad, estatura, peso, género, nivel, objetivo, frecuencia, estado, entrenador, limitaciones y código de acceso) y **Eliminar** (doble confirmación).
- Si se elimina a un socio con la sesión abierta en su teléfono, la app lo saca automáticamente.
- **Importante:** para poder eliminar hay que **pegar las reglas nuevas** de `firebase-rules.json` en Firebase Console → Realtime Database → Reglas → Publicar.

## Conocimiento: agregar lo que falte (coordinador)
- **Ejercicios** (con músculos, zona, enfoque, tipo, series/reps/carga sugeridas, descripción propioceptiva y lesiones a evitar), **métodos de intensidad**, **principios del club** y **notas y descripciones** libres. Se pueden editar y quitar.
- Los ejercicios y métodos agregados los usa el sistema al crear rutinas nuevas, en las opciones "área ocupada" y en las indicaciones para la IA. Los principios y las notas van a la IA.

## Panel del coordinador / entrenador: rediseño
- **Barra superior limpia**: en celular las acciones (Entrenadores, Nuevo entrenador, Conocimiento, Resumen, Respaldo, Firebase, Cerrar sesión) están en un botón **Menú**, agrupadas. El rol, el estado de conexión y el nombre van en una línea aparte.
- **Lista y ficha por separado** en celular: primero ves la lista de socios (con buscador, filtros con conteo y tarjetas grandes); al tocar uno se abre su ficha con el botón **Volver a socios**. En pantallas grandes siguen lado a lado.
- **Ficha del socio ordenada**: datos clave en etiquetas, botones *Editar datos* y *Métodos y opciones*, resumen de números, y **Guardar cambios** (y **Aprobar plan** si está pendiente) fijos abajo, siempre a la mano.
- **Editar la rutina**: cada día se abre al tocarlo; cada ejercicio tiene campos con nombre (Series, Repeticiones, Peso, Nota propioceptiva) y lo avanzado (método, grupo, descanso, opciones) queda dentro de un desplegable.
- **Eliminar socio** quedó en una *Zona de peligro* al final de la ficha, para no tocarlo por accidente.

## Diseño v5 — según los prototipos (claro y oscuro)
- Nueva paleta: **lima + blanco** (claro) y **lima + negro azulado** (oscuro), tarjetas planas, íconos de línea en recuadros y tipografía deportiva (Kanit) en títulos.
- **Barra inferior de 5 secciones**: Inicio · Rutina · Progreso · Nutrición · Perfil.
- **Inicio**: saludo, foto principal con la frase del gimnasio, tarjeta *Entrenamiento de hoy* con anillo semanal y botón **Iniciar entrenamiento**, tres números clave y la semana.
- **Rutina (Mi plan)**: objetivo, días/nivel/entrenador y la semana en tarjetas con foto.
- **Detalle del día**: portada con foto, resumen (ejercicios, series, nivel), avance y cada ejercicio con su miniatura.
- **Progreso** y **Nutrición** con tarjetas e íconos nuevos; **Perfil** nuevo (datos, logros, apariencia claro/oscuro, PDF y cerrar sesión).
- **Banco de imágenes**: carpeta `img/` (lee `img/LEEME.md`). Donde falta una foto se ve un fondo con ícono; puedes ir agregándolas poco a poco. `img/LISTA-DE-IMAGENES.csv` trae los nombres exactos de archivo.
