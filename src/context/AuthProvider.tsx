// src/context/AuthProvider.tsx
import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext"; // Importar el contexto
import { API_BASE_URL } from "@/config/config.ts"; // Asegúrate de importar la URL de la API

// Definir la interfaz de Usuario
interface User {
  id: string;
  nombre: string;
  email: string;
  roles: number[];
  cursos: number[];
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const navigate = useNavigate(); // Navegación para redirigir después de login/logout

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
      setAuthToken(token); // Guardamos el token en el estado
    } else {
      setAuth(false); // Si no hay token, establecemos auth como false
      setLoading(false); // Finalizamos el estado de carga
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
        setUser(data.user); // Establecer el usuario si la verificación es exitosa
      } else {
        setAuth(false);
        localStorage.removeItem("token"); // Limpiar el token si la verificación falla
      }
    } catch (error) {
      console.error("Error al verificar el token:", error);
      setAuth(false);
      localStorage.removeItem("token");
    } finally {
      setLoading(false); // Finalizamos el estado de carga
    }
  };

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token); // Guardar el token en localStorage
    setAuth(true);
    setUser(user); // Establecer el usuario en el estado
    setAuthToken(token); // Guardar el token en el estado
    verifyToken(token); // Verificar el token
    navigate("/dashboard"); // Redirigir a la página de dashboard
  };

  const logout = () => {
    localStorage.removeItem("token"); // Eliminar el token del localStorage
    setAuth(false); // Establecer auth como false
    setUser(null); // Limpiar el usuario
    setAuthToken(null); // Limpiar el token
    navigate("/login"); // Redirigir al login
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        user,
        login,
        logout,
        loading,
        authToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
