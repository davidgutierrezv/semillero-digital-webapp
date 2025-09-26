import { useState, useEffect } from 'react';
import { getAttendanceRecords } from '../services/firestore';
import { getStudentEmail, getStudentName } from '../utils/studentUtils';

const AnalyticsView = ({ 
  role, 
  courseId, 
  courseName, 
  students = [], 
  courseWork = [], 
  cells = [],
  filteredStudents = null,
  cellName = null,
  user 
}) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determinar qué estudiantes usar según el rol
  const studentsToAnalyze = role === 'coordinator' && filteredStudents ? filteredStudents : students;

  useEffect(() => {
    if (courseId && studentsToAnalyze.length > 0) {
      loadAnalyticsData();
    }
  }, [courseId, studentsToAnalyze]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // Cargar datos de asistencia de los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const attendanceRecords = await getAttendanceRecords(courseId);
      setAttendanceData(attendanceRecords);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas de asistencia
  const getAttendanceStats = () => {
    const studentEmails = studentsToAnalyze.map(s => getStudentEmail(s));
    const relevantRecords = attendanceData.filter(record => 
      studentEmails.includes(record.studentEmail)
    );

    const totalRecords = relevantRecords.length;
    const presentRecords = relevantRecords.filter(r => r.status === 'presente').length;
    const absentRecords = relevantRecords.filter(r => r.status === 'ausente').length;
    const justifiedRecords = relevantRecords.filter(r => r.status === 'justificado').length;

    return {
      total: totalRecords,
      present: presentRecords,
      absent: absentRecords,
      justified: justifiedRecords,
      attendanceRate: totalRecords > 0 ? ((presentRecords + justifiedRecords) / totalRecords * 100).toFixed(1) : 0
    };
  };

  // Calcular estadísticas de trabajos
  const getAssignmentStats = () => {
    const totalAssignments = courseWork.length;
    const publishedAssignments = courseWork.filter(w => w.state === 'PUBLISHED').length;
    const draftAssignments = courseWork.filter(w => w.state === 'DRAFT').length;
    const upcomingDeadlines = courseWork.filter(w => 
      w.dueDate && new Date(w.dueDate.date) > new Date()
    ).length;

    return {
      total: totalAssignments,
      published: publishedAssignments,
      drafts: draftAssignments,
      upcoming: upcomingDeadlines
    };
  };

  // Calcular estadísticas por estudiante (para coordinador)
  const getStudentAnalytics = () => {
    return studentsToAnalyze.map(student => {
      const email = getStudentEmail(student);
      const name = getStudentName(student);
      
      const studentAttendance = attendanceData.filter(r => r.studentEmail === email);
      const presentCount = studentAttendance.filter(r => r.status === 'presente').length;
      const totalCount = studentAttendance.length;
      const attendanceRate = totalCount > 0 ? (presentCount / totalCount * 100).toFixed(1) : 0;
      
      // Determinar riesgo
      const isAtRisk = attendanceRate < 80 || totalCount < 3;
      
      return {
        email,
        name,
        attendanceRate,
        totalClasses: totalCount,
        presentClasses: presentCount,
        isAtRisk
      };
    });
  };

  const attendanceStats = getAttendanceStats();
  const assignmentStats = getAssignmentStats();
  const studentAnalytics = getStudentAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  // Dashboard del Profesor
  if (role === 'professor') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            📊 Analíticas del Curso - {courseName}
          </h2>
          <div className="text-sm text-gray-600">
            Visión estratégica del curso completo
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Asistencia</p>
                <p className="text-2xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estudiantes Activos</p>
                <p className="text-2xl font-bold text-green-600">{students.length}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trabajos Publicados</p>
                <p className="text-2xl font-bold text-yellow-600">{assignmentStats.published}</p>
              </div>
              <div className="text-3xl">📝</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Células Activas</p>
                <p className="text-2xl font-bold text-red-600">{cells.length}</p>
              </div>
              <div className="text-3xl">🏘️</div>
            </div>
          </div>
        </div>

        {/* Comparativa por Células */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📊 Rendimiento por Células
          </h3>
          <div className="space-y-4">
            {cells.map((cell, index) => {
              const cellStudentEmails = cell.studentEmails || [];
              const cellAttendance = attendanceData.filter(r => 
                cellStudentEmails.includes(r.studentEmail)
              );
              const cellRate = cellAttendance.length > 0 ? 
                (cellAttendance.filter(r => r.status === 'presente').length / cellAttendance.length * 100).toFixed(1) : 0;

              return (
                <div key={cell.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{cell.name}</div>
                      <div className="text-sm text-gray-600">
                        Coordinador: {cell.assistantName || cell.assistantEmail}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{cellRate}%</div>
                    <div className="text-sm text-gray-600">{cellStudentEmails.length} estudiantes</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución de Asistencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              📈 Estadísticas de Asistencia
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Presentes</span>
                <span className="font-medium text-green-600">{attendanceStats.present}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ausentes</span>
                <span className="font-medium text-red-600">{attendanceStats.absent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Justificados</span>
                <span className="font-medium text-yellow-600">{attendanceStats.justified}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              📝 Estado de Trabajos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-medium text-gray-900">{assignmentStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Publicados</span>
                <span className="font-medium text-green-600">{assignmentStats.published}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Borradores</span>
                <span className="font-medium text-yellow-600">{assignmentStats.drafts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard del Coordinador
  if (role === 'coordinator') {
    const groupStats = getAttendanceStats();
    const studentsAtRisk = studentAnalytics.filter(s => s.isAtRisk);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            📊 Analíticas de {cellName}
          </h2>
          <div className="text-sm text-gray-600">
            Gestión táctica de tu célula
          </div>
        </div>

        {/* KPIs del Grupo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asistencia del Grupo</p>
                <p className="text-2xl font-bold text-blue-600">{groupStats.attendanceRate}%</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estudiantes Activos</p>
                <p className="text-2xl font-bold text-green-600">{studentsToAnalyze.length}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estudiantes en Riesgo</p>
                <p className="text-2xl font-bold text-red-600">{studentsAtRisk.length}</p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>
        </div>

        {/* Tabla de Rendimiento Individual */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            👥 Rendimiento Individual de Estudiantes
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asistencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentAnalytics.map((student) => (
                  <tr key={student.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.attendanceRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.presentClasses} / {student.totalClasses}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.isAtRisk ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          🔥 En Riesgo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Bien
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trabajos Próximos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📅 Próximos Trabajos
          </h3>
          {courseWork.filter(w => w.dueDate && new Date(w.dueDate.date) > new Date()).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay trabajos próximos</p>
          ) : (
            <div className="space-y-3">
              {courseWork
                .filter(w => w.dueDate && new Date(w.dueDate.date) > new Date())
                .slice(0, 5)
                .map((work, index) => (
                  <div key={work.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 text-sm">📝</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{work.title}</div>
                        <div className="text-sm text-gray-600">
                          Vence: {new Date(work.dueDate.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {studentsToAnalyze.length} estudiantes
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard del Estudiante
  if (role === 'student') {
    const myEmail = user?.email;
    const myAttendance = attendanceData.filter(r => r.studentEmail === myEmail);
    const myAttendanceRate = myAttendance.length > 0 ? 
      (myAttendance.filter(r => r.status === 'presente').length / myAttendance.length * 100).toFixed(1) : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            📊 Mi Progreso Personal
          </h2>
          <div className="text-sm text-gray-600">
            Tu rendimiento y próximas tareas
          </div>
        </div>

        {/* Mi Progreso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mi Asistencia</p>
                <p className="text-2xl font-bold text-blue-600">{myAttendanceRate}%</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clases Asistidas</p>
                <p className="text-2xl font-bold text-green-600">
                  {myAttendance.filter(r => r.status === 'presente').length}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Clases</p>
                <p className="text-2xl font-bold text-yellow-600">{myAttendance.length}</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>
        </div>

        {/* Próximas Tareas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📋 ¿Qué Tengo que Hacer Ahora?
          </h3>
          {courseWork.filter(w => w.dueDate && new Date(w.dueDate.date) > new Date()).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-gray-500">¡No tienes tareas pendientes!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courseWork
                .filter(w => w.dueDate && new Date(w.dueDate.date) > new Date())
                .slice(0, 5)
                .map((work, index) => {
                  const daysLeft = Math.ceil((new Date(work.dueDate.date) - new Date()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 3;

                  return (
                    <div key={work.id || index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                      isUrgent ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isUrgent ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <span className={`text-sm ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
                            {isUrgent ? '🔥' : '📝'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{work.title}</div>
                          <div className="text-sm text-gray-600">
                            Vence: {new Date(work.dueDate.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                          {daysLeft} día{daysLeft !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isUrgent ? 'Urgente' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Mi Historial de Asistencia */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📅 Mi Historial de Asistencia
          </h3>
          {myAttendance.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay registros de asistencia</p>
          ) : (
            <div className="space-y-2">
              {myAttendance.slice(-10).reverse().map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    record.status === 'presente' ? 'bg-green-100 text-green-800' :
                    record.status === 'justificado' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status === 'presente' ? '✅ Presente' :
                     record.status === 'justificado' ? '📝 Justificado' :
                     '❌ Ausente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div>Rol no reconocido</div>;
};

export default AnalyticsView;
