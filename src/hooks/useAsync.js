import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling async operations with loading, error, and data states
 * @param {Function} asyncFunction - The async function to execute
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {boolean} immediate - Whether to execute immediately on mount
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useAsync = (asyncFunction, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      console.error('Async operation failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Hook for managing multiple async operations
 * @param {Object} asyncFunctions - Object with named async functions
 * @returns {Object} - Object with states for each function
 */
export const useMultipleAsync = (asyncFunctions) => {
  const [states, setStates] = useState(() => {
    const initialStates = {};
    Object.keys(asyncFunctions).forEach(key => {
      initialStates[key] = {
        data: null,
        loading: false,
        error: null
      };
    });
    return initialStates;
  });

  const execute = useCallback(async (functionName, ...args) => {
    if (!asyncFunctions[functionName]) {
      throw new Error(`Function ${functionName} not found`);
    }

    setStates(prev => ({
      ...prev,
      [functionName]: { ...prev[functionName], loading: true, error: null }
    }));

    try {
      const result = await asyncFunctions[functionName](...args);
      setStates(prev => ({
        ...prev,
        [functionName]: { data: result, loading: false, error: null }
      }));
      return result;
    } catch (error) {
      setStates(prev => ({
        ...prev,
        [functionName]: { ...prev[functionName], loading: false, error }
      }));
      throw error;
    }
  }, [asyncFunctions]);

  const reset = useCallback((functionName) => {
    if (functionName) {
      setStates(prev => ({
        ...prev,
        [functionName]: { data: null, loading: false, error: null }
      }));
    } else {
      setStates(() => {
        const resetStates = {};
        Object.keys(asyncFunctions).forEach(key => {
          resetStates[key] = { data: null, loading: false, error: null };
        });
        return resetStates;
      });
    }
  }, [asyncFunctions]);

  return {
    states,
    execute,
    reset
  };
};
