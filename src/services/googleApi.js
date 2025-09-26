/**
 * Google API service functions for interacting with Classroom and Calendar APIs
 */

import { auth } from './firebase';
import { GoogleAuthProvider, getAdditionalUserInfo } from 'firebase/auth';

const BASE_CLASSROOM_URL = 'https://classroom.googleapis.com/v1';
const BASE_CALENDAR_URL = 'https://www.googleapis.com/calendar/v3';

/**
 * Get Google access token for API calls
 * @returns {string} - Google access token
 */
export const getGoogleAccessToken = () => {
  const accessToken = localStorage.getItem('googleAccessToken');
  if (!accessToken) {
    throw new Error('Google access token not available. Please sign out and sign in again.');
  }
  return accessToken;
};

/**
 * Helper function to make authenticated requests to Google APIs
 * @param {string} url - The API endpoint URL
 * @param {string} accessToken - The user's access token
 * @returns {Promise<any>} - The API response data
 */
export const fetchGoogleApi = async (url, accessToken) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Google API request failed:', error);
    throw error;
  }
};

/**
 * Get all courses for the authenticated user
 * @param {string} accessToken - The user's access token
 * @returns {Promise<Array>} - Array of course objects
 */
export const getCourses = async (accessToken) => {
  const url = `${BASE_CLASSROOM_URL}/courses?courseStates=ACTIVE`;
  const data = await fetchGoogleApi(url, accessToken);
  return data.courses || [];
};

/**
 * Get all students enrolled in a specific course
 * @param {string} courseId - The course ID
 * @param {string} accessToken - The user's access token
 * @returns {Promise<Array>} - Array of student objects
 */
export const getCourseStudents = async (courseId, accessToken) => {
  const url = `${BASE_CLASSROOM_URL}/courses/${courseId}/students`;
  const data = await fetchGoogleApi(url, accessToken);
  return data.students || [];
};

/**
 * Get user's role in a specific course
 * @param {string} courseId - The course ID
 * @param {string} accessToken - The user's access token
 * @returns {Promise<string>} - User's role in the course
 */
export const getUserRoleInCourse = async (courseId, accessToken) => {
  try {
    // Try to get user as student
    const studentsUrl = `${BASE_CLASSROOM_URL}/courses/${courseId}/students/me`;
    await fetchGoogleApi(studentsUrl, accessToken);
    return 'STUDENT';
  } catch (studentError) {
    try {
      // Try to get user as teacher
      const teachersUrl = `${BASE_CLASSROOM_URL}/courses/${courseId}/teachers/me`;
      await fetchGoogleApi(teachersUrl, accessToken);
      return 'TEACHER';
    } catch (teacherError) {
      // User might be a viewer or have limited access
      return 'VIEWER';
    }
  }
};

/**
 * Get all coursework (assignments) for a specific course
 * @param {string} courseId - The course ID
 * @param {string} accessToken - The user's access token
 * @returns {Promise<Array>} - Array of coursework objects
 */
export const getCourseWork = async (courseId, accessToken) => {
  try {
    const url = `${BASE_CLASSROOM_URL}/courses/${courseId}/courseWork`;
    const data = await fetchGoogleApi(url, accessToken);
    return data.courseWork || [];
  } catch (error) {
    // If 403, check user role for better error message
    if (error.message.includes('403')) {
      const userRole = await getUserRoleInCourse(courseId, accessToken);
      console.log(`User role in course ${courseId}: ${userRole}`);
      
      if (userRole === 'VIEWER') {
        throw new Error(`403: No tienes permisos de estudiante en este curso. Tu rol actual es: ${userRole}`);
      }
    }
    throw error;
  }
};

/**
 * Get student submissions for a specific coursework
 * @param {string} courseId - The course ID
 * @param {string} courseWorkId - The coursework ID
 * @param {string} accessToken - The user's access token
 * @returns {Promise<Array>} - Array of submission objects
 */
export const getStudentSubmissions = async (courseId, courseWorkId, accessToken) => {
  const url = `${BASE_CLASSROOM_URL}/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`;
  const data = await fetchGoogleApi(url, accessToken);
  return data.studentSubmissions || [];
};

/**
 * Get calendar events for a specific calendar
 * @param {string} calendarId - The calendar ID (usually 'primary' for main calendar)
 * @param {string} accessToken - The user's access token
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} - Array of event objects
 */
export const getCalendarEvents = async (calendarId = 'primary', accessToken, options = {}) => {
  const params = new URLSearchParams({
    timeMin: options.timeMin || new Date().toISOString(),
    timeMax: options.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: options.maxResults || 50,
    ...options
  });

  const url = `${BASE_CALENDAR_URL}/calendars/${calendarId}/events?${params}`;
  const data = await fetchGoogleApi(url, accessToken);
  return data.items || [];
};

/**
 * Get assignments (coursework) for a specific course with submission status
 * @param {string} courseId - The course ID
 * @param {string} accessToken - The user's access token
 * @returns {Promise<Array>} - Array of assignment objects with submission status
 */
export const getAssignments = async (courseId, accessToken) => {
  try {
    // Get coursework for the course
    const coursework = await getCourseWork(courseId, accessToken);
    
    // For each coursework, get the student's submission status
    const assignmentsWithStatus = await Promise.all(
      coursework.map(async (assignment) => {
        try {
          const submissions = await getStudentSubmissions(courseId, assignment.id, accessToken);
          const userSubmission = submissions.find(sub => sub.userId === 'me') || submissions[0];
          
          return {
            ...assignment,
            submissionStatus: userSubmission?.state || 'NOT_SUBMITTED',
            grade: userSubmission?.assignedGrade,
            submissionHistory: userSubmission?.submissionHistory || []
          };
        } catch (error) {
          console.warn(`Error getting submissions for assignment ${assignment.id}:`, error);
          return {
            ...assignment,
            submissionStatus: 'ERROR',
            grade: null,
            submissionHistory: []
          };
        }
      })
    );
    
    return assignmentsWithStatus;
  } catch (error) {
    console.error('Error getting assignments:', error);
    
    // If it's a 403 error, return empty array instead of throwing
    if (error.message.includes('403')) {
      console.warn(`No permission to access coursework for course ${courseId}. Returning empty assignments.`);
      return [];
    }
    
    throw error;
  }
};

/**
 * Detect user's primary role across all courses
 * @param {string} accessToken - The user's access token
 * @returns {Promise<Object>} - User role information
 */
export const detectUserRole = async (accessToken) => {
  try {
    const courses = await getCourses(accessToken);
    
    let teacherCourses = 0;
    let studentCourses = 0;
    let viewerCourses = 0;
    const roleDetails = [];

    // Check role in each course
    for (const course of courses) {
      try {
        const role = await getUserRoleInCourse(course.id, accessToken);
        roleDetails.push({
          courseId: course.id,
          courseName: course.name,
          role: role
        });

        switch (role) {
          case 'TEACHER':
            teacherCourses++;
            break;
          case 'STUDENT':
            studentCourses++;
            break;
          default:
            viewerCourses++;
        }
      } catch (error) {
        console.warn(`Could not determine role for course ${course.name}:`, error);
      }
    }

    // Determine primary role
    let primaryRole = 'STUDENT'; // Default
    
    if (teacherCourses > 0) {
      primaryRole = 'PROFESSOR';
    } else if (studentCourses > 0) {
      primaryRole = 'STUDENT';
    } else if (viewerCourses > 0) {
      primaryRole = 'VIEWER';
    }

    // Check if user could be an assistant (student in some courses, teacher-like permissions in others)
    const couldBeAssistant = studentCourses > 0 && (teacherCourses > 0 || viewerCourses > 0);

    return {
      primaryRole,
      couldBeAssistant,
      statistics: {
        totalCourses: courses.length,
        teacherCourses,
        studentCourses,
        viewerCourses
      },
      roleDetails,
      courses
    };
  } catch (error) {
    console.error('Error detecting user role:', error);
    throw error;
  }
};

/**
 * Get courses where user is a teacher
 * @param {string} accessToken - The user's access token
 * @returns {Promise<Array>} - Array of courses where user is teacher
 */
export const getTeacherCourses = async (accessToken) => {
  const roleInfo = await detectUserRole(accessToken);
  return roleInfo.roleDetails
    .filter(detail => detail.role === 'TEACHER')
    .map(detail => roleInfo.courses.find(course => course.id === detail.courseId));
};

/**
 * Get courses where user is a student
 * @param {string} accessToken - The user's access token
 * @returns {Promise<Array>} - Array of courses where user is student
 */
export const getStudentCourses = async (accessToken) => {
  const roleInfo = await detectUserRole(accessToken);
  return roleInfo.roleDetails
    .filter(detail => detail.role === 'STUDENT')
    .map(detail => roleInfo.courses.find(course => course.id === detail.courseId));
};

/**
 * Get user profile information
 * @param {string} accessToken - The user's access token
 * @returns {Promise<Object>} - User profile object
 */
export const getUserProfile = async (accessToken) => {
  const url = 'https://www.googleapis.com/oauth2/v2/userinfo';
  return await fetchGoogleApi(url, accessToken);
};
