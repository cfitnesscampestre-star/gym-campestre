# Reglas v8.6 — protección por campo de los socios

**Qué cambia:** solo se reemplaza `firebase-rules.json`. No hay que subir nada a GitHub ni cambiar el service worker.

## Qué protege
Un socio (sesión anónima con su código) **ya no puede cambiar**, en un registro existente:
- `status` (activo / inactivo / pendiente)
- `membresia/vence`, `membresia/ancla`, `membresia/suspendido`
- `asignado`, `entrenadorId`, `nutriologoId`, `nutriologo`

Solo el staff (cualquier usuario con rol en `/roles`) puede modificarlos.

**Alta de socio nuevo** (cualquier sesión): solo se acepta si el código tiene 4 dígitos, el campo `code` coincide con la llave, `status` es `pendiente` y no trae `membresia` ni nutriólogo. Así nadie puede darse de alta ya como "activo" o con mensualidad vigente.

## Qué NO cubre (límites conocidos)
- **Leer:** quien adivine un código de 4 dígitos todavía puede leer ese registro (punto 2 de la lista).
- **Objetos completos:** `rutina`, `nutricion`, `progresion` y el historial `membresia/pagos` no se pueden comparar campo por campo en las reglas; un socio con el código de otro podría alterarlos. Lo mismo para el historial (`logs`).
- **Vencimiento:** la app marca "inactivo" al abrir el panel del staff; el servidor no vence solo a nadie.
- **Altas basura:** nada impide que alguien cree muchos socios "pendiente" (se ven en el panel y se borran).

## Cómo publicar (en este orden)
0. Respaldo: Realtime Database → Datos → ⋮ → Exportar JSON.
1. Realtime Database → Reglas → pega `firebase-rules.json` completo → **Publicar**.
2. Pruebas rápidas (abajo). Si algo falla, pega `docs/firebase-rules-v8_2-ANTERIOR.json` y publica.

## Pruebas en el Simulador de reglas (pestaña Reglas → "Simulador de reglas")
Usa ubicación `/socios/1234` (cambia por un código existente), tipo **set**, y autenticado.

| # | Quién | Qué | Debe pasar |
|---|---|---|---|
| 1 | Anónimo (uid cualquiera) | set con `nombre`, `objetivo`, `code:"9999"`, `status:"pendiente"` en `/socios/9999` (no existe) | ✅ Permitido |
| 2 | Anónimo | Igual que 1 pero `status:"activo"` | ❌ Denegado |
| 3 | Anónimo | Igual que 1 pero con `membresia:{vence:"2027-12-31"}` | ❌ Denegado |
| 4 | Anónimo | En un socio existente: mismo registro, solo agregar una sesión a `logs` | ✅ Permitido |
| 5 | Anónimo | En un socio existente: cambiar `status` a `"activo"` | ❌ Denegado |
| 6 | Anónimo | En un socio existente: quitar `membresia` (o cambiar `vence`) | ❌ Denegado |
| 7 | Staff (uid con rol) | update de `status` y `membresia/vence` | ✅ Permitido |
| 8 | Anónimo | Borrar un socio (set null) | ❌ Denegado |

## Prueba real en la app (después de publicar)
1. Registrar un socio de prueba con el cuestionario → aparece pendiente.
2. Director lo aprueba y le registra un pago.
3. Entrar como ese socio, registrar una sesión y un peso → debe sincronizar (sin aviso de "Firebase rechazó el guardado").
4. Director marca inactivo → el socio ve "usuario inactivo".
5. Borrar el socio de prueba.

## Hallazgo aparte
`registrarLugarVisitado` (js/06) escribe en `/config/lugares` desde el teléfono del socio, pero `/config` solo permite escribir al staff, así que **ese reporte no se está llenando con los socios** (desde v8.2). Hay que moverlo a una ruta que el socio sí pueda escribir; no se incluyó aquí para no tocar código en este paso.
