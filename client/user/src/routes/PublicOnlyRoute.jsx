import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

const PublicOnlyRoute = () => { 
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; 

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />; 
};

export default PublicOnlyRoute;