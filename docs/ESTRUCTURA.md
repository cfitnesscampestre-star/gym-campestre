# Estructura del proyecto (v8.3)

```
index.html          Solo la estructura de pantallas y las etiquetas que cargan todo
css/estilos.css     Todos los estilos (temas claro y oscuro)
js/                 Código dividido por tema (ver tabla)
manifest.json       Datos de la app instalable
sw.js               Modo sin conexión (lista de archivos a guardar + versión del caché)
icons/ img/ video/  Imágenes y videos
servidor/           worker-ia.js (Cloudflare Worker de la IA; no se sube a GitHub Pages)
docs/               Guías, reglas de Firebase y bitácora de cambios
firebase-rules.json Reglas de seguridad de la base de datos (se pegan en Firebase)
```

## Orden de carga (importa)
Los archivos de `js/` son scripts normales y comparten el mismo ámbito global; **se cargan en el orden de los números**. Regla: un archivo puede *definir* funciones que se usan después, pero no *ejecutar al cargar* algo que dependa de un archivo posterior. Lo que dependa de varios módulos va en `99-arranque.js`.

| Archivo | Qué contiene |
|---|---|
| `js/00-conocimiento.js` | Catálogo: ejercicios, clases grupales, enfoques musculares (KB_*). |
| `js/01-datos-firebase.js` | Datos, autenticación (staff y socios), bandeja de cambios sin conexión y fusión de datos. |
| `js/02-mensualidad.js` | Fecha de renovación, tolerancia de 3 días y estado activo/inactivo. |
| `js/03-nutricion-motor.js` | Fórmulas de calorías y macros. |
| `js/04-estadisticas.js` | Estadísticas de evolución del socio. |
| `js/05-seed-demo.js` | Datos demo locales y entrenadores base (sin contraseñas). |
| `js/06-geofence-sesion-login.js` | Geocerca, sesión persistente, navegación y login del socio. |
| `js/07-quiz.js` | Cuestionario de 11 pasos y alta del socio nuevo. |
| `js/08-rutinas-ia-fallback.js` | Generación de rutina (IA) y plantillas locales. |
| `js/09-pdf-rutina.js` | PDF de la rutina del socio. |
| `js/10-tema-fondo.js` | Tema claro/oscuro y fondo animado. |
| `js/11-composicion-rehab.js` | Composición corporal y módulo de rehabilitación. |
| `js/12-deportes-club.js` | Biblioteca de deportes y protocolos. |
| `js/13-avatar-3d.js` | Visor de avatar 3D (ya no se muestra en Progreso; el código sigue disponible). |
| `js/14-motor-rutinas.js` | Métodos de intensidad, cardio, movilidad, isométricos y variedad. |
| `js/15-registro-sesion.js` | Detalle del día y registro de la sesión. |
| `js/16-socios-admin.js` | Editar datos del socio (director). |
| `js/17-panel-staff.js` | Panel del staff: lista, login de staff y navegación. |
| `js/18-editor-ejercicios.js` | Editor rápido de ejercicios y selector del catálogo. |
| `js/19-ficha-socio-estado.js` | Ficha del socio, progresión por bloques y submenú de estado/pagos. |
| `js/20-dialogos.js` | Diálogos propios (confirmar / preguntar). |
| `js/21-progresion.js` | Progresión por bloques de 4-6 semanas. |
| `js/22-resumen-coordinacion.js` | KPIs, riesgo de abandono y exportaciones del director. |
| `js/23-conocimiento-staff.js` | Consulta y edición de conocimiento propio. |
| `js/24-filosofia-entrenador.js` | Huella visual y quiz de filosofía del entrenador. |
| `js/25-entrenadores-admin.js` | Alta, edición y baja de entrenadores (con Firebase Authentication). |
| `js/26-nutricion-staff.js` | Nutriólogo asignado y menús. |
| `js/27-seleccion-entrenador.js` | Elegir entrenador al registrarse; avisos (toast). |
| `js/28-pwa.js` | Service worker y auto-actualización. |
| `js/99-arranque.js` | Ajustes finales que dependen de funciones de varios módulos (siempre al final). |

## Agregar o cambiar algo
- **Cambiar un texto o estilo:** `css/estilos.css` o el módulo del tema.
- **Un módulo nuevo:** crea `js/NN-nombre.js`, agrégalo en `index.html` (en el orden correcto) y en la lista `PRECACHE_LOCAL` de `sw.js`.
- **Después de cualquier cambio publicado:** sube el número de `CACHE_VERSION` en `sw.js`.

## Publicar en GitHub (desde el celular)
Sube `index.html`, `sw.js`, la carpeta `css` y la carpeta `js` (Add file → Upload files, entrando a cada carpeta). Las carpetas `icons`, `img` y `video` solo si cambiaron.
