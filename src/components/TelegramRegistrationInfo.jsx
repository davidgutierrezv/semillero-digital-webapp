import { useState } from 'react';
import { getBotInfo } from '../services/telegramApi';

const TelegramRegistrationInfo = ({ isOpen, onClose, botUsername = 'semillero_digital_bot' }) => {
  const [botInfo, setBotInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGetBotInfo = async () => {
    try {
      setLoading(true);
      const info = await getBotInfo();
      setBotInfo(info);
    } catch (error) {
      console.error('Error getting bot info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              🤖 Registro en Telegram Bot
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Regístrate en nuestro Bot!
            </h4>
            <p className="text-gray-600">
              Para recibir mensajes automáticos del Semillero Digital
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Abrir Telegram</p>
                <p className="text-sm text-gray-600">Abre la aplicación de Telegram en tu dispositivo</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Buscar el Bot</p>
                <div className="text-sm text-gray-600">
                  <p>Busca: <code className="bg-gray-100 px-2 py-1 rounded">@{botUsername}</code></p>
                  <p className="mt-1">O haz clic en este enlace:</p>
                  <a 
                    href={`https://t.me/${botUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 mt-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span>t.me/{botUsername}</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Iniciar Conversación</p>
                <p className="text-sm text-gray-600">
                  Haz clic en <strong>"INICIAR"</strong> o envía el comando <code className="bg-gray-100 px-2 py-1 rounded">/start</code>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <p className="font-medium text-gray-900">Seguir Instrucciones</p>
                <p className="text-sm text-gray-600">
                  El bot te guiará para completar tu registro con tu email del curso
                </p>
              </div>
            </div>
          </div>

          {/* Bot Info */}
          {botInfo && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">🤖</span>
                </div>
                <div>
                  <p className="font-medium text-blue-900">{botInfo.first_name}</p>
                  <p className="text-sm text-blue-700">@{botInfo.username}</p>
                </div>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-medium text-green-900 mb-2">📚 Recibirás:</h5>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Recordatorios de clases</li>
              <li>• Anuncios importantes</li>
              <li>• Material de estudio</li>
              <li>• Información sobre tareas</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handleGetBotInfo}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Ver info del bot'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramRegistrationInfo;
