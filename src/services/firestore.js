import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

/**
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
 * Get all cells for a specific course
 * @param {string} courseId - The course ID
 * @returns {Promise<Array>} - Array of cell documents
 */
export const getCellsForCourse = async (courseId) => {
  try {
    const cellsRef = collection(db, 'courses', courseId, 'cells');
    const snapshot = await getDocs(cellsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting cells for course:', error);
    throw error;
  }
};

/**
 * Create a new cell for a course
 * @param {string} courseId - The course ID
 * @param {Object} cellData - Cell data (name, assistantEmail, studentEmails)
 * @returns {Promise<string>} - The ID of the created cell
 */
export const createCell = async (courseId, cellData) => {
  try {
    const cellsRef = collection(db, 'courses', courseId, 'cells');
    const docRef = await addDoc(cellsRef, {
      ...cellData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating cell:', error);
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
 * @param {string} eventId - The calendar event ID
 * @param {Object} attendanceData - Attendance data object
 * @returns {Promise<void>}
 */
export const saveAttendanceRecord = async (courseId, eventId, attendanceData) => {
  try {
    const attendanceRef = doc(db, 'courses', courseId, 'attendance', eventId);
    await setDoc(attendanceRef, {
      ...attendanceData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving attendance record:', error);
    throw error;
  }
};

/**
 * Get attendance records for a course
 * @param {string} courseId - The course ID
 * @returns {Promise<Array>} - Array of attendance records
 */
export const getAttendanceRecords = async (courseId) => {
  try {
    const attendanceRef = collection(db, 'courses', courseId, 'attendance');
    const attendanceQuery = query(attendanceRef, orderBy('eventDate', 'desc'));
    const snapshot = await getDocs(attendanceQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting attendance records:', error);
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
