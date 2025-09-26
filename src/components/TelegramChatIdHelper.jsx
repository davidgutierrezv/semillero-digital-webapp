import { useState } from 'react';
import { saveUserChatId } from '../services/firestore';

const TelegramChatIdHelper = ({ isOpen, onClose, participant, courseId, onSuccess }) => {
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSaveChatId = async () => {
    try {
      setLoading(true);
      
      if (!chatId.trim()) {
        alert('Por favor ingresa tu Chat ID');
        return;
      }
      
      // Validar que sea un número
      if (!/^\d+$/.test(chatId.trim())) {
        alert('El Chat ID debe ser un número');
        return;
      }
      
      await saveUserChatId(courseId, participant.email, chatId.trim(), {
        name: participant.name,
        registeredAt: new Date()
      });
      
      alert('✅ Chat ID guardado correctamente');
      onSuccess && onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error saving chat ID:', error);
      alert('❌ Error al guardar Chat ID');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              🤖 Obtener Chat ID de Telegram
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
          {/* User Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {participant?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{participant?.name}</p>
                <p className="text-sm text-gray-600">{participant?.email}</p>
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Paso 1: Obtener tu Chat ID</h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Abrir Telegram</p>
                    <p className="text-sm text-gray-600">Ve a la aplicación de Telegram</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Buscar @userinfobot</p>
                    <p className="text-sm text-gray-600">
                      Busca y abre una conversación con 
                      <a 
                        href="https://t.me/userinfobot" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 ml-1"
                      >
                        @userinfobot
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Enviar cualquier mensaje</p>
                    <p className="text-sm text-gray-600">El bot te responderá con tu información, incluyendo tu Chat ID</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Copiar tu Chat ID</p>
                    <p className="text-sm text-gray-600">Copia el número que aparece como "Id" (será algo como: 123456789)</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Ya tengo mi Chat ID →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Paso 2: Ingresar Chat ID</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu Chat ID de Telegram
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solo números, sin espacios ni caracteres especiales
                </p>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">Importante</p>
                    <p className="text-yellow-700 text-xs mt-1">
                      Asegúrate de copiar exactamente el número que te dio @userinfobot
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleSaveChatId}
                  disabled={loading || !chatId.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Chat ID'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelegramChatIdHelper;
