import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { loading, authenticated } = useAuth();

  if (loading) return null;

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
