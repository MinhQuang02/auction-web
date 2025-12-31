import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null });
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      setAuth({ isAuthenticated: false, user: null });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Token invalid");
      }

      const data = await res.json();
      
      // FIX: Supports both { user: {...} } and { id: 1, ... } structures
      const userData = data.user || data; 

      setAuth({ 
        isAuthenticated: true, 
        user: userData,
        role: userData.role 
      });

    } catch (err) {
      console.log("❌ Auth Failed:", err.message);
      localStorage.removeItem("token");
      setAuth({ isAuthenticated: false, user: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
        auth, 
        user: auth?.user, 
        isAuthenticated: auth?.isAuthenticated, 
        loading, 
        logout: () => {
          localStorage.removeItem("token");
          setAuth({ isAuthenticated: false, user: null });
          window.location.href = "/"; 
        }, 
        refetchUser: fetchMe 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);