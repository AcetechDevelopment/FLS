export const getAuthToken = () => {
  const token = sessionStorage.getItem("authToken");
  return token;
};

export const isValidToken = (token) => {
  return token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
};

export const clearAuthToken = () => {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("Name");
  sessionStorage.removeItem("RoleId");
};

export const handleAuthError = (navigate) => {
  clearAuthToken();
  window.location.replace("/login");
};
