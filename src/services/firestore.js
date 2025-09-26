import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

/**
{{ ... }}
 * Get user role and information from Firestore
 * @param {string} userId - The user's UID from Firebase Auth
 * @returns {Promise<Object|null>} - User document data or null if not found
 */
export const getUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
};

/**
 * Create or update user document in Firestore
 * @param {string} userId - The user's UID from Firebase Auth
 * @param {Object} userData - User data to save
 * @returns {Promise<void>}
 */
export const createOrUpdateUser = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

/**
 * Get cells for a specific course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} Array of cell objects
 */
export const getCellsForCourse = async (courseId) => {
  try {
    const cellsRef = collection(db, 'cells');
    const q = query(cellsRef, where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting cells for course:', error);
    throw error;
  }
};

/**
 * Create a new cell
 * @param {Object} cellData - Cell data
 * @returns {Promise<Object>} Created cell with ID
 */
export const createCell = async (cellData) => {
  try {
    const cellsRef = collection(db, 'cells');
    const docRef = await addDoc(cellsRef, cellData);
    
    return {
      id: docRef.id,
      ...cellData
    };
  } catch (error) {
    console.error('Error creating cell:', error);
    throw error;
  }
};

/**
 * Update an existing cell
 * @param {string} cellId - Cell ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated data
 */
export const updateCell = async (cellId, updateData) => {
  try {
    const cellRef = doc(db, 'cells', cellId);
    await updateDoc(cellRef, updateData);
    
    return updateData;
  } catch (error) {
    console.error('Error updating cell:', error);
    throw error;
  }
};

/**
 * Delete a cell
 * @param {string} cellId - Cell ID
 * @returns {Promise<void>}
 */
export const deleteCell = async (cellId) => {
  try {
    const cellRef = doc(db, 'cells', cellId);
    await deleteDoc(cellRef);
  } catch (error) {
    console.error('Error deleting cell:', error);
    throw error;
  }
};



/**
 * Get cells where a specific assistant is assigned
 * @param {string} assistantEmail - The assistant's email
 * @returns {Promise<Array>} - Array of cells with course information
 */
export const getCellsForAssistant = async (assistantEmail) => {
  try {
    // We need to query across all courses, so we'll get all courses first
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    const cellsWithCourse = [];

    for (const courseDoc of coursesSnapshot.docs) {
      const courseId = courseDoc.id;
      const courseData = courseDoc.data();
      
      const cellsRef = collection(db, 'courses', courseId, 'cells');
      const cellsQuery = query(cellsRef, where('assistantEmail', '==', assistantEmail));
      const cellsSnapshot = await getDocs(cellsQuery);
      
      cellsSnapshot.docs.forEach(cellDoc => {
        cellsWithCourse.push({
          id: cellDoc.id,
          courseId,
          courseName: courseData.name,
          ...cellDoc.data()
        });
      });
    }

    return cellsWithCourse;
  } catch (error) {
    console.error('Error getting cells for assistant:', error);
    throw error;
  }
};

/**
 * Save attendance record for a class
 * @param {string} courseId - The course ID
 * @param {string} recordId - The record ID
 * @param {Object} attendanceData - Attendance data object
 * @returns {Promise<void>}
 */
export const saveAttendanceRecord = async (courseId, recordId, attendanceData) => {
  try {
    console.log('💾 Firestore: Saving attendance record');
    console.log('💾 Course ID:', courseId);
    console.log('💾 Record ID:', recordId);
    console.log('💾 Data:', attendanceData);
    
    const attendanceRef = doc(db, 'courses', courseId, 'attendance', recordId);
    const dataToSave = {
      ...attendanceData,
      updatedAt: serverTimestamp()
    };
    
    console.log('💾 Firestore: Document path:', attendanceRef.path);
    await setDoc(attendanceRef, dataToSave, { merge: true });
    console.log('✅ Firestore: Attendance record saved successfully');
  } catch (error) {
    console.error('🚨 Firestore Error saving attendance record:', error);
    console.error('🚨 Save error details:', {
      code: error.code,
      message: error.message,
      courseId,
      recordId
    });
    throw error;
  }
};

/**
 * Get attendance records for a course
 * @param {string} courseId - The course ID
 * @param {string} date - Optional specific date to filter by (YYYY-MM-DD format)
 * @returns {Promise<Array>} - Array of attendance records
 */
export const getAttendanceRecords = async (courseId, date = null) => {
  try {
    console.log('🔍 Firestore: Getting attendance records for course:', courseId, 'date:', date);
    const attendanceRef = collection(db, 'courses', courseId, 'attendance');
    
    let snapshot;
    if (date) {
      // Filter by specific date - use simple query first
      console.log('🔍 Firestore: Querying by date:', date);
      const dateQuery = query(attendanceRef, where('date', '==', date));
      snapshot = await getDocs(dateQuery);
    } else {
      // Get all records
      console.log('🔍 Firestore: Getting all records');
      snapshot = await getDocs(attendanceRef);
    }
    
    const records = snapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      console.log('🔍 Firestore: Found record:', data);
      return data;
    });
    
    // Sort manually
    const sortedRecords = records.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      return new Date(b.recordedAt || 0) - new Date(a.recordedAt || 0);
    });
    
    console.log('🔍 Firestore: Returning', sortedRecords.length, 'sorted records');
    return sortedRecords;
    
  } catch (error) {
    console.error('🚨 Firestore Error getting attendance records:', error);
    console.error('🚨 Error details:', {
      code: error.code,
      message: error.message,
      courseId,
      date
    });
    throw error;
  }
};

/**
 * Create or update course information
 * @param {string} courseId - The course ID from Google Classroom
 * @param {Object} courseData - Course data to save
 * @returns {Promise<void>}
 */
export const createOrUpdateCourse = async (courseId, courseData) => {
  try {
    await setDoc(doc(db, 'courses', courseId), {
      ...courseData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error creating/updating course:', error);
    throw error;
  }
};

/**
 * Save student phone number
 * @param {string} courseId - The course ID
 * @param {string} studentEmail - Student email
 * @param {string} phoneNumber - Phone number
 * @param {Object} studentData - Additional student data
 * @returns {Promise<void>}
 */
export const saveStudentPhone = async (courseId, studentEmail, phoneNumber, studentData = {}) => {
  try {
    console.log('📱 Firestore: Saving student phone number');
    console.log('📱 Course ID:', courseId);
    console.log('📱 Student Email:', studentEmail);
    console.log('📱 Phone Number:', phoneNumber);
    
    const studentRef = doc(db, 'courses', courseId, 'students', studentEmail);
    const dataToSave = {
      email: studentEmail,
      phoneNumber: phoneNumber,
      ...studentData,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(studentRef, dataToSave, { merge: true });
    console.log('✅ Firestore: Student phone number saved successfully');
  } catch (error) {
    console.error('🚨 Firestore Error saving student phone:', error);
    throw error;
  }
};

/**
 * Get student data including phone number
 * @param {string} courseId - The course ID
 * @param {string} studentEmail - Student email
 * @returns {Promise<Object|null>} - Student data or null
 */
export const getStudentData = async (courseId, studentEmail) => {
  try {
    const studentRef = doc(db, 'courses', courseId, 'students', studentEmail);
    const snapshot = await getDoc(studentRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('🚨 Firestore Error getting student data:', error);
    throw error;
  }
};

/**
 * Get all students data for a course
 * @param {string} courseId - The course ID
 * @returns {Promise<Array>} - Array of student data
 */
export const getAllStudentsData = async (courseId) => {
  try {
    const studentsRef = collection(db, 'courses', courseId, 'students');
    const snapshot = await getDocs(studentsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('🚨 Firestore Error getting all students data:', error);
    throw error;
  }
};
