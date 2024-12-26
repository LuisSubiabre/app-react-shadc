import { Navigate } from "react-router-dom";

// Componente de ruta protegida
export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    // Si no hay token, redirigimos al login
    return <Navigate to="/login" replace />;
  }

  return children; // Si hay token, mostramos el contenido
};
