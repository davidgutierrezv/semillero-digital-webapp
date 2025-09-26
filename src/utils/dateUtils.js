/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date to a localized string
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'Fecha no disponible';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Fecha inválida';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString('es-ES', defaultOptions);
};

/**
 * Format a date with time
 * @param {Date|string|number} date - The date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get relative time (e.g., "hace 2 días", "en 3 horas")
 * @param {Date|string|number} date - The date to compare
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return 'Fecha no disponible';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Fecha inválida';
  
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));
  
  if (Math.abs(diffDays) >= 1) {
    if (diffDays > 0) {
      return diffDays === 1 ? 'Mañana' : `En ${diffDays} días`;
    } else {
      return diffDays === -1 ? 'Ayer' : `Hace ${Math.abs(diffDays)} días`;
    }
  } else if (Math.abs(diffHours) >= 1) {
    if (diffHours > 0) {
      return diffHours === 1 ? 'En 1 hora' : `En ${diffHours} horas`;
    } else {
      return diffHours === -1 ? 'Hace 1 hora' : `Hace ${Math.abs(diffHours)} horas`;
    }
  } else if (Math.abs(diffMinutes) >= 1) {
    if (diffMinutes > 0) {
      return diffMinutes === 1 ? 'En 1 minuto' : `En ${diffMinutes} minutos`;
    } else {
      return diffMinutes === -1 ? 'Hace 1 minuto' : `Hace ${Math.abs(diffMinutes)} minutos`;
    }
  } else {
    return 'Ahora';
  }
};

/**
 * Check if a date is overdue
 * @param {Date|string|number} dueDate - The due date to check
 * @returns {boolean} - True if overdue
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const dateObj = new Date(dueDate);
  return dateObj.getTime() < new Date().getTime();
};

/**
 * Get days until due date
 * @param {Date|string|number} dueDate - The due date
 * @returns {number} - Days until due (negative if overdue)
 */
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const dateObj = new Date(dueDate);
  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format Google Classroom date object to Date
 * @param {Object} classroomDate - Google Classroom date object
 * @returns {Date|null} - JavaScript Date object
 */
export const parseClassroomDate = (classroomDate) => {
  if (!classroomDate) return null;
  
  if (classroomDate.seconds) {
    // Firestore Timestamp
    return new Date(classroomDate.seconds * 1000);
  }
  
  if (classroomDate.year && classroomDate.month && classroomDate.day) {
    // Google Classroom date format
    return new Date(classroomDate.year, classroomDate.month - 1, classroomDate.day);
  }
  
  return new Date(classroomDate);
};

/**
 * Get academic period from date
 * @param {Date|string|number} date - The date
 * @returns {string} - Academic period (e.g., "2024-1", "2024-2")
 */
export const getAcademicPeriod = (date = new Date()) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 0-indexed
  
  // Assuming two periods per year: Jan-Jun (1), Jul-Dec (2)
  const period = month <= 6 ? 1 : 2;
  return `${year}-${period}`;
};
