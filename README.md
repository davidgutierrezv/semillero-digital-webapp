# Semillero Digital - Dashboard de Gestión

Una aplicación web completa desarrollada con React que funciona como dashboard de gestión para la organización "Semillero Digital". Esta aplicación se conecta a Google Classroom API para proporcionar vistas y métricas personalizadas que resuelven problemas de seguimiento de progreso, comunicación y obtención de métricas.

## 🚀 Características Principales

- **Branding Oficial**: Integración del logo oficial de Semillero Digital
- **Autenticación con Google**: Integración completa con Firebase Authentication
- **Dashboards por Rol**: Vistas personalizadas para Profesores, Asistentes y Estudiantes
- **Integración con Google Classroom**: Sincronización automática de cursos, tareas y entregas
- **Módulo de Asistencia**: Gestión de asistencia integrada con Google Calendar
- **Sistema de Células**: Organización de estudiantes en grupos con asistentes asignados
- **Reportes y Exportación**: Exportación de datos a CSV para análisis
- **Interfaz Moderna**: Diseño responsivo con Tailwind CSS y colores oficiales

## 🛠️ Stack Tecnológico

- **Frontend**: React 18+ con Hooks
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Autenticación**: Firebase Authentication
- **Base de Datos**: Firebase Firestore
- **APIs**: Google Classroom API, Google Calendar API, Google People API
- **Despliegue**: Compatible con Netlify

## 📋 Prerrequisitos

1. **Node.js** (versión 16 o superior)
2. **Cuenta de Google Cloud Platform**
3. **Proyecto de Firebase**
4. **APIs habilitadas en Google Cloud Console**:
   - Google Classroom API
   - Google Calendar API
   - Google People API

## 🔧 Configuración del Proyecto

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd semillero-digital-webapp
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Authentication con el proveedor de Google
4. Habilita Firestore Database
5. Ve a Configuración del Proyecto > General > Tus apps
6. Copia la configuración de Firebase

### 4. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto de Firebase
3. Habilita las siguientes APIs:
   - Google Classroom API
   - Google Calendar API
   - Google People API
4. Configura la pantalla de consentimiento OAuth
5. Agrega los dominios autorizados

### 5. Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita `.env` con tu configuración de Firebase:
```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Opcional: Solo si quieres Google Analytics
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id_aqui
```

### 6. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📊 Estructura de la Base de Datos

### Firestore Collections

#### `users`
```javascript
{
  email: "usuario@email.com",
  name: "Nombre Completo",
  photoURL: "url_de_foto",
  role: "student|assistant|professor|coordinator"
}
```

#### `courses/{courseId}`
```javascript
{
  name: "Nombre del Curso",
  ownerId: "id_del_profesor"
}
```

#### `courses/{courseId}/cells/{cellId}`
```javascript
{
  name: "Célula 1",
  assistantEmail: "asistente@email.com",
  studentEmails: ["estudiante1@email.com", "estudiante2@email.com"]
}
```

#### `courses/{courseId}/attendance/{eventId}`
```javascript
{
  eventSummary: "Título del Evento",
  eventDate: "2024-01-15T10:00:00Z",
  records: {
    "estudiante1@email.com": "presente",
    "estudiante2@email.com": "ausente"
  }
}
```

## 👥 Roles de Usuario

### Estudiante
- Ver progreso personal en tareas
- Consultar calificaciones
- Acceso a enlaces de Google Classroom

### Asistente
- Gestionar células asignadas
- Ver progreso de estudiantes en sus células
- Seguimiento de entregas de tareas

### Profesor/Coordinador
- Vista completa de todos los cursos
- Gestión de asistencia
- Reportes y exportación de datos
- Organización por células

## 🚀 Despliegue

### Netlify

1. Construir la aplicación:
```bash
npm run build
```

2. La carpeta `dist` contiene los archivos para despliegue

3. En Netlify:
   - Conecta tu repositorio
   - Configura las variables de entorno
   - Comando de build: `npm run build`
   - Directorio de publicación: `dist`

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de entorno en tu plataforma de despliegue:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 🔒 Seguridad

- Todas las APIs requieren autenticación
- Los permisos se basan en roles de usuario
- Las reglas de Firestore deben configurarse apropiadamente
- Los tokens de acceso se manejan de forma segura

## 📝 Configuración Inicial de Datos

### Crear Usuarios Iniciales

1. Los usuarios se crean automáticamente al iniciar sesión por primera vez
2. El rol por defecto es "student"
3. Los administradores deben cambiar los roles manualmente en Firestore

### Configurar Células

1. Los profesores/coordinadores pueden crear células desde el dashboard
2. Asignar asistentes a cada célula
3. Agregar estudiantes a las células correspondientes

## 🐛 Solución de Problemas

### Error de Autenticación
- Verifica que las APIs estén habilitadas en Google Cloud Console
- Confirma que los dominios estén autorizados en OAuth
- Revisa la configuración de Firebase Authentication

### Error de Permisos de API
- Asegúrate de que el usuario tenga acceso a Google Classroom
- Verifica que los scopes estén correctamente configurados
- Confirma que el usuario sea profesor o estudiante en los cursos

### Problemas de Firestore
- Revisa las reglas de seguridad de Firestore
- Confirma que el proyecto de Firebase esté correctamente configurado
- Verifica que las colecciones existan

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación, contacta al equipo de desarrollo del Semillero Digital.

---

**Desarrollado con ❤️ para Semillero Digital**
