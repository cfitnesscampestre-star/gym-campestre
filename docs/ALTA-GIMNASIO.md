# Alta de un gimnasio nuevo (guía paso a paso)

Cada gimnasio tiene **su propio Firebase, su propio repositorio de GitHub y su propio link**. Así sus datos no se mezclan con los de otro cliente y puedes cobrarle y cortarle el servicio por separado.

## Qué necesitas pedirle al gimnasio
- Nombre completo y nombre corto (el que se ve al instalar la app).
- Su **logo** (cuadrado, mínimo 512 × 512 px) y, si lo tiene, un video corto del logo girando.
- Su **color principal** (hexadecimal, por ejemplo `#1E90FF`) o el logo para sacarlo de ahí.
- Ubicación del gimnasio (coordenadas del mapa) y ciudad.
- Quién será su **director** (usuario y contraseña de 6 o más caracteres).

## Parte A · Firebase del gimnasio (≈ 15 min)
1. Entra a console.firebase.google.com con TU cuenta → **Agregar proyecto** → nombre, por ejemplo `gym-titanes`.
2. **Compilación → Realtime Database → Crear base de datos** → ubicación Estados Unidos → modo de prueba (las reglas se cambian en el paso 6).
3. **Compilación → Authentication → Comenzar → Método de acceso:** habilita **Correo electrónico/contraseña** y **Anónimo**.
4. **Authentication → Usuarios → Agregar usuario:** correo `coordinador1@staff.fitnesspro.app` y la contraseña del director. Copia su **UID**.
5. **Realtime Database → Datos:** agrega la rama `roles/<UID>` con el valor `coordinador`.
6. **Realtime Database → Reglas:** pega el contenido de `firebase-rules.json` y **Publicar**.
7. **Configuración del proyecto (engrane) → Tus apps → Web (</>):** registra la app y copia el bloque `firebaseConfig`.

## Parte B · Repositorio y link (≈ 10 min)
1. En GitHub crea un repositorio nuevo, por ejemplo `gym-titanes`, y sube todos los archivos del proyecto.
2. **Settings → Pages →** Branch `main` → carpeta `/ (root)` → Save. El link será `https://TU-USUARIO.github.io/gym-titanes/`.

## Parte C · Personalizar (los únicos archivos que cambian)
1. **`js/config.js`:** nombre, nombre corto, título, siglas, prefijo de ID, texto del PDF, color, ubicación y el bloque `firebase` del paso 7. (Hay una plantilla en `docs/config-plantilla.js`.)
2. **`manifest.json`:** `name`, `short_name`, `description` y los colores `background_color` / `theme_color`.
3. **`icons/`:** reemplaza `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` y `apple-touch-icon.png` con el logo del gimnasio (mismos nombres y tamaños).
4. **`video/`:** reemplaza `logo-animado.mp4` (portada) y `logo-progreso.mp4` (pantalla Progreso), o déjalos si no hay video.
5. **`img/hero/`:** fotos de bienvenida e inicio del gimnasio (opcional).
6. **`sw.js`:** sube el número de `CACHE_VERSION` (por ejemplo `gym-titanes-v1`).
7. Si usarás IA de rutinas: despliega `servidor/worker-ia.js` en Cloudflare, agrega el dominio del gimnasio en la lista `ALLOWED_ORIGINS` del Worker y pega su dirección en `aiEndpoint` de `config.js`. Sin esto, la app usa las plantillas locales.

## Parte D · Entrega y prueba (≈ 10 min)
1. Abre el link, entra al panel con el director y revisa: título, nombre, logo y color.
2. Registra un socio de prueba con el cuestionario y verifica que aparece pendiente en el panel; entra con su código.
3. Crea un entrenador (Entrenadores → Nuevo) y entra con él.
4. Borra el socio de prueba.
5. Entrega al director: link, usuario y contraseña, y la guía rápida de uso.

## Notas
- Los socios que vienen de otra base no se mezclan: cada Firebase es independiente.
- Haz un respaldo (Realtime Database → ⋮ → Exportar JSON) antes de cada actualización grande.
- Para actualizar a un cliente, sube los archivos nuevos **sin tocar** su `js/config.js`, `manifest.json`, `icons/`, `video/` ni `img/hero/`.
- El color automático es una aproximación a partir de un solo color: revisa cómo se ven botones y gráficas en los temas Día y Noche antes de entregar.
