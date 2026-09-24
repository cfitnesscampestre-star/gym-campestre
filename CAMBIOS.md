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
