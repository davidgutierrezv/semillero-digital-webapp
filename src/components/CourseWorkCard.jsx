import { useState } from 'react';

const CourseWorkCard = ({ coursework, onViewDetails, showSubmissions = false }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = (status) => {
    const badges = {
      'SUBMITTED': { text: 'Entregado', color: 'bg-green-100 text-green-800' },
      'TURNED_IN': { text: 'Entregado', color: 'bg-green-100 text-green-800' },
      'GRADED': { text: 'Calificado', color: 'bg-blue-100 text-blue-800' },
      'NOT_SUBMITTED': { text: 'Pendiente', color: 'bg-gray-100 text-gray-800' },
      'NOT_ASSIGNED': { text: 'No asignado', color: 'bg-orange-100 text-orange-800' },
      'OVERDUE': { text: 'Atrasado', color: 'bg-red-100 text-red-800' },
      'RETURNED': { text: 'Devuelto', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const badge = badges[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const renderMaterials = (materials) => {
    if (!materials || materials.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        <h5 className="text-sm font-medium text-gray-700">Materiales adjuntos:</h5>
        <div className="space-y-1">
          {materials.map((material, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {material.driveFile && (
                <>
                  <span className="text-blue-500">📎</span>
                  <a 
                    href={material.driveFile.driveFile?.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {material.driveFile.driveFile?.title || 'Archivo de Drive'}
                  </a>
                </>
              )}
              {material.youtubeVideo && (
                <>
                  <span className="text-red-500">🎥</span>
                  <a 
                    href={material.youtubeVideo.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800 underline"
                  >
                    {material.youtubeVideo.title || 'Video de YouTube'}
                  </a>
                </>
              )}
              {material.link && (
                <>
                  <span className="text-green-500">🔗</span>
                  <a 
                    href={material.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 underline"
                  >
                    {material.link.title || 'Enlace'}
                  </a>
                </>
              )}
              {material.form && (
                <>
                  <span className="text-purple-500">📋</span>
                  <a 
                    href={material.form.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    {material.form.title || 'Formulario de Google'}
                  </a>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSubmissionDetails = () => {
    if (!coursework.assignmentSubmission && !coursework.shortAnswerSubmission && !coursework.multipleChoiceSubmission) {
      return null;
    }

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Detalles de entrega:</h5>
        
        {coursework.assignmentSubmission && (
          <div className="text-sm text-gray-600">
            <p><strong>Tipo:</strong> Tarea con archivo</p>
            {coursework.assignmentSubmission.attachments && (
              <p><strong>Archivos permitidos:</strong> {coursework.assignmentSubmission.attachments.length}</p>
            )}
          </div>
        )}
        
        {coursework.shortAnswerSubmission && (
          <div className="text-sm text-gray-600">
            <p><strong>Tipo:</strong> Respuesta corta</p>
          </div>
        )}
        
        {coursework.multipleChoiceSubmission && (
          <div className="text-sm text-gray-600">
            <p><strong>Tipo:</strong> Opción múltiple</p>
            <div className="mt-1">
              <p><strong>Opciones:</strong></p>
              <ul className="list-disc list-inside ml-2">
                {coursework.multipleChoiceSubmission.choices?.map((choice, index) => (
                  <li key={index} className="text-xs">{choice}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${coursework.typeColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{coursework.typeIcon}</span>
            <h4 className="font-medium text-gray-900">{coursework.title}</h4>
            {coursework.submissionStatus && getStatusBadge(coursework.submissionStatus)}
          </div>
          
          {coursework.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {coursework.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <span>📅</span>
              <span>
                {coursework.formattedDueDate || 'Sin fecha límite'}
              </span>
            </span>
            
            {coursework.hasAttachments && (
              <span className="flex items-center space-x-1">
                <span>📎</span>
                <span>{coursework.attachmentCount} archivo(s)</span>
              </span>
            )}
            
            {coursework.maxPoints && (
              <span className="flex items-center space-x-1">
                <span>⭐</span>
                <span>{coursework.maxPoints} puntos</span>
              </span>
            )}
          </div>
          
          {coursework.grade && (
            <div className="mt-2">
              <span className="text-sm font-medium text-blue-600">
                Calificación: {coursework.grade}/{coursework.maxPoints || 100}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(coursework)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Ver detalles
            </button>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {coursework.description && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Descripción completa:</h5>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {coursework.description}
              </p>
            </div>
          )}
          
          {renderMaterials(coursework.materials)}
          {renderSubmissionDetails()}
          
          {coursework.topicId && (
            <div className="mt-3 text-xs text-gray-500">
              <span>📚 Tema: {coursework.topicId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseWorkCard;
