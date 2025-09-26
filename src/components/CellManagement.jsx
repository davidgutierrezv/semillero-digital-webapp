import { useState, useEffect } from 'react';
import { getCellsForCourse, createCell, updateCell, deleteCell } from '../services/firestore';
import CellCard from './CellCard';
import CellForm from './CellForm';

const CellManagement = ({ courseId, courseName, students, accessToken, currentUser }) => {
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      loadCells();
    }
  }, [courseId]);

  const loadCells = async () => {
    try {
      setLoading(true);
      const cellsData = await getCellsForCourse(courseId);
      setCells(cellsData);
    } catch (error) {
      console.error('Error loading cells:', error);
      setError('Error al cargar las células');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCell = () => {
    setEditingCell(null);
    setShowForm(true);
  };

  const handleEditCell = (cell) => {
    setEditingCell(cell);
    setShowForm(true);
  };

  const handleDeleteCell = async (cellId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta célula?')) {
      return;
    }

    try {
      await deleteCell(cellId);
      setCells(cells.filter(cell => cell.id !== cellId));
    } catch (error) {
      console.error('Error deleting cell:', error);
      setError('Error al eliminar la célula');
    }
  };

  const handleSaveCell = async (cellData) => {
    try {
      console.log('Raw cellData:', cellData); // Debug log
      
      // Clean data to avoid undefined values - be more thorough
      const cleanData = {
        name: String(cellData.name || '').trim(),
        description: String(cellData.description || '').trim(),
        assistantEmail: String(cellData.assistantEmail || '').trim(),
        assistantName: String(cellData.assistantName || '').trim(),
        studentEmails: Array.isArray(cellData.studentEmails) ? cellData.studentEmails.filter(email => email && email.trim()) : [],
        courseId: String(courseId || ''),
        courseName: String(courseName || '')
      };
      
      // Remove any remaining undefined or null values
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined || cleanData[key] === null) {
          cleanData[key] = '';
        }
      });
      
      console.log('Clean data:', cleanData); // Debug log

      if (editingCell) {
        // Update existing cell
        const updatedCell = await updateCell(editingCell.id, {
          ...cleanData,
          updatedAt: new Date().toISOString()
        });
        setCells(cells.map(cell => 
          cell.id === editingCell.id ? { ...cell, ...updatedCell } : cell
        ));
      } else {
        // Create new cell
        const newCell = await createCell({
          ...cleanData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setCells([...cells, newCell]);
      }
      
      setShowForm(false);
      setEditingCell(null);
    } catch (error) {
      console.error('Error saving cell:', error);
      setError('Error al guardar la célula');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCell(null);
  };

  // Get students not assigned to any cell
  const getUnassignedStudents = () => {
    const assignedEmails = cells.flatMap(cell => cell.studentEmails || []);
    return students.filter(student => 
      !assignedEmails.includes(student.profile?.emailAddress || student.emailAddress)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Cargando células...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gestión de Células - {courseName}
          </h3>
          <p className="text-sm text-gray-600">
            Organiza estudiantes en grupos con asistentes asignados
          </p>
        </div>
        
        <button
          onClick={handleCreateCell}
          className="btn-primary flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Nueva Célula</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-700 text-sm mt-2"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{cells.length}</div>
          <div className="text-sm text-blue-600">Células Creadas</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {cells.reduce((sum, cell) => sum + (cell.studentEmails?.length || 0), 0)}
          </div>
          <div className="text-sm text-green-600">Estudiantes Asignados</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {getUnassignedStudents().length}
          </div>
          <div className="text-sm text-orange-600">Sin Asignar</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {cells.filter(cell => cell.assistantEmail).length}
          </div>
          <div className="text-sm text-purple-600">Con Asistente</div>
        </div>
      </div>

      {/* Cell Form Modal */}
      {showForm && (
        <CellForm
          cell={editingCell}
          students={students}
          unassignedStudents={getUnassignedStudents()}
          onSave={handleSaveCell}
          onCancel={handleCancelForm}
          currentUser={currentUser}
        />
      )}

      {/* Cells Grid */}
      {cells.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">🧬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay células creadas
          </h3>
          <p className="text-gray-600 mb-4">
            Crea tu primera célula para organizar a los estudiantes
          </p>
          <button
            onClick={handleCreateCell}
            className="btn-primary"
          >
            Crear Primera Célula
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cells.map((cell) => (
            <CellCard
              key={cell.id}
              cell={cell}
              onEdit={handleEditCell}
              onDelete={handleDeleteCell}
            />
          ))}
        </div>
      )}

      {/* Unassigned Students Alert */}
      {getUnassignedStudents().length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-yellow-600 text-xl mr-3">⚠️</span>
            <div>
              <h4 className="font-medium text-yellow-800">
                Estudiantes sin asignar ({getUnassignedStudents().length})
              </h4>
              <p className="text-yellow-700 text-sm mt-1">
                Hay estudiantes que no están asignados a ninguna célula. 
                Considera crear nuevas células o editarlas existentes.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {getUnassignedStudents().slice(0, 5).map((student) => (
                  <span 
                    key={student.profile?.emailAddress || student.emailAddress}
                    className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs"
                  >
                    {student.profile?.name?.fullName || student.profile?.emailAddress || student.emailAddress}
                  </span>
                ))}
                {getUnassignedStudents().length > 5 && (
                  <span className="text-yellow-700 text-xs">
                    +{getUnassignedStudents().length - 5} más...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CellManagement;
