/**
 * Utility functions for data export functionality
 */

/**
 * Convert array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header names (optional)
 * @returns {string} - CSV formatted string
 */
export const arrayToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';
  
  // If no headers provided, use keys from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(header => `"${header}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (csvContent, filename = 'export.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Export student progress data to CSV
 * @param {Object} studentProgress - Student progress data
 * @param {string} courseName - Name of the course
 * @returns {string} - CSV content
 */
export const exportStudentProgressToCSV = (studentProgress, courseName = 'Curso') => {
  if (!studentProgress || Object.keys(studentProgress).length === 0) {
    return '';
  }
  
  const data = [];
  const maxAssignments = Math.max(
    ...Object.values(studentProgress).map(p => p.assignments?.length || 0)
  );
  
  // Create headers
  const headers = ['Estudiante', 'Célula', 'Curso'];
  for (let i = 0; i < maxAssignments; i++) {
    headers.push(`Tarea ${i + 1}`, `Estado ${i + 1}`, `Calificación ${i + 1}`);
  }
  
  // Create data rows
  Object.entries(studentProgress).forEach(([email, studentData]) => {
    const row = {
      'Estudiante': email,
      'Célula': studentData.cellName || '',
      'Curso': courseName
    };
    
    // Add assignment data
    if (studentData.assignments) {
      studentData.assignments.forEach((assignment, index) => {
        row[`Tarea ${index + 1}`] = assignment.title || '';
        row[`Estado ${index + 1}`] = getStatusText(assignment.status) || '';
        row[`Calificación ${index + 1}`] = assignment.grade || '';
      });
    }
    
    data.push(row);
  });
  
  return arrayToCSV(data, headers);
};

/**
 * Export attendance data to CSV
 * @param {Array} attendanceRecords - Array of attendance records
 * @param {string} courseName - Name of the course
 * @returns {string} - CSV content
 */
export const exportAttendanceToCSV = (attendanceRecords, courseName = 'Curso') => {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return '';
  }
  
  const data = [];
  
  attendanceRecords.forEach(record => {
    if (record.records) {
      Object.entries(record.records).forEach(([email, status]) => {
        data.push({
          'Curso': courseName,
          'Evento': record.eventSummary || '',
          'Fecha': record.eventDate?.toDate?.()?.toLocaleDateString('es-ES') || '',
          'Estudiante': email,
          'Estado': status === 'presente' ? 'Presente' : 
                   status === 'ausente' ? 'Ausente' : 
                   status === 'justificado' ? 'Justificado' : status
        });
      });
    }
  });
  
  return arrayToCSV(data);
};

/**
 * Get status text in Spanish
 * @param {string} status - Status code
 * @returns {string} - Status text in Spanish
 */
const getStatusText = (status) => {
  const statusMap = {
    'submitted': 'Entregado',
    'graded': 'Calificado',
    'not_submitted': 'No entregado',
    'overdue': 'Atrasado',
    'returned': 'Devuelto',
    'assigned': 'Asignado',
    'error': 'Error'
  };
  return statusMap[status] || status;
};

/**
 * Generate filename with timestamp
 * @param {string} baseName - Base name for the file
 * @param {string} extension - File extension (default: csv)
 * @returns {string} - Filename with timestamp
 */
export const generateFilename = (baseName, extension = 'csv') => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${baseName}_${timestamp}.${extension}`;
};
