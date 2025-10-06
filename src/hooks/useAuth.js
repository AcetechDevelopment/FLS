import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = sessionStorage.getItem('authToken');
    if (!token || token === 'undefined' || token === 'null') {
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const handleAuthError = () => {
    toast.error('Session expired. Please login again.');
    logout();
  };

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
    handleAuthError,
    logout
  };
};

export default useAuth;
