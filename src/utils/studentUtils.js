/**
 * Utility functions for handling student data from Google Classroom API
 */

/**
 * Extract email address from a student object
 * Tries multiple fields in order of preference:
 * 1. student.profile.emailAddress (most reliable)
 * 2. student.emailAddress (direct field)
 * 3. student.profile.id (fallback, should be email)
 * 
 * @param {Object} student - Student object from Google Classroom API
 * @returns {string|null} - Email address or null if not found
 */
export const getStudentEmail = (student) => {
  if (!student) return null;
  
  // Log para debugging
  console.log('getStudentEmail - student object:', student);
  
  const email = student.profile?.emailAddress || 
                student.emailAddress || 
                student.profile?.id || 
                null;
                
  // Verificar si el resultado es un email válido o un ID numérico
  if (email && /^\d+$/.test(email)) {
    console.warn('getStudentEmail - Got numeric ID instead of email:', email, 'for student:', student);
    // Si es solo números y no hay email disponible, usar el nombre como identificador temporal
    const fallbackId = student.profile?.name?.fullName || `student-${email}`;
    console.log('getStudentEmail - using fallback identifier:', fallbackId);
    return fallbackId;
  }
  
  console.log('getStudentEmail - extracted email:', email);
  return email;
};

/**
 * Extract student name from a student object
 * Tries multiple fields in order of preference:
 * 1. student.profile.name.fullName
 * 2. student.profile.emailAddress
 * 3. student.emailAddress
 * 4. student.profile.id
 * 
 * @param {Object} student - Student object from Google Classroom API
 * @returns {string} - Student name or email as fallback
 */
export const getStudentName = (student) => {
  if (!student) return 'Unknown Student';
  
  console.log('getStudentName - input student:', student);
  console.log('getStudentName - available fields:', {
    fullName: student.profile?.name?.fullName,
    profileEmail: student.profile?.emailAddress,
    directEmail: student.emailAddress,
    profileId: student.profile?.id
  });
  
  const name = student.profile?.name?.fullName || 
               student.profile?.emailAddress || 
               student.emailAddress || 
               student.profile?.id || 
               'Unknown Student';
               
  console.log('getStudentName - final name:', name);
  return name;
};

/**
 * Get unique identifier for a student (for React keys, etc.)
 * Uses email as the primary identifier
 * 
 * @param {Object} student - Student object from Google Classroom API
 * @returns {string} - Unique identifier for the student
 */
export const getStudentId = (student) => {
  return getStudentEmail(student) || `student-${student.userId || Math.random()}`;
};

/**
 * Filter students by email addresses
 * 
 * @param {Array} students - Array of student objects
 * @param {Array} emails - Array of email addresses to filter by
 * @returns {Array} - Filtered array of students
 */
export const filterStudentsByEmails = (students, emails) => {
  if (!Array.isArray(students) || !Array.isArray(emails)) return [];
  
  return students.filter(student => {
    const studentEmail = getStudentEmail(student);
    return studentEmail && emails.includes(studentEmail);
  });
};

/**
 * Get students not included in the provided email list
 * 
 * @param {Array} students - Array of student objects
 * @param {Array} assignedEmails - Array of already assigned email addresses
 * @returns {Array} - Array of unassigned students
 */
export const getUnassignedStudents = (students, assignedEmails) => {
  if (!Array.isArray(students)) return [];
  if (!Array.isArray(assignedEmails)) return students;
  
  return students.filter(student => {
    const studentEmail = getStudentEmail(student);
    return studentEmail && !assignedEmails.includes(studentEmail);
  });
};
