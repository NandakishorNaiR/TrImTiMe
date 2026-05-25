import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLoading from "./AuthLoading";

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isValidating, validationError } = useAuth();

  // Show loading while validating auth on app load
  if (isValidating) {
    return <AuthLoading />;
  }

  // If validation failed or no auth token, redirect to login
  if (!isAuthenticated || validationError) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    const role = user && user.role;
    if (!role || !roles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
