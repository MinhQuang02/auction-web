import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    role: "guest",
  });
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      setAuth({ isAuthenticated: false, user: null, role: "guest" });
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

      // Support both { user: {...} } and direct user object
      const userData = data.user ?? data;

      if (!userData || !userData.id) {
        throw new Error("Invalid user payload");
      }

      setAuth({
        isAuthenticated: true,
        user: userData,
        role: userData.role ?? "user",
      });
    } catch (err) {
      console.warn("Auth failed:", err.message);
      localStorage.removeItem("token");
      setAuth({ isAuthenticated: false, user: null, role: "guest" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        user: auth.user,
        isAuthenticated: auth.isAuthenticated,
        role: auth.role,
        loading,
        logout: () => {
          localStorage.removeItem("token");
          setAuth({ isAuthenticated: false, user: null, role: "guest" });
          window.location.href = "/";
        },
        refetchUser: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
