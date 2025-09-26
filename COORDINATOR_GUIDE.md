# 👨‍🏫 Guía del Sistema de Coordinador (Asistente)

## 📋 Descripción General

El sistema de coordinador permite a profesores asignados como asistentes de células específicas gestionar únicamente los estudiantes de su célula asignada, proporcionando una vista enfocada y responsabilidades delimitadas.

## 🎯 Características Principales

### ✅ Vista Filtrada
- **Solo estudiantes de su célula**: El coordinador ve únicamente los estudiantes asignados a su célula
- **Múltiples células**: Si está asignado a varias células, puede alternar entre ellas
- **Interfaz simplificada**: Sin acceso a funciones de profesor principal

### ✅ Funcionalidades Disponibles
- **📊 Dashboard de Resumen**: Estadísticas y vista general de la célula
- **👥 Gestión de Estudiantes**: Lista, búsqueda y comunicación con estudiantes
- **📋 Registro de Asistencia**: Control de asistencia específico de la célula
- **📱 Comunicación**: Telegram y gestión de teléfonos de estudiantes

## 🚀 Cómo Usar el Sistema

### Paso 1: Asignación como Coordinador
1. El **profesor principal** crea o edita una célula
2. En el formulario, selecciona un **profesor del curso** como asistente
3. El sistema guarda la asignación automáticamente

### Paso 2: Acceso del Coordinador
1. El **coordinador** inicia sesión en la aplicación
2. Selecciona el rol **"Asistente"** en el selector de roles
3. El sistema carga automáticamente sus células asignadas

### Paso 3: Gestión de la Célula
1. **Dashboard**: Ve estadísticas y resumen de su célula
2. **Estudiantes**: Gestiona comunicación y datos de contacto
3. **Asistencia**: Registra asistencia solo de sus estudiantes

## 📱 Funcionalidades por Pestaña

### 📊 **Pestaña Resumen**
```
┌─────────────────────────────────────────┐
│ 📊 Información de la Célula             │
├─────────────────────────────────────────┤
│ [15] Estudiantes  [Curso X]  [Célula A] │
│                                         │
│ 📝 Descripción: Célula enfocada en...   │
│                                         │
│ 👥 Vista Previa de Estudiantes          │
│ • Juan Pérez                            │
│ • María García                          │
│ • Carlos López                          │
│ ...                                     │
└─────────────────────────────────────────┘
```

### 👥 **Pestaña Estudiantes**
- Lista completa de estudiantes de la célula
- Búsqueda y filtrado
- Gestión de teléfonos
- Comunicación por Telegram
- Registro de chat IDs

### 📋 **Pestaña Asistencia**
- Registro de asistencia por fecha
- Solo estudiantes de la célula
- Historial de asistencia
- Estadísticas de presencia

## 🔧 Configuración Técnica

### Estructura de Datos
```javascript
// Célula con asistente asignado
{
  id: "cell_123",
  name: "Célula A",
  courseId: "course_456",
  courseName: "Matemáticas Avanzadas",
  assistantEmail: "coordinador@colegio.edu",
  assistantName: "Prof. Juan Pérez",
  studentEmails: ["estudiante1@email.com", "estudiante2@email.com"],
  students: [
    {
      email: "estudiante1@email.com",
      name: "Ana García",
      userId: "123456789"
    }
  ]
}
```

### Funciones Principales
```javascript
// Obtener células asignadas a un coordinador
getCellsByAssistant(assistantEmail)

// Componentes con vista filtrada
<ParticipantsView 
  filteredStudents={cellStudents}
  isCoordinatorView={true}
  cellName={selectedCell.name}
/>

<AttendanceModule 
  filteredStudents={cellStudents}
  isCoordinatorView={true}
  cellName={selectedCell.name}
/>
```

## 🎨 Interfaz de Usuario

### Selector de Células (Múltiples Asignaciones)
```
Seleccionar Célula: [Matemáticas - Célula A (15 estudiantes) ▼]
                   [Física - Célula B (12 estudiantes)      ]
                   [Química - Célula C (18 estudiantes)     ]
```

### Estados Visuales
- **🟢 Con Estudiantes**: Célula activa con estudiantes asignados
- **🟡 Sin Estudiantes**: Célula creada pero sin estudiantes
- **🔵 Múltiples Células**: Selector disponible para alternar

## ⚠️ Limitaciones y Permisos

### ✅ **Permitido**
- Ver estudiantes de su célula
- Registrar asistencia de su célula
- Comunicarse con sus estudiantes
- Ver historial de su célula

### ❌ **No Permitido**
- Ver estudiantes de otras células
- Crear o eliminar células
- Ver información de profesores
- Acceder a datos de todo el curso

## 🔄 Flujo de Trabajo Típico

1. **Mañana**: Revisar resumen de la célula
2. **Durante Clase**: Registrar asistencia de estudiantes
3. **Comunicación**: Enviar recordatorios por Telegram
4. **Seguimiento**: Revisar historial de asistencia
5. **Coordinación**: Reportar al profesor principal si es necesario

## 🆘 Solución de Problemas

### "No hay células asignadas"
- Verificar que el profesor principal haya asignado células
- Confirmar que el email coincida exactamente
- Contactar al administrador del curso

### "No se cargan estudiantes"
- Verificar conexión con Google Classroom
- Confirmar que la célula tenga estudiantes asignados
- Refrescar la página

### "Error de permisos"
- Verificar rol de "Asistente" seleccionado
- Confirmar acceso a Google Classroom
- Revisar configuración de Firebase

## 📞 Soporte

Para problemas técnicos o dudas sobre el sistema:
1. Revisar esta documentación
2. Contactar al profesor principal del curso
3. Reportar bugs al equipo de desarrollo

---

**Versión**: 1.0  
**Última actualización**: 2024  
**Desarrollado por**: Equipo Semillero Digital
