import { useState } from 'react';

const CellCard = ({ cell, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = () => {
    if (!cell.assistantEmail) return 'bg-red-100 text-red-800';
    if (!cell.studentEmails || cell.studentEmails.length === 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (!cell.assistantEmail) return 'Sin Coordinador';
    if (!cell.studentEmails || cell.studentEmails.length === 0) return 'Sin Estudiantes';
    return 'Activa';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900">{cell.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            
            {cell.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {cell.description}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <span>👥</span>
                <span>{cell.studentEmails?.length || 0} estudiantes</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <span>📅</span>
                <span>{formatDate(cell.createdAt)}</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={() => onEdit(cell)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar célula"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={() => onDelete(cell.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Eliminar célula"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Assistant Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Coordinador Asignado</h4>
          </div>
          
          {cell.assistantEmail ? (
            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-medium">
                  {cell.assistantName ? cell.assistantName.charAt(0).toUpperCase() : '👤'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {cell.assistantName || 'Coordinador'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {cell.assistantEmail}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-red-50 rounded-lg text-center">
              <p className="text-sm text-red-600">Sin coordinador asignado</p>
            </div>
          )}
        </div>

        {/* Students Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Estudiantes ({
                cell.students && cell.students.length > 0 
                  ? cell.students.length 
                  : (cell.studentEmails?.length || 0)
              })
            </h4>
            
            {((cell.students && cell.students.length > 0) || (cell.studentEmails?.length || 0) > 0) && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>{expanded ? 'Ocultar' : 'Ver todos'}</span>
                <svg 
                  className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          
          {(!cell.students || cell.students.length === 0) && (!cell.studentEmails || cell.studentEmails.length === 0) ? (
            <div className="p-2 bg-yellow-50 rounded-lg text-center">
              <p className="text-sm text-yellow-600">Sin estudiantes asignados</p>
            </div>
          ) : (
            <div className="space-y-1">
              {(() => {
                // Usar el nuevo formato si está disponible, sino usar el legacy
                const studentsToShow = cell.students && cell.students.length > 0 
                  ? cell.students 
                  : (cell.studentEmails || []).map(email => ({ email, name: email }));
                
                return (
                  <>
                    {/* Preview (first 3 students) */}
                    {!expanded && (
                      <>
                        {studentsToShow.slice(0, 3).map((student, index) => {
                          const displayName = student.name || student.email;
                          const displayEmail = student.email;
                          
                          return (
                            <div key={student.email || index} className="flex items-center space-x-2 p-1">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs font-medium">
                                  {displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-900 truncate font-medium">
                                  {displayName}
                                </div>
                                {displayName !== displayEmail && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {displayEmail}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {studentsToShow.length > 3 && (
                          <div className="text-xs text-gray-500 pl-8">
                            +{studentsToShow.length - 3} estudiantes más...
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Full list */}
                    {expanded && (
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {studentsToShow.map((student, index) => {
                          const displayName = student.name || student.email;
                          const displayEmail = student.email;
                          
                          return (
                            <div key={student.email || index} className="flex items-center space-x-2 p-1">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs font-medium">
                                  {displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-900 truncate font-medium">
                                  {displayName}
                                </div>
                                {displayName !== displayEmail && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {displayEmail}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Creada: {formatDate(cell.createdAt)}
          </span>
          {cell.updatedAt && cell.updatedAt !== cell.createdAt && (
            <span>
              Actualizada: {formatDate(cell.updatedAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CellCard;
