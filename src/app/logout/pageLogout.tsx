import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks

const Logout = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout(); // Llamar al método logout automáticamente al cargar el componente
  }, [logout]);

  return null; // Opcional: Mostrar un mensaje o redirigir antes de terminar
};

export default Logout;
