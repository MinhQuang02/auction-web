import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

const RoleRoute = ({ allowedRoles }) => {
  // FIX: Destructure 'user', NOT 'role'
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // FIX: Check user.role. 
  // If user exists but role is not in allowed list, redirect Home.
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;