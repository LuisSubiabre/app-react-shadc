import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import Spinner from "./Spinner";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRoles?: number[]; // Roles necesarios para acceder a la ruta
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { auth, user, loading } = useContext(AuthContext) || {
    auth: false,
    loading: true,
  };
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    ); // Mostrar un loader mientras se verifica la autenticación
  }

  if (!auth || !user) {
    // Si no está autenticado, redirigir al login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    requiredRoles &&
    !requiredRoles.some((role) => user.roles.includes(role))
  ) {
    // Si no tiene los roles requeridos, redirigir a una página de "No autorizado"
    return <Navigate to="/unauthorized" replace />;
  }

  return children; // Si cumple con todo, renderizar la ruta protegida
};

export default ProtectedRoute;
