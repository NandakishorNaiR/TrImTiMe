import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    const role = user && user.role;
    if (!role || !roles.includes(role)) return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
