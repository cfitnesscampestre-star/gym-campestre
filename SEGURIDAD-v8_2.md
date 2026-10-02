# Publicar la v8.2 (en este orden)

0. **Respaldo:** Realtime Database → Datos → menú ⋮ → Exportar JSON.
1. Authentication: Correo/contraseña y Anónimo habilitados (ya hecho).
2. Usuario `coordinador1@staff.fitnesspro.app` creado, y en Datos la rama `roles/<UID>` = `coordinador` (ya hecho).
3. **Sube la v8.2 a GitHub** (todos los archivos, incluida la carpeta `video`). Espera 1-2 minutos.
4. **Prueba antes de las reglas:** abre la app, entra al panel con `coordinador1` y tu contraseña nueva, y entra como socio con un código.
5. **Publica las reglas:** Realtime Database → Reglas → pega `firebase-rules.json` completo → Publicar.
6. **Vuelve a probar** (panel y socio). Si algo falla: pega `firebase-rules-ANTERIOR.json` y publícalo para regresar.
7. Entrenadores existentes: Entrenadores → Editar → contraseña nueva (mín. 6). Cada uno entra con su usuario.

Importante: no publiques las reglas antes del paso 3, o la versión vieja de la app dejará de funcionar.
