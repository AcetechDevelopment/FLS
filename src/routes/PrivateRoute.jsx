import { Navigate } from 'react-router-dom';
import { getAuthToken, isValidToken } from '../utils/authUtils';

export default function PrivateRoute({ children }) {
  const token = getAuthToken();
  return isValidToken(token) ? children : <Navigate to="/login" replace />;
}