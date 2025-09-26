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
 * Get all coursework (assignments) for a specific course
 * @param {string} courseId - The course ID
 * @param {string} accessToken - The user's access token
 * @returns {Promise<Array>} - Array of coursework objects
 */
export const getCourseWork = async (courseId, accessToken) => {
  const url = `${BASE_CLASSROOM_URL}/courses/${courseId}/courseWork`;
  const data = await fetchGoogleApi(url, accessToken);
  return data.courseWork || [];
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
    throw error;
  }
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
