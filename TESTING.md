# Guía de Pruebas - Semillero Digital Dashboard

## Pruebas de Funcionalidad

### 1. Autenticación y Autorización

#### Prueba de Login
- [ ] Abrir la aplicación en `http://localhost:3000`
- [ ] Verificar que aparece la pantalla de login
- [ ] Hacer clic en "Continuar con Google"
- [ ] Verificar que se abre el popup de Google OAuth
- [ ] Completar el login con una cuenta de Google
- [ ] Verificar que se redirige al dashboard apropiado

#### Prueba de Roles
- [ ] **Estudiante**: Verificar que ve el StudentDashboard
- [ ] **Asistente**: Verificar que ve el AssistantDashboard
- [ ] **Profesor**: Verificar que ve el ProfessorDashboard
- [ ] **Coordinador**: Verificar que ve el ProfessorDashboard con funciones adicionales

### 2. Dashboard del Estudiante

#### Funcionalidades Básicas
- [ ] Ver lista de cursos en los que está inscrito
- [ ] Seleccionar un curso del dropdown
- [ ] Ver progreso general (barra de progreso)
- [ ] Ver estadísticas (tareas pendientes, calificadas)

#### Lista de Tareas
- [ ] Ver lista de tareas del curso seleccionado
- [ ] Verificar estados de tareas (Entregado, Calificado, Pendiente, etc.)
- [ ] Ver fechas de vencimiento
- [ ] Hacer clic en "Ver en Classroom" para abrir Google Classroom

#### Estados de Tareas
- [ ] **Entregado**: Tarea enviada pero no calificada
- [ ] **Calificado**: Tarea con calificación asignada
- [ ] **Pendiente**: Tarea no enviada dentro del plazo
- [ ] **Atrasado**: Tarea no enviada después del vencimiento

### 3. Dashboard del Asistente

#### Gestión de Células
- [ ] Ver células asignadas al asistente
- [ ] Ver número de estudiantes por célula
- [ ] Ver nombre del curso de cada célula

#### Seguimiento de Progreso
- [ ] Ver progreso de estudiantes en sus células
- [ ] Ver estado de las últimas 5 tareas por estudiante
- [ ] Verificar que solo ve estudiantes de sus células asignadas

### 4. Dashboard del Profesor/Coordinador

#### Gestión de Cursos
- [ ] Ver lista de cursos que administra
- [ ] Seleccionar un curso del dropdown
- [ ] Ver estadísticas del curso (estudiantes, células, tareas)

#### Vista por Células
- [ ] Ver organización de estudiantes por células
- [ ] Ver asistente asignado a cada célula
- [ ] Ver progreso de estudiantes dentro de cada célula

#### Módulo de Asistencia
- [ ] Hacer clic en "Mostrar Asistencia"
- [ ] Ver eventos del calendario relacionados con el curso
- [ ] Seleccionar un evento
- [ ] Marcar asistencia de estudiantes (Presente, Ausente, Justificado)
- [ ] Guardar registro de asistencia
- [ ] Ver historial de asistencia

#### Exportación de Datos
- [ ] Hacer clic en "Exportar CSV"
- [ ] Verificar que se descarga un archivo CSV
- [ ] Abrir el archivo y verificar que contiene los datos correctos

### 5. Integración con APIs de Google

#### Google Classroom
- [ ] Verificar que los cursos se cargan desde Classroom
- [ ] Verificar que las tareas se sincronizan correctamente
- [ ] Verificar que los estudiantes aparecen en la lista
- [ ] Verificar que las entregas se muestran con el estado correcto

#### Google Calendar
- [ ] Verificar que los eventos del calendario se cargan
- [ ] Verificar que se pueden filtrar eventos por curso
- [ ] Verificar que se pueden crear registros de asistencia

### 6. Persistencia de Datos (Firestore)

#### Usuarios
- [ ] Verificar que el usuario se crea en Firestore al primer login
- [ ] Verificar que el rol se asigna correctamente
- [ ] Cambiar rol manualmente en Firestore y verificar que se refleja en la app

#### Cursos y Células
- [ ] Verificar que los cursos se sincronizan con Firestore
- [ ] Crear células manualmente en Firestore
- [ ] Asignar estudiantes y asistentes a células
- [ ] Verificar que los cambios se reflejan en los dashboards

#### Asistencia
- [ ] Crear un registro de asistencia
- [ ] Verificar que se guarda en Firestore
- [ ] Verificar que aparece en el historial

### 7. Interfaz de Usuario

#### Responsividad
- [ ] Probar en desktop (1920x1080)
- [ ] Probar en tablet (768x1024)
- [ ] Probar en móvil (375x667)
- [ ] Verificar que todos los elementos se adaptan correctamente

#### Estados de Carga
- [ ] Verificar spinners durante la carga de datos
- [ ] Verificar mensajes de "Cargando..."
- [ ] Verificar que no hay contenido roto durante la carga

#### Manejo de Errores
- [ ] Desconectar internet y verificar mensajes de error
- [ ] Probar con usuario sin permisos de Classroom
- [ ] Verificar que los errores se muestran de forma amigable

### 8. Rendimiento

#### Tiempos de Carga
- [ ] Medir tiempo de carga inicial (< 3 segundos)
- [ ] Medir tiempo de cambio entre dashboards (< 1 segundo)
- [ ] Medir tiempo de carga de datos de API (< 5 segundos)

#### Optimización
- [ ] Verificar que no hay llamadas API innecesarias
- [ ] Verificar que los datos se cachean apropiadamente
- [ ] Verificar que no hay memory leaks en navegación

### 9. Seguridad

#### Autenticación
- [ ] Verificar que usuarios no autenticados no pueden acceder
- [ ] Verificar que el token se renueva automáticamente
- [ ] Verificar que el logout funciona correctamente

#### Autorización
- [ ] Verificar que estudiantes no ven datos de otros estudiantes
- [ ] Verificar que asistentes solo ven sus células asignadas
- [ ] Verificar que profesores solo ven sus cursos

### 10. Casos Edge

#### Datos Vacíos
- [ ] Usuario sin cursos asignados
- [ ] Curso sin estudiantes
- [ ] Curso sin tareas
- [ ] Asistente sin células asignadas

#### Datos Corruptos
- [ ] Fechas inválidas en tareas
- [ ] Usuarios con roles inexistentes
- [ ] Referencias a cursos que no existen

#### Conectividad
- [ ] Pérdida de conexión durante uso
- [ ] APIs de Google no disponibles
- [ ] Firestore no disponible

## Checklist de Despliegue

### Antes del Despliegue
- [ ] Todas las pruebas funcionales pasan
- [ ] No hay errores en la consola del navegador
- [ ] No hay warnings críticos en el build
- [ ] Variables de entorno configuradas correctamente
- [ ] Reglas de Firestore actualizadas

### Después del Despliegue
- [ ] Verificar que la aplicación carga en producción
- [ ] Verificar que el login funciona en producción
- [ ] Verificar que las APIs funcionan en producción
- [ ] Verificar que los dominios están autorizados en Google Cloud

## Herramientas de Prueba

### Navegadores
- [ ] Chrome (última versión)
- [ ] Firefox (última versión)
- [ ] Safari (si está en Mac)
- [ ] Edge (si está en Windows)

### Dispositivos
- [ ] Desktop/Laptop
- [ ] Tablet
- [ ] Smartphone

### Cuentas de Prueba
- Crear cuentas de Google para cada rol:
  - [ ] Cuenta de estudiante
  - [ ] Cuenta de asistente
  - [ ] Cuenta de profesor
  - [ ] Cuenta de coordinador

## Reportar Problemas

Al encontrar un problema, documentar:
1. **Pasos para reproducir**
2. **Comportamiento esperado**
3. **Comportamiento actual**
4. **Navegador y versión**
5. **Screenshots/videos si es necesario**
6. **Mensajes de error en consola**

## Automatización (Futuro)

Para implementación futura:
- [ ] Tests unitarios con Jest
- [ ] Tests de integración con Cypress
- [ ] Tests de rendimiento con Lighthouse
- [ ] CI/CD pipeline con GitHub Actions
