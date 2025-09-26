const StudentProgressRow = ({ 
  studentEmail, 
  cellName, 
  courseName, 
  assignments, 
  getStatusColor, 
  getStatusText 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h5 className="font-medium text-gray-900">{studentEmail}</h5>
          <p className="text-sm text-gray-600">{cellName} - {courseName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {assignments.length} tareas recientes
          </p>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {assignments.map((assignment, index) => (
          <div key={index} className="text-center">
            <div className="mb-1">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                {getStatusText(assignment.status)}
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate" title={assignment.title}>
              {assignment.title}
            </p>
            {assignment.grade && (
              <p className="text-xs font-medium text-green-600">
                {assignment.grade}
              </p>
            )}
            {assignment.dueDate && (
              <p className="text-xs text-gray-400">
                {new Date(assignment.dueDate.seconds * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">
          No hay tareas disponibles
        </p>
      )}
    </div>
  );
};

export default StudentProgressRow;
