/**
 * Telegram Bot API Integration
 * Funciones para enviar mensajes y gestionar grupos de Telegram
 */

// Configuración del bot (estas variables deberían estar en variables de entorno)
const TELEGRAM_BOT_TOKEN = import.meta.env?.VITE_TELEGRAM_BOT_TOKEN || window.REACT_APP_TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = TELEGRAM_BOT_TOKEN ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}` : null;

/**
 * Enviar mensaje a un chat_id específico
 * @param {string} chatId - Chat ID del usuario en Telegram
 * @param {string} message - Mensaje a enviar
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const sendMessageToChatId = async (chatId, message) => {
  try {
    console.log('📱 Telegram: Sending message to chat_id:', chatId);
    
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('Telegram Bot Token no configurado');
    }

    if (!TELEGRAM_API_URL) {
      throw new Error('Telegram API URL no disponible');
    }
    
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Error enviando mensaje');
    }

    console.log('✅ Telegram: Message sent successfully');
    return data;
    
  } catch (error) {
    console.error('🚨 Telegram Error sending message:', error);
    throw error;
  }
};

/**
 * Enviar mensaje a un usuario por email (busca su chat_id)
 * @param {string} userEmail - Email del usuario
 * @param {string} message - Mensaje a enviar
 * @param {string} courseId - ID del curso
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const sendMessageToUser = async (userEmail, message, courseId) => {
  try {
    console.log('📱 Telegram: Sending message to user:', userEmail);
    
    // Importar función de Firestore para obtener chat_id
    const { getUserChatId } = await import('./firestore');
    
    const chatId = await getUserChatId(courseId, userEmail);
    
    if (!chatId) {
      throw new Error('Usuario no registrado en Telegram. Debe enviar /start al bot primero.');
    }
    
    return await sendMessageToChatId(chatId, message);
    
  } catch (error) {
    console.error('🚨 Telegram Error sending message to user:', error);
    throw error;
  }
};

/**
 * Crear enlace de invitación para grupo de Telegram
 * @param {string} groupId - ID del grupo de Telegram
 * @returns {Promise<string>} - Enlace de invitación
 */
export const createGroupInviteLink = async (groupId) => {
  try {
    console.log('🔗 Telegram: Creating invite link for group:', groupId);
    
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('Telegram Bot Token no configurado');
    }

    const response = await fetch(`${TELEGRAM_API_URL}/createChatInviteLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: groupId,
        name: 'Enlace para estudiantes',
        expire_date: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 días
        member_limit: 100
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Error creando enlace');
    }

    console.log('✅ Telegram: Invite link created successfully');
    return data.result.invite_link;
    
  } catch (error) {
    console.error('🚨 Telegram Error creating invite link:', error);
    throw error;
  }
};

/**
 * Enviar mensaje a un grupo de Telegram
 * @param {string} groupId - ID del grupo
 * @param {string} message - Mensaje a enviar
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const sendMessageToGroup = async (groupId, message) => {
  try {
    console.log('📢 Telegram: Sending message to group:', groupId);
    
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('Telegram Bot Token no configurado');
    }

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: groupId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Error enviando mensaje al grupo');
    }

    console.log('✅ Telegram: Group message sent successfully');
    return data;
    
  } catch (error) {
    console.error('🚨 Telegram Error sending group message:', error);
    throw error;
  }
};

/**
 * Obtener información del bot
 * @returns {Promise<Object>} - Información del bot
 */
export const getBotInfo = async () => {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('Telegram Bot Token no configurado');
    }

    const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Error obteniendo info del bot');
    }

    return data.result;
    
  } catch (error) {
    console.error('🚨 Telegram Error getting bot info:', error);
    throw error;
  }
};

/**
 * Formatear mensaje para estudiante
 * @param {Object} student - Datos del estudiante
 * @param {string} courseName - Nombre del curso
 * @param {string} messageType - Tipo de mensaje ('welcome', 'reminder', 'announcement')
 * @param {string} customMessage - Mensaje personalizado
 * @returns {string} - Mensaje formateado
 */
export const formatStudentMessage = (student, courseName, messageType = 'announcement', customMessage = '') => {
  const studentName = student.name || student.email;
  
  const templates = {
    welcome: `
🎓 <b>¡Bienvenido al Semillero Digital!</b>

Hola ${studentName},

Te damos la bienvenida al curso: <b>${courseName}</b>

📚 Aquí recibirás:
• Recordatorios de clases
• Anuncios importantes
• Material de estudio
• Información sobre tareas

¡Esperamos que tengas una excelente experiencia de aprendizaje!

---
<i>Semillero Digital - Educación de Calidad</i>
    `,
    
    reminder: `
⏰ <b>Recordatorio de Clase</b>

Hola ${studentName},

Te recordamos que tienes clase de <b>${courseName}</b> próximamente.

${customMessage}

¡No faltes!

---
<i>Semillero Digital</i>
    `,
    
    announcement: `
📢 <b>Anuncio Importante</b>

Hola ${studentName},

Curso: <b>${courseName}</b>

${customMessage}

---
<i>Semillero Digital</i>
    `
  };

  return templates[messageType] || templates.announcement;
};

/**
 * Validar configuración de Telegram
 * @returns {Object} - Estado de la configuración
 */
export const validateTelegramConfig = () => {
  return {
    botTokenConfigured: !!TELEGRAM_BOT_TOKEN,
    apiUrl: TELEGRAM_API_URL,
    ready: !!TELEGRAM_BOT_TOKEN
  };
};
