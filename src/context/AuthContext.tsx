import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Verificación del token al cargar la app
  // En AuthProvider.tsx
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token); // Verifica el token si existe
    } else {
      navigate("/login");
    }
  }, []);

  const verifyToken = async (token: string) => {
    console.log(token);
    try {
      const response = await fetch("http://localhost:3100/login/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Usa el encabezado Authorization
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setAuth(true);
        setUser(data.user); // Asegúrate de que 'data.user' esté bien estructurado
      } else {
        setAuth(false);
        setUser(null);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error al verificar el token:", error);
      setAuth(false);
      setUser(null);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const login = (token: string, user: any) => {
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
    <AuthContext.Provider value={{ auth, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
