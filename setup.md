# Guía de Configuración Paso a Paso

## 1. Configuración de Google Cloud Platform

### Habilitar APIs
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a "APIs y servicios" > "Biblioteca"
4. Busca y habilita las siguientes APIs:
   - **Google Classroom API**
   - **Google Calendar API** 
   - **Google People API**

### Configurar OAuth 2.0
1. Ve a "APIs y servicios" > "Credenciales"
2. Crea credenciales > ID de cliente de OAuth 2.0
3. Tipo de aplicación: Aplicación web
4. Orígenes autorizados de JavaScript:
   - `http://localhost:3000` (desarrollo)
   - Tu dominio de producción
5. URIs de redirección autorizados:
   - `http://localhost:3000` (desarrollo)
   - Tu dominio de producción
6. **IMPORTANTE**: Copia el "ID de cliente" generado (formato: xxxxx.apps.googleusercontent.com)
   - Este es tu `VITE_GOOGLE_CLIENT_ID`

### Configurar Pantalla de Consentimiento
1. Ve a "APIs y servicios" > "Pantalla de consentimiento de OAuth"
2. Tipo de usuario: Externo (o Interno si es G Suite)
3. Completa la información requerida
4. Agrega los scopes necesarios:
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.rosters.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.students.readonly`
   - `https://www.googleapis.com/auth/classroom.student-submissions.students.readonly`
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`

## 2. Configuración de Firebase

### Crear Proyecto
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Google Analytics (opcional)

### Configurar Authentication
1. Ve a "Authentication" > "Sign-in method"
2. Habilita "Google" como proveedor
3. Configura el ID de cliente web de OAuth 2.0 (del paso anterior)

### Configurar Firestore
1. Ve a "Firestore Database"
2. Crear base de datos
3. Modo: Empezar en modo de prueba (cambiar a producción después)
4. Ubicación: Selecciona la más cercana a tus usuarios

### Configurar Google Analytics (Opcional)
**¿Necesitas Analytics?**
- ✅ SÍ: Si quieres métricas de uso, páginas visitadas, usuarios activos
- ❌ NO: Si solo necesitas funcionalidad básica

**Si decides habilitarlo:**
1. Ve a "Analytics" en Firebase Console
2. Habilitar Google Analytics
3. Crear o vincular cuenta de Analytics
4. Copiar el Measurement ID (formato: G-XXXXXXXXXX)

### Obtener Configuración
1. Ve a "Configuración del proyecto" > "General"
2. En "Tus apps", selecciona la app web
3. Copia la configuración de Firebase

## 3. Configuración del Proyecto

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Google APIs Configuration (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com

# Opcional: Solo si habilitaste Google Analytics
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Instalar Dependencias
```bash
npm install
```

### Ejecutar en Desarrollo
```bash
npm run dev
```

## 4. Configuración Inicial de Datos

### Crear Usuario Administrador
1. Inicia sesión en la aplicación con tu cuenta de Google
2. Ve a Firestore Console
3. Busca tu documento en la colección `users`
4. Cambia el campo `role` a `coordinator`

### Configurar Cursos y Células
1. Inicia sesión como coordinador
2. Los cursos se sincronizarán automáticamente desde Google Classroom
3. Crea células para organizar a los estudiantes
4. Asigna asistentes a cada célula

## 5. Despliegue en Producción

### Netlify
1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno en Netlify
3. Comando de build: `npm run build`
4. Directorio de publicación: `dist`

### Firebase Hosting (Alternativo)
1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicia sesión: `firebase login`
3. Inicializa: `firebase init hosting`
4. Construye: `npm run build`
5. Despliega: `firebase deploy`

## 6. Configuración de Seguridad

### Reglas de Firestore
1. Ve a Firestore Console > "Reglas"
2. Reemplaza las reglas con el contenido de `firestore.rules`
3. Publica las reglas

### Dominios Autorizados
1. Ve a Firebase Console > "Authentication" > "Settings"
2. En "Authorized domains", agrega tu dominio de producción

## 7. Verificación

### Lista de Verificación
- [ ] APIs habilitadas en Google Cloud
- [ ] OAuth configurado correctamente
- [ ] Firebase Authentication funcionando
- [ ] Firestore configurado con reglas de seguridad
- [ ] Variables de entorno configuradas
- [ ] Aplicación ejecutándose localmente
- [ ] Primer usuario administrador creado
- [ ] Cursos sincronizados desde Classroom
- [ ] Células configuradas
- [ ] Despliegue en producción funcionando

### Pruebas
1. **Login**: Verifica que puedas iniciar sesión con Google
2. **Roles**: Confirma que los diferentes roles muestren dashboards apropiados
3. **Classroom**: Verifica que los cursos se carguen desde Google Classroom
4. **Asistencia**: Prueba el módulo de asistencia con eventos de Calendar
5. **Exportación**: Verifica que la exportación a CSV funcione

## Solución de Problemas Comunes

### Error: "Access blocked: This app's request is invalid"
- Verifica que los dominios estén autorizados en Google Cloud Console
- Confirma que la pantalla de consentimiento esté configurada

### Error: "Firebase: Error (auth/popup-blocked)"
- Permite popups en el navegador
- Verifica que no haya bloqueadores de anuncios interfiriendo

### Error: "Missing or insufficient permissions"
- Verifica las reglas de Firestore
- Confirma que el usuario tenga el rol correcto

### Cursos no se cargan
- Verifica que el usuario tenga acceso a Google Classroom
- Confirma que las APIs estén habilitadas
- Revisa los scopes de OAuth

¿Necesitas ayuda con algún paso específico? Contacta al equipo de desarrollo.
