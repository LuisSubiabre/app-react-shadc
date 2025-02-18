import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/config";

// Definir un tipo para el usuario (ajústalo según la estructura real de tu respuesta)
interface User {
  id: string;
  nombre: string;
  email: string;
  // Otros campos de usuario
}
// Definir un tipo para el contexto de autenticación
interface AuthContextType {
  auth: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  authToken: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
      setAuthToken(token);
    } else {
      setAuth(false);
      setLoading(false); // Marcamos como cargado incluso si no hay token
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();

      if (response.ok) {
        setAuth(true);
        setUser(data.user);
      } else {
        setAuth(false);
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error al verificar el token:", error);
      setAuth(false);
      localStorage.removeItem("token");
    } finally {
      setLoading(false); // Finaliza la carga después de verificar
    }
  };
  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    setAuth(true);
    setUser(user);
    navigate("/dashboard"); // Redirigir al dashboard después de login
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ auth, user, login, logout, loading, authToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
