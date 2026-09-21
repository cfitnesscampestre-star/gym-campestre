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
