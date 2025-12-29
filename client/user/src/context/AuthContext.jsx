import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuth({
        authenticated: false,
        role: "guest",
        user: null,
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Invalid token");

      const data = await res.json();

      console.log(data);

      if (data.authenticated && !data.user) {
        localStorage.removeItem("token");
        setAuth({
          authenticated: false,
          role: "guest",
          user: null,
        });
      } else {
        setAuth(data);
      }
    } catch {
      localStorage.removeItem("token");
      setAuth({
        authenticated: false,
        role: "guest",
        user: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({
      authenticated: false,
      role: "guest",
      user: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        user: auth?.user ?? null,
        role: auth?.role ?? "guest",
        isAuthenticated: !!auth?.user,
        loading,
        logout,
        refetchUser: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
