import { useState, useEffect } from 'react';

const CellForm = ({ cell, students, unassignedStudents, onSave, onCancel, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assistantEmail: '',
    assistantName: '',
    studentEmails: []
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cell) {
      setFormData({
        name: cell.name || '',
        description: cell.description || '',
        assistantEmail: cell.assistantEmail || '',
        assistantName: cell.assistantName || '',
        studentEmails: cell.studentEmails || []
      });
    }
  }, [cell]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la célula es requerido';
    }

    console.log('Validating studentEmails:', formData.studentEmails);
    if (formData.studentEmails.length === 0) {
      newErrors.students = 'Debe asignar al menos un estudiante';
      console.log('Validation error: No students selected');
    }

    if (formData.assistantEmail && !formData.assistantName.trim()) {
      newErrors.assistantName = 'El nombre del asistente es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    console.log('Validation errors:', errors);
    if (!isValid) return;

    setSaving(true);
    try {
      console.log('=== DEBUGGING SUBMIT ===');
      console.log('formData.studentEmails:', formData.studentEmails);
      console.log('formData.studentEmails.length:', formData.studentEmails.length);
      console.log('Full formData:', formData);
      
      // Only send the fields we need
      const dataToSave = {
        name: formData.name,
        description: formData.description,
        assistantEmail: formData.assistantEmail,
        assistantName: formData.assistantName,
        studentEmails: formData.studentEmails
      };
      
      console.log('FormData before save:', formData);
      console.log('DataToSave:', dataToSave);
      console.log('DataToSave.studentEmails:', dataToSave.studentEmails);
      
      await onSave(dataToSave);
    } catch (error) {
      console.error('Error saving cell:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStudentToggle = (studentEmail) => {
    console.log('Toggling student:', studentEmail);
    console.log('Current studentEmails:', formData.studentEmails);
    
    setFormData(prev => {
      const newEmails = prev.studentEmails.includes(studentEmail)
        ? prev.studentEmails.filter(email => email !== studentEmail)
        : [...prev.studentEmails, studentEmail];
      
      console.log('New studentEmails:', newEmails);
      
      return {
        ...prev,
        studentEmails: newEmails
      };
    });
  };

  const handleSelectAllUnassigned = () => {
    const unassignedEmails = unassignedStudents.map(s => 
      s.profile?.emailAddress || s.userId
    );
    setFormData(prev => ({
      ...prev,
      studentEmails: [...new Set([...prev.studentEmails, ...unassignedEmails])]
    }));
  };

  const handleClearStudents = () => {
    setFormData(prev => ({
      ...prev,
      studentEmails: []
    }));
  };

  // Get available students (unassigned + currently assigned to this cell if editing)
  const getAvailableStudents = () => {
    if (cell) {
      // When editing, include current cell students + unassigned
      const currentCellEmails = cell.studentEmails || [];
      const unassignedEmails = unassignedStudents.map(s => 
        s.profile?.emailAddress || s.userId
      );
      const availableEmails = [...new Set([...currentCellEmails, ...unassignedEmails])];
      
      return students.filter(student => 
        availableEmails.includes(student.profile?.emailAddress || student.userId)
      );
    } else {
      // When creating, only show unassigned students
      return unassignedStudents;
    }
  };

  const availableStudents = getAvailableStudents();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {cell ? 'Editar Célula' : 'Nueva Célula'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Célula *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Célula A, Grupo 1, etc."
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Descripción opcional de la célula..."
                />
              </div>
            </div>

            {/* Assistant Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Asistente</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Email del Asistente
                    </label>
                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          assistantEmail: currentUser.email,
                          assistantName: currentUser.displayName || currentUser.email
                        }))}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Asignarme a mí
                      </button>
                    )}
                  </div>
                  <input
                    type="email"
                    value={formData.assistantEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, assistantEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="asistente@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Asistente
                  </label>
                  <input
                    type="text"
                    value={formData.assistantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, assistantName: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.assistantName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre completo"
                  />
                  {errors.assistantName && (
                    <p className="text-red-600 text-sm mt-1">{errors.assistantName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Student Assignment */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Estudiantes ({formData.studentEmails.length} seleccionados)
                </h3>
                
                <div className="flex space-x-2">
                  {unassignedStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllUnassigned}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Seleccionar sin asignar ({unassignedStudents.length})
                    </button>
                  )}
                  
                  {formData.studentEmails.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearStudents}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Limpiar selección
                    </button>
                  )}
                </div>
              </div>

              {errors.students && (
                <p className="text-red-600 text-sm">{errors.students}</p>
              )}

              {availableStudents.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    {cell 
                      ? 'No hay estudiantes disponibles para reasignar'
                      : 'Todos los estudiantes ya están asignados a otras células'
                    }
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {availableStudents.map((student) => {
                    console.log('Student object:', student);
                    const studentEmail = student.profile?.emailAddress || student.userId;
                    console.log('Extracted studentEmail:', studentEmail);
                    const studentName = student.profile?.name?.fullName || student.profile?.emailAddress || studentEmail;
                    const isSelected = formData.studentEmails.includes(studentEmail);
                    const isUnassigned = unassignedStudents.some(s => 
                      (s.profile?.emailAddress || s.userId) === studentEmail
                    );

                    return (
                      <div
                        key={studentEmail}
                        className={`flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (studentEmail) {
                              handleStudentToggle(studentEmail);
                            } else {
                              console.error('Cannot toggle student: email is undefined');
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {studentName}
                            </p>
                            {!isUnassigned && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                Reasignando
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{studentEmail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={saving}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={saving}
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{cell ? 'Actualizar' : 'Crear'} Célula</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CellForm;
