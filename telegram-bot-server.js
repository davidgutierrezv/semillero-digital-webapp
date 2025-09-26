/**
 * Servidor del Bot de Telegram para Semillero Digital
 * Este servidor captura los chat_ids reales cuando los usuarios envían /start
 */

const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// Configuración
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Inicializar Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Estado temporal para registro de usuarios
const registrationState = new Map();

// Comando /start - Iniciar registro
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  console.log(`📱 Usuario ${firstName} (${chatId}) inició conversación`);
  
  // Iniciar proceso de registro
  registrationState.set(chatId, { step: 'waiting_email' });
  
  const welcomeMessage = `🎓 ¡Hola ${firstName}! Bienvenido al Semillero Digital.

Para completar tu registro y recibir notificaciones del curso, necesito que me proporciones tu email institucional.

📧 Por favor, envía tu email del curso:
Ejemplo: estudiante@gmail.com`;

  await bot.sendMessage(chatId, welcomeMessage);
});

// Comando /help - Ayuda
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `🤖 *Comandos disponibles:*

/start - Iniciar registro
/help - Mostrar esta ayuda
/status - Ver estado de registro
/unregister - Cancelar notificaciones

📚 *¿Qué recibirás?*
• Recordatorios de clases
• Anuncios importantes
• Material de estudio
• Información sobre tareas`;

  await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Comando /status - Estado del registro
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Buscar si el usuario está registrado
    const userQuery = await db.collectionGroup('telegram_users')
      .where('chatId', '==', chatId.toString())
      .get();
    
    if (userQuery.empty) {
      await bot.sendMessage(chatId, '❌ No estás registrado. Envía /start para registrarte.');
    } else {
      const userData = userQuery.docs[0].data();
      await bot.sendMessage(chatId, `✅ Estás registrado como: ${userData.email}\n📅 Desde: ${userData.registeredAt.toDate().toLocaleDateString()}`);
    }
  } catch (error) {
    console.error('Error checking status:', error);
    await bot.sendMessage(chatId, '❌ Error al verificar tu estado.');
  }
});

// Manejar mensajes de texto (para registro de email)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Ignorar comandos
  if (text.startsWith('/')) return;
  
  const userState = registrationState.get(chatId);
  
  if (userState && userState.step === 'waiting_email') {
    await handleEmailRegistration(chatId, text, msg.from);
  }
});

// Función para manejar el registro de email
async function handleEmailRegistration(chatId, email, userInfo) {
  try {
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await bot.sendMessage(chatId, '❌ Email inválido. Por favor, envía un email válido:\nEjemplo: estudiante@gmail.com');
      return;
    }
    
    // Buscar si el email ya está registrado
    const existingQuery = await db.collectionGroup('telegram_users')
      .where('email', '==', email)
      .get();
    
    if (!existingQuery.empty) {
      await bot.sendMessage(chatId, '⚠️ Este email ya está registrado en otro chat.');
      return;
    }
    
    // Buscar cursos donde este email aparece como estudiante o profesor
    const coursesSnapshot = await db.collection('courses').get();
    let registeredInCourses = [];
    
    for (const courseDoc of coursesSnapshot.docs) {
      const courseId = courseDoc.id;
      
      // Verificar en estudiantes
      const studentQuery = await db.collection('courses').doc(courseId)
        .collection('students').where('email', '==', email).get();
      
      // Verificar en profesores  
      const teacherQuery = await db.collection('courses').doc(courseId)
        .collection('teachers').where('email', '==', email).get();
      
      if (!studentQuery.empty || !teacherQuery.empty) {
        // Registrar en este curso
        await db.collection('courses').doc(courseId)
          .collection('telegram_users').doc(email).set({
            email: email,
            chatId: chatId.toString(),
            name: `${userInfo.first_name} ${userInfo.last_name || ''}`.trim(),
            username: userInfo.username || null,
            registeredAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        
        registeredInCourses.push(courseId);
      }
    }
    
    // Limpiar estado de registro
    registrationState.delete(chatId);
    
    if (registeredInCourses.length > 0) {
      const successMessage = `✅ ¡Registro completado exitosamente!

📧 Email: ${email}
🎓 Cursos: ${registeredInCourses.length}
📱 Chat ID: ${chatId}

Ya puedes recibir notificaciones del Semillero Digital. ¡Bienvenido! 🎉`;

      await bot.sendMessage(chatId, successMessage);
      
      console.log(`✅ Usuario registrado: ${email} -> ${chatId} en ${registeredInCourses.length} cursos`);
    } else {
      await bot.sendMessage(chatId, `❌ El email ${email} no está registrado en ningún curso del Semillero Digital.\n\nVerifica que sea el email correcto o contacta a tu profesor.`);
    }
    
  } catch (error) {
    console.error('Error en registro:', error);
    await bot.sendMessage(chatId, '❌ Error al procesar el registro. Intenta nuevamente.');
    registrationState.delete(chatId);
  }
}

// Manejar errores
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

// Manejar cierre del proceso
process.on('SIGINT', () => {
  console.log('🛑 Cerrando bot...');
  bot.stopPolling();
  process.exit(0);
});

console.log('🤖 Bot de Telegram iniciado...');
console.log('📱 Los usuarios pueden enviar /start para registrarse');
