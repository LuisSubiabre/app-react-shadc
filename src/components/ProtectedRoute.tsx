import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

// Aseguramos que children esté correctamente tipado como React.ReactNode
interface ProtectedRouteProps {
  children: React.ReactNode; // Propiedad 'children' correctamente definida
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { auth, loading } = useContext(AuthContext) || {
    auth: false,
    loading: true,
  };

  if (loading) {
    return <div>Loading...</div>; // Indicador de carga mientras se verifica la autenticación
  }

  if (!auth) {
    return <Navigate to="/login" />; // Si no está autenticado, redirige al login
  }

  return <>{children}</>; // Si está autenticado, muestra el contenido de la ruta
};

export default ProtectedRoute;
