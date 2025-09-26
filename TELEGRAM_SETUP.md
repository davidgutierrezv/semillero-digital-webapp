# 📱 Configuración de Telegram Bot para Semillero Digital

Esta guía te ayudará a configurar un bot de Telegram para enviar mensajes automáticos a los estudiantes y gestionar grupos del curso.

## 🤖 Crear un Bot de Telegram

### Paso 1: Contactar a BotFather
1. Abre Telegram y busca `@BotFather`
2. Inicia una conversación con `/start`
3. Crea un nuevo bot con `/newbot`
4. Sigue las instrucciones:
   - Nombre del bot: `Semillero Digital Bot`
   - Username del bot: `semillero_digital_bot` (debe terminar en `_bot`)

### Paso 2: Obtener el Token
1. BotFather te dará un **token** como: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
2. **¡GUARDA ESTE TOKEN DE FORMA SEGURA!**

### Paso 3: Configurar Variables de Entorno
Agrega el token a tu archivo `.env`:

```bash
# Para Vite (recomendado)
VITE_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# O para Create React App (alternativo)
REACT_APP_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Nota:** Si usas Vite, usa `VITE_TELEGRAM_BOT_TOKEN`. Si usas Create React App, usa `REACT_APP_TELEGRAM_BOT_TOKEN`.

## 🔧 Configuración del Bot

### Comandos Básicos del Bot
Configura estos comandos con BotFather usando `/setcommands`:

```
start - Iniciar el bot y registrarse
help - Mostrar ayuda
info - Información del curso
unsubscribe - Cancelar notificaciones
```

### Descripción del Bot
Usa `/setdescription` con BotFather:

```
Bot oficial del Semillero Digital. Recibe notificaciones sobre clases, tareas y anuncios importantes de tu curso.
```

## 👥 Crear Grupo del Curso

### Paso 1: Crear el Grupo
1. Crea un nuevo grupo en Telegram
2. Nómbralo: `Semillero Digital - [Nombre del Curso]`
3. Agrega el bot como administrador

### Paso 2: Obtener el Chat ID del Grupo
1. Agrega el bot al grupo
2. Envía un mensaje en el grupo
3. Ve a: `https://api.telegram.org/bot[TOKEN]/getUpdates`
4. Busca el `chat.id` del grupo (número negativo)

### Paso 3: Configurar Permisos del Bot
El bot necesita estos permisos como administrador:
- ✅ Enviar mensajes
- ✅ Eliminar mensajes
- ✅ Invitar usuarios
- ✅ Gestionar chat de voz/video

## 🚀 Funcionalidades Implementadas

### 📱 Gestión de Teléfonos
- **Agregar/Editar teléfono**: Los profesores pueden agregar números de teléfono a los estudiantes
- **Validación**: Formato internacional con código de país
- **Almacenamiento**: Guardado seguro en Firestore

### 📨 Envío de Mensajes
- **Mensajes individuales**: A estudiantes específicos
- **Mensajes grupales**: A todo el grupo del curso
- **Plantillas**: Bienvenida, recordatorios, anuncios

### 🔗 Enlaces de Invitación
- **Generación automática**: Enlaces temporales para unirse al grupo
- **Límites configurables**: Número máximo de miembros
- **Expiración**: Enlaces con fecha de vencimiento

## 📋 Uso en la Aplicación
### Para Profesores:

1. **Agregar Teléfonos**:
   - Ve a `Participantes` → Estudiantes
   - Haz clic en el ícono  junto al estudiante
            <div>
              <p className="text-yellow-800 font-medium">Telegram no configurado</p>
              <p className="text-yellow-700 text-sm mt-1">
                Para habilitar el envío de mensajes por Telegram, configura la variable de entorno VITE_TELEGRAM_BOT_TOKEN o REACT_APP_TELEGRAM_BOT_TOKEN
              </p>
            </div>
   - Enviar anuncios al grupo
   - Moderar conversaciones

### Para Estudiantes:
   - Buscar el bot: `@semillero_digital_bot`
   - Enviar `/start`
   - Seguir instrucciones de registro

2. **Unirse al Grupo**:
   - Usar el enlace de invitación proporcionado
   - Seguir las reglas del grupo

## 🔒 Seguridad y Privacidad

### Protección de Datos
- Los números de teléfono se almacenan encriptados
- Solo profesores autorizados pueden ver/editar teléfonos
- Los mensajes se envían de forma segura a través de la API de Telegram

### Buenas Prácticas
- **No compartir el token** del bot públicamente
- **Usar variables de entorno** para configuración sensible
- **Revisar permisos** del bot regularmente
- **Moderar grupos** activamente

## 🛠️ Solución de Problemas

### Bot no responde
1. Verificar que el token esté correcto
2. Comprobar que el bot esté activo
3. Revisar permisos del bot

### No se pueden enviar mensajes
1. Verificar que el usuario haya iniciado conversación con el bot
2. Comprobar que el bot tenga permisos en el grupo
3. Validar el formato del número de teléfono

### Errores de API
1. Revisar límites de rate limiting de Telegram
2. Verificar que los IDs de chat sean correctos
3. Comprobar conectividad a internet

## 📚 Recursos Adicionales

- [Documentación oficial de Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather Commands](https://core.telegram.org/bots#6-botfather)
- [Telegram Bot Examples](https://github.com/python-telegram-bot/python-telegram-bot/tree/master/examples)

## 🆘 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs de la consola del navegador
2. Verifica las variables de entorno
3. Comprueba la configuración del bot con BotFather
4. Contacta al equipo de desarrollo

---

**¡Listo!** Tu bot de Telegram está configurado y listo para mejorar la comunicación con los estudiantes del Semillero Digital. 🎓📱
