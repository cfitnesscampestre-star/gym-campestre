# 🔥 Guía de conexión a Firebase
## Fitness System Pro — Club Campestre Aguascalientes

---

## PASO 1 — Crear el proyecto Firebase (5 min)

1. Ve a **console.firebase.google.com**
2. Clic en **"Agregar proyecto"**
3. Nombre: `fitness-campestre` (o el que quieras)
4. Desactiva Google Analytics (no es necesario)
5. Clic en **"Crear proyecto"**

---

## PASO 2 — Activar Realtime Database

1. En el menú izquierdo → **Compilación → Realtime Database**
2. Clic en **"Crear una base de datos"**
3. Región: **Estados Unidos (us-central1)** ← más cercana a México y gratis
4. Modo de inicio: **"Comenzar en modo de prueba"** (después aplicamos las reglas)
5. Clic en **"Habilitar"**

---

## PASO 3 — Obtener el firebaseConfig

1. En el menú izquierdo → ⚙️ **Configuración del proyecto**
2. Baja hasta **"Tus apps"** → clic en el ícono `</>`  (Web)
3. Alias de la app: `kiosco` → clic en **"Registrar app"**
4. Copia el objeto **firebaseConfig** que aparece (desde `{` hasta `}`)
5. Clic en **"Continuar a la consola"**

El objeto se ve así:
```javascript
{
  "apiKey": "AIzaSyXXXXXXXXXXXX",
  "authDomain": "fitness-campestre.firebaseapp.com",
  "databaseURL": "https://fitness-campestre-default-rtdb.firebaseio.com",
  "projectId": "fitness-campestre",
  "storageBucket": "fitness-campestre.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef"
}
```

---

## PASO 4 — Conectar en la app

1. Abre la app → menú del panel Staff → botón **🔥 FIREBASE**
2. Pega el objeto firebaseConfig completo
3. Clic en **"CONECTAR"**
4. La app se conecta, sube los socios demo a Firebase y muestra el badge verde **🔥 FIREBASE**

---

## PASO 5 — Aplicar reglas de seguridad

1. En Firebase Console → Realtime Database → **Reglas**
2. Borra el contenido actual y pega el contenido de **firebase-rules.json**
3. Clic en **"Publicar"**

---

## PASO 6 — Verificar que todo funciona

- El badge en el panel Staff debe mostrar **🔥 FIREBASE** en verde
- Registra un socio nuevo desde el kiosco
- Entra a Firebase Console → Realtime Database → verifica que aparece
- Abre la app en OTRO dispositivo y verifica que el socio nuevo está ahí

---

## NOTAS IMPORTANTES

### Cambios en la rutina visibles al instante
El entrenador edita la rutina de un socio en el panel → el socio la ve actualizada
al instante en su dashboard (Firebase escucha cambios en tiempo real).

### ¿Y si no hay internet?
La app guarda una copia local (localStorage). El socio puede ver su rutina y
registrar sesiones offline. Cuando recupere internet, los cambios se sincronizan
solos al siguiente guardado.

### Plan gratuito Spark (suficiente para el club)
- 1 GB de almacenamiento
- 10 GB de transferencia/mes
- 100 conexiones simultáneas
Para ~100 socios con uso normal del kiosco, no lo vas a superar.

### Para el futuro (Play Store)
Cuando subas la app como TWA, no necesitas cambiar nada — sigue leyendo
de la misma base de datos Firebase. Los datos son del club, no del dispositivo.

---

## SOLUCIÓN DE PROBLEMAS

| Problema | Solución |
|----------|----------|
| Badge muestra 📦 LOCAL | Firebase no está configurado o hubo error al conectar |
| "No se pudo conectar" | Verifica que el databaseURL sea correcto (termina en .firebaseio.com) |
| Socio nuevo no aparece en otro dispositivo | Verifica que tengas internet y que las reglas permitan escritura |
| Quiero cambiar de proyecto | Panel Staff → 🔥 FIREBASE → pega la nueva config |
