import { useState, useEffect } from 'react';
import { saveStudentPhone, getStudentData, saveTeacherPhone, getTeacherData } from '../services/firestore';

const PhoneModal = ({ isOpen, onClose, participant, courseId, onSave, participantType = 'student' }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && participant) {
      loadParticipantData();
    }
  }, [isOpen, participant, participantType]);

  const loadParticipantData = async () => {
    try {
      setLoading(true);
      const getData = participantType === 'teacher' ? getTeacherData : getStudentData;
      const participantData = await getData(courseId, participant.email);
      
      if (participantData && participantData.phoneNumber) {
        setPhoneNumber(participantData.phoneNumber);
      } else {
        setPhoneNumber('');
      }
    } catch (error) {
      console.error('Error loading participant data:', error);
      setPhoneNumber('');
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phone) => {
    // Validar formato de teléfono (permite varios formatos internacionales)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
  };

  const formatPhoneNumber = (phone) => {
    // Limpiar el número de caracteres especiales excepto +
    return phone.replace(/[^\d\+]/g, '');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const cleanPhone = formatPhoneNumber(phoneNumber);
      
      if (!cleanPhone) {
        setError('Por favor ingresa un número de teléfono');
        return;
      }

      if (!validatePhoneNumber(cleanPhone)) {
        setError('Por favor ingresa un número de teléfono válido (mínimo 10 dígitos)');
        return;
      }

      const participantData = {
        name: participant.name,
        email: participant.email,
        userId: participant.userId,
        profileId: participant.profileId
      };

      const saveFunction = participantType === 'teacher' ? saveTeacherPhone : saveStudentPhone;
      await saveFunction(courseId, participant.email, cleanPhone, participantData);
      
      setSuccess(true);
      setTimeout(() => {
        onSave && onSave(cleanPhone);
        onClose();
        setSuccess(false);
      }, 1500);

    } catch (error) {
      console.error('Error saving phone number:', error);
      setError('Error al guardar el número de teléfono');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const isTeacher = participantType === 'teacher';
  const title = isTeacher ? '👨‍🏫 Configurar Teléfono - Profesor' : '👨‍🎓 Configurar Teléfono - Estudiante';
  const description = isTeacher 
    ? 'Este número se usará para comunicación entre coordinadores y profesores.'
    : 'Este número se usará para enviar mensajes automáticos y agregar al grupo de Telegram del curso.';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={handleClose}
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
          {/* Participant Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isTeacher ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                <span className={`font-medium ${
                  isTeacher ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {participant?.name?.charAt(0).toUpperCase() || (isTeacher ? 'P' : 'E')}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{participant?.name}</p>
                <p className="text-sm text-gray-600">{participant?.email}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                  isTeacher 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isTeacher ? 'Profesor' : 'Estudiante'}
                </span>
              </div>
            </div>
          </div>

          {/* Phone Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Teléfono
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+57 300 123 4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: +57 300 123 4567 (incluye código de país)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 text-sm">¡Número guardado correctamente!</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className={`mb-4 p-3 rounded-lg border ${
            isTeacher 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start">
              <svg className={`w-5 h-5 mr-2 mt-0.5 ${
                isTeacher ? 'text-green-400' : 'text-blue-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className={`font-medium text-sm ${
                  isTeacher ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {isTeacher ? 'Comunicación Profesional' : 'Integración con Telegram'}
                </p>
                <p className={`text-xs mt-1 ${
                  isTeacher ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {description}
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
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || success}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 ${
              isTeacher 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : success ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Guardado</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Guardar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneModal;
