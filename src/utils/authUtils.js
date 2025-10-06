export const getAuthToken = () => {
  const token = sessionStorage.getItem("authToken");
  return token;
};

export const isValidToken = (token) => {
  return token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
};

export const clearAuthToken = () => {
  sessionStorage.removeItem("authToken");
};

export const handleAuthError = (navigate) => {
  clearAuthToken();
  window.location.href = "/login";
};
