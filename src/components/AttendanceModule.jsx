import { useState, useEffect } from 'react';
import { getCalendarEvents } from '../services/googleApi';
import { saveAttendanceRecord as saveToFirestore, getAttendanceRecords } from '../services/firestore';
import { getStudentEmail, getStudentName, getStudentId } from '../utils/studentUtils';

const AttendanceModule = ({ courseId, courseName, students, user }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    loadCalendarEvents();
    loadAttendanceHistory();
  }, [courseId]);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = await user.accessToken || user.auth?.currentUser?.accessToken;
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Get events for the next 30 days
      const now = new Date();
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const eventsData = await getCalendarEvents('primary', accessToken, {
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
        maxResults: 20
      });

      // Filter events that might be related to the course
      const courseEvents = eventsData.filter(event => 
        event.summary && (
          event.summary.toLowerCase().includes(courseName.toLowerCase()) ||
          event.summary.toLowerCase().includes('clase') ||
          event.summary.toLowerCase().includes('semillero')
        )
      );

      setEvents(courseEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setError('Error al cargar los eventos del calendario.');
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

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setSuccess(null);
    setError(null);

    // Initialize attendance state for all students
    const initialAttendance = {};
    students.forEach(student => {
      const email = getStudentEmail(student);
      if (email) {
        initialAttendance[email] = 'presente'; // Default to present
      }
    });
    setAttendance(initialAttendance);

    // Load existing attendance if available
    const existingRecord = attendanceHistory.find(record => record.id === event.id);
    if (existingRecord && existingRecord.records) {
      setAttendance(existingRecord.records);
    }
  };

  const handleAttendanceChange = (studentEmail, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentEmail]: status
    }));
  };

  const saveAttendance = async () => {
    if (!selectedEvent) return;

    try {
      setSaving(true);
      setError(null);

      const attendanceData = {
        eventSummary: selectedEvent.summary,
        eventDate: new Date(selectedEvent.start.dateTime || selectedEvent.start.date),
        records: attendance
      };

      await saveAttendanceRecord(courseId, selectedEvent.id, attendanceData);
      
      setSuccess('Asistencia guardada correctamente.');
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
      presente: 'bg-green-500 hover:bg-green-600',
      ausente: 'bg-red-500 hover:bg-red-600',
      justificado: 'bg-yellow-500 hover:bg-yellow-600'
    };
    return colors[status] || 'bg-gray-500 hover:bg-gray-600';
  };

  const formatEventDate = (event) => {
    const date = new Date(event.start.dateTime || event.start.date);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: event.start.dateTime ? '2-digit' : undefined,
      minute: event.start.dateTime ? '2-digit' : undefined
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-medium text-gray-900">
          Módulo de Asistencia
        </h4>
        <button
          onClick={loadCalendarEvents}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? 'Cargando...' : 'Actualizar Eventos'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Event Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Evento/Clase
        </label>
        <select
          value={selectedEvent?.id || ''}
          onChange={(e) => {
            const event = events.find(ev => ev.id === e.target.value);
            handleEventSelect(event);
          }}
          className="input-field"
        >
          <option value="">Selecciona un evento</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.summary} - {formatEventDate(event)}
            </option>
          ))}
        </select>

        {events.length === 0 && !loading && (
          <p className="text-sm text-gray-500 mt-2">
            No se encontraron eventos próximos relacionados con el curso.
          </p>
        )}
      </div>

      {/* Attendance Taking */}
      {selectedEvent && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">
              {selectedEvent.summary}
            </h5>
            <p className="text-sm text-blue-700">
              {formatEventDate(selectedEvent)}
            </p>
          </div>

          {/* Attendance Stats */}
          {Object.keys(attendance).length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {(() => {
                const stats = getAttendanceStats();
                return (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                      <p className="text-sm text-gray-600">Presentes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                      <p className="text-sm text-gray-600">Ausentes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{stats.justified}</p>
                      <p className="text-sm text-gray-600">Justificados</p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Student List */}
          <div className="space-y-3">
            <h6 className="font-medium text-gray-900">Lista de Estudiantes</h6>
            {students.map((student) => {
              const email = getStudentEmail(student);
              const name = getStudentName(student);
              
              if (!email) return null;
              
              return (
                <div key={email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{name}</p>
                    <p className="text-sm text-gray-600">{email}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {['presente', 'ausente', 'justificado'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleAttendanceChange(email, status)}
                        className={`px-3 py-1 text-sm font-medium text-white rounded-md transition-colors duration-200 ${
                          attendance[email] === status 
                            ? getStatusColor(status)
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveAttendance}
              disabled={saving || Object.keys(attendance).length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Asistencia'}
            </button>
          </div>
        </div>
      )}

      {/* Attendance History */}
      {attendanceHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h6 className="font-medium text-gray-900 mb-4">Historial de Asistencia</h6>
          <div className="space-y-2">
            {attendanceHistory.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{record.eventSummary}</p>
                  <p className="text-sm text-gray-600">
                    {record.eventDate?.toDate?.()?.toLocaleDateString('es-ES') || 'Fecha no disponible'}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  {Object.keys(record.records || {}).length} estudiantes registrados
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceModule;
