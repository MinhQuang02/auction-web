import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

const PublicOnlyRoute = ({ children }) => { 
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Checking Auth...</div>; 
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children ? children : <Outlet />;
};

export default PublicOnlyRoute;