import { useState, useEffect } from 'react';
import { saveAttendanceRecord as saveToFirestore, getAttendanceRecords } from '../services/firestore';
import { getStudentEmail, getStudentName, getStudentId } from '../utils/studentUtils';

const AttendanceModule = ({ courseId, courseName, students, user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'present', 'absent'

  useEffect(() => {
    loadAttendanceHistory();
    initializeAttendance();
  }, [courseId, students]);

  useEffect(() => {
    loadAttendanceForDate();
  }, [selectedDate]);

  const initializeAttendance = () => {
    // Inicializar asistencia para todos los estudiantes
    const initialAttendance = {};
    students.forEach(student => {
      const email = getStudentEmail(student);
      if (email) {
        initialAttendance[email] = 'presente'; // Por defecto presente
      }
    });
    setAttendance(initialAttendance);
  };

  const loadAttendanceForDate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar asistencia existente para la fecha seleccionada
      const records = await getAttendanceRecords(courseId, selectedDate);
      const attendanceMap = {};
      
      // Inicializar todos los estudiantes como presentes
      students.forEach(student => {
        const email = getStudentEmail(student);
        if (email) {
          attendanceMap[email] = 'presente';
        }
      });
      
      // Sobrescribir con datos existentes
      records.forEach(record => {
        attendanceMap[record.studentEmail] = record.status;
      });

      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error loading attendance for date:', error);
      setError('Error al cargar la asistencia para esta fecha');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      const history = await getAttendanceRecords(courseId);
      setAttendanceHistory(history);
    } catch (error) {
      console.error('Error loading attendance history:', error);
    }
  };

  const handleAttendanceChange = (studentEmail, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentEmail]: status
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      const email = getStudentEmail(student);
      if (email) {
        newAttendance[email] = status;
      }
    });
    setAttendance(newAttendance);
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Guardar cada registro de asistencia individualmente
      const savePromises = [];
      
      Object.entries(attendance).forEach(([studentEmail, status]) => {
        const student = students.find(s => getStudentEmail(s) === studentEmail);
        if (student) {
          const attendanceData = {
            courseId,
            courseName,
            date: selectedDate,
            studentEmail,
            studentName: getStudentName(student),
            studentId: student.userId,
            status,
            recordedBy: user.email,
            recordedAt: new Date().toISOString()
          };
          
          savePromises.push(
            saveToFirestore(courseId, `${selectedDate}_${studentEmail}`, attendanceData)
          );
        }
      });

      await Promise.all(savePromises);
      
      setSuccess(`Asistencia guardada correctamente para ${Object.keys(attendance).length} estudiantes.`);
      await loadAttendanceHistory(); // Refresh history
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError('Error al guardar la asistencia. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const total = Object.keys(attendance).length;
    const present = Object.values(attendance).filter(status => status === 'presente').length;
    const absent = Object.values(attendance).filter(status => status === 'ausente').length;
    const justified = Object.values(attendance).filter(status => status === 'justificado').length;

    return { total, present, absent, justified };
  };

  const getStatusColor = (status) => {
    const colors = {
      presente: 'bg-green-100 text-green-800 border-green-200',
      ausente: 'bg-red-100 text-red-800 border-red-200',
      justificado: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusButtonColor = (status, isSelected) => {
    if (!isSelected) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    
    const colors = {
      presente: 'bg-green-500 text-white hover:bg-green-600',
      ausente: 'bg-red-500 text-white hover:bg-red-600',
      justificado: 'bg-yellow-500 text-white hover:bg-yellow-600'
    };
    return colors[status] || 'bg-gray-500 text-white hover:bg-gray-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFilteredHistory = () => {
    if (historyFilter === 'all') return attendanceHistory;
    return attendanceHistory.filter(record => record.status === historyFilter.replace('present', 'presente').replace('absent', 'ausente'));
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Registro de Asistencia - {courseName}
          </h3>
          <p className="text-sm text-gray-600">
            Registra la asistencia de todos los estudiantes para una fecha específica
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{showHistory ? 'Ocultar Historial' : 'Ver Historial'}</span>
          </button>
          
          <button
            onClick={loadAttendanceForDate}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Cargando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {!showHistory && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Date Selection */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">Seleccionar Fecha</h4>
                <p className="text-sm text-gray-600">Elige la fecha para registrar asistencia</p>
              </div>
              
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="text-center">
              <h5 className="text-xl font-semibold text-gray-900">
                {formatDate(selectedDate)}
              </h5>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Acciones Rápidas</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMarkAll('presente')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Marcar Todos Presentes
                </button>
                <button
                  onClick={() => handleMarkAll('ausente')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Marcar Todos Ausentes
                </button>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <div className="text-sm text-green-600">Presentes</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <div className="text-sm text-red-600">Ausentes</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.justified}</div>
                <div className="text-sm text-yellow-600">Justificados</div>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Lista de Estudiantes ({students.length})
            </h4>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-2"></div>
                <span className="text-gray-600">Cargando estudiantes...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">👥</div>
                <p>No hay estudiantes registrados en este curso</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => {
                  const email = getStudentEmail(student);
                  const name = getStudentName(student);
                  const currentStatus = attendance[email] || 'presente';
                  
                  return (
                    <div key={getStudentId(student)} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{name}</div>
                          <div className="text-sm text-gray-500">{email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(currentStatus)}`}>
                          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {['presente', 'ausente', 'justificado'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleAttendanceChange(email, status)}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                getStatusButtonColor(status, currentStatus === status)
                              }`}
                            >
                              {status === 'presente' && '✓'}
                              {status === 'ausente' && '✗'}
                              {status === 'justificado' && '!'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Registrando asistencia para {formatDate(selectedDate)}
              </div>
              <button
                onClick={saveAttendance}
                disabled={saving || students.length === 0}
                className="btn-primary flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Guardar Asistencia</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History View */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Historial de Asistencia</h4>
              
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Todos los registros</option>
                <option value="present">Solo presentes</option>
                <option value="absent">Solo ausentes</option>
                <option value="justificado">Solo justificados</option>
              </select>
            </div>
          </div>
          
          <div className="p-6">
            {attendanceHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <p>No hay registros de asistencia aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredHistory().slice(0, 50).map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          {record.studentName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{record.studentName || record.studentEmail}</div>
                        <div className="text-sm text-gray-500">{record.studentEmail}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString('es-ES')}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {getFilteredHistory().length > 50 && (
                  <div className="text-center py-4 text-gray-500">
                    Mostrando los primeros 50 registros de {getFilteredHistory().length} total
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceModule;
