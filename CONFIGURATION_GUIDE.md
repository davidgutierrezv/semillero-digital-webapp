# Guía de Configuración - Dónde Encontrar Cada Variable

## 🔧 Variables de Entorno Requeridas

### 🔥 **Firebase Configuration**
**Dónde encontrar**: [Firebase Console](https://console.firebase.google.com/) → Tu Proyecto → ⚙️ Configuración del proyecto → General → Tus apps

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
```

**Pasos detallados:**
1. Ve a Firebase Console
2. Selecciona tu proyecto
3. Clic en ⚙️ (configuración) → "Configuración del proyecto"
4. Scroll down hasta "Tus apps"
5. Si no tienes una app web, clic en "Agregar app" → Web
6. Copia todos los valores del objeto `firebaseConfig`

---

### 🌐 **Google APIs Configuration**
**Dónde encontrar**: [Google Cloud Console](https://console.cloud.google.com/) → Tu Proyecto → APIs y servicios → Credenciales

```env
VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

**Pasos detallados:**
1. Ve a Google Cloud Console
2. **Asegúrate de estar en el MISMO proyecto que Firebase**
3. Menú → "APIs y servicios" → "Credenciales"
4. Busca "ID de cliente de OAuth 2.0"
5. Copia el "ID de cliente" (NO el secreto)

**Si no tienes OAuth 2.0 configurado:**
1. Clic en "Crear credenciales" → "ID de cliente de OAuth 2.0"
2. Tipo: "Aplicación web"
3. Orígenes autorizados:
   - `http://localhost:3000`
   - Tu dominio de producción
4. URIs de redirección: (mismos que arriba)

---

### 📊 **Google Analytics (Opcional)**
**Dónde encontrar**: Firebase Console → Analytics → Configuración

```env
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Pasos detallados:**
1. Firebase Console → Tu proyecto
2. "Analytics" en el menú lateral
3. Si no está habilitado: "Comenzar" → Vincular cuenta de Analytics
4. Una vez habilitado: Configuración → Copiar Measurement ID

---

## 🔍 **Verificación de APIs Habilitadas**

### En Google Cloud Console → APIs y servicios → Biblioteca

**APIs que DEBEN estar habilitadas:**
- ✅ **Google Classroom API**
- ✅ **Google Calendar API** 
- ✅ **Google People API**
- ✅ **Identity and Access Management (IAM) API**

**Cómo verificar:**
1. Google Cloud Console → "APIs y servicios" → "Biblioteca"
2. Busca cada API por nombre
3. Si dice "Habilitar" → Haz clic para habilitarla
4. Si dice "Administrar" → Ya está habilitada ✅

---

## 🛡️ **Configuración de OAuth Consent Screen**

### Google Cloud Console → APIs y servicios → Pantalla de consentimiento de OAuth

**Configuración mínima requerida:**
1. **Tipo de usuario**: Externo (o Interno si tienes G Suite)
2. **Información de la app**:
   - Nombre: "Semillero Digital Dashboard"
   - Email de soporte: tu email
   - Logo: (opcional) URL del logo de Semillero Digital
3. **Dominios autorizados**:
   - `localhost` (para desarrollo)
   - Tu dominio de producción
4. **Scopes** (permisos):
   ```
   https://www.googleapis.com/auth/classroom.courses.readonly
   https://www.googleapis.com/auth/classroom.rosters.readonly
   https://www.googleapis.com/auth/classroom.coursework.students.readonly
   https://www.googleapis.com/auth/classroom.student-submissions.students.readonly
   https://www.googleapis.com/auth/calendar.readonly
   https://www.googleapis.com/auth/userinfo.profile
   https://www.googleapis.com/auth/userinfo.email
   ```

---

## 🔗 **Relación entre Firebase y Google Cloud**

### ¿Por qué necesito ambos?

**Firebase** (Autenticación + Base de datos):
- `VITE_FIREBASE_*` → Para login y guardar datos
- Maneja usuarios, roles, células, asistencia

**Google Cloud** (APIs externas):
- `VITE_GOOGLE_CLIENT_ID` → Para acceder a Classroom y Calendar
- Obtiene cursos, tareas, entregas, eventos

### ¿Es el mismo proyecto?
**SÍ** - Firebase y Google Cloud deben ser el **mismo proyecto**:
1. Cuando creas un proyecto en Firebase, automáticamente se crea en Google Cloud
2. Usa el **mismo Project ID** en ambos
3. Verifica en ambas consolas que el nombre del proyecto coincida

---

## 🚨 **Problemas Comunes**

### Error: "Access blocked: This app's request is invalid"
**Causa**: OAuth mal configurado
**Solución**: 
1. Verifica dominios autorizados en Google Cloud Console
2. Asegúrate de que `localhost:3000` esté en orígenes autorizados

### Error: "API not enabled"
**Causa**: APIs no habilitadas en Google Cloud
**Solución**: Habilita Classroom, Calendar y People APIs

### Error: "Invalid client_id"
**Causa**: `VITE_GOOGLE_CLIENT_ID` incorrecto
**Solución**: Verifica que copiaste el Client ID completo (termina en `.apps.googleusercontent.com`)

### Error: "Firebase configuration"
**Causa**: Variables de Firebase incorrectas
**Solución**: Verifica que todas las variables `VITE_FIREBASE_*` estén correctas

---

## ✅ **Checklist de Configuración**

### Firebase
- [ ] Proyecto creado en Firebase Console
- [ ] Authentication habilitado con Google
- [ ] Firestore Database creado
- [ ] App web registrada
- [ ] Variables `VITE_FIREBASE_*` copiadas

### Google Cloud (mismo proyecto)
- [ ] APIs habilitadas: Classroom, Calendar, People
- [ ] OAuth 2.0 Client ID creado
- [ ] Dominios autorizados configurados
- [ ] Pantalla de consentimiento configurada
- [ ] Variable `VITE_GOOGLE_CLIENT_ID` copiada

### Archivo .env
- [ ] Archivo `.env` creado (copiado de `.env.example`)
- [ ] Todas las variables reemplazadas con valores reales
- [ ] No hay espacios extra o comillas

### Verificación
- [ ] `npm run dev` ejecuta sin errores
- [ ] Login con Google funciona
- [ ] No hay errores en consola del navegador

---

**💡 Tip**: Si tienes dudas, compara el Project ID en Firebase Console y Google Cloud Console - deben ser idénticos.
