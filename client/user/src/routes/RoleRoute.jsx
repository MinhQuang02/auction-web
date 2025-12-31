import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

const RoleRoute = ({ allowedRoles }) => {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) return null; // or spinner

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
