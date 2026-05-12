import { Navigate, useLocation } from "react-router-dom";
import { dashboardForRole, useAuth } from "../context/AuthContext";

export function ProtectedRoute({ allowedRole, allowedRoles, children }) {
  const { isAuthenticated, role, authChecked } = useAuth();
  const location = useLocation();
  const roles = allowedRoles || (allowedRole ? [allowedRole] : null);

  if (!authChecked) {
    return <div className="grid min-h-screen place-items-center bg-night text-white">Checking access...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to={dashboardForRole(role)} replace />;
  }

  return children;
}
