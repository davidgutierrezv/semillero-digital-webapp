import { useState } from 'react';
import { formatStudentMessage } from '../services/telegramApi';

const TelegramMessageModal = ({ isOpen, onClose, participant, courseName, onSend }) => {
  const [messageType, setMessageType] = useState('welcome');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  const messageTypes = {
    welcome: {
      label: '🎓 Bienvenida',
      description: 'Mensaje de bienvenida al curso',
      placeholder: 'Mensaje personalizado de bienvenida...'
    },
    reminder: {
      label: '⏰ Recordatorio',
      description: 'Recordatorio de clase o actividad',
      placeholder: 'Detalles del recordatorio (fecha, hora, tema)...'
    },
    announcement: {
      label: '📢 Anuncio',
      description: 'Anuncio importante del curso',
      placeholder: 'Contenido del anuncio...'
    }
  };

  const getPreviewMessage = () => {
    if (!participant) return '';
    
    return formatStudentMessage(
      { name: participant.name, email: participant.email },
      courseName,
      messageType,
      customMessage || messageTypes[messageType].placeholder
    );
  };

  const handleSend = async () => {
    try {
      setSending(true);
      
      const message = formatStudentMessage(
        { name: participant.name, email: participant.email },
        courseName,
        messageType,
        customMessage
      );

      await onSend(message);
      onClose();
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setMessageType('welcome');
    setCustomMessage('');
    setSending(false);
    onClose();
  };

  if (!isOpen || !participant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              📱 Enviar Mensaje por Telegram
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={sending}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Participant Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-lg">
                  {participant.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{participant.name}</p>
                <p className="text-sm text-gray-600">{participant.email}</p>
                <p className="text-sm text-blue-600">📱 {participant.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Message Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Mensaje
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(messageTypes).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setMessageType(type)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    messageType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={sending}
                >
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{config.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje Personalizado
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={messageTypes[messageType].placeholder}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={sending}
            />
            <p className="text-xs text-gray-500 mt-1">
              Este mensaje se agregará al template seleccionado
            </p>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista Previa del Mensaje
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Semillero Digital Bot</span>
                </div>
                <div className="text-sm text-gray-800 whitespace-pre-line">
                  {getPreviewMessage()}
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-800 text-sm font-medium">Nota Importante</p>
                <p className="text-yellow-700 text-xs mt-1">
                  El usuario debe haber iniciado una conversación con el bot de Telegram previamente para recibir mensajes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={sending}
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !customMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                <span>Enviar Mensaje</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramMessageModal;
